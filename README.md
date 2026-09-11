# Farmer Kamol

Official website of **Farmer Kamol (কৃষক কমল)** — focused on integrated agriculture, farming knowledge, agricultural products, and online services.

🌐 **Website:** https://farmerkamol.com

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL (Supabase)
- Authentication & Authorization
- Supabase Storage
- Render (Production Hosting)

## Main Features

- 🛒 Product & Shop
- 📝 Agricultural Blog
- 🎥 Farming Videos / Media
- 👤 Customer Authentication
- 📦 Order Management
- 👨‍💼 Admin & Agent Panel
- 🧾 Invoice & Order Management
- 📍 Bangladesh District & Upazila Support
- 🔐 Role-based Access Control
- 🔎 SEO & Structured Data
- 🤖 AI/Search Engine Friendly Content Structure

## Project Structure

The project uses the **Next.js App Router** architecture with a `src/` based application structure.

Major areas include:

- Customer-facing website
- Admin Panel
- API Routes
- Authentication
- Products & Orders
- Blog & Media
- Database / Prisma
- SEO & Metadata

## Environment Variables

Create a `.env` / `.env.local` file for local development.

Required environment variable **names** should be kept private in their actual values.

```env
DATABASE_URL=
DIRECT_URL=

NEXTAUTH_SECRET=
NEXTAUTH_URL=

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

> Never commit `.env`, `.env.local`, API keys, passwords, tokens, or other secrets to GitHub.

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Production

- **Hosting:** Render
- **Database:** Supabase PostgreSQL
- **Storage:** Supabase
- **Production Domain:** https://farmerkamol.com

## Security

Production secrets and credentials must be stored in the hosting provider's environment variables and must never be committed to the repository.

## License

This project is maintained for the Farmer Kamol website and related services.
