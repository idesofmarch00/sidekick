const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbFilePath = path.join(__dirname, 'sidekick-db.json');

// Memory cache of tables
let data = {
  organizations: [],
  users: [],
  user_organizations: [],
  hubs: [],
  scooters: [],
  ride_details: [],
  ride_steps: [],
  wallets: [],
  transactions: []
};

// Synchronously load data if exists
function loadData() {
  if (fs.existsSync(dbFilePath)) {
    try {
      const fileContent = fs.readFileSync(dbFilePath, 'utf8');
      data = JSON.parse(fileContent);
      console.info('JSON Database loaded successfully from:', dbFilePath);
    } catch (e) {
      console.error('Failed to parse database file. Re-initializing...', e);
      saveData();
    }
  } else {
    saveData();
  }
}

// Synchronously save data to file
function saveData() {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to persist database to JSON file:', e);
  }
}

// Custom parser to map SQL queries to pure-JS memory operations
class MockStatement {
  constructor(sql) {
    this.sql = sql.trim().replace(/\s+/g, ' ');
  }

  run(...params) {
    console.log(`[SQL EXEC RUN] ${this.sql} | Params:`, params);
    
    // 1. INSERT INTO ride_details
    if (this.sql.startsWith('INSERT INTO ride_details')) {
      const [id, user_id, scooter_id, start_hub_id, end_hub_id, start_time, end_time, total_cost, total_distance, cost_type, created_at] = params;
      const newRow = { id, user_id, scooter_id, start_hub_id, end_hub_id, start_time, end_time, total_cost, total_distance, cost_type, created_at };
      data.ride_details.push(newRow);
      saveData();
      return { changes: 1 };
    }

    // 2. INSERT INTO ride_steps
    if (this.sql.startsWith('INSERT INTO ride_steps')) {
      const [id, ride_details_id, steps, created_at] = params;
      const newRow = { id, ride_details_id, steps, created_at };
      data.ride_steps.push(newRow);
      saveData();
      return { changes: 1 };
    }

    // 3. INSERT INTO wallets
    if (this.sql.startsWith('INSERT INTO wallets')) {
      const [id, balance, security_deposit, created_at, org_id] = params;
      const newRow = { id, balance: parseFloat(balance || 0), security_deposit: parseFloat(security_deposit || 0), created_at, org_id };
      data.wallets.push(newRow);
      saveData();
      return { changes: 1 };
    }

    // 4. INSERT INTO transactions
    if (this.sql.startsWith('INSERT INTO transactions')) {
      const [id, wallet_id, ride_id, amount, created_at] = params;
      const newRow = { id, wallet_id, ride_id, amount: parseFloat(amount || 0), created_at };
      data.transactions.push(newRow);
      saveData();
      return { changes: 1 };
    }

    // 5. UPDATE users
    if (this.sql.startsWith('UPDATE users SET')) {
      // e.g., UPDATE users SET full_name = ?, phone_number = ? WHERE id = ?
      const id = params[params.length - 1];
      const user = data.users.find(u => u.id === id);
      if (user) {
        if (this.sql.includes('full_name = ?')) {
          user.full_name = params[0];
        }
        if (this.sql.includes('phone_number = ?')) {
          user.phone_number = this.sql.includes('full_name = ?') ? params[1] : params[0];
        }
        saveData();
      }
      return { changes: 1 };
    }

    // 6. UPDATE ride_details
    if (this.sql.startsWith('UPDATE ride_details SET')) {
      const id = params[params.length - 1];
      const ride = data.ride_details.find(r => r.id === id);
      if (ride) {
        if (this.sql.includes('end_time = ?')) {
          ride.end_time = params[0];
        }
        if (this.sql.includes('total_cost = ?')) {
          ride.total_cost = parseFloat(params[1]);
        }
        saveData();
      }
      return { changes: 1 };
    }

    // 7. UPDATE scooters
    if (this.sql.startsWith('UPDATE scooters')) {
      if (this.sql.includes("status = 'IN_USE'")) {
        const scooterId = params[0];
        const sc = data.scooters.find(s => s.id === scooterId);
        if (sc) {
          sc.status = 'IN_USE';
          saveData();
        }
      } else if (this.sql.includes("status = 'PAUSED'")) {
        const scooterId = params[0];
        const sc = data.scooters.find(s => s.id === scooterId);
        if (sc) {
          sc.status = 'PAUSED';
          saveData();
        }
      } else if (this.sql.includes("status = 'AVAILABLE'")) {
        const [hubId, scooterId] = params;
        const sc = data.scooters.find(s => s.id === scooterId);
        if (sc) {
          sc.status = 'AVAILABLE';
          sc.hub_id = hubId;
          saveData();
        }
      }
      return { changes: 1 };
    }

    // 8. UPDATE wallets (Increments)
    if (this.sql.startsWith('UPDATE wallets SET balance = balance + ?')) {
      const [val, id] = params;
      const wallet = data.wallets.find(w => w.id === id);
      if (wallet) {
        wallet.balance = parseFloat((wallet.balance + parseFloat(val)).toFixed(2));
        saveData();
      }
      return { changes: 1 };
    }

    if (this.sql.startsWith('UPDATE wallets SET security_deposit = security_deposit + ?')) {
      const [val, id] = params;
      const wallet = data.wallets.find(w => w.id === id);
      if (wallet) {
        wallet.security_deposit = parseFloat((wallet.security_deposit + parseFloat(val)).toFixed(2));
        saveData();
      }
      return { changes: 1 };
    }

    return { changes: 0 };
  }

