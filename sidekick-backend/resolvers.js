const db = require('./db');
const { v4: uuidv4 } = require('uuid');

const resolvers = {
  Query: {
    organizations: () => {
      return db.prepare('SELECT * FROM organizations').all();
    },
    users: () => {
      return db.prepare('SELECT * FROM users').all();
    },
    hubs: () => {
      return db.prepare('SELECT * FROM hubs').all();
    },
    scooters: (_, { where }) => {
      let query = 'SELECT * FROM scooters';
      const params = [];

      if (where && where.registration_number) {
        const { _ilike } = where.registration_number;
        if (_ilike) {
          query += ' WHERE registration_number LIKE ?';
          params.push(`%${_ilike}%`);
        }
      }

      return db.prepare(query).all(...params);
    },
    ride_details: (_, { where }) => {
      let query = 'SELECT * FROM ride_details';
      const params = [];
      const conditions = [];

      if (where) {
        if (where.user_id && where.user_id._eq) {
          conditions.push('user_id = ?');
          params.push(where.user_id._eq);
        }

        // Handle completed ride filter checking nested ride_steps steps = 'RIDE_ENDED'
        if (where.ride_steps) {
          conditions.push(`
            id IN (
              SELECT ride_details_id 
              FROM ride_steps 
              WHERE steps = 'RIDE_ENDED'
            )
          `);
        }
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      // Order by created_at DESC to put the latest rides at the top
      query += ' ORDER BY created_at DESC';

      return db.prepare(query).all(...params);
    },
    wallets: () => {
      return db.prepare('SELECT * FROM wallets').all();
    }
  },

  User: {
    user_organizations: (user) => {
      const userOrgs = db.prepare('SELECT * FROM user_organizations WHERE user_id = ?').all(user.id);
      return userOrgs.map(uo => ({
        user_id: uo.user_id,
        organization_id: uo.organization_id,
        // The organization relation itself is resolved by UserOrganization.organization
      }));
    }
  },

  UserOrganization: {
    organization: (uo) => {
      return db.prepare('SELECT * FROM organizations WHERE id = ?').get(uo.organization_id);
    }
  },

  RideDetail: {
    ride_steps: (ride) => {
      return db.prepare('SELECT * FROM ride_steps WHERE ride_details_id = ? ORDER BY created_at ASC').all(ride.id);
    },
    hubByStartHubId: (ride) => {
      return db.prepare('SELECT * FROM hubs WHERE id = ?').get(ride.start_hub_id);
    },
    hub: (ride) => {
      // General hub shortcut used in wallet transaction queries
      const hubId = ride.end_hub_id || ride.start_hub_id;
      return db.prepare('SELECT * FROM hubs WHERE id = ?').get(hubId);
    }
  },

  Wallet: {
    transactions: (wallet) => {
      return db.prepare('SELECT * FROM transactions WHERE wallet_id = ? ORDER BY created_at DESC').all(wallet.id);
    }
  },

  Transaction: {
    ride: (transaction) => {
      if (!transaction.ride_id) return null;
      return db.prepare('SELECT * FROM ride_details WHERE id = ?').get(transaction.ride_id);
    }
  },

  Mutation: {
    update_users_by_pk: (_, { pk_columns, _set }) => {
      const { id } = pk_columns;
      const fields = Object.keys(_set);
      if (fields.length === 0) return { id };

      const setClause = fields.map(f => `${f} = ?`).join(', ');
      const values = Object.values(_set);
      values.push(id);

      db.prepare(`UPDATE users SET ${setClause} WHERE id = ?`).run(...values);
      return { id };
    },

    insert_ride_details_one: (_, { object }) => {
      const id = object.id || uuidv4();
      const createdAt = new Date().toISOString();
      
      const userId = object.user_id;
      const scooterId = object.scooter_id;
      const startHubId = object.start_hub_id;
      const endHubId = object.end_hub_id || null;
      const startTime = object.start_time || createdAt;
      const endTime = object.end_time || null;
      const totalCost = object.total_cost || null;
      const totalDistance = object.total_distance || null;
      const costType = object.cost_type || 'per_minute';

      db.prepare(`
        INSERT INTO ride_details (
          id, user_id, scooter_id, start_hub_id, end_hub_id, start_time, end_time, total_cost, total_distance, cost_type, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, userId, scooterId, startHubId, endHubId, startTime, endTime, totalCost, totalDistance, costType, createdAt);

      // Create initial RIDE_CREATED step automatically
      const stepId = uuidv4();
      db.prepare(`
        INSERT INTO ride_steps (id, ride_details_id, steps, created_at)
        VALUES (?, ?, 'RIDE_CREATED', ?)
      `).run(stepId, id, createdAt);

      // Also set scooter status to 'IN_USE'
      db.prepare("UPDATE scooters SET status = 'IN_USE' WHERE id = ?").run(scooterId);

      return {
        id,
        user_id: userId,
        scooter_id: scooterId,
        start_hub_id: startHubId,
        end_hub_id: endHubId,
        start_time: startTime,
        end_time: endTime,
        total_cost: totalCost,
        total_distance: totalDistance,
        cost_type: costType,
        created_at: createdAt
      };
    },

    update_ride_details_by_pk: (_, { pk_columns, _set }) => {
      const { id } = pk_columns;
      const fields = Object.keys(_set);
      if (fields.length === 0) {
        const r = db.prepare('SELECT * FROM ride_details WHERE id = ?').get(id);
        return { id, end_time: r.end_time, created_at: r.created_at };
      }

      const setClause = fields.map(f => `${f} = ?`).join(', ');
      const values = Object.values(_set);
      values.push(id);

      db.prepare(`UPDATE ride_details SET ${setClause} WHERE id = ?`).run(...values);

      const updated = db.prepare('SELECT * FROM ride_details WHERE id = ?').get(id);

      // If ride is ending (end_time is provided), let's create RIDE_ENDED step and set scooter status back to 'AVAILABLE'
      if (_set.end_time) {
        const stepId = uuidv4();
        const now = new Date().toISOString();
        db.prepare(`
          INSERT INTO ride_steps (id, ride_details_id, steps, created_at)
          VALUES (?, ?, 'RIDE_ENDED', ?)
        `).run(stepId, id, now);

        db.prepare(`
          UPDATE scooters 
          SET status = 'AVAILABLE', hub_id = ?
          WHERE id = ?
        `).run(updated.end_hub_id || updated.start_hub_id, updated.scooter_id);

        // Also record a transaction for this ride!
        const transactionId = uuidv4();
        const wallet = db.prepare('SELECT id FROM wallets LIMIT 1').get();
        if (wallet && updated.total_cost) {
          db.prepare(`
            INSERT INTO transactions (id, wallet_id, ride_id, amount, created_at)
            VALUES (?, ?, ?, ?, ?)
          `).run(transactionId, wallet.id, id, updated.total_cost, now);
        }
      }

      return {
        id,
        end_time: updated.end_time,
        created_at: updated.created_at
      };
    },

    insert_ride_steps_one: (_, { object }) => {
      const id = uuidv4();
      const createdAt = new Date().toISOString();
      const { steps, ride_details_id } = object;

      db.prepare(`
        INSERT INTO ride_steps (id, ride_details_id, steps, created_at)
        VALUES (?, ?, ?, ?)
      `).run(id, ride_details_id, steps, createdAt);

      // If this step is RIDE_PAUSED, update scooter status
      if (steps === 'RIDE_PAUSED') {
        const r = db.prepare('SELECT scooter_id FROM ride_details WHERE id = ?').get(ride_details_id);
        if (r) {
          db.prepare("UPDATE scooters SET status = 'PAUSED' WHERE id = ?").run(r.scooter_id);
        }
      } else if (steps === 'RIDE_ACTIVE') {
        const r = db.prepare('SELECT scooter_id FROM ride_details WHERE id = ?').get(ride_details_id);
        if (r) {
          db.prepare("UPDATE scooters SET status = 'IN_USE' WHERE id = ?").run(r.scooter_id);
        }
      }

      return { id, ride_details_id, steps, created_at: createdAt };
    },

    insert_wallets_one: (_, { object }) => {
      const id = uuidv4();
      const createdAt = new Date().toISOString();
      const balance = object.balance || 0.0;
      const securityDeposit = object.security_deposit || 0.0;
      const orgId = object.org_id || null;

      db.prepare(`
        INSERT INTO wallets (id, balance, security_deposit, created_at, org_id)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, balance, securityDeposit, createdAt, orgId);

      return { id, balance, security_deposit: securityDeposit, created_at: createdAt, org_id: orgId };
    },

    update_wallets_by_pk: (_, { pk_columns, _inc }) => {
      const { id } = pk_columns;
      
      if (_inc) {
        if (_inc.balance !== undefined && _inc.balance !== null) {
          db.prepare('UPDATE wallets SET balance = balance + ? WHERE id = ?').run(_inc.balance, id);
        }
        if (_inc.security_deposit !== undefined && _inc.security_deposit !== null) {
          db.prepare('UPDATE wallets SET security_deposit = security_deposit + ? WHERE id = ?').run(_inc.security_deposit, id);
        }
      }

      const updated = db.prepare('SELECT * FROM wallets WHERE id = ?').get(id);
      return {
        id: updated.id,
        balance: updated.balance,
        security_deposit: updated.security_deposit,
        created_at: updated.created_at,
        org_id: updated.org_id
      };
    }
  }
};

module.exports = resolvers;
