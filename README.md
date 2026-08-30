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

-

---



---

## 📄 License
© United Reference Laboratory Pvt. Ltd. All rights reserved.
