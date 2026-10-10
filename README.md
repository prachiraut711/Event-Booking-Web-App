# EventSphere

EventSphere is a full-stack event discovery, ticket reservation, and attendee management platform built with React, Node.js, Express, and MongoDB. It provides a complete end-to-end ticketing experience with real-time seat tracking, digital QR e-tickets, simulated checkout, and an administrator dashboard for event and booking oversight.

🌐 **Live Demo:** [Open EventSphere](https://event-booking-web-app-nine.vercel.app/)

---

## Architecture & Hosting

* **Frontend:** Hosted on [Vercel](https://vercel.com/)
* **Backend API:** Hosted on [Render](https://render.com/)
* **Database:** Hosted on [MongoDB Atlas](https://www.mongodb.com/atlas) (supports local MongoDB for development)

---

## Tech Stack

* **Frontend:**
  * React 19
  * Vite
  * Tailwind CSS
  * React Router v7
  * Axios
  * React Icons
  * `qrcode` (browser-side QR rendering)
* **Backend:**
  * Node.js
  * Express 5
  * MongoDB & Mongoose
  * JSON Web Tokens (JWT) for session management
  * bcryptjs for secure password hashing
  * CORS middleware

---

## Features

### 🔍 Event Discovery & Exploration
* Browse, search, filter by category, and sort events by upcoming dates, title, or price.
* View comprehensive event details: date, time, location, organizer, category, ticket price, and real-time seat availability.

### 🔐 Authentication (Demo Experience)
* Fast account registration and login using JWT and bcrypt-hashed passwords.
* Public registration assigns the regular attendee role (`user`).
* Simplified demo authentication flow allows immediate sign-up and sign-in without email OTP verification.
* Protected attendee and administrative routes.

### 🎟️ Flexible Reservation & Booking System
* Multiple ticket purchases with real-time seat deduction and capacity safeguards.
* **Free Events:** Instant RSVP with immediate ticket confirmation.
* **Paid Events (Simulated Checkout):** Demo checkout sandbox supporting mock Card and UPI options.
* **Booking Requests (Pending Approval):** Option to submit booking requests in `pending` status for manual review.
* **Booking Cancellation:** Attendees can cancel reservations with atomic seat restoration back to the event.

### 📱 Digital QR E-Tickets
* Instant scannable QR passes generated for confirmed bookings.
* Includes unique booking reference, event details, attendee name, and ticket quantity.

### 📊 Admin Dashboard & Management
* High-level metrics: total events, platform capacity, total reservations, and simulated revenue.
* Create, edit, and manage event listings.
* Review all user reservations with status filters (`all`, `confirmed`, `pending`, `cancelled`).
* Confirm pending booking requests without double-deducting seats.

---

## Screenshots

### Home Page
![EventSphere Home Page](docs/screenshots/home-page.png)

### Event Details
![Event Details](docs/screenshots/event-details.png)

### Demo Checkout
![Demo Checkout](docs/screenshots/checkout.png)

*Demo checkout only. No real money is charged.*

### Digital E-Ticket
![Digital E-Ticket](docs/screenshots/digital-ticket.png)

### Admin Dashboard
![Admin Dashboard](docs/screenshots/admin-dashboard.png)

### Booking Management
![Booking Management](docs/screenshots/booking-management.png)

---

## Payment Disclaimer

> [!NOTE]
> EventSphere features a **simulated sandbox checkout** for portfolio and demonstration purposes. No real payment gateway is integrated, and no real money will ever be charged.

---

## Local Setup & Development

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* [npm](https://www.npmjs.com/)
* [MongoDB](https://www.mongodb.com/) (running locally on port 27017 or a MongoDB Atlas connection string)

### 1. Clone the Repository

```bash
git clone https://github.com/prachiraut711/Event-Booking-Web-App.git
cd Event-Booking-Web-App
```

### 2. Install Dependencies

You can install all dependencies from the root directory:

```bash
npm run install:all
```

Or install them individually:

```bash
# Backend dependencies
cd server
npm install

# Frontend dependencies
cd ../client
npm install
```

### 3. Configure Environment Variables

#### Backend Configuration (`server/.env`)
Create a `.env` file in the `server` directory based on `server/.env.example`:

```env
PORT=5000
MONGODB_URL=mongodb://localhost:27017/eventsphere
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_secure_random_jwt_secret_here
NODE_ENV=development
```

#### Frontend Configuration (`client/.env`)
Create a `.env` file in the `client` directory based on `client/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

> [!IMPORTANT]
> Never commit `.env` files containing real production secrets, database credentials, or API keys to version control.

### 4. Database Seed Script Warning

> [!WARNING]
> Inspect `server/seed.js` before running it. The seed script deletes and recreates collections, so **never run it against a production database or any database containing data that must be preserved**.

To seed demo data in a fresh local development database:

```bash
cd server
npm run seed
```

### 5. Start the Application

Run the backend and frontend servers in separate terminal sessions:

#### Terminal 1 — Backend:
```bash
cd server
npm run dev
```
The server will start at `http://localhost:5000`.

#### Terminal 2 — Frontend:
```bash
cd client
npm run dev
```
Open `http://localhost:5173` in your browser.

*(Alternatively, run `npm run server` and `npm run client` from the root directory).*

---

## Author & Links

* **Author:** Prachi Raut
* **GitHub Profile:** [https://github.com/prachiraut711](https://github.com/prachiraut711)
* **Project Repository:** [https://github.com/prachiraut711/Event-Booking-Web-App](https://github.com/prachiraut711/Event-Booking-Web-App)
* **Live Deployment:** [https://event-booking-web-app-nine.vercel.app/](https://event-booking-web-app-nine.vercel.app/)
