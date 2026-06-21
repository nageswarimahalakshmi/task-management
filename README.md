# ZenTask | Premium Task Management Web Application

A premium, full-stack, real-time task management web application. The project features a React frontend client and an Express/Node.js backend server connecting to MongoDB Atlas with live WebSockets sync.

[![Live Demo](https://img.shields.io/badge/Demo-Live_Preview-6366f1?style=for-the-badge)](https://your-zentask-demo-link.vercel.app)
[![Vite](https://img.shields.io/badge/Vite-React-FFD600?style=for-the-badge&logo=vite)](https://vite.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://mongodb.com)

---

## 🚀 Features

- **Premium Glassmorphic Design:** A stunning obsidian dark-mode interface utilizing Google Fonts (`Outfit` & `Inter`), glowing accent overlays, and seamless animations.
- **Interactive Kanban Board:** Manage tasks using status lanes (*To Do*, *In Progress*, *Completed*) with quick control buttons for fast updates.
- **Searchable List View:** Toggle to a data grid view supporting real-time keyword search, column sorting (by date/priority), and category filtering.
- **Real-Time Live Syncing:** Powered by `Socket.io` WebSockets to instantly sync task lists across multiple browser windows and devices under the same account.
- **Performance Analytics:** Pure CSS circular progress gauges and animated priority/category bar charts visualizing your productivity metrics.
- **Secure Authentication:** Complete registration and login system with auto-hashed passwords (`bcryptjs`) and JWT session persistence.

---

## 📂 Project Structure

```text
├── client/                 # React frontend application (Vite)
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # UI Components (Dashboard, Board, List, Sidebar, Modals, Toast)
│   │   ├── utils/          # API fetch & Socket utilities
│   │   ├── App.jsx         # App state container
│   │   ├── index.css       # Core styling & theme design variables
│   │   └── main.jsx        # App entry point
│   ├── index.html          # Main HTML template
│   └── package.json        # Client package definitions
│
├── server/                 # Express backend API application
│   ├── config/
│   │   └── db.js           # Mongoose DB connection helper
│   ├── middleware/
│   │   └── auth.js         # JWT auth validation middleware
│   ├── models/
│   │   ├── User.js         # User database schema & password hashers
│   │   └── Task.js         # Task database schema
│   ├── .env                # Environment variables configuration
│   ├── .env.example        # Template for env configurations
│   ├── seed.js             # DB mock data seeder script
│   ├── server.js           # Express + Socket.io entry script
│   └── package.json        # Server package definitions
│
└── README.md               # Project documentation
```

---

## 🛠️ Installation & Setup

Ensure you have [Node.js](https://nodejs.org/) (v18+) installed.

### 1. Configure Environment Variables
Inside the `server/` directory, create a `.env` file (you can copy `.env.example`) and specify your MongoDB Atlas URI:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/taskmanager
JWT_SECRET=your_jwt_secret_key
```

### 2. Install Server Dependencies
```bash
cd server
npm install
```

### 3. Seed Database Data (Recommended)
To populate your database with sample categories (Work, Personal, Shopping, Urgent) and mock tasks, run:
```bash
node seed.js
```

### 4. Install Client Dependencies
```bash
cd ../client
npm install --legacy-peer-deps
```

---

## 💻 Running the Application

To run the application locally, you will need to start both the backend server and the frontend client.

### 1. Start the Backend API Server
In the `/server` folder, run:
```bash
npm start
```
*Port: `http://localhost:5000`*

### 2. Start the Frontend Client Dev Server
In the `/client` folder, run:
```bash
npm run dev
```
*Port: `http://localhost:5173`*

---

## 📸 Screenshots

#### 1. Authentication (Login & Signup screens)
![Login Screen](./login.png)

#### 2. Kanban Board (Interactive columns with status controls)
![Kanban Dashboard](./dashboard.png)

#### 3. Task List (Search filters and sorting)
![Task List](./list.png)

#### 4. Task Form (Create & Edit Dialog)
![Task Modal](./task.png)

#### 5. Productivity Analytics (CSS gauges & category ratios)
![Analytics Tab](./analytics.png)
