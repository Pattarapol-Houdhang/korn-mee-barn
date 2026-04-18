# System Specification Document (SSD)
## Real Estate Web Application — Buy / Sell / Rent

**Version:** 1.0  
**Date:** April 18, 2026  
**Status:** Draft for Review

---

## 1. System Architecture Overview

### 1.1 Architecture Style
**Recommended Architecture:** Three-tier microservices-oriented architecture with API Gateway pattern

**Rationale:**
- **Scalability**: Independent scaling of services based on load
- **Maintainability**: Clear separation of concerns
- **Flexibility**: Independent service updates
- **Technology Diversity**: Each service can use its optimal stack

### 1.2 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Web App    │  │  Admin Panel │  │  Mobile Web  │      │
│  │  (React.js)  │  │  (React.js)  │  │   (PWA)      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │ HTTPS / REST API
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway Layer                        │
│   Kong / AWS API Gateway                                     │
│   - Authentication/Authorization  - Rate Limiting            │
│   - Request Routing               - Load Balancing           │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │   Auth   │ │ Property │ │  Search  │ │ Messaging│      │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ Payment  │ │Notif.    │ │Analytics │ │  Admin   │      │
│  │ Service  │ │Service   │ │ Service  │ │ Service  │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                             │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐ ┌──────────┐   │
│  │PostgreSQL│ │  Redis   │ │Elasticsearch│ │ AWS S3   │   │
│  │(Primary) │ │ (Cache)  │ │  (Search)   │ │(Files)   │   │
│  └──────────┘ └──────────┘ └─────────────┘ └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Recommended Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | React.js 18+ with TypeScript | Large ecosystem, type safety, talent availability |
| **State Management** | Redux Toolkit or Zustand | Predictable state, dev tools |
| **UI Library** | Material-UI v5 or Ant Design v5 | Pre-built components, consistent design |
| **Maps** | Mapbox GL JS | Better pricing vs Google Maps |
| **Build Tool** | Vite | 10x faster than Webpack |
| **Backend** | Node.js 20+ with Express.js / Nest.js | JavaScript everywhere, async I/O, NPM ecosystem |
| **API Style** | RESTful with OpenAPI 3.0 | Industry standard, good tooling |
| **ORM** | Prisma | Type-safe, excellent developer experience |
| **Primary DB** | PostgreSQL 15+ | ACID compliance, JSON support, PostGIS for geo queries |
| **Cache** | Redis 7+ | Session storage, query caching, pub/sub |
| **Search Engine** | Elasticsearch 8+ | Full-text, geospatial, faceted search |
| **Message Queue** | RabbitMQ or AWS SQS | Async processing, notifications |
| **File Storage** | AWS S3 or Cloudflare R2 | Scalable, cost-effective object storage |
| **CDN** | CloudFront or Cloudflare | Fast global asset delivery |
| **Containers** | Docker + Kubernetes | Consistent environments, orchestration |
| **CI/CD** | GitHub Actions | Native integration, free for public repos |
| **Monitoring** | Prometheus + Grafana | Open-source, powerful dashboards |
| **Error Tracking** | Sentry | Real-time error alerts |

---

## 2. Module Breakdown

### 2.1 Authentication and Authorization Module

**Purpose:** Manage user identity, access control, and session management

**Key Components:**
- User Registration Service
- Login/Logout Service
- OAuth Integration Service (Google, Facebook, Apple)
- JWT Token Manager (access token 15 min, refresh token 7 days)
- MFA Service (TOTP via authenticator app)
- Password Reset Service
- RBAC Engine

**Technologies:** Passport.js, bcrypt (cost factor 12), jsonwebtoken, speakeasy

**Database Tables:**
```sql
users, sessions, oauth_tokens
```

---

### 2.2 Property Listing Module

**Purpose:** Manage creation, editing, and lifecycle of property listings

**Key Components:**
- Listing CRUD Service
- Image Upload and Processing Service (auto-compress, generate thumbnails)
- Listing Status Manager (draft → pending → active → sold/rented/expired)
- Listing Validation Engine
- Bulk Import Service (CSV)

**Image Processing:**
- Generate thumbnail variants: 150×150, 400×300, 800×600
- Strip EXIF location data for privacy
- Store originals + variants in S3

**Database Tables:**
```sql
properties, property_details, property_images, property_location
```

---

### 2.3 Search and Discovery Module

**Purpose:** Enable efficient property search with multiple criteria

