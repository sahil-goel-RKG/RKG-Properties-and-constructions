# REIAS India Real Estate Website

A modern real estate website built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- 🏠 Residential and Commercial Project Listings
- 📝 Contact Form with Supabase Database Integration
- 📧 Email Notifications via Resend (when users submit contact form)
- 🖼️ Image Storage via Supabase Storage
- 📱 Fully Responsive Design
- 🚀 Server-Side Rendering with Next.js 16
- ⚡ Fast Performance with TypeScript

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings > API
3. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Create Supabase Tables

Run these SQL commands in your Supabase SQL Editor:

#### Projects Table

```sql
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  location TEXT NOT NULL,
  area TEXT,
  price TEXT,
  type TEXT NOT NULL CHECK (type IN ('residential', 'commercial', 'plots', 'sco-plots', 'villa-house')),
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_projects_type ON projects(type);
CREATE INDEX idx_projects_slug ON projects(slug);
```

#### Contact Submissions Table

```sql
CREATE TABLE contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Set Up Supabase Storage for Images

1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `project-images`
3. Set the bucket to public (or configure RLS policies as needed)

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── api/
│   │   └── contact/
│   │       └── route.ts          # Contact form API endpoint
│   ├── about/
│   │   └── page.tsx              # About page
│   ├── contact/
│   │   └── page.tsx              # Contact page
│   ├── residential/
│   │   └── page.tsx              # Residential projects page
│   ├── commercial/
│   │   └── page.tsx              # Commercial projects page
│   ├── layout.tsx                # Root layout with Header/Footer
│   └── page.tsx                  # Home page
├── components/
│   ├── Header.tsx                # Navigation header
│   ├── Footer.tsx                # Site footer
│   ├── ContactForm.tsx          # Contact form component
│   └── ProjectCard.tsx          # Project card component
└── lib/
    └── supabase/
        ├── client.ts             # Supabase client configuration
        └── types.ts              # TypeScript types
```

## Adding Projects

You can add projects to your Supabase database:

1. Via Supabase Dashboard: Insert rows directly into the `projects` table
2. Via SQL: Use INSERT statements in the SQL Editor
3. Via API: Create an admin interface to add projects

Example SQL:

```sql
INSERT INTO projects (name, slug, location, area, price, type, image_url)
VALUES (
  'Godrej SORA',
  'godrej-sora',
  'Golf Course Road',
  '3050-4250 sqft',
  '₹ Assured Best Price',
  'residential',
  'https://your-supabase-url.supabase.co/storage/v1/object/public/project-images/godrej-sora.jpg'
);
```

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for server-side operations)
- `RESEND_API_KEY` - Your Resend API key for sending email notifications (optional but recommended)
- `CONTACT_EMAIL` - Email address to receive contact form submissions (defaults to sahil@rkgproperties.in)
- `RESEND_FROM_EMAIL` - Email address to send from (defaults to onboarding@resend.dev, must be verified in Resend)

### Setting Up Resend Email Notifications

1. Create an account at [resend.com](https://resend.com)
2. Get your API key from the Resend dashboard
3. Verify your domain or use the default `onboarding@resend.dev` email
4. Add the following to your `.env.local` file:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CONTACT_EMAIL=sahil@rkgproperties.in
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**Note:** If `RESEND_API_KEY` is not set, the contact form will still work and save submissions to Supabase, but email notifications will be skipped.

## Technologies Used

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Supabase** - Backend and database
- **React 19** - UI library

## Project Structure

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed information about the project organization.

## Production Deployment

### Environment Variables

Copy `.env.example` to `.env.local` and fill in all required values:

```bash
cp .env.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for server-side operations)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key
- `RESEND_API_KEY` - Resend API key for email notifications
- `CONTACT_EMAIL` - Email address to receive contact form submissions
- `RESEND_FROM_EMAIL` - Verified email address for sending emails

### Build for Production

```bash
npm run build
npm start
```

### Deployment Platforms

#### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add all environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

#### Other Platforms
- Ensure Node.js 18+ is available
- Set all environment variables
- Run `npm run build` and `npm start`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically

## Security Features

- ✅ Row Level Security (RLS) on Supabase
- ✅ Rate limiting on API routes
- ✅ Input validation and sanitization
- ✅ Content Security Policy headers
- ✅ Automatic sign-out after inactivity
- ✅ Authentication required for admin routes
- ✅ Secure image uploads

## License

Private project - All rights reserved. 
"# RKG-Properties-and-constructions" 
