# Ticket Booking API

A concurrency-safe ticket booking system built with Node.js, Express, and MongoDB. Implements atomic updates to prevent overselling when multiple users book tickets simultaneously.

## Tech Stack

- **Node.js** + **Express.js** - Backend server
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **dotenv** - Environment variable management

## Project Structure

```
ticket-booking-api_onlybees/
├── src/
│   ├── models/
│   │   ├── Event.js          # Event schema
│   │   └── Booking.js        # Booking schema
│   ├── routes/
│   │   ├── eventRoutes.js    # Event endpoints
│   │   └── bookingRoutes.js  # Booking endpoints
│   ├── controllers/
│   │   ├── eventController.js    # Event logic
│   │   └── bookingController.js  # Booking logic
│   ├── config/
│   │   └── db.js             # MongoDB connection
│   └── server.js             # Entry point
├── scripts/
│   └── raceTest.js           # Concurrency test script
├── .env                      # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## How to Run Locally

### 1. Clone the Repository

```bash
git clone https://github.com/Shamimkhan1406/ticket-booking-api_onlybees.git
cd ticket-booking-api_onlybees
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ticket-booking
```

**Note:** Replace `MONGO_URI` with your MongoDB connection string (local or MongoDB Atlas).

### 4. Start the Server

```bash
npm run dev
```

Server will start at `http://localhost:5000`

## API Endpoints

### 1. Create Event

**Endpoint:** `POST /events/create`

**Purpose:** Create a new event with available tickets

**Request Body:**
```json
{
  "name": "Concert Night",
  "totalTickets": 10
}
```

**Response:**
```json
{
  "success": true,
  "event": {
    "_id": "67841f2a3b4c5d6e7f8g9h0i",
    "name": "Concert Night",
    "totalTickets": 10,
    "availableTickets": 10
  }
}
```

---

### 2. Get Event Details

**Endpoint:** `GET /events/:id`

**Purpose:** Fetch event details and available tickets

**Response:**
```json
{
  "success": true,
  "event": {
    "_id": "67841f2a3b4c5d6e7f8g9h0i",
    "name": "Concert Night",
    "totalTickets": 10,
    "availableTickets": 5
  }
}
```

---

### 3. Book Ticket

**Endpoint:** `POST /book`

**Purpose:** Book a ticket for an event (concurrency-safe)

**Request Body:**
```json
{
  "eventId": "67841f2a3b4c5d6e7f8g9h0i",
  "userId": "user123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Booking successful",
  "booking": {
    "_id": "67842a1b2c3d4e5f6g7h8i9j",
    "eventId": "67841f2a3b4c5d6e7f8g9h0i",
    "userId": "user123",
    "bookedAt": "2026-01-13T10:30:00.000Z"
  }
}
```

**Response (Failed):**
```json
{
  "success": false,
  "message": "No tickets available"
}
```

---

### 4. Get All Bookings

**Endpoint:** `GET /bookings`

**Purpose:** Retrieve all bookings

**Response:**
```json
{
  "success": true,
  "bookings": [
    {
      "_id": "67842a1b2c3d4e5f6g7h8i9j",
      "eventId": "67841f2a3b4c5d6e7f8g9h0i",
      "userId": "user123",
      "bookedAt": "2026-01-13T10:30:00.000Z"
    }
  ]
}
```

## Concurrency Test Script

### What It Does

The `scripts/raceTest.js` script simulates 10 users attempting to book tickets simultaneously for an event with only 5 available tickets. This tests the concurrency-safe locking mechanism.

### Run the Test

```bash
node scripts/raceTest.js
```

### Expected Output

```
Starting race condition test...
Event created: Concert Night (5 tickets)

Simulating 10 concurrent booking requests...

✅ Success: 5
❌ Failed: 5

Test completed. Check the results above.
```

**Interpretation:** Exactly 5 bookings succeed, and 5 fail. No overselling occurs.

## Locking Strategy & Concurrency Handling

### The Problem: Race Condition & Overselling

When multiple users try to book the last ticket simultaneously, a race condition can occur:

1. User A checks: 1 ticket available ✅
2. User B checks: 1 ticket available ✅  
3. User A books → Success
4. User B books → Success (OVERSOLD! Should have failed)

This happens because both users see available tickets before either completes their booking, resulting in selling more tickets than available.

### The Solution: Atomic Updates with MongoDB

This API uses **MongoDB's atomic `findOneAndUpdate`** operation to prevent overselling:

```javascript
const event = await Event.findOneAndUpdate(
  { _id: eventId, availableTickets: { $gte: 1 } },
  { $inc: { availableTickets: -1 } },
  { new: true }
);
```

**How It Works:**

- **Atomic Operation:** MongoDB executes the check (`$gte: 1`) and decrement (`$inc: -1`) as a single atomic operation
- **Conditional Update:** Only decrements if `availableTickets >= 1` at the exact moment of execution
- **No Locking Required:** MongoDB's document-level atomicity handles concurrency internally
- **Returns Updated Document:** If successful, returns the updated event; if no tickets available, returns `null`

**Why This Prevents Overselling:**

MongoDB guarantees that the check-and-update happens atomically. If 10 users request the last ticket, only one `findOneAndUpdate` will succeed because MongoDB processes them sequentially at the document level. The other 9 will fail since the condition `availableTickets >= 1` becomes false after the first succeeds.

### Real-World Production Improvements

For production systems handling high traffic, consider:

- **Database Indexing:** Index `eventId` and `availableTickets` for faster queries
- **Redis Caching:** Cache event availability to reduce database load
- **Queue System:** Use message queues (RabbitMQ, AWS SQS) for booking requests to handle spikes
- **Distributed Locking:** Implement Redis-based locks for multi-server deployments
- **Optimistic Concurrency Control:** Add version numbers to detect concurrent modifications
- **Rate Limiting:** Prevent abuse with rate limits per user/IP
- **Monitoring & Alerts:** Track booking failures and system performance in real-time

---


## Author

[Shamim Khan](https://github.com/Shamimkhan1406)