**Elasticsearch Index Mapping:**
```json
{
  "mappings": {
    "properties": {
      "title":            { "type": "text",    "analyzer": "english" },
      "description":      { "type": "text" },
      "location":         { "type": "geo_point" },
      "price":            { "type": "integer" },
      "property_type":    { "type": "keyword" },
      "transaction_type": { "type": "keyword" },
      "bedrooms":         { "type": "integer" },
      "amenities":        { "type": "keyword" }
    }
  }
}
```

**Caching Strategy:**
- Popular searches: cache 15 minutes (Redis)
- Property detail pages: cache 5 minutes
- Invalidate on property updates

---

### 2.4 Messaging Module

**Purpose:** Facilitate real-time communication between parties

**Key Components:**
- Real-time Message Service (Socket.io / WebSocket)
- Message Persistence Service
- Notification Trigger Service
- Attachment Handler (stored in S3)
- Profanity Filter / Moderation

**Database Tables:**
```sql
conversations (id, property_id, participants[], created_at)
messages      (id, conversation_id, sender_id, content, attachments[], read_status, sent_at)
```

---

### 2.5 Payment and Transaction Module

**Purpose:** Handle financial transactions securely

**Payment Provider:** Stripe (recommended)

**Rationale:** PCI DSS Level 1, Stripe Connect for escrow, excellent SDKs, strong fraud detection

**Rental Deposit Flow:**
1. Tenant initiates payment → Stripe Checkout
2. Amount held in Stripe Connect escrow account
3. Released to landlord after move-in confirmation
4. Platform commission deducted automatically

**Purchase Escrow Flow:**
1. Buyer deposits funds
2. Funds held until title transfer confirmation
3. Seller receives funds minus platform commission
4. Dispute resolution if needed

**PCI DSS Compliance:**
- Never store full card numbers — use Stripe tokenization
- Implement 3D Secure authentication
- Maintain payment audit logs for 1 year

**Database Tables:**
```sql
transactions, payments, escrow_accounts
```

---

### 2.6 Notification Module

| Event | Email | SMS | Push | In-App |
|-------|:-----:|:---:|:----:|:------:|
| New Message | ✓ | Optional | ✓ | ✓ |
| Appointment Confirmed | ✓ | ✓ | ✓ | ✓ |
| Payment Received | ✓ | ✓ | — | ✓ |
| Listing Approved | ✓ | — | ✓ | ✓ |
| Saved Search Alert | ✓ | — | ✓ | ✓ |
| Account Suspended | ✓ | ✓ | — | ✓ |

**Providers:** SendGrid / AWS SES (email), Twilio (SMS), Firebase Cloud Messaging (push)

**Queue:** RabbitMQ for asynchronous delivery

---

### 2.7 Admin Panel Module

**Admin Roles:**

| Role | Permissions |
|------|------------|
| **Super Admin** | Full system access, user management, system configuration |
| **Moderator** | Listing approval, content moderation, flagged content |
| **Support Agent** | View-only access, message users |
| **Finance Admin** | Transaction monitoring, refunds |

**Key Dashboard Metrics:**
- Daily Active Users (DAU)
- New Listings (today / week / month)
- Transaction Volume and Revenue
- Conversion Rate (views → inquiries → transactions)
- Flagged Content Count

---

### 2.8 Analytics Module

**Tracked Events:**
```
property_view  (property_id, user_id, timestamp, duration)
search         (query, filters, result_count)
message_sent   (conversation_id)
listing_created (property_id, user_id)
payment_completed (transaction_id, amount)
```

**Integrations:** Google Analytics 4, Mixpanel (product analytics), Hotjar (heatmaps)

---

## 3. Data Model Specifications

### 3.1 Core Entities

```
User ──(1:N)──> Property [owns]
User ──(N:M)──> Property [favorites]
Property ──(1:N)──> Transaction
User ──(N:M)──> User [conversations via messages]
Transaction ──(1:1)──> Review
```

### 3.2 Entity SQL Definitions

#### User
```sql
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name    VARCHAR(100),
    last_name     VARCHAR(100),
    phone         VARCHAR(20),
    role          VARCHAR(20) CHECK (role IN ('buyer','seller','landlord','tenant','agent','admin')),
    profile_image_url TEXT,
    verified      BOOLEAN DEFAULT FALSE,
    mfa_enabled   BOOLEAN DEFAULT FALSE,
    mfa_secret    VARCHAR(255),
    status        VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','suspended','banned','deleted')),
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role  ON users(role);
```

