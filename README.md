# CreatorOS — Backend

The core API server for **CreatorOS**. Built with Node.js and Express, it handles authentication (including Google OAuth with YouTube access), MongoDB data storage, Redis caching, and acts as a proxy between the frontend and the Python AI service.

## Tech Stack

- **Node.js** + **Express**
- **MongoDB** (via Mongoose) — hosted on MongoDB Atlas
- **Redis** (via `ioredis`) — caching layer, hosted on Redis Cloud
- **JWT** — authentication tokens, delivered via HTTP-only cookies
- **express-session** — used during the OAuth handshake (state/CSRF protection)
- **Google APIs** — OAuth 2.0, YouTube Data API v3, YouTube Analytics API
- **Axios** — used to call the Python AI service

## Features

- Email/password registration and login (bcrypt-hashed passwords)
- Google OAuth 2.0 login with YouTube channel access (`youtube.readonly`, `yt-analytics.readonly`)
- Account linking — a user who registered with email/password can later connect their YouTube channel via Google, without creating a duplicate account
- Encrypted storage of Google refresh tokens (AES-256-GCM)
- YouTube video + analytics data fetching with pagination and batching (handles 50+ videos via chunked API calls)
- Redis caching of fetched YouTube data (20-minute TTL), with graceful fallback if Redis is unavailable
- Proxy routes to the Python AI service for chat, trend insights, and topic suggestions

## Project Structure

```
src/
├── config/
│   ├── config.js          # Centralized env var access
│   └── redis.js           # Redis client + connection handling
├── controllers/
│   ├── auth/               # Register, login, getMe
│   ├── oauth/               # Google OAuth callback, connect-youtube
│   ├── youtube/              # Video list, single video
│   └── ai/                   # Chat, trends, suggest-topic proxy controllers
├── middlewares/
│   └── auth/
│       └── auth.middleware.js  # verifyJWT — reads cookie, attaches req.user
├── models/
│   ├── user.model.js
│   └── videos.model.js
├── routes/
│   ├── auth.routes.js
│   ├── Oauth.routes.js
│   ├── youtube.routes.js
│   └── ai.routes.js
├── services/
│   ├── googleAuth.service.js  # OAuth client, token exchange, YouTube API calls
│   ├── getVideos.service.js   # Orchestrates cache → Google fetch → cache write
├── utils/
│   └── crypto.utli.js         # AES-256-GCM encrypt/decrypt for refresh tokens
├── app.js                     # Express app setup (middleware, routes)
└── index.js                   # Server entry point
```

## Environment Variables

```env
# Server
PORT=3000
FRONTEND_URL=http://localhost:5173

# MongoDB
MONGODB_URI=mongodb+srv://...

# Redis
REDIS_URL=redis://default:password@host:port

# Sessions & JWT
SESSION_SECRET=long_random_string
JWT_SECRET=long_random_string
TOKEN_ENC_KEY=64_char_hex_string   # generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# AI Service
AI_SERVICE_URL=http://localhost:8000
```

## Getting Started

```bash
npm install
npm run dev
```

Server runs on `http://localhost:3000` by default.

## Authentication Design

- **JWT is stored in an HTTP-only cookie**, not `localStorage`. This prevents client-side scripts from reading or tampering with the token.
- `verifyJWT` middleware reads the cookie, verifies the signature, and attaches `req.user = { id }` to the request. Downstream handlers trust `req.user.id` — it is never taken from the client body or query params.
- When the backend calls the Python AI service, it passes `creatorId` derived from `req.user.id` — the Python service never receives or trusts an ID supplied directly by the browser.

## Google OAuth Flow

1. `GET /auth/google` — generates a random `state`, stores it in the session, redirects to Google's consent screen. Requested scopes: `openid`, `email`, `profile`, `youtube.readonly`, `yt-analytics.readonly`.
2. `GET /auth/google/callback` — validates `state`, exchanges the authorization `code` for tokens, fetches the user's profile and YouTube channel info.
   - If `req.session.linkUserId` is set (user clicked "Connect YouTube" while already logged in), the existing user record is updated instead of creating a new account.
   - Otherwise, an existing user is found by `googleId` or created fresh.
3. The YouTube **refresh token** is encrypted (AES-256-GCM) before being stored in MongoDB (`select: false` on the schema field, so it's excluded from normal queries).
4. A JWT is issued and set as an HTTP-only cookie; the browser is redirected to the frontend dashboard.

## YouTube Data Fetching & Caching

- `getVideos.service.js` orchestrates the flow: check Redis cache → if miss, fetch a fresh access token from the stored refresh token → fetch the channel's uploads playlist → paginate through all videos (handles channels with 50+ videos via `nextPageToken` loops and batched `videos.list` calls) → fetch channel analytics → cache the combined result in Redis for 20 minutes.
- Redis failures (connection issues, quota limits) are caught and logged; the request still succeeds by falling back to a live Google API fetch. Redis is a performance layer, not a hard dependency.

## AI Service Proxy

The backend never lets the frontend call the Python AI service directly. Instead:

```
Frontend → POST /api/ai/chat (cookie-authenticated)
         → Backend resolves req.user.id → creatorId
         → Backend calls Python service with trusted creatorId
         → Response forwarded back to frontend
```

Routes:
- `POST /api/ai/chat` — ask a question about the channel's data
- `GET /api/ai/trends` — get AI-generated trend insights from top videos
- `POST /api/ai/suggest-topic` — get a new video topic suggestion based on preferences

## Deployment

Deployed on **Railway**. Recommended: run the Node.js backend and the Python AI service as separate services within the same Railway project to take advantage of private internal networking between them.

Set all environment variables above in the Railway service settings. Update `GOOGLE_REDIRECT_URI` and `FRONTEND_URL` to production values, and add the production redirect URI to the Google Cloud Console OAuth client.

## Known Limitations / Future Work

- Chroma vector store data (used by the AI service) is not yet backed by persistent storage in production — see the chatbot README.
- Google OAuth app is currently in "Testing" mode in Google Cloud Console; publishing requires completing Google's verification process for sensitive scopes (`youtube.readonly`, `yt-analytics.readonly`).
