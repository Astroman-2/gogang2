# LyricFlow: Lyric-Image Blog Ecosystem

## Setup Instructions
1. **Environment**: Copy `.env.example` to `.env` and add your `DATABASE_URL` and `UNSPLASH_ACCESS_KEY`.
2. **Database**: Run `npx prisma migrate dev --name init` to set up your PostgreSQL schema.
3. **Install**: Run `npm install` in the root.
4. **Launch**: Run `npm run dev` to start the Express server (Port 5000) and React client simultaneously.

## Features
- **Autonomous Content**: Scrapes YouTube transcripts via `youtube-transcript`.
- **Dynamic Visuals**: Generates high-end imagery via Unsplash API.
- **Interaction**: Persistent social reactions and comments via Prisma/PostgreSQL.
- **Dark UI**: Built with React + Tailwind CSS.