#### Property
```sql
CREATE TABLE properties (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    title            VARCHAR(255) NOT NULL,
    description      TEXT,
    property_type    VARCHAR(50) CHECK (property_type IN ('house','apartment','condo','townhouse','land','commercial')),
    transaction_type VARCHAR(20) CHECK (transaction_type IN ('sale','rent','lease')),
    price            DECIMAL(12,2),
    price_negotiable BOOLEAN DEFAULT FALSE,
    status           VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','pending','active','sold','rented','expired','deleted')),
    featured         BOOLEAN DEFAULT FALSE,
    view_count       INTEGER DEFAULT 0,
    created_at       TIMESTAMP DEFAULT NOW(),
    updated_at       TIMESTAMP DEFAULT NOW(),
    published_at     TIMESTAMP,
    expires_at       TIMESTAMP
);

CREATE INDEX idx_properties_owner              ON properties(owner_id);
CREATE INDEX idx_properties_status             ON properties(status);
CREATE INDEX idx_properties_type_transaction   ON properties(property_type, transaction_type);
CREATE INDEX idx_properties_price              ON properties(price);
```

#### Property Details
```sql
CREATE TABLE property_details (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id    UUID REFERENCES properties(id) ON DELETE CASCADE,
    bedrooms       INTEGER,
    bathrooms      DECIMAL(3,1),
    square_feet    INTEGER,
    lot_size       INTEGER,
    year_built     INTEGER,
    parking_spaces INTEGER,
    amenities      JSONB,   -- {"pool": true, "gym": true, "elevator": false}
    furnishing     VARCHAR(20) CHECK (furnishing IN ('unfurnished','semi-furnished','fully-furnished')),
    floor_number   INTEGER,
    total_floors   INTEGER,
    hoa_fee        DECIMAL(10,2),
    property_tax   DECIMAL(10,2)
);

CREATE INDEX idx_property_details_bedrooms  ON property_details(bedrooms);
CREATE INDEX idx_property_details_sqft      ON property_details(square_feet);
CREATE INDEX idx_property_details_amenities ON property_details USING GIN (amenities);
```

#### Property Location (PostGIS)
```sql
CREATE TABLE property_locations (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id  UUID UNIQUE REFERENCES properties(id) ON DELETE CASCADE,
    address      VARCHAR(255),
    city         VARCHAR(100) NOT NULL,
    state        VARCHAR(100),
    postal_code  VARCHAR(20),
    country      VARCHAR(100) DEFAULT 'Thailand',
    latitude     DECIMAL(10,8),
    longitude    DECIMAL(11,8),
    geolocation  GEOGRAPHY(POINT, 4326),  -- PostGIS extension
    neighborhood VARCHAR(100)
);

CREATE INDEX idx_location_city        ON property_locations(city);
CREATE INDEX idx_location_geolocation ON property_locations USING GIST (geolocation);
```

#### Transaction
```sql
CREATE TABLE transactions (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id          UUID REFERENCES properties(id),
    buyer_id             UUID REFERENCES users(id),
    seller_id            UUID REFERENCES users(id),
    agent_id             UUID REFERENCES users(id),
    transaction_type     VARCHAR(20) CHECK (transaction_type IN ('purchase','rental')),
    amount               DECIMAL(12,2) NOT NULL,
    commission_amount    DECIMAL(12,2),
    commission_rate      DECIMAL(5,2) DEFAULT 2.00,
    status               VARCHAR(30) DEFAULT 'initiated'
                           CHECK (status IN ('initiated','payment_pending','in_escrow','completed','cancelled','refunded')),
    payment_method       VARCHAR(50),
    payment_gateway_id   VARCHAR(255),
    notes                TEXT,
    created_at           TIMESTAMP DEFAULT NOW(),
    completed_at         TIMESTAMP
);
```

#### Review
```sql
CREATE TABLE reviews (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id  UUID REFERENCES properties(id),
    transaction_id UUID REFERENCES transactions(id),
    reviewer_id  UUID REFERENCES users(id),
    reviewee_id  UUID REFERENCES users(id),
    rating       INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment      TEXT,
    review_type  VARCHAR(20) CHECK (review_type IN ('property','landlord','tenant','agent')),
    status       VARCHAR(20) DEFAULT 'published' CHECK (status IN ('published','flagged','removed')),
    created_at   TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reviews_property  ON reviews(property_id);
CREATE INDEX idx_reviews_reviewee  ON reviews(reviewee_id);
```

---

## 4. API Endpoint Specifications

### 4.1 Design Principles
- Base path: `/api/v1/`
- Plural nouns for resources: `/properties`, not `/property`
- Standard HTTP methods: GET, POST, PUT, PATCH, DELETE
- Pagination: `?page=1&limit=20`
- Filtering: `?city=Bangkok&type=apartment`
- Sorting: `?sort=price&order=asc`

