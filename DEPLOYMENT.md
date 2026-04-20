# Deployment Guide

This project should be deployed in 3 parts:
- MongoDB Atlas for database
- Render for backend
- Vercel for frontend

## Backend on Render

Use these settings:
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`

Set these environment variables in Render:
- `MONGO_URI=your-mongodb-atlas-connection-string`
- `JWT_SECRET=your-strong-secret`

After deployment, test:
- `https://your-backend-name.onrender.com/ping`

## Frontend on Vercel

Use these settings:
- Root Directory: `frontend`
- Framework: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

Set this environment variable in Vercel:
- `VITE_API_BASE_URL=https://your-backend-name.onrender.com`

## Local Environment Files

Use these example files:
- `frontend/.env.example`
- `backend/.env.example`

Create local env files as:
- `frontend/.env.local`
- `backend/.env`

## Important

- Deploying only the backend is not enough for this project.
- The frontend must also be deployed and connected to the backend URL.
- Your local Windows `spawn EPERM` issue should not block cloud deployment.
