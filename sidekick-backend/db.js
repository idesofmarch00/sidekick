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
  ride_coordinates: [],
  wallets: [],
  transactions: []
};

// Synchronously load data if exists
function loadData() {
  if (fs.existsSync(dbFilePath)) {
    try {
      const fileContent = fs.readFileSync(dbFilePath, 'utf8');
      data = JSON.parse(fileContent);
      data.ride_coordinates = data.ride_coordinates || [];
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

    if (this.sql.startsWith('UPSERT INTO ride_coordinates')) {
      const [id, ride_id, latitude, longitude, altitude, speed, accuracy, timestamp] = params;
      const row = {
        id,
        ride_id,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        altitude: altitude === null || altitude === undefined ? null : parseFloat(altitude),
        speed: speed === null || speed === undefined ? null : parseFloat(speed),
        accuracy: accuracy === null || accuracy === undefined ? null : parseFloat(accuracy),
        timestamp: Number(timestamp)
      };
      const existingIndex = data.ride_coordinates.findIndex(coord => coord.id === id);
      if (existingIndex >= 0) {
        data.ride_coordinates[existingIndex] = row;
      } else {
        data.ride_coordinates.push(row);
      }
      saveData();
      return { changes: 1 };
    }

    if (this.sql.startsWith('UPSERT INTO ride_details')) {
      const [id, user_id, scooter_id, start_hub_id, end_hub_id, start_time, end_time, total_distance, status, created_at] = params;
      const existing = data.ride_details.find(ride => ride.id === id);
      if (existing) {
        existing.scooter_id = scooter_id || existing.scooter_id;
        existing.start_hub_id = start_hub_id || existing.start_hub_id;
        existing.end_hub_id = end_hub_id || existing.end_hub_id;
        existing.start_time = start_time || existing.start_time;
        existing.end_time = end_time || existing.end_time;
        existing.total_distance = total_distance === null || total_distance === undefined ? existing.total_distance : parseFloat(total_distance);
        existing.status = status || existing.status;
      } else {
        data.ride_details.push({
          id,
          user_id,
          scooter_id,
          start_hub_id,
          end_hub_id,
          start_time,
          end_time,
          total_cost: null,
          total_distance: total_distance === null || total_distance === undefined ? null : parseFloat(total_distance),
          cost_type: 'per_minute',
          created_at,
          status
        });
      }
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
        if (this.sql.includes("status = 'FLAGGED_SPOOFED'")) {
          ride.status = 'FLAGGED_SPOOFED';
          ride.spoof_flag = true;
          console.warn(`[DB] 🚨 Ride ${id} flagged as SPOOFED by anti-cheat validation`);
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

    if (this.sql.startsWith('SELECT * FROM scooters WHERE id = ?')) {
      const id = params[0];
      return data.scooters.find(s => s.id === id) || null;
    }

    if (this.sql.includes('SELECT id FROM users LIMIT 1')) {
      return data.users[0] || null;
    }

    if (this.sql.includes('SELECT id FROM hubs LIMIT 1')) {
      return data.hubs[0] || null;
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

    // 7. SELECT from ride_coordinates WHERE ride_id = ? (used by anti-spoofing validator)
    if (this.sql.includes('ride_coordinates') && this.sql.includes('ride_id = ?')) {
      const rideId = params[0];
      let coords = (data.ride_coordinates || []).filter(c => c.ride_id === rideId);
      if (this.sql.includes('ORDER BY timestamp ASC')) {
        coords.sort((a, b) => a.timestamp - b.timestamp);
      }
      return coords;
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

  // Force re-seeding if we only have the old basic seed, no completed rides, or fewer than 7 rides
  const needsPremiumSeed = data.organizations.length === 0 || data.ride_details.length === 0 || data.ride_details.length < 7 || (data.wallets[0] && data.wallets[0].balance === 500.0);

  if (needsPremiumSeed) {
    console.info('Seeding premium default Sidekick database tables with high-fidelity rides...');

    // Clear old data to start fresh
    data = {
      organizations: [],
      users: [],
      user_organizations: [],
      hubs: [],
      scooters: [],
      ride_details: [],
      ride_steps: [],
      ride_coordinates: [],
      wallets: [],
      transactions: []
    };

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

    // Wallets (Bigger balance for premium demo test run!)
    data.wallets.push({
      id: walletId,
      balance: 5000.0,
      security_deposit: 500.0,
      created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      org_id: orgId
    });

    // Hubs
    const hubs = [
      { id: 'hub-1', name: 'North Campus Hub (Vishwavidyalaya Metro)', latitude: 28.6974, longitude: 77.2023, organization_id: orgId, created_at: new Date().toISOString() },
      { id: 'hub-2', name: 'Kamla Nagar Hub (North Campus)', latitude: 28.6816, longitude: 77.2016, organization_id: orgId, created_at: new Date().toISOString() },
      { id: 'hub-3', name: 'South Campus Hub (Dhaula Kuan)', latitude: 28.5840, longitude: 77.1630, organization_id: orgId, created_at: new Date().toISOString() },
      { id: 'hub-4', name: 'Satya Niketan Hub (South Campus)', latitude: 28.5873, longitude: 77.1645, organization_id: orgId, created_at: new Date().toISOString() }
    ];
    data.hubs.push(...hubs);

    // Scooters
    const scooters = [
      { id: 'scooter-1', registration_number: 'SCOOTER1', status: 'AVAILABLE', is_active: true, latitude: 28.6974, longitude: 77.2023, hub_id: 'hub-1' },
      { id: 'scooter-2', registration_number: 'SCOOTER2', status: 'AVAILABLE', is_active: true, latitude: 28.6816, longitude: 77.2016, hub_id: 'hub-2' },
      { id: 'scooter-3', registration_number: 'SCOOTER3', status: 'AVAILABLE', is_active: true, latitude: 28.5840, longitude: 77.1630, hub_id: 'hub-3' },
      { id: 'scooter-4', registration_number: 'SCOOTER4', status: 'AVAILABLE', is_active: true, latitude: 28.5873, longitude: 77.1645, hub_id: 'hub-4' }
    ];
    data.scooters.push(...scooters);

    // ====== Seed 7 Completed Rides for S Ahmed ======
    const now = Date.now();

    // Ride 1: Morning Commute (Hub 1 → Hub 2) — 2.1km, 12 min, ₹45
    const ride1 = { id: 'ride-morning-commute-1', start: new Date(now - 13 * 24 * 60 * 60 * 1000 + 8.25 * 60 * 60 * 1000), duration: 12, cost: 45.0, distance: 2.1, scooter: 'scooter-1', startHub: 'hub-1', endHub: 'hub-2' };
    // Ride 2: South Campus Quick (Hub 3 → Hub 4) — 1.4km, 8 min, ₹30
    const ride2 = { id: 'ride-south-campus-quick-1', start: new Date(now - 11 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000), duration: 8, cost: 30.0, distance: 1.4, scooter: 'scooter-3', startHub: 'hub-3', endHub: 'hub-4' };
    // Ride 3: Cross-Campus Long (Hub 2 → Hub 4) — 15.6km, 42 min, ₹250
    const ride3 = { id: 'ride-cross-campus-long-1', start: new Date(now - 9 * 24 * 60 * 60 * 1000 + 9.5 * 60 * 60 * 1000), duration: 42, cost: 250.0, distance: 15.6, scooter: 'scooter-2', startHub: 'hub-2', endHub: 'hub-4' };
    // Ride 4: Evening Return (Hub 2 → Hub 1) — 1.8km, 10 min, ₹35
    const ride4 = { id: 'ride-evening-return-1', start: new Date(now - 7 * 24 * 60 * 60 * 1000 + 18.5 * 60 * 60 * 1000), duration: 10, cost: 35.0, distance: 1.8, scooter: 'scooter-2', startHub: 'hub-2', endHub: 'hub-1' };
    // Ride 5: Weekend Explorer (Hub 1 → Hub 3) — 8.2km, 32 min, ₹190
    const ride5 = { id: 'ride-weekend-explorer-1', start: new Date(now - 5 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000), duration: 32, cost: 190.0, distance: 8.2, scooter: 'scooter-1', startHub: 'hub-1', endHub: 'hub-3' };
    // Ride 6: Quick Errand (Hub 4 → Hub 3) — 0.8km, 5 min, ₹15
    const ride6 = { id: 'ride-quick-errand-1', start: new Date(now - 3 * 24 * 60 * 60 * 1000 + 16.75 * 60 * 60 * 1000), duration: 5, cost: 15.0, distance: 0.8, scooter: 'scooter-4', startHub: 'hub-4', endHub: 'hub-3' };
    // Ride 7: Night Ride (Hub 3 → Hub 1) — 12.4km, 38 min, ₹300
    const ride7 = { id: 'ride-night-cruise-1', start: new Date(now - 1 * 24 * 60 * 60 * 1000 + 22 * 60 * 60 * 1000), duration: 38, cost: 300.0, distance: 12.4, scooter: 'scooter-3', startHub: 'hub-3', endHub: 'hub-1' };

    const allRides = [ride1, ride2, ride3, ride4, ride5, ride6, ride7];

    for (const r of allRides) {
      const startTime = r.start.toISOString();
      const endTime = new Date(r.start.getTime() + r.duration * 60 * 1000).toISOString();

      data.ride_details.push({
        id: r.id,
        user_id: userId,
        scooter_id: r.scooter,
        start_hub_id: r.startHub,
        end_hub_id: r.endHub,
        start_time: startTime,
        end_time: endTime,
        total_cost: r.cost,
        total_distance: r.distance,
        cost_type: 'per_minute',
        created_at: startTime,
        status: 'COMPLETED'
      });

      data.ride_steps.push(
        { id: `step-${r.id}-start`, ride_details_id: r.id, steps: 'RIDE_CREATED', created_at: startTime },
        { id: `step-${r.id}-end`, ride_details_id: r.id, steps: 'RIDE_ENDED', created_at: endTime }
      );

      data.transactions.push(
        { id: `tx-${r.id}`, wallet_id: walletId, ride_id: r.id, amount: r.cost, created_at: endTime }
      );
    }

    saveData();
    console.info('Premium database seeding completed successfully with 7 completed rides!');
  } else {
    console.info('Database already contains premium seeded data.');
  }
}

initDb();

module.exports = db;