### 4.2 Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/register` | Register new user | No |
| POST | `/api/v1/auth/login` | Authenticate user | No |
| POST | `/api/v1/auth/logout` | Invalidate session | Yes |
| POST | `/api/v1/auth/refresh-token` | Get new access token | Yes |
| POST | `/api/v1/auth/forgot-password` | Request password reset | No |
| POST | `/api/v1/auth/reset-password` | Reset with token | No |
| POST | `/api/v1/auth/verify-email` | Verify email token | No |
| POST | `/api/v1/auth/enable-mfa` | Enable 2FA | Yes |
| GET  | `/api/v1/auth/oauth/google` | Google OAuth redirect | No |
| GET  | `/api/v1/auth/oauth/facebook` | Facebook OAuth redirect | No |

### 4.3 Property Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET    | `/api/v1/properties` | List/search properties | No |
| GET    | `/api/v1/properties/:id` | Get property details | No |
| POST   | `/api/v1/properties` | Create listing | Seller/Landlord |
| PUT    | `/api/v1/properties/:id` | Update listing | Owner |
| PATCH  | `/api/v1/properties/:id/status` | Change status | Owner |
| DELETE | `/api/v1/properties/:id` | Delete listing | Owner |
| GET    | `/api/v1/properties/:id/similar` | Similar properties | No |
| POST   | `/api/v1/properties/:id/images` | Upload images | Owner |
| DELETE | `/api/v1/properties/:id/images/:imageId` | Delete image | Owner |

**Example Search Request:**
```
GET /api/v1/properties?city=Bangkok&type=apartment&bedrooms=2
  &price_min=2000000&price_max=5000000&page=1&limit=20&sort=price&order=asc
```

### 4.4 Messaging Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET  | `/api/v1/conversations` | List conversations | Yes |
| GET  | `/api/v1/conversations/:id` | Get conversation | Yes |
| POST | `/api/v1/conversations` | Start conversation | Yes |
| POST | `/api/v1/conversations/:id/messages` | Send message | Yes |
| PATCH| `/api/v1/messages/:id/read` | Mark as read | Yes |

### 4.5 Transaction Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST   | `/api/v1/transactions` | Initiate transaction | Yes |
| GET    | `/api/v1/transactions/:id` | Get details | Participant |
| POST   | `/api/v1/transactions/:id/payment` | Process payment | Yes |
| POST   | `/api/v1/transactions/:id/escrow/release` | Release escrow | Admin |
| POST   | `/api/v1/transactions/:id/refund` | Process refund | Admin |

### 4.6 User Profile Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET    | `/api/v1/users/me` | Get own profile | Yes |
| PUT    | `/api/v1/users/me` | Update profile | Yes |
| GET    | `/api/v1/users/me/properties` | Own listings | Yes |
| GET    | `/api/v1/users/me/favorites` | Saved properties | Yes |
| POST   | `/api/v1/users/me/favorites/:propertyId` | Add favorite | Yes |
| DELETE | `/api/v1/users/me/favorites/:propertyId` | Remove favorite | Yes |

### 4.7 Admin Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET   | `/api/v1/admin/dashboard` | Metrics overview | Admin |
| GET   | `/api/v1/admin/properties/pending` | Pending listings | Moderator |
| PATCH | `/api/v1/admin/properties/:id/approve` | Approve listing | Moderator |
| PATCH | `/api/v1/admin/properties/:id/reject` | Reject listing | Moderator |
| PATCH | `/api/v1/admin/users/:id/suspend` | Suspend user | Admin |
| GET   | `/api/v1/admin/reports` | Generate reports | Admin |

---

## 5. Third-Party Integrations

### 5.1 Mapping Service — Mapbox GL JS
- **Use cases:** Property maps, geocoding, radius search, nearby amenities
- **Required APIs:** Maps JS, Geocoding, Places, Distance Matrix
- **Strategy:** Cache geocoded addresses for 30 days

### 5.2 Payment Gateway — Stripe
- **Use cases:** Card payments, ACH, digital wallets, escrow (Stripe Connect)
- **Compliance:** PCI DSS Level 1, 3D Secure
- **Webhooks:** Real-time payment status updates

### 5.3 Email Service — SendGrid / AWS SES
- **Use cases:** Transactional emails, notification emails, search alerts
- **Config:** SPF/DKIM/DMARC for deliverability; unsubscribe management

### 5.4 SMS Service — Twilio
- **Use cases:** 2FA codes, appointment reminders, payment confirmations
- **Strategy:** SMS only for critical events to control costs