  get(...params) {
    console.log(`[SQL EXEC GET] ${this.sql} | Params:`, params);

    // 1. SELECT COUNT FROM organizations
    if (this.sql.includes('SELECT COUNT(*) as count FROM organizations')) {
      return { count: data.organizations.length };
    }

    // 2. Fetch single row (e.g. SELECT * FROM users WHERE id = ?)
    if (this.sql.startsWith('SELECT * FROM users WHERE id = ?')) {
      const id = params[0];
      return data.users.find(u => u.id === id) || null;
    }

    if (this.sql.startsWith('SELECT * FROM organizations WHERE id = ?')) {
      const id = params[0];
      return data.organizations.find(o => o.id === id) || null;
    }

    if (this.sql.startsWith('SELECT * FROM hubs WHERE id = ?')) {
      const id = params[0];
      return data.hubs.find(h => h.id === id) || null;
    }

    if (this.sql.startsWith('SELECT * FROM ride_details WHERE id = ?')) {
      const id = params[0];
      return data.ride_details.find(r => r.id === id) || null;
    }

    if (this.sql.includes('SELECT id FROM wallets LIMIT 1')) {
      return data.wallets[0] || null;
    }

    if (this.sql.startsWith('SELECT * FROM wallets WHERE id = ?')) {
      const id = params[0];
      return data.wallets.find(w => w.id === id) || null;
    }

    return null;
  }

  all(...params) {
    console.log(`[SQL EXEC ALL] ${this.sql} | Params:`, params);

    // 1. Standard tables fetch
    if (this.sql === 'SELECT * FROM organizations') {
      return data.organizations;
    }
    if (this.sql === 'SELECT * FROM users') {
      return data.users;
    }
    if (this.sql === 'SELECT * FROM hubs') {
      return data.hubs;
    }
    if (this.sql === 'SELECT * FROM wallets') {
      return data.wallets;
    }

    // 2. SELECT * FROM scooters
    if (this.sql.startsWith('SELECT * FROM scooters')) {
      if (params.length > 0) {
        const likeVal = params[0].replace(/%/g, '').toLowerCase();
        return data.scooters.filter(s => s.registration_number.toLowerCase().includes(likeVal));
      }
      return data.scooters;
    }

    // 3. SELECT * FROM user_organizations WHERE user_id = ?
    if (this.sql.startsWith('SELECT * FROM user_organizations WHERE user_id = ?')) {
      const userId = params[0];
      return data.user_organizations.filter(uo => uo.user_id === userId);
    }

    // 4. SELECT * FROM ride_steps WHERE ride_details_id = ?
    if (this.sql.startsWith('SELECT * FROM ride_steps WHERE ride_details_id = ?')) {
      const rideId = params[0];
      return data.ride_steps.filter(rs => rs.ride_details_id === rideId);
    }

    // 5. SELECT * FROM transactions WHERE wallet_id = ?
    if (this.sql.startsWith('SELECT * FROM transactions WHERE wallet_id = ?')) {
      const walletId = params[0];
      return data.transactions.filter(t => t.wallet_id === walletId);
    }

    // 6. SELECT * FROM ride_details (with filters)
    if (this.sql.startsWith('SELECT * FROM ride_details')) {
      let results = [...data.ride_details];

      // Handle user_id = ?
      if (this.sql.includes('user_id = ?')) {
        const userId = params[0];
        results = results.filter(r => r.user_id === userId);
      }

      // Handle ride_steps filter e.g. RIDE_ENDED
      if (this.sql.includes("steps = 'RIDE_ENDED'")) {
        results = results.filter(r => {
          return data.ride_steps.some(rs => rs.ride_details_id === r.id && rs.steps === 'RIDE_ENDED');
        });
      }

      // Handle order by
      if (this.sql.includes('ORDER BY created_at DESC')) {
        results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }

      return results;
    }

    return [];
  }
}

