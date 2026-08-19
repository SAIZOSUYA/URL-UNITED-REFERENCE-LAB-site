# United Reference Laboratory (URL) — Admin Security & Database Workflow Guide

## Overview
This document describes the production-ready security, authentication, and database workflow implementation for the United Reference Laboratory (URL Group) diagnostic website backend and admin portal.

---

## 1. Authentication Architecture
- **Password Storage**: Admin credentials in `data/admin_auth.json` are stored exclusively as **Bcrypt hashes** (cost factor 10). Plaintext passwords are never persisted.
- **Session Tokens**: Authenticated sessions issue signed **JWTs** (JSON Web Tokens) with a **8-hour expiration** (`expiresIn: '8h'`).
- **Single Auth Path**: Login is strictly gated via `POST /api/auth/login` requiring valid admin `username` and `password`. Raw access code bypasses have been removed.
- **Rate Limiting & Lockout**: `POST /api/auth/login` is protected by `express-rate-limit` allowing a maximum of **5 failed attempts per 15 minutes per IP**.

---

## 2. Environment Variables (`.env`)
Secrets and environment settings are loaded via `dotenv` from `.env` (excluded from version control via `.gitignore`):

```env
PORT=3000
NODE_ENV=production
JWT_SECRET="c5a6ad2107e8ee3d4ee06e9f8dd9038f950b11a6b63e63787c04dbc6aa24538e"
ADMIN_DEFAULT_USERNAME="admin"
ADMIN_DEFAULT_PASSWORD="unitedrl12"
ALLOWED_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"
```

---

## 3. How to Rotate Admin Credentials
To rotate or reset the admin password:

1. **Option A: Using the Migration Script**
   Update `ADMIN_DEFAULT_PASSWORD` in your `.env` file, then run:
   ```bash
   node scripts/migrate-auth.js --force
   ```

2. **Option B: Manual Hash Generation**
   Generate a bcrypt hash (e.g. using `bcryptjs`) and update `data/admin_auth.json`:
   ```json
   {
     "username": "admin",
     "passwordHash": "$2b$10$YourGeneratedBcryptHashHere...",
     "updatedAt": "2026-08-17T00:00:00.000Z"
   }
   ```

---

## 4. Protected Admin Endpoints & Audit Logging
All admin API routes require a valid `Authorization: Bearer <JWT_TOKEN>` header:

- `GET /api/appointments`: Server-side paginated & filtered appointment records.
- `PATCH /api/appointments/:id/status`: Updates appointment status and `updated_at` timestamp.
- `DELETE /api/appointments/:id`: **Soft-deletes** record by setting `is_archived = 1`.
- `POST /api/appointments/bulk-action`: Bulk confirms or archives selected records.
- `POST /api/appointments/empty-archive`: Permanently purges archived records.
- `GET /api/appointments/export`: Downloads full CSV export of query results.
- `GET /api/audit-logs`: Fetches audit log records from the `admin_actions` table.
- `POST /api/upload-image`: Authenticated Base64 image upload with MIME validation & 5MB limit.

---

## 5. Audit Logging & Soft-Delete Workflow
- **Audit Logs (`admin_actions`)**: Every admin login, status change, archive, bulk action, and purge is recorded in SQLite with the admin username, IP, action, target ID, and timestamp.
- **Soft-Delete**: Deleting a record flags it as `is_archived = 1`. Archived records can be viewed under the **Archived Records** tab in `dashboard.html` and restored or permanently purged via "Empty Archive".