### 5.5 Cloud Storage — AWS S3 / Cloudflare R2
- Separate buckets: `images`, `documents`, `backups`
- Lifecycle policies for old content
- Signed URLs for private documents
- CDN-integrated for fast delivery

### 5.6 Analytics — Google Analytics 4 + Mixpanel
- Tracked funnels: Search → View → Contact → Transaction
- Hotjar for heatmaps and session recording

---

## 6. Security Specifications

### 6.1 OWASP Top 10 Mitigation

| OWASP Risk | Mitigation |
|-----------|-----------|
| **A01 Broken Access Control** | RBAC on all routes; verify ownership before modifications; audit logs |
| **A02 Cryptographic Failures** | AES-256 at rest; TLS 1.3 in transit; bcrypt cost 12; HTTPS + HSTS |
| **A03 Injection** | Parameterized queries; Prisma ORM; input sanitization; CSP headers |
| **A04 Insecure Design** | Threat modeling; least privilege; defense in depth |
| **A05 Security Misconfiguration** | Remove defaults; disable unnecessary services; env-specific configs |
| **A06 Vulnerable Components** | Snyk / Dependabot scanning; regular dependency updates |
| **A07 Authentication Failures** | Rate limiting on login; MFA option; HTTP-only Secure cookies; short JWT expiry |
| **A08 Data Integrity Failures** | Code signing; SRI for CDN resources |
| **A09 Logging Failures** | Log all auth attempts and admin actions; centralized ELK; anomaly alerts |
| **A10 SSRF** | URL validation; domain whitelist for external requests; network segmentation |

### 6.2 Access Control Matrix

| Resource | Anonymous | Buyer | Seller | Landlord | Agent | Admin |
|----------|:---------:|:-----:|:------:|:--------:|:-----:|:-----:|
| View Listings | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create Listing | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| Edit Own Listing | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| Send Message | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Initiate Transaction | ✗ | ✓ | ✗ | ✗ | ✓ | ✓ |
| Approve Listing | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Suspend User | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |

### 6.3 Data Privacy and Compliance

**GDPR Rights Implemented:**
- Right to Access: `/api/v1/users/me/data-export`
- Right to Erasure: Soft delete with anonymization
- Right to Rectification: Profile update endpoint
- Data Portability: JSON export
- Consent: Cookie banner + preference center

**Data Retention Policy:**

| Data Type | Retention Period |
|-----------|-----------------|
| Active user data | Indefinitely while account active |
| Inactive accounts | Warning at 1 year; deletion at 2 years |
| Transaction records | 7 years (regulatory requirement) |
| Message history | 2 years |
| Analytics | Aggregated & anonymized after 90 days |

---

## 7. Performance and Scalability Targets

### 7.1 Performance Benchmarks

| Metric | Target | Tool |
|--------|--------|------|
| Page Load Time (Listing) | < 2 seconds | Lighthouse |
| API Response (Search) | < 500 ms | APM |
| API Response (CRUD) | < 300 ms | APM |
| Database Query (Complex) | < 100 ms | Query profiling |
| Time to First Byte (TTFB) | < 200 ms | Server monitoring |
| Concurrent Users | 10,000 | Load testing (k6) |
| Transactions per Second | 100 TPS | Load testing |

### 7.2 Scalability Strategy

**Horizontal Scaling:**
- Stateless app servers behind load balancer
- Auto-scaling on CPU/memory thresholds
- Kubernetes HPA (Horizontal Pod Autoscaler)

**Database Scaling:**
- 3 PostgreSQL read replicas initially
- Connection pooling via PgBouncer
- Partition large tables by date
- PostGIS for geospatial queries

**Caching Layers:**
- L1: In-memory application cache
- L2: Redis shared cache
- L3: CDN for images and static assets

**Capacity Planning:**

| Year | Users | Listings | Infrastructure |
|------|-------|----------|---------------|
| Year 1 | 50,000 | 10,000 | 2 app servers, 1 DB primary, 2 read replicas |
| Year 2 | 150,000 | 30,000 | 4 app servers, auto-scale enabled |
| Year 3 | 400,000 | 100,000 | Multi-region, DB sharding by geography |

### 7.3 Monitoring and Alerting

**Alerting Thresholds:**
- Error rate > 1% for 5 minutes → PagerDuty alert
- Response time > 3 seconds for 5 minutes → Warning
- CPU usage > 80% for 10 minutes → Scale up trigger
- Disk space < 20% → Alert
- Failed payments > 5% of attempts → Immediate alert

**Monitoring Stack:**
- APM: Prometheus + Grafana
- Logging: ELK Stack
- Error Tracking: Sentry
- Uptime: Pingdom / UptimeRobot
