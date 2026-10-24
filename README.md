# Personal Notes App (Full-Stack MERN)

A complete, minimal, full-stack MERN application adhering strictly to standard RESTful conventions.

---

## 🏗️ Architecture

```
personal-notes-app/
├── package.json               # Root scripts
├── .gitignore                 # Root gitignore (node_modules, .env, dist)
├── server/                    # Standalone Node.js & Express Backend
│   ├── models/
│   │   ├── User.js            # User Schema (name, email, password, timestamps)
│   │   └── Note.js            # Note Schema (userId ref, title, content, timestamps)
│   ├── middleware/
│   │   └── auth.js            # JWT Bearer Token verification middleware
│   ├── routes/
│   │   ├── auth.js            # /api/auth (register, login, me)
│   │   └── notes.js           # /api/notes (GET, POST, DELETE with ownership check)
│   ├── .env.example           # Example environment variables
│   ├── .env                   # Local environment variables
│   ├── index.js               # Express application entrypoint
│   └── package.json
└── client/                    # Standalone React + Vite Frontend
    ├── src/
    │   ├── components/
    │   │   ├── AuthScreen.jsx  # Toggleable Sign In / Register card
    │   │   ├── Navbar.jsx      # Top navigation with user status and logout
    │   │   ├── NoteCreator.jsx # Note title & content input with submit
    │   │   ├── NoteCard.jsx    # Individual note card with formatted date & delete
    │   │   ├── NotesList.jsx   # Grid & 4 UI states (Loading, Success, Empty, Error)
    │   │   ├── Toast.jsx       # Floating feedback alerts
    │   │   └── Icons.jsx       # Clean SVG Icon set
    │   ├── services/
    │   │   └── api.js          # API client with automatic Bearer token injection
    │   ├── App.jsx             # Main application orchestrator
    │   ├── App.css             # Modern glassmorphism & responsive styles
    │   ├── index.css           # Design tokens, variables, and animations
    │   └── main.jsx
    ├── index.html              # Modern typography with Google Fonts
    ├── vite.config.js
    └── package.json
```

---

## 🌐 Live Hosted Link

- **Immediate Public Preview**: [https://hot-aliens-win.loca.lt](https://hot-aliens-win.loca.lt) *(Click "Click to Submit" / Enter IP `111.92.88.130` if prompted)*

### 🚀 Permanent Free 1-Click Cloud Hosting (Render)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/harsha05082007/personal-notes-app)

#### Option 1: 1-Click Deploy (Fastest)
1. Click the **Deploy to Render** button above (or open [render.com/deploy?repo=https://github.com/harsha05082007/personal-notes-app](https://render.com/deploy?repo=https://github.com/harsha05082007/personal-notes-app)).
2. Sign in with GitHub.
3. Render will automatically read `render.yaml` from this repository.
4. Enter your `MONGODB_URI`:
   ```
   mongodb+srv://Harsha:abcd1234@cluster0.ycplca6.mongodb.net/personal_notes?retryWrites=true&w=majority
   ```
5. Click **Apply** / **Deploy**! Render builds the React frontend, starts the Express server, and gives you your live URL.

#### Option 2: Manual Web Service Setup
1. Go to [Render Dashboard](https://dashboard.render.com) and click **New +** ➔ **Web Service**.
2. Connect your GitHub repository: `harsha05082007/personal-notes-app`.
3. Configure settings:
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
4. Under **Environment Variables**, add:
   - `MONGODB_URI`: `mongodb+srv://Harsha:abcd1234@cluster0.ycplca6.mongodb.net/personal_notes?retryWrites=true&w=majority`
   - `JWT_SECRET`: `supersecretpersonalnotesjwtkey12345`
5. Click **Deploy Web Service** to launch your live site!

---

## 🐳 Quick Start with Docker (Full-Stack + MongoDB)

The easiest way to run the entire application (MongoDB + Express Backend + React Frontend) is with Docker:

```bash
docker compose up --build -d
```

- **Frontend Web App (Open in Browser)**: [http://localhost:5173](http://localhost:5173)
- **Backend API (REST endpoints)**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **MongoDB Database**: Runs internally on port `27017` (accessed by backend driver or MongoDB Compass, not a web browser).

To shut down the containers:
```bash
docker compose down
```

---

## 💻 Manual Local Setup

### 1. Prerequisites
- **Node.js**: v18+ installed
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017/personal_notes`) or MongoDB Atlas.

### 2. Backend Setup (`/server`)
```bash
cd server
npm install
npm run dev
```
The server will start on `http://localhost:5000`.

Environment Variables (`server/.env`):
- `PORT`: Server port (default: `5000`)
- `MONGODB_URI`: MongoDB connection string (e.g. `mongodb://localhost:27017/personal_notes` or Atlas URI)
- `JWT_SECRET`: Secret key for signing JWT tokens

### 3. Frontend Setup (`/client`)
```bash
cd client
npm install
npm run dev
```
The Vite development server will start (default: `http://localhost:5173`).

---

## 📡 RESTful API Specifications

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Public | Register new user (hashes password with bcrypt 10 rounds, issues JWT) |
| **POST** | `/api/auth/login` | Public | Authenticates credentials and returns JWT + user profile |
| **GET** | `/api/auth/me` | Protected | Returns current authenticated user's profile |
| **GET** | `/api/notes` | Protected | Fetches all notes belonging strictly to `req.user.id` |
| **POST** | `/api/notes` | Protected | Creates a new note linked to `req.user.id` |
| **DELETE** | `/api/notes/:id` | Protected | Deletes a note only if owned by `req.user.id` |
| **GET** | `/api/health` | Public | Healthcheck and database connection status |

All protected routes require the HTTP header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🎨 Frontend Features & UI States

- **Single-Card Authentication**: Smooth toggle between Sign In and Register with instant client-side validation and quick demo credential fill.
- **Header**: Live user identity pill, database status indicator, and secure Logout button.
- **Note Creator**: Input fields for Title and Content, character counter, keyboard shortcut (`Ctrl` + `Enter`), and clear Submit button.
- **Notes List**: Responsive masonry/grid displaying title, formatted content with preserved linebreaks, creation timestamps, and single-click delete confirmation.
- **4 Essential UI States**:
  1. **Loading State**: Shimmering skeleton loader cards while notes are loading.
  2. **Success State**: Responsive toast notifications on creation, deletion, and login.
  3. **Empty List State**: Elegant "No notes found" state when note collection is empty.
  4. **Error State**: Inline banners and error cards with retry capabilities.
