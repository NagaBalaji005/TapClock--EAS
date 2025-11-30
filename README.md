# TapClock — EAS

**Employee Tracking System**

**Author:** Adapala Naga Balaji  
**College:** Vignan's Lara Institute of Technology and Science  
**Contact:** +91 93943 14214  
**Email:** adapala.nagabalaji005@gmail.com

> Lightweight, role-based attendance tracking system for employees and managers — built with **React**, **Redux Toolkit**, **Node.js**, **Express**, and **PostgreSQL**.

---

## 🔍 Table of Contents

- [Project Overview](#project-overview)  
- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Project Structure](#project-structure)  
- [Database Schema](#database-schema)  
- [Environment Variables](#environment-variables)  
- [Setup & Run (Local)](#setup--run-local)  
- [Seed Data](#seed-data)  
- [API Endpoints](#api-endpoints)  
- [Usage Notes](#usage-notes)  
- [Troubleshooting](#troubleshooting)  
- [Contributing](#contributing)  
- [License](#license)  
- [Contact](#contact)

---

## Project Overview

**TapClock (EAS)** is a full-stack attendance solution with two roles:

- **Employee** — register/login, check-in/check-out, view history, monthly summary, dashboard.  
- **Manager** — view and manage team attendance, filters, calendar, CSV exports, team dashboard.

Designed for small-to-medium companies and training academies (e.g., TAP Academy).

---

## Features

### Employee
- Register / Login (JWT)
- Check In / Check Out (automatic status: present / late / half-day / absent)
- Calendar & Table attendance views
- Monthly summary & recent activity
- Profile management

### Manager
- View all employees' attendance
- Filter by employee / department / status / date range
- Team calendar & team summary
- Export reports (CSV)
- Manager dashboard (trends, late arrivals, absent list)

---

## Tech Stack

- **Frontend:** React, Redux Toolkit, React Router, Axios, date-fns  
- **Backend:** Node.js, Express, jsonwebtoken, bcryptjs, express-validator  
- **Database:** PostgreSQL (`pg`)  
- **Dev Tools:** Nodemon, dotenv

---

## Project Structure

