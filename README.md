# United Reference Laboratory (URL) Pvt. Ltd.

> Official Web Portal & Live Admin Management System for United Reference Laboratory (URL Group) — Nepal's Premier Diagnostic & Pathology Laboratory.

---

## 🌟 Features

- **Diagnostic Services & Test Booking**: Interactive online lab test booking system for patients.
- **Production Express Backend** (`server.js`): Built with Node.js, Express, Rate-limiting, Helmet security headers, and CORS control.
- **Embedded SQLite Database**: Fast, reliable local database (`data/appointments.sqlite`) tracking appointment bookings and audit events.
- **Secure Admin Portal** (`/admin-login.html` & `/dashboard.html`):
  - **Bcrypt & JWT Auth**: Secured session authorization (`expiresIn: '8h'`).
  - **Appointment Management**: Filter by status, confirm, complete, or archive requests.
  - **CSV Export**: Instant export of appointment records.
  - **Audit Logging**: Tracks admin operations with timestamps and IP addresses.
  - **Soft Delete & Archive Purge**: Safely archive records without permanent data loss.

---

## 🚀 Live Deployment Options

### Option 1: Render.com (Recommended for Persistent SQLite)
Render provides persistent disk storage so your SQLite database (`data/appointments.sqlite`) stays saved forever across deployments and restarts.

1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository: `SAIZOSUYA/URL-UNITED-REFERENCE-LAB-site`.
4. Render automatically detects [`render.yaml`](render.yaml) or select **Node** runtime:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. *(Optional)* Under **Disks**, add a persistent disk mounted to `/app/data` (1 GB) for full database persistence.

---

### Option 2: Railway.app (Persistent Node + SQLite)
1. Go to [Railway.app](https://railway.app).
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select `SAIZOSUYA/URL-UNITED-REFERENCE-LAB-site`.
4. Add environment variables (`JWT_SECRET`, `ADMIN_DEFAULT_PASSWORD`).
5. Click **Deploy** — Railway will start the app automatically using [`Procfile`](Procfile).

---

### Option 3: Vercel (Serverless Deployment)
The repository includes [`vercel.json`](vercel.json) configured for Vercel serverless functions (`/tmp/data` environment).

1. Import the repository into [Vercel](https://vercel.com).
2. Deploy directly.
> *Note: On Vercel, serverless functions use an ephemeral `/tmp` directory. For permanent long-term database persistence, Render or Railway is recommended.*

---

## 🔐 Admin Credentials & Security setup

Default login credentials on first run:
- **Username**: `admin`
- **Password**: `URLDiagAdmin2026Secured!`

### Changing Admin Passwords:
Update `ADMIN_DEFAULT_PASSWORD` in `.env`, then run:
```bash
node scripts/migrate-auth.js --force
```

---

## 🛠️ Local Development Setup

1. **Clone repository**:
   ```bash
   git clone https://github.com/SAIZOSUYA/URL-UNITED-REFERENCE-LAB-site.git
   cd URL-UNITED-REFERENCE-LAB-site
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run local server**:
   ```bash
   npm start
   ```
4. **Access in browser**:
   - Website: `http://localhost:3000`
   - Admin Login: `http://localhost:3000/admin-login.html`
   - Admin Dashboard: `http://localhost:3000/dashboard.html`

---

## 📄 License
© United Reference Laboratory Pvt. Ltd. All rights reserved.
