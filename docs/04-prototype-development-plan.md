# Prototype Development Plan
## Real Estate Web Application — Buy / Sell / Rent

**Version:** 1.0  
**Date:** April 18, 2026  
**Goal:** Build a working clickable prototype to validate UX flows and core features before full development  
**Timeline:** 3 Weeks (1–2 developers)

---

## 1. Prototype Scope and Strategy

### What a Prototype Is (and Is Not)

| Aspect | Prototype | Full Production App |
|--------|-----------|-------------------|
| **Purpose** | Validate UX flows, gather feedback | Serve real users at scale |
| **Data** | Seed / mock data | Real user data |
| **Auth** | Simplified (email/password only) | OAuth, MFA, JWT rotation |
| **Payments** | Simulated (no real money) | Stripe live integration |
| **Performance** | Not optimized | Tuned for 10,000+ concurrent users |
| **Security** | Basic only | OWASP hardened |
| **Infrastructure** | Single server / Vercel free tier | AWS, Kubernetes, CDN |
| **Testing** | Manual only | Automated test suite |

### Prototype Goals
1. Demonstrate all 5 core user flows end-to-end
2. Validate UI/UX decisions with real users before committing to full build
3. Show stakeholders a working demo for feedback and buy-in
4. Identify usability issues early (cheapest point to fix them)
5. Provide a working base to iterate into the MVP

---

## 2. Important Features for the Prototype

### Priority 1 — Must Be In Prototype (Core Flows)

| # | Feature | Why It's Critical |
|---|---------|------------------|
| **P1-01** | **Landing Page** with hero search bar and property category tabs (Buy / Rent / Sell) | First impression; drives all other flows |
| **P1-02** | **Property Search Results** with basic filters (location, price, type, bedrooms) and a list/grid view toggle | Core discovery feature; most-used page |
| **P1-03** | **Property Detail Page** with image gallery, full specs, map location pin, and "Contact Agent / Owner" button | Validates listing content and layout |
| **P1-04** | **User Registration & Login** (email/password) | Gates listing creation and messaging |
| **P1-05** | **Create Listing Form** (3-step: Basic Info → Location + Map → Images & Price) | Core value for sellers and landlords |
| **P1-06** | **Contact / Inquiry Form** — buyer sends message to listing owner | Validates communication flow |
| **P1-07** | **User Dashboard — My Listings** — owner sees their active/draft listings | Shows listing management basics |
| **P1-08** | **User Dashboard — Saved Properties** — buyer saves and reviews favorite listings | Validates buyer retention loop |

### Priority 2 — Include If Time Allows

| # | Feature | Value |
|---|---------|-------|
| **P2-01** | **Map View** on search results (pins on embedded Google Maps / Mapbox static) | Strong visual validation for geo-based search |
| **P2-02** | **Listing Status Badge** — For Sale / For Rent / Sold / Rented | Clear transaction-type labeling |
| **P2-03** | **Basic Inbox** — view sent/received inquiries in one place | Validates messaging architecture |
| **P2-04** | **Similar Properties** widget on detail page (3 manually seeded cards) | Tests recommendation UI pattern |
| **P2-05** | **Admin — Listing Moderation Page** — approve or reject pending listings | Validates admin workflow |

### Excluded from Prototype

| Feature | Reason |
|---------|--------|
| Real payment / Stripe | Not needed to validate UX; adds complexity |
| OAuth (Google/Facebook) | Non-critical for prototype validation |
| Real-time messaging (WebSocket) | Simulated with page reload is sufficient |
| Email notification delivery | Logged to console only |
| Elasticsearch | PostgreSQL `ILIKE` search is sufficient for seeded data |
| MFA / advanced security | Out of scope for prototype |
| PWA / offline support | Post-prototype |

---

## 3. Recommended Prototype Tech Stack

Chosen for **speed of development**, not production scale.

| Layer | Technology | Reason |
|-------|-----------|--------|
| **Framework** | **Next.js 14** (App Router) | Full-stack in one repo; built-in routing, SSR, API routes |
| **Language** | **TypeScript** | Type safety, better DX even in prototype |
| **Styling** | **Tailwind CSS** | Utility-first; fastest way to build clean UIs |
| **UI Components** | **shadcn/ui** | Beautiful pre-built components built on Radix UI |
| **Database** | **PostgreSQL** (via Neon.tech free tier) | Serverless Postgres; zero config; real SQL |
| **ORM** | **Prisma** | Auto-generates types from schema; fast migrations |
| **Auth** | **NextAuth.js v5** | Drop-in auth; email/password for prototype |
| **File Uploads** | **Cloudinary** (free tier) | Image upload + CDN without S3 setup |
| **Maps** | **Google Maps Embed API** or **Leaflet.js** | Free static map embed on detail page |
| **Deployment** | **Vercel** (free tier) | One-command deploy; preview URLs per branch |
| **Icons** | **Lucide React** | Consistent icon set, included in shadcn/ui |
| **Forms** | **React Hook Form + Zod** | Lightweight, no extra dependencies |

