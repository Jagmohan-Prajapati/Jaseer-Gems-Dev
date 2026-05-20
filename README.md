# JaseerGems - Luxury Gemstone E-commerce

A full-stack luxury gemstone e-commerce application built with Next.js architecture (replicated via Express + Vite for the AI Studio Build environment), Prisma, and Tailwind CSS.

## Features

- **Luxury Brand Presence:** Faithful replication of high-end jewelry store designs from Jaipur.
- **Dynamic Inventory:** Manage rare gemstones with details like carat weight, origin, and certification.
- **Secure Authentication:** Role-based access for Admins and Patrons.
- **Advanced Cart:** persisted shopping experience with Zustand.
- **Secure Payments:** Integrated with Razorpay for global luxury transactions.
- **Administrative Suite:** Real-time dashboard, inventory management, and order tracking.

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Motion (animations)
- **Backend:** Express (Node.js)
- **ORM:** Prisma
- **Database:** PostgreSQL (hosted on Railway)
- **Auth:** Custom JWT-based session management using `jose` and `bcrypt`
- **Payments:** Razorpay
- **Images:** Cloudinary

## Setup Instructions

1. **Environment Variables**:
   See `.env.example` for the required keys. You will need:
   - `DATABASE_URL`: PostgreSQL connection string.
   - `CLOUDINARY_*`: API keys for image hosting.
   - `RAZORPAY_*`: API keys for payments.
   - `ADMIN_EMAIL` & `ADMIN_PASSWORD_HASH`: Initial admin credentials.

2. **Database Initialization**:
   ```bash
   npx prisma generate
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

3. **Development**:
   ```bash
   npm run dev
   ```

## Deployment

- **Frontend/API**: Deployed to Cloud Run via AI Studio.
- **Database**: Recommended PostgreSQL instance on Railway or Supabase.
- **Images**: Media assets served from Cloudinary CDN.

---
© 2024 JaseerGems Jaipur. All rights reserved.
