# FixEdu: School Facility Condition Reporting & Repair Tracking Portal

FixEdu is a production-ready, full-stack web application designed for academic campuses to streamline, monitor, and resolve physical facility damages and repair lifecycles. This system bridges the gap between reporters (students and teachers), maintenance staff, and school administrators, transforming a chaotic paper-trail reporting process into a real-time, audit-logged repair pipeline.

---

## 🚀 Key Features

### 🧑‍🎓 Students & Teachers (Reporters)
* **Quick Login & Registration**: Secure account creation with email format verification.
* **Incident Submission Form**: File reports detailing damage, choosing exact locations, and assigning severity tiers.
* **Proof Upload**: Drag-and-drop support for attaching up to 5 images of physical damage.
* **Detailed Status Tracking**: View a live, interactive timeline auditing each step of your report's resolution.
* **Notification System**: Receive unread notification badges and instant automated email alerts on status changes.

### 👷 Maintenance Staff
* **Personalized Task Queue**: Instant view of complaints assigned directly to you by the administration team.
* **Lifecycle Controls**: Accept jobs ("Start Work") to update tickets to "In Progress".
* **Completion Reports**: Upload completion photographs and write final resolution summaries to mark reports as "Resolved".

### 🛡️ Administrators
* **Central Command Dashboard**: Overview of system statistics (pending vs. completed reports, active repairs).
* **Complaint Assignment Modals**: Assign pending complaints to available maintenance staff.
* **User Permission Directories**: Verify user profiles and dynamically promote roles.
* **Facility Management CRUD**: Register new rooms, labs, or blocks, or edit details of existing locations.
* **Interactive Chart Analytics**: Visually trace monthly reporting frequencies, repair status ratios, and facility complaint spreads using Chart.js.

---

## 🛠️ Technology Stack
* **Frontend**: React.js (Vite), React Router v6, Chart.js, Axios, Vanilla CSS
* **Backend**: Node.js, Express.js (Model-View-Controller architecture)
* **Database**: MongoDB Atlas cloud cluster via Mongoose ORM
* **Security & Optimization**: JWT Authentication, bcryptjs password hashing, Helmet headers, express-rate-limit, express-mongo-sanitize

---

## 📁 Project Directory Structure
```text
school-facility-repair/
├── backend/            # Express REST API (MVC)
│   ├── config/         # Database and SMTP transporter setups
│   ├── controllers/    # Route controllers (auth, complaints, admin)
│   ├── middlewares/    # Custom middlewares (role checks, uploads, limits)
│   ├── models/         # Mongoose Schemas (User, Facility, Complaint, logs)
│   ├── routes/         # Express Router endpoints
│   ├── utils/          # Auxiliary services (Nodemailer sendEmail helper)
│   └── uploads/        # Local buffer for file uploads
└── frontend/           # React + Vite Client SPA
    ├── src/
    │   ├── components/ # Reusable UI components (Skeleton loaders)
    │   ├── context/    # App state contexts (AuthContext, ToastContext)
    │   ├── layouts/    # Structural wrappers (AuthLayout, DashboardLayout)
    │   ├── pages/      # Route page views (Login, LandingPage, Analytics)
    │   └── services/   # Client-side Axios API services
```

---

## 💻 Local Installation Guide

### Prerequisites
* Node.js (v18+)
* MongoDB Atlas account

### 1. Backend Setup
1. Clone the repository and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory using `.env.example` as a template:
   ```bash
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
   SMTP_HOST=smtp.mailtrap.io
   SMTP_PORT=2525
   SMTP_USER=your_smtp_username
   SMTP_PASS=your_smtp_password
   FROM_EMAIL=noreply@schoolfacility.com
   FROM_NAME="School Facility Portal"
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the client:
   ```bash
   npm run dev
   ```
4. Open your browser to `http://localhost:5173`.

---

## 🔮 Future Enhancements
* **Real-time WebSockets**: Integrate Socket.io to trigger instant browser notifications for active users without manual polling.
* **SMS Notifications**: Incorporate Twilio API to text status alerts directly to staff and students.
* **Map Pinpointing**: Integrate building floorplans allowing reporters to click and place pins on the exact location of the damage.

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