### Why Next.js Instead of React + Express?
- One codebase for frontend + backend (API routes)
- No CORS configuration needed
- Built-in image optimization
- Deploy to Vercel in minutes
- Can evolve directly into the production app

---

## 4. Core User Flows to Prototype

### Flow 1: Browse and Find a Property (Buyer/Tenant)
```
Landing Page
    ↓ Search "Bangkok" + "Apartment" + "Rent"
Search Results Page (list of property cards)
    ↓ Click a property card
Property Detail Page (images, specs, location, price)
    ↓ Click "Save to Favorites"
Login / Register Page (if not logged in)
    ↓ Log in
Property saved → confirmation toast
```

### Flow 2: List a Property (Seller/Landlord)
```
Landing Page
    ↓ Click "Post a Listing"
Login / Register Page (if not logged in)
    ↓ Log in
Create Listing — Step 1: Basic Info (title, type, transaction type, description)
    ↓ Next
Create Listing — Step 2: Location + Map pin
    ↓ Next
Create Listing — Step 3: Images upload + Price
    ↓ Submit
Listing created → redirect to My Listings dashboard
```

### Flow 3: Inquire About a Property (Buyer → Owner)
```
Property Detail Page
    ↓ Click "Contact Owner"
Inquiry Form modal (name, email pre-filled, message)
    ↓ Send
Confirmation message: "Your inquiry has been sent"
Owner's Inbox shows the new message
```

### Flow 4: Manage My Listings (Owner)
```
User Dashboard → My Listings tab
    ↓ View list of own listings (status badges)
Click "Edit" on a listing
    ↓
Edit Listing Form (pre-filled)
    ↓ Save changes
Updated listing shown in dashboard
    ↓ Click "Mark as Sold / Rented"
Status updated
```

### Flow 5: Admin Moderation (Admin)
```
Admin Login
    ↓
Admin Dashboard → Pending Listings tab
    ↓ View listing details
Click "Approve" or "Reject"
    ↓
Listing status updated; owner notified (console log)
```

---

## 5. Database Schema (Prototype — Simplified)

```prisma
// schema.prisma

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  phone     String?
  role      Role     @default(BUYER)
  createdAt DateTime @default(now())

  properties  Property[]
  favorites   Favorite[]
  sentMessages    Message[] @relation("SentMessages")
  receivedMessages Message[] @relation("ReceivedMessages")
}

enum Role {
  BUYER
  SELLER
  LANDLORD
  TENANT
  AGENT
  ADMIN
}

model Property {
  id              String          @id @default(cuid())
  title           String
  description     String
  propertyType    PropertyType
  transactionType TransactionType
  price           Float
  bedrooms        Int
  bathrooms       Float
  squareFeet      Int?
  address         String
  city            String
  latitude        Float?
  longitude       Float?
  status          ListingStatus   @default(PENDING)
  images          String[]        // Cloudinary URLs
  amenities       String[]
  ownerId         String
  createdAt       DateTime        @default(now())

  owner     User       @relation(fields: [ownerId], references: [id])
  favorites Favorite[]
  messages  Message[]
}

enum PropertyType    { HOUSE APARTMENT CONDO TOWNHOUSE LAND COMMERCIAL }
enum TransactionType { SALE RENT LEASE }
enum ListingStatus   { DRAFT PENDING ACTIVE SOLD RENTED }

model Favorite {
  id         String   @id @default(cuid())
  userId     String
  propertyId String
  createdAt  DateTime @default(now())

  user     User     @relation(fields: [userId], references: [id])
  property Property @relation(fields: [propertyId], references: [id])

  @@unique([userId, propertyId])
}

model Message {
  id         String   @id @default(cuid())
  propertyId String
  senderId   String
  receiverId String
  content    String
  read       Boolean  @default(false)
  createdAt  DateTime @default(now())

  property Property @relation(fields: [propertyId], references: [id])
  sender   User     @relation("SentMessages",     fields: [senderId],   references: [id])
  receiver User     @relation("ReceivedMessages", fields: [receiverId], references: [id])
}
```

