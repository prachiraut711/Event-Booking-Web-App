# 🎟️ Eventora - Event Booking Web Application

Eventora is a full-stack event booking platform that allows users to discover events, register securely, and manage bookings in real-time. It provides a seamless experience for both users and administrators with features like OTP verification, role-based dashboards, and dynamic event management.

---

## 🚀 Project Demo

🎥 Watch the full demo here:
https://www.youtube.com/watch?v=0TlHoaTM-II

---

## ✨ Features

* 🔐 User Authentication with Email & OTP Verification
* 👤 Role-Based Access (User & Admin)
* 📅 Browse and Search Events
* 🎟️ Book Events with OTP Confirmation
* 📊 Admin Dashboard for Event Management
* 📉 Real-time Seat Availability Tracking
* 📧 Email Notifications using Nodemailer
* ⚡ Responsive UI with modern design

---

## 🛠️ Tech Stack

### Frontend

* React.js (Vite)
* Tailwind CSS
* React Router
* Axios

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)

### Other Tools

* JWT Authentication
* Nodemailer (Email Service)
* dotenv (Environment Variables)

---

## 📁 Project Structure

Event-Booking-Web-App/
├── client/        # Frontend (React + Vite)
├── server/        # Backend (Node + Express)
└── README.md

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/prachiraut711/Event-Booking-Web-App.git
cd Event-Booking-Web-App
```

---

### 2️⃣ Setup Backend

```bash
cd server
npm install
```

Create a `.env` file in the server folder and add:

```env
PORT=5000
MONGODB_URL=your_mongodb_connection_string
EMAIL_USER=your_email
EMAIL_PASS=your_email_app_password
JWT_SECRET=your_secret_key
```

Run backend:

```bash
npm run dev
```

---

### 3️⃣ Setup Frontend

```bash
cd ../client
npm install
npm run dev
```

Frontend will run on:
http://localhost:5173

Backend will run on:
http://localhost:5000

---

## 🔐 Authentication Flow

* User registers → OTP sent via email
* User verifies OTP → Account activated
* Login with credentials
* Role-based navigation (Admin/User)

---

## 📌 API Endpoints

### Auth

* POST `/api/auth/register`
* POST `/api/auth/login`
* POST `/api/auth/verify-otp`

### Events

* GET `/api/events`
* GET `/api/events/:id`

### Bookings

* POST `/api/bookings/send-otp`
* POST `/api/bookings`

---

## 🎯 Future Enhancements

* 💳 Payment Integration (Stripe/Razorpay)
* 📱 Mobile App Version
* 👥 Group Bookings
* ⭐ Event Reviews & Ratings

---

## 👩‍💻 Author

**Prachi Raut**
GitHub: https://github.com/prachiraut711

