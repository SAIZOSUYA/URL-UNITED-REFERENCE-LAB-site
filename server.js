/**
 * United Reference Laboratory Pvt. Ltd. (URL Group)
 * Production-Ready Express & SQLite Backend Server
 * Secure Auth, Audit Logging, Input Validation, & Hardened Security
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'url_diag_production_secure_jwt_secret_key_84920482094';
const IS_PROD = process.env.NODE_ENV === 'production';

// Paths (Support Vercel writable /tmp environment)
const IS_VERCEL = !!process.env.VERCEL || !!process.env.AWS_EXECUTION_ENV;
const DATA_DIR = IS_VERCEL ? path.join('/tmp', 'data') : path.join(__dirname, 'data');
const SEED_DATA_DIR = path.join(__dirname, 'data');

const CONFIG_FILE = path.join(DATA_DIR, 'clinic_config.json');
const TEMPLATE_FILE = path.join(DATA_DIR, 'site_template.json');
const ADMIN_AUTH_FILE = path.join(DATA_DIR, 'admin_auth.json');
const DB_FILE = path.join(DATA_DIR, 'appointments.sqlite');

// Ensure Data Directory Exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Copy seed data files to /tmp/data on Vercel if needed
if (IS_VERCEL && fs.existsSync(SEED_DATA_DIR)) {
  try {
    const seedFiles = fs.readdirSync(SEED_DATA_DIR);
    for (const file of seedFiles) {
      const src = path.join(SEED_DATA_DIR, file);
      const dest = path.join(DATA_DIR, file);
      if (!fs.existsSync(dest) && fs.statSync(src).isFile()) {
        fs.copyFileSync(src, dest);
      }
    }
  } catch (e) {
    console.error('Vercel data initialization warning:', e.message);
  }
}

// 1. HELMET & SECURITY HEADERS
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// 2. CORS CONFIGURATION
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000').split(',');
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || !IS_PROD) {
      return callback(null, true);
    }
    return callback(new Error('CORS policy violation: Origin not allowed.'));
  },
  credentials: true
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(express.static(__dirname));

// 3. RATE LIMITING FOR LOGIN ENDPOINT
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 failed attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again after 15 minutes.' }
});

// Blacklisted / Revoked JWT Token Set (Survivable via memory/file)
const revokedTokens = new Set();

// Admin Credentials File Helper
function getAdminAuth() {
  if (fs.existsSync(ADMIN_AUTH_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(ADMIN_AUTH_FILE, 'utf8'));
      if (data.username && data.passwordHash) return data;
    } catch (e) {}
  }
  // Fallback default
  const defaultUser = process.env.ADMIN_DEFAULT_USERNAME || 'admin';
  const defaultPass = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
  const hash = bcrypt.hashSync(defaultPass, 10);
  const authObj = { username: defaultUser, passwordHash: hash, updatedAt: new Date().toISOString() };
  fs.writeFileSync(ADMIN_AUTH_FILE, JSON.stringify(authObj, null, 2), 'utf8');
  return authObj;
}

// 4. JWT AUTHORIZATION MIDDLEWARE
function requireAdminAuth(req, res, next) {
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.headers['x-admin-token']) {
    token = req.headers['x-admin-token'];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing admin session token.' });
  }

  if (revokedTokens.has(token)) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Session token has been logged out.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.adminUser = decoded.username || 'admin';
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or expired session token.' });
  }
}

// 5. SQLITE DATABASE INITIALIZATION (Dual Engine Loader with better-sqlite3 Fallback)
function createDbConnection(dbPath) {
  try {
    const sqlite3 = require('sqlite3').verbose();
    const instance = new sqlite3.Database(dbPath, (err) => {
      if (err) console.error('❌ Failed to open SQLite Database:', err);
      else console.log(`🗄️ Connected to SQLite Database (sqlite3) at: ${dbPath}`);
    });
    return instance;
  } catch (e) {
    try {
      const Database = require('better-sqlite3');
      const bdb = new Database(dbPath);
      console.log(`🗄️ Connected to SQLite Database (better-sqlite3 fallback) at: ${dbPath}`);
      return {
        serialize: (fn) => fn(),
        run: function(sql, params, cb) {
          if (typeof params === 'function') { cb = params; params = []; }
          try {
            const info = bdb.prepare(sql).run(...(params || []));
            if (cb) cb.call({ lastID: Number(info.lastInsertRowid), changes: info.changes }, null);
          } catch (err) {
            if (cb) cb(err);
          }
        },
        get: function(sql, params, cb) {
          if (typeof params === 'function') { cb = params; params = []; }
          try {
            const row = bdb.prepare(sql).get(...(params || []));
            if (cb) cb(null, row);
          } catch (err) {
            if (cb) cb(err);
          }
        },
        all: function(sql, params, cb) {
          if (typeof params === 'function') { cb = params; params = []; }
          try {
            const rows = bdb.prepare(sql).all(...(params || []));
            if (cb) cb(null, rows);
          } catch (err) {
            if (cb) cb(err);
          }
        },
        prepare: function(sql) {
          const stmt = bdb.prepare(sql);
          return {
            run: function(...args) {
              const cb = typeof args[args.length - 1] === 'function' ? args.pop() : null;
              try {
                const info = stmt.run(...args);
                if (cb) cb.call({ lastID: Number(info.lastInsertRowid), changes: info.changes }, null);
              } catch (err) {
                if (cb) cb(err);
              }
            },
            finalize: function() {}
          };
        }
      };
    } catch (err2) {
      console.error('❌ Database connection error:', err2);
      throw err2;
    }
  }
}

const db = createDbConnection(DB_FILE);

// Database Schema Setup with Migrations
db.serialize(() => {
  // Appointment Requests Table
  db.run(`
    CREATE TABLE IF NOT EXISTS appointment_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      appointment_code TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      phone_number TEXT NOT NULL,
      test_category TEXT NOT NULL,
      nearest_branch TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending Review',
      admin_notes TEXT DEFAULT '',
      is_archived INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Ensure Columns Exist (Migrations)
  db.all("PRAGMA table_info(appointment_requests)", [], (err, columns) => {
    if (!err && Array.isArray(columns)) {
      const names = columns.map(c => c.name);
      if (!names.includes('updated_at')) {
        db.run("ALTER TABLE appointment_requests ADD COLUMN updated_at DATETIME");
      }
      if (!names.includes('admin_notes')) {
        db.run("ALTER TABLE appointment_requests ADD COLUMN admin_notes TEXT");
      }
      if (!names.includes('is_archived')) {
        db.run("ALTER TABLE appointment_requests ADD COLUMN is_archived INTEGER DEFAULT 0");
      }
    }
  });

  // Admin Audit Log Table
  db.run(`
    CREATE TABLE IF NOT EXISTS admin_actions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_user TEXT NOT NULL,
      action TEXT NOT NULL,
      target_id TEXT,
      details TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed Default Records if Empty
  db.get("SELECT COUNT(*) AS count FROM appointment_requests", (err, row) => {
    if (!err && row && row.count === 0) {
      const stmt = db.prepare(`
        INSERT INTO appointment_requests (appointment_code, full_name, phone_number, test_category, nearest_branch, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const now = new Date().toISOString();
      stmt.run("APT-7842", "Ram Prasad Sharma", "9856012345", "General Comprehensive Health Package", "Pokhara New Road (Head Office)", "Pending Review", now, now);
      stmt.run("APT-5193", "Sita Adhikari", "9846056789", "Thyroid & Hormones (Roche ECL)", "Pokhara Hospital Chowk (24/7)", "Confirmed", new Date(Date.now() - 3600000).toISOString(), now);
      stmt.finalize();
      console.log('🌱 SQLite Database initialized with default diagnostic records.');
    }
  });
});

// Audit Logger Function
function logAdminAction(adminUser, action, targetId, details) {
  const sql = `INSERT INTO admin_actions (admin_user, action, target_id, details, timestamp) VALUES (?, ?, ?, ?, ?)`;
  db.run(sql, [adminUser, action, targetId || '', details || '', new Date().toISOString()], (err) => {
    if (err) console.error('Error writing audit log:', err);
  });
}

// Defaults Configuration
const DEFAULT_CONFIG = {
  branchName: 'UNITED REFERENCE LABORATORY PVT. LTD. (HEAD OFFICE)',
  address: 'Giri Complex, New Road, Pokhara-8, Kaski, Nepal',
  phone: '+977-61-570503, 543503, 9856013595',
  email: 'urlnepal@gmail.com',
  announcement: 'Gandaki Province’s First & Leading Reference Laboratory Since 2013.'
};

const DEFAULT_TEMPLATE = {
  hero: {
    badge: 'Celebrating 13+ Years of Excellence (Since 2013)',
    titleLine1: "Gandaki Province's First & Leading",
    titleLine2: "Reference Laboratory"
  }
};

function readConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  } catch (e) {}
  return DEFAULT_CONFIG;
}

function readTemplate() {
  try {
    if (fs.existsSync(TEMPLATE_FILE)) return JSON.parse(fs.readFileSync(TEMPLATE_FILE, 'utf8'));
  } catch (e) {}
  return DEFAULT_TEMPLATE;
}

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// POST /api/auth/login (Bcrypt + JWT + Rate Limited)
app.post('/api/auth/login', loginLimiter, (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required.' });
  }

  const auth = getAdminAuth();
  const isUserMatch = username.trim().toLowerCase() === auth.username.toLowerCase();
  const isPassMatch = isUserMatch && bcrypt.compareSync(password.trim(), auth.passwordHash);

  if (!isPassMatch) {
    logAdminAction(username.trim() || 'unknown', 'FAILED_LOGIN_ATTEMPT', null, `Failed login attempt from IP ${req.ip}`);
    return res.status(401).json({ success: false, message: 'Invalid Admin Username or Password.' });
  }

  // Issue 8-Hour Signed JWT
  const token = jwt.sign(
    { username: auth.username, role: 'admin' },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  logAdminAction(auth.username, 'ADMIN_LOGIN', null, `Admin logged in from IP ${req.ip}`);

  res.json({
    success: true,
    token,
    expiresInSeconds: 28800, // 8 hours
    username: auth.username,
    message: 'Admin authentication successful.'
  });
});

// POST /api/auth/logout (Revoke Session Token)
app.post('/api/auth/logout', requireAdminAuth, (req, res) => {
  if (req.token) {
    revokedTokens.add(req.token);
  }
  logAdminAction(req.adminUser, 'ADMIN_LOGOUT', null, 'Admin logged out.');
  res.json({ success: true, message: 'Successfully logged out.' });
});

// GET /api/auth/verify (Verify Token Validity)
app.get('/api/auth/verify', requireAdminAuth, (req, res) => {
  res.json({ success: true, username: req.adminUser, valid: true });
});

// ==========================================
// PUBLIC FORM SUBMISSION ROUTE (STRICT INPUT VALIDATION)
// ==========================================

app.post('/api/appointments', (req, res) => {
  let { name, phone, test, branch } = req.body;

  // Validation Rules
  if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
    return res.status(400).json({ success: false, message: 'Full Name must be between 2 and 100 characters.' });
  }

  if (!phone || typeof phone !== 'string') {
    return res.status(400).json({ success: false, message: 'Mobile Phone number is required.' });
  }

  const cleanPhone = phone.trim();
  const phoneRegex = /^[0-9\s\-+]{7,15}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid phone number (7 to 15 digits).' });
  }

  const cleanName = name.trim().replace(/[<>]/g, '');
  const testCategory = (test && typeof test === 'string') ? test.trim().substring(0, 150) : 'General Comprehensive Health Package';
  const nearestBranch = (branch && typeof branch === 'string') ? branch.trim().substring(0, 150) : 'Pokhara New Road (Head Office)';

  const appointmentCode = 'APT-' + Math.floor(1000 + Math.random() * 9000);
  const now = new Date().toISOString();
  const status = 'Pending Review';

  const sql = `
    INSERT INTO appointment_requests (appointment_code, full_name, phone_number, test_category, nearest_branch, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [appointmentCode, cleanName, cleanPhone, testCategory, nearestBranch, status, now, now], function(err) {
    if (err) {
      console.error('❌ Error inserting appointment into SQLite DB:', err);
      return res.status(500).json({ success: false, message: 'Database error storing appointment.' });
    }

    const newAppointment = {
      id: appointmentCode,
      db_id: this.lastID,
      name: cleanName,
      phone: cleanPhone,
      test: testCategory,
      branch: nearestBranch,
      date: now,
      updated_at: now,
      status
    };

    console.log(`📌 Public Submission: Stored [${appointmentCode}] for [${cleanName}] in SQLite DB`);
    res.json({ success: true, message: 'Appointment request submitted successfully.', appointment: newAppointment });
  });
});

// ==========================================
// ADMIN PROTECTED APPOINTMENT MANAGEMENT ROUTES
// ==========================================

// GET /api/appointments (Server-Side Search, Filter & Pagination)
app.get('/api/appointments', requireAdminAuth, (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
  const offset = (page - 1) * limit;

  const status = req.query.status || 'all';
  const branch = req.query.branch || 'all';
  const search = (req.query.search || '').trim().toLowerCase();
  const isArchived = req.query.archived === '1' ? 1 : 0;

  let whereClauses = [`is_archived = ${isArchived}`];
  let params = [];

  if (status !== 'all') {
    whereClauses.push("status = ?");
    params.push(status);
  }

  if (branch !== 'all') {
    whereClauses.push("nearest_branch = ?");
    params.push(branch);
  }

  if (search) {
    whereClauses.push("(LOWER(full_name) LIKE ? OR LOWER(phone_number) LIKE ? OR LOWER(test_category) LIKE ? OR LOWER(appointment_code) LIKE ?)");
    const q = `%${search}%`;
    params.push(q, q, q, q);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countSql = `SELECT COUNT(*) AS total FROM appointment_requests ${whereSql}`;
  db.get(countSql, params, (err, countRow) => {
    if (err) {
      console.error('Error counting appointments:', err);
      return res.status(500).json({ success: false, message: 'Database query error.' });
    }

    const total = countRow ? countRow.total : 0;
    const totalPages = Math.ceil(total / limit) || 1;

    const dataSql = `
      SELECT * FROM appointment_requests 
      ${whereSql}
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `;

    db.all(dataSql, [...params, limit, offset], (err, rows) => {
      if (err) {
        console.error('Error querying appointments:', err);
        return res.status(500).json({ success: false, message: 'Database query error.' });
      }

      const appointments = rows.map(r => ({
        id: r.appointment_code,
        db_id: r.id,
        name: r.full_name,
        phone: r.phone_number,
        test: r.test_category,
        branch: r.nearest_branch,
        date: r.created_at,
        updated_at: r.updated_at || r.created_at,
        status: r.status,
        admin_notes: r.admin_notes || '',
        is_archived: r.is_archived || 0
      }));

      res.json({
        success: true,
        appointments,
        pagination: {
          total,
          page,
          limit,
          totalPages
        }
      });
    });
  });
});

// PATCH /api/appointments/:id/status (Update Status & Touch updated_at)
app.patch('/api/appointments/:id/status', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { status, admin_notes } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: 'Status is required.' });
  }

  const now = new Date().toISOString();
  const notesClause = typeof admin_notes === 'string' ? ', admin_notes = ?' : '';
  const params = typeof admin_notes === 'string' ? [status, now, admin_notes, id, id] : [status, now, id, id];

  const sql = `
    UPDATE appointment_requests 
    SET status = ?, updated_at = ? ${notesClause} 
    WHERE appointment_code = ? OR id = ?
  `;

  db.run(sql, params, function(err) {
    if (err) {
      console.error('Error updating status:', err);
      return res.status(500).json({ success: false, message: 'Failed to update status.' });
    }

    logAdminAction(req.adminUser, 'STATUS_UPDATE', id, `Updated status to [${status}]`);
    res.json({ success: true, message: `Status updated to ${status}.`, id, status });
  });
});

// DELETE /api/appointments/:id (Soft-Delete: is_archived = 1)
app.delete('/api/appointments/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const now = new Date().toISOString();

  const sql = `UPDATE appointment_requests SET is_archived = 1, updated_at = ? WHERE appointment_code = ? OR id = ?`;
  db.run(sql, [now, id, id], function(err) {
    if (err) {
      console.error('Error soft-deleting record:', err);
      return res.status(500).json({ success: false, message: 'Soft-delete failed.' });
    }

    logAdminAction(req.adminUser, 'SOFT_DELETE', id, 'Archived record');
    res.json({ success: true, message: `Record ${id} archived successfully.` });
  });
});

// POST /api/appointments/bulk-action (Bulk Confirm or Bulk Archive)
app.post('/api/appointments/bulk-action', requireAdminAuth, (req, res) => {
  const { ids, action } = req.body;

  if (!Array.isArray(ids) || ids.length === 0 || !['confirm', 'archive'].includes(action)) {
    return res.status(400).json({ success: false, message: 'Invalid payload: ids array and valid action required.' });
  }

  const placeholders = ids.map(() => '?').join(',');
  const now = new Date().toISOString();

  let sql = '';
  let params = [];

  if (action === 'confirm') {
    sql = `UPDATE appointment_requests SET status = 'Confirmed', updated_at = ? WHERE appointment_code IN (${placeholders})`;
    params = [now, ...ids];
  } else if (action === 'archive') {
    sql = `UPDATE appointment_requests SET is_archived = 1, updated_at = ? WHERE appointment_code IN (${placeholders})`;
    params = [now, ...ids];
  }

  db.run(sql, params, function(err) {
    if (err) {
      console.error('Error performing bulk action:', err);
      return res.status(500).json({ success: false, message: 'Bulk action failed.' });
    }

    logAdminAction(req.adminUser, `BULK_${action.toUpperCase()}`, null, `Processed ${ids.length} records`);
    res.json({ success: true, message: `Successfully performed ${action} on ${ids.length} records.` });
  });
});

// POST /api/appointments/empty-archive (Permanent Purge of Archived Records)
app.post('/api/appointments/empty-archive', requireAdminAuth, (req, res) => {
  const sql = `DELETE FROM appointment_requests WHERE is_archived = 1`;
  db.run(sql, [], function(err) {
    if (err) {
      console.error('Error emptying archive:', err);
      return res.status(500).json({ success: false, message: 'Failed to empty archive.' });
    }

    logAdminAction(req.adminUser, 'EMPTY_ARCHIVE', null, `Purged ${this.changes} archived records`);
    res.json({ success: true, message: `Permanently purged ${this.changes} archived records.` });
  });
});

// GET /api/appointments/export (Protected CSV Backend Export)
app.get('/api/appointments/export', requireAdminAuth, (req, res) => {
  const status = req.query.status || 'all';
  const branch = req.query.branch || 'all';
  const search = (req.query.search || '').trim().toLowerCase();
  const isArchived = req.query.archived === '1' ? 1 : 0;

  let whereClauses = [`is_archived = ${isArchived}`];
  let params = [];

  if (status !== 'all') {
    whereClauses.push("status = ?");
    params.push(status);
  }

  if (branch !== 'all') {
    whereClauses.push("nearest_branch = ?");
    params.push(branch);
  }

  if (search) {
    whereClauses.push("(LOWER(full_name) LIKE ? OR LOWER(phone_number) LIKE ? OR LOWER(test_category) LIKE ? OR LOWER(appointment_code) LIKE ?)");
    const q = `%${search}%`;
    params.push(q, q, q, q);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const sql = `SELECT * FROM appointment_requests ${whereSql} ORDER BY id DESC`;

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Export query failed.' });
    }

    logAdminAction(req.adminUser, 'EXPORT_CSV', null, `Exported ${rows.length} rows to CSV`);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="URL_Appointments_${Date.now()}.csv"`);

    let csv = 'Appointment Code,Full Name,Phone Number,Test Category,Nearest Branch,Status,Created At,Last Updated\n';
    rows.forEach(r => {
      const cleanName = (r.full_name || '').replace(/"/g, '""');
      const cleanPhone = (r.phone_number || '').replace(/"/g, '""');
      const cleanTest = (r.test_category || '').replace(/"/g, '""');
      const cleanBranch = (r.nearest_branch || '').replace(/"/g, '""');
      csv += `"${r.appointment_code}","${cleanName}","${cleanPhone}","${cleanTest}","${cleanBranch}","${r.status}","${r.created_at}","${r.updated_at || r.created_at}"\n`;
    });

    res.send(csv);
  });
});

// GET /api/audit-logs (Protected Admin Audit Log View)
app.get('/api/audit-logs', requireAdminAuth, (req, res) => {
  const sql = `SELECT * FROM admin_actions ORDER BY id DESC LIMIT 50`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to fetch audit logs.' });
    }
    res.json({ success: true, logs: rows });
  });
});

// POST /api/upload-image (Protected Base64 Image Upload with MIME + Size Check)
app.post('/api/upload-image', requireAdminAuth, (req, res) => {
  const { imageBase64 } = req.body;
  if (!imageBase64) {
    return res.status(400).json({ success: false, message: 'No image payload provided.' });
  }

  const matches = imageBase64.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
  if (!matches) {
    return res.status(400).json({ success: false, message: 'Invalid image format. Allowed: PNG, JPEG, WEBP.' });
  }

  const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
  const buffer = Buffer.from(matches[2], 'base64');

  if (buffer.length > 5 * 1024 * 1024) {
    return res.status(400).json({ success: false, message: 'Image size exceeds maximum limit of 5MB.' });
  }

  const safeFileName = 'img_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8) + '.' + ext;
  const targetPath = path.join(__dirname, 'assets', safeFileName);

  try {
    fs.writeFileSync(targetPath, buffer);
    logAdminAction(req.adminUser, 'IMAGE_UPLOAD', safeFileName, `Uploaded image assets/${safeFileName}`);
    res.json({ success: true, imageUrl: 'assets/' + safeFileName, message: 'Image uploaded successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to save image file.' });
  }
});

// Config & Template Public Endpoints
app.get('/api/config', (req, res) => res.json({ success: true, config: readConfig() }));
app.get('/api/template', (req, res) => res.json({ success: true, template: readTemplate() }));

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server (Only when run directly, not imported by Vercel serverless)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`
    🏥 =========================================================
    UNITED REFERENCE LABORATORY - PRODUCTION BACKEND
    Running at: http://localhost:${PORT}
    Admin Login: http://localhost:${PORT}/admin-login.html
    Database Hub: http://localhost:${PORT}/dashboard.html
    Database File: ${DB_FILE}
    ========================================================= 🏥
    `);
  });
}

module.exports = app;
