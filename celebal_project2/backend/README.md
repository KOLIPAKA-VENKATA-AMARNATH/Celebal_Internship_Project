# Collaborative Code Editor Backend

This is the backend for a real-time collaborative code editor, similar to Google Docs but for code. It supports real-time editing, chat, version control, user authentication, and code snippet sharing.

---

## Features

- User authentication (JWT-based)
- Real-time collaborative code editing (Socket.IO)
- Syntax highlighting support (frontend)
- Version control (track changes, revert)
- Real-time chat for collaborators
- Code snippet sharing via public links
- MongoDB for data storage

---

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd celebal_project2/backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the `backend` folder:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/collabcode
JWT_SECRET=your_jwt_secret_here
```

---

**What’s next?**

- You can now share your backend with others or start building a frontend.
- If you want, I can provide a suggested folder structure and starter code for a React frontend that connects to this backend.

**Would you like to see how to start the frontend, or do you want to add more advanced backend features?**  
Let me know, or just say “continue” and I’ll keep building!

### 4. Start the server

```bash
npm run dev
```

or

```bash
npx nodemon server.js
```

---

## API Endpoints

### Auth

- `POST /api/auth/signup` — Register a new user
- `POST /api/auth/login` — Login and get JWT

### Code Documents

- `POST /api/code/` — Create a new document (auth required)
- `GET /api/code/:id` — Get a document by ID (auth required)
- `PUT /api/code/:id` — Update a document and save a new version (auth required)
- `GET /api/code/` — List all documents for a user (auth required)
- `POST /api/code/:id/revert` — Revert to a previous version (auth required)
- `POST /api/code/:id/share` — Generate a public share link (auth required)
- `POST /api/code/:id/unshare` — Remove share link (auth required)
- `GET /api/code/shared/:token` — Get a shared document by token (public)

### Chat

- `GET /api/chat/:documentId` — Get chat history for a document (auth required)
- Real-time chat via Socket.IO

---

## Real-Time Collaboration

- Connect to the backend using Socket.IO on the same port.
- Events:
  - `joinDocument` — Join a document room
  - `codeChange` — Send code changes
  - `codeUpdate` — Receive code updates
  - `chatMessage` — Send/receive chat messages

---

## License

MIT
