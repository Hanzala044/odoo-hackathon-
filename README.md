# 🚀 Dayflow — Modern HRMS Platform

<p align="center">
  <strong>A full-featured Human Resource Management System built for modern teams.</strong><br/>
  Employee onboarding, attendance tracking, leave management, and payroll — all in one place.
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white" />
  <img alt="MySQL" src="https://img.shields.io/badge/MySQL-Database-4479A1?logo=mysql&logoColor=white" />
  <img alt="Socket.IO" src="https://img.shields.io/badge/Socket.IO-Realtime-010101?logo=socket.io&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" />
</p>

<p align="center">
  🎥 <a href="https://drive.google.com/drive/folders/1hVBJ7u16wWIwCka2E7p6P8VYxNHf7a9k?usp=drive_link"><strong>Watch the Live Demo Video</strong></a>
</p>

---

## 📖 Overview

**Dayflow** is a complete Human Resource Management System (HRMS) designed and built during the **Odoo x NMIT Hackathon**. It streamlines everyday HR operations for organizations of any size — from employee onboarding and daily attendance to leave approvals and payroll calculations — wrapped in a clean, fast, and responsive interface.

The platform supports **multi-tenant companies**, meaning any organization can register, get its own isolated workspace, auto-generated login IDs for employees, and role-based dashboards for **Admins**, **HR**, and **Employees**.

---

## ✨ Key Features

### 🔐 Authentication & Onboarding
- Company self-registration with **auto-generated unique login IDs** (based on company initials, employee name, and join year)
- Secure password hashing with **bcrypt**
- Company logo upload during registration, displayed across the dashboard
- Forced password change flow for newly onboarded employees
- Session-based authentication with protected routes

### 👥 Employee Management
- Admin/HR can add, view, and manage employee records
- Auto-generated Employee ID and temporary password for new hires
- Rich employee profiles — personal details, job info, banking details, and documents

### ⏱️ Attendance Tracking
- One-click **Check-In / Check-Out**
- Break tracking with automatic time computation
- Daily, weekly, and historical attendance views
- Real-time attendance status updates across the dashboard (via Socket.IO)

### 🌴 Leave Management
- Employees can apply for **Paid / Sick / Unpaid** leave
- Admin/HR approval workflow with comments
- Real-time leave status notifications
- Leave history and current status tracking

### 💰 Payroll
- Automatic salary computation based on monthly wage, working days, and attendance
- Detailed **payslip generation** with breakdowns (base pay, bonuses, deductions)
- Mini payslip previews for quick reference

### ⚡ Real-Time Experience
- Powered by **Socket.IO** for live updates on attendance and leave requests — no manual refresh needed
- Instant UI sync between HR/Admin and Employee views

### 🎨 UI/UX
- Clean, modern dashboard built with **Tailwind CSS**
- Fully responsive across devices
- Role-based navigation (Employee / HR / Admin views)

---

## 🛠️ Tech Stack

| Layer            | Technology                                   |
|-------------------|-----------------------------------------------|
| Framework         | [Next.js 16](https://nextjs.org/) (App Router, Server Actions) |
| Language          | TypeScript                                    |
| UI                | React 19, Tailwind CSS 4                      |
| Database          | MySQL                                         |
| ORM               | Prisma 6                                      |
| Real-time Engine  | Socket.IO                                     |
| Auth & Security   | bcryptjs, custom session management           |
| Validation        | Zod                                           |
| Custom Server     | `tsx` + Node HTTP server for Socket.IO integration |

---

## 📂 Project Structure

```
odoo-hackathon-/
├── prisma/
│   ├── schema.prisma        # Database schema (Company, User, Profile, Attendance, LeaveRequest)
│   ├── migrations/          # MySQL migrations
│   └── seed.ts              # Database seed script
├── src/
│   ├── app/
│   │   ├── (auth)/          # Login & Register pages
│   │   ├── (dashboard)/     # Dashboard, Attendance, Leaves, Payroll, Employees, Profile, Admin
│   │   └── actions/         # Server actions (auth, attendance, leaves, employees)
│   ├── components/          # Reusable UI components
│   └── lib/                 # Auth, Prisma client, realtime, validations, utilities
├── server.ts                # Custom Node server bootstrapping Next.js + Socket.IO
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18
- **MySQL** database (local or hosted)

### 1. Clone the repository
```bash
git clone https://github.com/Hanzala044/odoo-hackathon-.git
cd odoo-hackathon-
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the project root:
```env
DATABASE_URL="mysql://<user>:<password>@<host>:<port>/<database>"
```

### 4. Set up the database
```bash
npm run db:migrate:dev
npm run db:seed
```

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 📜 Available Scripts

| Command                     | Description                                   |
|------------------------------|------------------------------------------------|
| `npm run dev`                | Start dev server (Next.js + Socket.IO via custom server) |
| `npm run dev:next`           | Start plain Next.js dev server                |
| `npm run build`              | Build for production                          |
| `npm run start`              | Start production server                       |
| `npm run lint`                | Run ESLint                                    |
| `npm run db:migrate:dev`     | Run Prisma migrations (development)           |
| `npm run db:migrate:deploy`  | Deploy Prisma migrations (production)         |
| `npm run db:seed`            | Seed the database                             |

---

## 🗄️ Database Schema Highlights

- **Company** — organization profile with logo, linked to its employees
- **User** — login credentials, role (`EMPLOYEE` / `HR` / `ADMIN`), linked profile
- **Profile** — personal, job, and banking details for each employee
- **Attendance** — daily check-in/out, breaks, and computed working minutes
- **LeaveRequest** — leave applications with type, status, and admin review
- **JoinCounter** — ensures unique, sequential login ID generation per company/year

---

## 🎥 Live Demo

Watch the full walkthrough and explanation of the project here:
👉 **[Project Demo Video](https://drive.google.com/drive/folders/1hVBJ7u16wWIwCka2E7p6P8VYxNHf7a9k?usp=drive_link)**

---

## 👨‍💻 Team

This project was proudly built by:

| Name                  |
|------------------------|
| **Mohammed Hanzala**   |
| **Mohammed Zaid**      |
| **Mohammed Mustafa**   |
| **Abdul Rehman**       |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/Hanzala044/odoo-hackathon-/issues).

## 📄 License

This project was created for the **Odoo x NMIT Hackathon**. All rights reserved by the team unless otherwise specified.

---

<p align="center">Made with ❤️ by Team Hanzala for the Odoo Hackathon</p>