const db = {
  pragma: (cmd) => {
    console.log(`[SQL PRAGMA] ${cmd}`);
  },
  prepare: (sql) => {
    return new MockStatement(sql);
  },
  exec: (sql) => {
    console.log(`[SQL EXEC DIRECT] Executing schema updates...`);
  }
};

function initDb() {
  console.info('Initializing JSON relational database at:', dbFilePath);
  loadData();

  // Seeding default datasets if completely empty
  if (data.organizations.length === 0) {
    console.info('Seeding default Sidekick database tables...');

    const orgId = 'org-default-uuid-1111';
    const userId = '6383b5a1-a742-42f1-84d4-5c51926b9eac'; // Matches user ID in mock configurations
    const walletId = 'wallet-default-uuid-2222';
    
    // Organizations
    data.organizations.push({ id: orgId, name: 'Sidekick Premium Fleet' });

    // Users
    data.users.push({
      id: userId,
      email: 'saif.ahmed@example.com',
      full_name: 'S Ahmed',
      phone_number: '+91 98765 43210'
    });

    // User Organizations
    data.user_organizations.push({ user_id: userId, organization_id: orgId });

    // Wallets
    data.wallets.push({
      id: walletId,
      balance: 500.0,
      security_deposit: 200.0,
      created_at: new Date().toISOString(),
      org_id: orgId
    });

    // Hubs
    const hubs = [
      { id: 'hub-1', name: 'Downtown Hub (Indiranagar)', latitude: 12.9716, longitude: 77.5946, organization_id: orgId, created_at: new Date().toISOString() },
      { id: 'hub-2', name: 'Tech Park Hub (Whitefield)', latitude: 12.9698, longitude: 77.7500, organization_id: orgId, created_at: new Date().toISOString() },
      { id: 'hub-3', name: 'Central Station Hub', latitude: 12.9779, longitude: 77.5724, organization_id: orgId, created_at: new Date().toISOString() },
      { id: 'hub-4', name: 'HSR Layout Hub', latitude: 12.9141, longitude: 77.6413, organization_id: orgId, created_at: new Date().toISOString() }
    ];
    data.hubs.push(...hubs);

    // Scooters
    const scooters = [
      { id: 'scooter-1', registration_number: 'SCOOTER1', status: 'AVAILABLE', is_active: true, latitude: 12.9716, longitude: 77.5946, hub_id: 'hub-1' },
      { id: 'scooter-2', registration_number: 'SCOOTER2', status: 'AVAILABLE', is_active: true, latitude: 12.9698, longitude: 77.7500, hub_id: 'hub-2' },
      { id: 'scooter-3', registration_number: 'SCOOTER3', status: 'AVAILABLE', is_active: true, latitude: 12.9779, longitude: 77.5724, hub_id: 'hub-3' },
      { id: 'scooter-4', registration_number: 'SCOOTER4', status: 'AVAILABLE', is_active: true, latitude: 12.9141, longitude: 77.6413, hub_id: 'hub-4' }
    ];
    data.scooters.push(...scooters);

    saveData();
    console.info('Database seeding completed successfully!');
  } else {
    console.info('Database already contains seeded data.');
  }
}

initDb();

module.exports = db;
