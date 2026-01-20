# TM Operation App

Web application for operation management, including Shift Logs, Dashboard statistics, and Staff management.

## Project Structure

- **frontend/**: React application (Vite + Tailwind CSS).
- **backend/**: Node.js (Express) server.

## Getting Started

### Prerequisites

- Node.js (v18+)
- Supabase Project
- Google Service Account (optional, for legacy Sheets sync)

### Local Development

1.  **Setup Backend**
    ```bash
    cd backend
    npm install
    cp .env.example .env
    # Update .env with your credentials
    npm run dev
    ```

2.  **Setup Frontend**
    ```bash
    cd frontend
    npm install
    cp .env.example .env
    # Update .env with your credentials
    npm run dev
    ```

## Environment Variables

### Frontend (.env)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | URL of the backend API (e.g., `https://api.your-domain.com/api` or `http://localhost:3001/api`) |
| `VITE_SUPABASE_URL` | Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase Anonymous Key |

### Backend (.env)
| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default 3001) |
| `CORS_ORIGIN` | Allowed Frontend Origin (e.g., `https://your-frontend.vercel.app`) |
| `SUPABASE_URL` | Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | **Crucial**: Supabase Service Role Key (not Anon key) for admin actions |
| `SPREADSHEET_ID` | (Optional) Google Sheet ID for data sync |
| `GOOGLE_SERVICE_ACCOUNT_KEY_FILE` | (Optional) Path to Google Service Account JSON |

## Deployment Guide (Vercel)

This project handles Deployment with separate Frontend and Backend services.

### Frontend (Vercel)

1.  Import the `frontend` directory as a new Project in Vercel.
2.  **Build Settings**:
    - Framework Preset: `Vite`
    - Build Command: `vite build` (or `npm run build`)
    - Output Directory: `dist`
3.  **Environment Variables**:
    - Add all variables from `frontend/.env.example`.
    - **Important**: Set `VITE_API_URL` to your deployed Backend URL.

### Backend (Render / Railway / Vercel Serverless)

**Recommendation**: Deploy the backend on **Render** or **Railway** for easier Node.js hosting. If deploying to Vercel as Serverless Functions, additional configuration (`vercel.json`) is required.

**Deploying to Render:**
1.  Connect your repo.
2.  Root Directory: `backend`
3.  Build Command: `npm install`
4.  Start Command: `npm start`
5.  Add Environment Variables from `backend/.env.example`.