---

## 6. Page Inventory

| Page | Route | Auth | Priority |
|------|-------|:----:|:--------:|
| Landing / Home | `/` | No | P1 |
| Search Results | `/search?city=...&type=...` | No | P1 |
| Property Detail | `/properties/[id]` | No | P1 |
| Login | `/login` | No | P1 |
| Register | `/register` | No | P1 |
| Create Listing | `/listings/new` | Yes | P1 |
| Edit Listing | `/listings/[id]/edit` | Yes (owner) | P1 |
| Dashboard — My Listings | `/dashboard/listings` | Yes | P1 |
| Dashboard — Saved Properties | `/dashboard/favorites` | Yes | P1 |
| Dashboard — Inbox | `/dashboard/messages` | Yes | P2 |
| Admin — Dashboard | `/admin` | Admin | P2 |
| Admin — Pending Listings | `/admin/listings` | Admin | P2 |
| 404 Not Found | — | No | P1 |

---

## 7. Prototype Sprint Plan

### Sprint 1 — Foundation & Search (Week 1)

**Day 1–2: Project Setup**
- [ ] Initialize Next.js 14 project with TypeScript
- [ ] Configure Tailwind CSS + shadcn/ui
- [ ] Set up Prisma + Neon PostgreSQL connection
- [ ] Configure NextAuth.js (email/password provider)
- [ ] Deploy skeleton to Vercel (get live URL immediately)
- [ ] Seed database with 20+ sample properties

**Day 3–4: Landing Page + Search**
- [ ] Build Landing Page with hero section, search bar, category tabs
- [ ] Implement search API route (`/api/properties?city=&type=&price_max=`)
- [ ] Build Search Results page (property cards grid + list toggle)
- [ ] Build filter sidebar (city, price range, type, bedrooms)

**Day 5: Property Detail Page**
- [ ] Build Property Detail page with image gallery (Cloudinary)
- [ ] Property specs grid (bedrooms, bathrooms, sqft, amenities)
- [ ] Static map embed (Google Maps iframe or Leaflet)
- [ ] "Contact Owner" button + "Save to Favorites" button

**Sprint 1 Deliverable:** Anyone can search for a property, browse results, and view full details

---

### Sprint 2 — Auth, Listings & Inquiry (Week 2)

**Day 6–7: Authentication**
- [ ] Register page (email, password, name, role)
- [ ] Login page with redirect
- [ ] Session handling (NextAuth session provider)
- [ ] Protect routes that require auth (middleware)

**Day 8–9: Create Listing**
- [ ] 3-step listing form (Basic Info → Location → Images & Price)
- [ ] Cloudinary image upload widget (drag & drop)
- [ ] Address autocomplete (Google Places or manual input)
- [ ] Save as Draft or Submit for Review
- [ ] API route: `POST /api/properties`

**Day 10: Inquiry Form**
- [ ] "Contact Owner" modal form on detail page
- [ ] API route: `POST /api/messages`
- [ ] Console log notification (simulate email)
- [ ] Save to Favorites (API route + optimistic UI)

**Sprint 2 Deliverable:** Users can register, log in, create a listing, and send an inquiry

---

### Sprint 3 — Dashboard, Admin & Polish (Week 3)

**Day 11–12: User Dashboard**
- [ ] Dashboard layout with sidebar navigation
- [ ] "My Listings" tab — list own listings with status badges and edit/delete actions
- [ ] "Saved Properties" tab — show favorited listings
- [ ] "Inbox" tab — list messages grouped by property
- [ ] Edit Listing form (pre-filled, same 3-step form)
- [ ] Mark listing as Sold / Rented

**Day 13: Admin Panel**
- [ ] Admin route protection (role === ADMIN)
- [ ] Admin Dashboard — metrics cards (total listings, users, pending count)
- [ ] Pending Listings table — approve / reject actions
- [ ] API routes: `PATCH /api/admin/properties/[id]/approve` and `/reject`

**Day 14: UI Polish & Seed Data**
- [ ] Responsive layout check (mobile, tablet, desktop)
- [ ] Loading skeletons on search results and detail pages
- [ ] Empty state illustrations (no results, empty inbox, no listings)
- [ ] Toast notifications (saved, sent, updated)
- [ ] Enrich seed data (30 properties, 5 cities, varied types)

**Day 15: Demo Preparation**
- [ ] Record demo walkthrough video
- [ ] Prepare feedback survey (Google Forms)
- [ ] Deploy final version to Vercel production URL
- [ ] Stakeholder demo session

