# Project Structure

This document outlines the structure of the RKG Properties and Constructions website.

## Directory Structure

```
RKG_Properties_and_Constructions/
├── app/                          # Next.js App Router
│   ├── about/                   # About page
│   ├── admin/                   # Admin dashboard and management
│   │   ├── add-listing/        # Add new property listing
│   │   ├── edit-builder-floor/ # Edit builder floor listings
│   │   ├── edit-property/      # Edit apartment listings
│   │   ├── login/              # Admin authentication
│   │   └── sync-developers/    # Developer sync utility
│   ├── api/                    # API routes
│   │   ├── admin/             # Admin API endpoints
│   │   ├── builder-floors/    # Builder floor CRUD operations
│   │   ├── contact/           # Contact form submission
│   │   ├── developers/        # Developer management
│   │   ├── projects/          # Apartment CRUD operations
│   │   └── upload-image/      # Image upload handler
│   ├── apartments/            # Apartment listings page
│   ├── builder-floor/         # Builder floor pages
│   │   ├── [slug]/           # Builder floor detail pages
│   │   ├── BuilderFloorContent.jsx
│   │   └── UserButtonWrapper.jsx
│   ├── contact/               # Contact page
│   ├── developers/            # Developer pages
│   ├── projects/              # Apartment detail pages
│   ├── layout.js             # Root layout
│   └── page.js               # Home page
│
├── components/                 # React components
│   ├── features/              # Feature-specific components
│   │   ├── ContactForm.jsx
│   │   ├── InactivityTimer.jsx
│   │   └── ResidentialFilters.jsx
│   ├── layout/                # Layout components
│   │   ├── Header.jsx
│   │   └── Footer.jsx
│   └── ui/                    # UI components
│       ├── ProjectCard.jsx
│       └── Pagination.jsx
│   └── [other components]     # Sliders, galleries, etc.
│
├── config/                    # Configuration files
│   └── constants.js          # Application constants
│
├── database/                  # Database schema and migrations
│   └── *.sql                 # SQL schema files
│
├── lib/                       # Utility libraries
│   ├── developerUtils.js     # Developer-related utilities
│   ├── formatPrice.js        # Price formatting
│   ├── inputValidation.js    # Form validation
│   ├── rateLimit.js          # Rate limiting
│   └── supabase/             # Supabase client configuration
│       ├── client.js
│       └── server.js
│
├── public/                    # Static assets
│   ├── img/                  # Images
│   └── pdf/                  # PDF files
│
├── proxy.js                   # Next.js proxy (auth, routing)
├── next.config.js            # Next.js configuration
├── package.json              # Dependencies and scripts
└── README.md                 # Project documentation
```

## Component Organization

### Layout Components (`components/layout/`)
- **Header.jsx**: Main navigation header with user authentication
- **Footer.jsx**: Site footer

### Feature Components (`components/features/`)
- **ContactForm.jsx**: Contact form with email integration
- **InactivityTimer.jsx**: Auto sign-out after inactivity
- **ResidentialFilters.jsx**: Property filtering component

### UI Components (`components/ui/`)
- **ProjectCard.jsx**: Property card display component
- **Pagination.jsx**: Pagination controls

### Other Components
- **BHKConfigurationSlider.jsx**: BHK configuration display
- **BuildingConfigurationSlider.jsx**: Building configuration display
- **HeroCarousel.jsx**: Home page hero carousel
- **ProjectsSlider.jsx**: Property listings slider
- **ProjectImageGallery.jsx**: Image gallery for properties
- **LocationsSlider.jsx**: Locations display
- **DevelopersSlider.jsx**: Developers display
- **CountUpStats.jsx**: Animated statistics

## Configuration

### Environment Variables
See `.env.example` for required environment variables.

### Constants
Application-wide constants are defined in `config/constants.js`:
- Timeouts and intervals
- Pagination settings
- Rate limiting configuration
- Routes
- Colors and styling

## Database

SQL schema files are organized in the `database/` directory:
- `BUILDER_FLOORS_TABLE.sql`: Builder floors table schema
- `UPDATE_BUILDER_FLOORS_TABLE.sql`: Migration scripts
- `DEVELOPERS_TABLE_SETUP.sql`: Developers table schema
- `PROJECTS_RLS_POLICIES.sql`: Row Level Security policies
- Other setup and migration files

## API Routes

All API routes follow RESTful conventions:
- `/api/projects/*`: Apartment/project operations
- `/api/builder-floors/*`: Builder floor operations
- `/api/contact`: Contact form submissions
- `/api/developers/*`: Developer management
- `/api/admin/*`: Admin-only operations

## Best Practices

1. **Component Organization**: Components are organized by purpose (layout, features, UI)
2. **Constants**: All magic numbers and strings are in `config/constants.js`
3. **Type Safety**: Use consistent naming and structure
4. **Error Handling**: All API routes include proper error handling
5. **Security**: Authentication and authorization are handled via proxy
6. **Performance**: Images are optimized via Next.js Image component
7. **SEO**: Metadata is configured for all pages

