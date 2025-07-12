# 📅 Meeting Room Booking App

Meeting Room Booking is a full-stack web application that allows users to schedule, manage, and track meetings efficiently. It supports user authentication, secure data handling, and CRUD operations for meeting events.

---

## 👥 Team Details

**Team Name:**
- Futureminds

**Centre manager:**
  - Rupan

**Trainer:**
- D.Murugan

**Members:**
- Deepak (Head)
- Monish Kumar
---

## 🛠 Tech Stack

**Frontend:**
- React.js
- Vite
- TailwindCSS
- Axios

**Backend:**
- Node.js
- Express.js
- JSON Web Token (JWT)
- Bcrypt.js

**Database:**
- MySQL (hosted on [Railway](https://railway.app))

**Hosting/Deployment:**
- Frontend: Localhost  
- Backend: Railway

---

## 📘 Project Description

The app allows authenticated users to:
- Register and log in securely
- Create, view, update, and delete meetings
- View upcoming meetings in a dashboard
- Securely handle data with JWT and encrypted passwords

This is ideal for small teams or individuals who want a streamlined solution for managing meetings.

---

## 🚀 Setup Instructions

### ✅ Prerequisites

- Node.js
- Git

---

### 💻 Run the App Locally

Open a terminal and run the following commands one by one:

```
git clone https://github.com/TechMorgan/Meeting-Booking-App.git

cd frontend
npm install

npm run dev
```
This runs the frontend on http://localhost:5173 by default.

## 🧭 Usage Guide
Register a new account or log in.

Create a new meeting using the dashboard.

View your meetings, edit or cancel as needed.

Sample accounts existing in the Web app:

Employee login - username: qwerty / Password: 123456

Admin login - username: admin1 / Password: qwerty

## 📡 API Endpoints / Architecture
Base URL: https://anudip-production.up.railway.app/api

🔐 Auth
| Method | Endpoint    | Description              |
| ------ | ----------- | ------------------------ |
| POST   | `/register` | Register a new user      |
| POST   | `/login`    | Login and receive JWT    |
| GET    | `/me`       | Get current user profile |

🧑‍💼 Users (Admin Only)
| Method | Endpoint | Description           |
| ------ | -------- | --------------------- |
| GET    | `/users` | Get list of all users |

🏢 Rooms
| Method | Endpoint     | Description                   |
| ------ | ------------ | ----------------------------- |
| GET    | `/rooms`     | Get all rooms (auth required) |
| POST   | `/rooms`     | Add a new room (admin only)   |
| PUT    | `/rooms/:id` | Update a room (admin only)    |
| DELETE | `/rooms/:id` | Delete a room (admin only)    |

📅 Bookings
| Method | Endpoint        | Description                                      |
| ------ | --------------- | ------------------------------------------------ |
| POST   | `/bookings`     | Book a room (employee only)                      |
| GET    | `/bookings`     | Get bookings (admin gets all, employee gets own) |
| DELETE | `/bookings/:id` | Cancel a booking (by owner or admin)             |

## Project is Live at https://meetingbookapp.vercel.app/