**Sprint 3 Deliverable:** Complete prototype with all 5 user flows working end-to-end

---

## 8. Folder Structure

```
kon-mee-ban/
├── app/                          # Next.js App Router pages
│   ├── (public)/
│   │   ├── page.tsx              # Landing page
│   │   ├── search/page.tsx       # Search results
│   │   └── properties/[id]/page.tsx  # Property detail
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/
│   │   ├── listings/page.tsx     # My listings
│   │   ├── favorites/page.tsx    # Saved properties
│   │   └── messages/page.tsx     # Inbox
│   ├── listings/
│   │   ├── new/page.tsx          # Create listing
│   │   └── [id]/edit/page.tsx    # Edit listing
│   └── admin/
│       ├── page.tsx              # Admin dashboard
│       └── listings/page.tsx     # Moderation queue
├── api/                          # Next.js API routes
│   ├── auth/[...nextauth]/
│   ├── properties/
│   ├── messages/
│   ├── favorites/
│   └── admin/
├── components/
│   ├── ui/                       # shadcn/ui base components
│   ├── property/                 # PropertyCard, PropertyGallery, etc.
│   ├── search/                   # SearchBar, FilterSidebar, etc.
│   ├── listing/                  # ListingForm steps
│   ├── dashboard/                # DashboardLayout, tabs
│   └── shared/                   # Navbar, Footer, etc.
├── lib/
│   ├── prisma.ts                 # Prisma client singleton
│   ├── auth.ts                   # NextAuth config
│   └── cloudinary.ts             # Upload helper
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                   # 30 sample properties
├── types/                        # Shared TypeScript types
└── public/                       # Static assets
```

---

## 9. Seed Data Plan

To make the prototype feel real, seed the database with:

| Dataset | Count | Details |
|---------|:-----:|---------|
| Users | 6 | 1 admin, 2 sellers, 1 landlord, 2 buyers |
| Properties (For Sale) | 12 | Mix of houses, condos, apartments in 3 cities |
| Properties (For Rent) | 10 | Apartments and condos, monthly rent pricing |
| Properties (For Lease) | 3 | Commercial units |
| Favorites | 8 | Buyer users with saved properties |
| Messages / Inquiries | 5 | Sample buyer-to-seller conversations |

**Cities to include:** Bangkok, Chiang Mai, Phuket (or your target market cities)

**Price ranges:**
- Sale: 1.5M – 15M THB
- Rent: 8,000 – 45,000 THB/month

---

## 10. Prototype Success Criteria

The prototype is considered successful when all the following are verified:

### Functional Checklist
- [ ] User can search properties by city, type, and price range
- [ ] Search results display correctly with filter + sort options
- [ ] Property detail page shows all key information and images
- [ ] New user can register and log in
- [ ] Logged-in seller/landlord can create and publish a listing with images
- [ ] Buyer can send an inquiry to a listing owner
- [ ] User dashboard shows own listings and saved properties
- [ ] Admin can approve or reject a pending listing

### UX Checklist
- [ ] Prototype is usable on mobile screen (375px width)
- [ ] No broken navigation links
- [ ] Loading states shown during data fetch
- [ ] Empty states shown when no results
- [ ] Form validation shows clear error messages

### Demo Checklist
- [ ] All 5 core flows can be walked through without errors
- [ ] Seed data makes the UI look realistic (not empty)
- [ ] Live Vercel URL accessible to all stakeholders

---

## 11. From Prototype → MVP

After prototype validation, the following changes are needed to evolve to full MVP:

| Prototype Implementation | MVP Replacement |
|--------------------------|----------------|
| NextAuth email/password only | + OAuth (Google, Facebook) + MFA |
| PostgreSQL `ILIKE` search | Elasticsearch with geospatial support |
| Cloudinary free tier | AWS S3 + CloudFront CDN |
| Next.js API routes (monolith) | Separate microservices with API Gateway |
| Single Vercel server | AWS ECS / Kubernetes with auto-scaling |
| Manual admin actions | Full moderation workflow with audit logs |
| Console log "notifications" | SendGrid email + Twilio SMS |
| No payments | Stripe integration with escrow |
| No real-time messaging | Socket.io WebSocket server |
| No caching | Redis + CDN caching layers |
| No monitoring | Prometheus + Grafana + Sentry |

> All prototype code (Next.js, Prisma schema, component structure) is designed to be reused and extended into the full MVP — not thrown away.
