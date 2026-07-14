# Product Requirements Document (PRD)
## School Facility Condition Reporting & Repair Tracking Portal

---

## 1. Executive Summary & Objective
FixEdu is a unified, cloud-hosted campus infrastructure management platform designed to automate and track facility repair operations. The primary objective is to replace sluggish manual reporting workflows with an audit-logged digital pipeline, connecting Students/Teachers, Maintenance Staff, and Administrators in a single portal.

---

## 2. Target Audience & Roles

### A. Students & Teachers (Reporters)
* **Objective**: Report facility breakdowns and view resolution statuses.
* **Core Actions**: Register/Login, submit complaints with title/desc/severity/facility, upload multiple proof images, track progress on a vertical audit timeline, receive email updates.

### B. Maintenance Staff (Repair Techs)
* **Objective**: View and update assigned tasks.
* **Core Actions**: Access queue of assigned tickets, update status to "In Progress", upload completion proof images, write resolution logs.

### C. Administrators
* **Objective**: Maintain oversight of system users, facilities, and incidents.
* **Core Actions**: Monitor dashboard stats, assign pending tickets to staff, verify user roles, add/edit/delete facilities, inspect Chart.js analytical charts.

---

## 3. Product Scope & Functional Specs

### 3.1 Authentication & Permissions
* JWT-based authentication on all private routes.
* Secure bcrypt password hashing.
* Role-based route shields on both backend routers and client-side layouts.

### 3.2 Complaint Reporting Pipeline
* Form submission carrying location dropdowns, title descriptions, severity selectors, and multiple image uploads.
* Multer upload middleware restricting file sizes to 5MB and extensions to images only.
* Generation of a `RepairHistory` audit event log upon status transitions.

### 3.3 Search, Filtering, & Pagination
* API query parsing for server-side page indices, limit bounds, and search parameter matching.
* Case-insensitive regex search checking titles and descriptions.
* Interactive pagination controls on list tables.

### 3.4 Email Notification Engine
* Automatic Nodemailer email alerts sent:
  * To the reporter upon complaint submission.
  * To the assignee and reporter upon task assignment.
  * To the reporter when status changes to "In Progress" or "Resolved".

---

## 4. Technical Architecture
* **Frontend**: React (Vite SPA), React Router v6, Chart.js, Axios, Vanilla CSS Variables
* **Backend**: Node.js, Express.js (MVC Pattern), Mongoose ORM
* **Database**: MongoDB Atlas Cloud
* **Hosting Configuration**: Render (Backend Web Service), Vercel (Frontend Client, `vercel.json` SPA rewrites)
