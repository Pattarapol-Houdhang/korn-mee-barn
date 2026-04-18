---
name: Project Kon-Mee-Baan (คอนมีบ้าน)
description: Thai real estate marketplace — core project facts, milestones, tech stack, and team structure
type: project
---

Thai real estate marketplace for buying, renting, and selling property. Targets the Thai market with LINE Login, PromptPay, Longdo Map, and full Thai-language UX.

**Why:** Competing with DDproperty, Fazwaz, Hipflat. Differentiates via superior Thai UX, LINE-native auth, geospatial map search, and transparent agent marketplace.

**Key Dates (Realistic Scenario):**
- Project Kickoff: 2026-04-28
- Phase 0 Complete: 2026-05-08
- MVP Internal Alpha: 2026-08-14
- MVP Public Beta: 2026-09-11
- MVP General Availability: 2026-10-09
- Phase 2 Feature-Complete: 2027-02-05

**Tech Stack:**
- Frontend: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Zustand, TanStack Query
- Backend: NestJS (Node.js), TypeScript
- Database: PostgreSQL 16 + PostGIS, Prisma ORM
- Search: Typesense (MVP), Elasticsearch (scale trigger: 50,000+ listings)
- Cache/Queue: Redis + BullMQ
- Auth: NextAuth.js v5, JWT (15-min access / 30-day refresh with rotation), LINE OAuth 2.0, Google OAuth
- Payments: Omise (Opn Payments) — PromptPay, credit card, internet banking
- Storage: Cloudflare R2 + Cloudflare Images CDN
- Maps: Longdo Map API (primary), Google Geocoding (fallback)
- Email: Resend + React Email
- SMS/OTP: Telnyx or DTAC BizPortal
- Hosting: Vercel (FE), Railway or AWS ECS (BE)
- Monitoring: Sentry + Datadog

**Business Model:**
- Free listing (3/month), Premium Boost (฿199–฿1,990 one-time), Agent Starter (฿990/month), Agent Pro (฿2,490/month), Developer Package (custom)

**User Roles:** Guest, Buyer/Tenant, Seller/Landlord, Agent/Broker, Admin

**MVP Scope:** Listing CRUD + photo upload, full-text + map search, property detail page, user auth (email + LINE), lead generation, agent public profile, seller/agent dashboard, payment (listing boost), admin moderation, email notifications, mortgage calculator, PDPA compliance, SEO

**Phase 2 (Month 7–12):** Real-time messaging (WebSocket), saved search alerts, comparison tool, PWA push, developer project pages, agent reviews, lead CRM kanban, advanced analytics, recurring subscriptions

**Phase 3 (Year 2):** React Native mobile app, Elasticsearch migration, AI recommendations, AVM, multi-language (EN/ZH), online escrow, banner advertising

**Recommended Team (MVP):** PM, Tech Lead, Senior FE Engineer, 1–2 BE Engineers, UI/UX Designer, DevOps (part-time), QA (from Sprint 3), Content/SEO Specialist (from Sprint 6)

**Cold-Start Risk (R08):** Highest business risk. Mitigation: agent outreach from Sprint 9, 3-month free Agent Pro for first 20 agents, data entry contractor to seed 200+ listings pre-launch.

**Infrastructure Break-Even:** ~8 paying agent accounts covers monthly infra cost (~฿10,000–18,000/month).

**How to apply:** Use these facts as baseline context for all planning, sprint, budget, and stakeholder discussions about this project. Always verify current state before assuming milestone dates are still valid.
