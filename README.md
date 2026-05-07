# Bookshelf

A beautiful, modern book tracking app — your personal reading tracker with a significantly better UI than Goodreads.

**Live URL:** _Deploy to Vercel and update this link_

---

## Features

- **Goodreads CSV import** — upload your Goodreads export and we fetch cover art, descriptions, and genres via Google Books
- **Book search** — real-time search powered by the Google Books API with instant add-to-shelf
- **Three shelves** — Currently Reading, Want to Read, Read — with shelf switching
- **Currently Reading card** — Spotify-style card with cover art, animated progress bar, and days elapsed
- **Stats dashboard** — books per year, rating distribution, favourite genres, total pages read
- **Dark mode** — deep navy + cream + amber, cover-art-forward design

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | Neon Postgres (via `@neondatabase/serverless`) |
| Book data | Google Books API |
| Deployment | Vercel |

---

## Local Development

### 1. Clone the repo

```bash
git clone https://github.com/owilson123/bookshelf.git
cd bookshelf
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
DATABASE_URL=postgres://...   # Your Neon connection string
GOOGLE_BOOKS_API_KEY=         # Optional but recommended
```

**Getting a Neon database:**
1. Go to [neon.tech](https://neon.tech) → create a free project
2. Copy the connection string from the dashboard
3. Paste it as `DATABASE_URL`

**Google Books API key (optional):**
- Go to [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials
- Create an API key and enable the Books API
- Without a key the API works at ~1,000 requests/day

### 3. Initialise the database

Visit `/import` — the page automatically calls `/api/init` on first import, or POST to `/api/init` manually.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Importing from Goodreads

1. Go to **goodreads.com → My Books → Import and Export → Export Library**
2. Download the `.csv` file
3. In Bookshelf, go to **/import** and upload the file
4. The app fetches cover art and descriptions from Google Books for each title automatically

---

## Deploying to Vercel

### 1. Push to GitHub

```bash
git remote add origin https://github.com/owilson123/bookshelf.git
git push -u origin main
```

### 2. Create a Vercel project

Via the Vercel dashboard: **New Project → Import Git Repository → bookshelf**

Or via CLI:

```bash
npx vercel
```

### 3. Add environment variables in Vercel

Go to **Settings → Environment Variables** and add:

| Key | Value |
|---|---|
| `DATABASE_URL` | Your Neon connection string |
| `GOOGLE_BOOKS_API_KEY` | Your Google Books key (optional) |

### 4. Deploy

Every push to `main` triggers an automatic deployment. Or run:

```bash
npx vercel --prod
```

---

## Environment Variables

See [`.env.example`](.env.example) for all variables with descriptions.

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon/Postgres connection string |
| `GOOGLE_BOOKS_API_KEY` | ✗ | Google Books API key for higher rate limits |
