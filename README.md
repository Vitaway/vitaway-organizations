# Vitaway Dashboard

A comprehensive organization/employer dashboard for a multi-tenant health platform built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.

## Overview

This dashboard enables organizations to:

- Monitor employee engagement and health trends
- Track program participation and utilization
- Identify population-level risk categories
- Generate and export reports
- Manage employee onboarding
- Send notifications to employees

## Features

### 🏠 Dashboard Overview
- Total employees enrolled
- Active vs inactive users
- Engagement rate percentage
- Risk category distribution
- Program participation metrics

### 🏥 Population Health
- BMI distribution analysis
- Blood pressure risk levels
- Diabetes risk indicators
- Stress and nutrition assessments
- Program completion rates

### 📊 Engagement & Utilization
- Login frequency trends
- Weekly/monthly active users
- Appointment booking and attendance
- Learning content completion
- Inactivity indicators

### 👥 Employee Management
- Manual employee onboarding
- Bulk CSV upload
- Employee list with engagement status
- Program assignment
- Notification system

### 📄 Reporting & Export
- Generate organization-level reports
- Export data in PDF and CSV formats
- View export history
- Audit trail for compliance

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Charts:** Recharts
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd vitaway-employeer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env.local
   ```

4. Keep the API base on core-backend:

   ```bash
   NEXT_PUBLIC_API_BASE_URL=https://care-api.vitaway.org/api/v1
   ```

   Do not point `NEXT_PUBLIC_API_BASE_URL` at the legacy Laravel organization API (`https://ehr.vitaway.org/api/organization`). The client ignores that URL if it is still set. `lib/ehr-client.ts` is separate and still uses `NEXT_PUBLIC_EHR_API_URL` (default `https://ehr.vitaway.org/api`).

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/
│   ├── dashboard/
│   │   ├── page.tsx                 # Overview page
│   │   ├── population-health/       # Population health metrics
│   │   ├── engagement/              # Engagement analytics
│   │   ├── employees/               # Employee management
│   │   └── reports/                 # Reporting & exports
│   ├── layout.tsx                   # Root layout
│   └── page.tsx                     # Root page (redirects to dashboard)
├── components/
│   ├── dashboard/                   # Dashboard-specific components
│   │   ├── metric-card.tsx
│   │   ├── chart-card.tsx
│   │   ├── data-table.tsx
│   │   ├── risk-badge.tsx
│   │   └── status-badge.tsx
│   ├── layout/                      # Layout components
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── dashboard-layout.tsx
│   └── ui/                          # shadcn/ui components
├── lib/
│   ├── utils.ts                     # Utility functions
│   ├── auth.ts                      # Authentication utilities
│   └── api-client.ts                # API client
├── types/
│   └── index.ts                     # TypeScript type definitions
```

## Security & Privacy

### Role-Based Access Control

Two user roles are supported:

1. **Organization Admin**
   - Full access within their organization
   - Can onboard employees
   - Can view analytics and reports
   - Can export data
   - Can send notifications

2. **Organization Analyst** (Optional)
   - Read-only access
   - Cannot onboard employees
   - Cannot export sensitive data

### Tenant Isolation

- All data is scoped to the authenticated organization
- Backend enforces strict tenant-based access control
- Frontend components assume proper authorization checks

### Data Privacy

- All displayed data is aggregated and anonymized
- No individual health records are accessible
- Risk indicators are non-diagnostic
- Export operations are audited

## API Integration

The organization portal talks to Vitaway core-backend through `lib/api-client.ts`.

```bash
NEXT_PUBLIC_API_BASE_URL=https://care-api.vitaway.org/api/v1
```

Production builds that still have `NEXT_PUBLIC_API_BASE_URL=https://ehr.vitaway.org/api/organization` are treated as legacy. Auth does not stay on that Laravel path. Set the Vercel variable to the care-api URL above on the next deploy. This repo does not change Vercel project settings.

The browser does not call care-api directly. care-api CORS currently allows `https://care.vitaway.org` and `https://ehr.vitaway.org`, and does not allow `https://organizations.vitaway.org`. `next.config.ts` rewrites same-origin `/api/care/*` to `NEXT_PUBLIC_API_BASE_URL` (default `https://care-api.vitaway.org/api/v1`). Auth requests still carry `portal: "organization"`.

### Auth (core-backend)

Every auth call sends `portal: "organization"`.

- `POST /auth/login` — `{ email, password, portal }`. Response data is `{ token, user }` with `user.role === "organization_admin"`. If `mfaRequired` is true, the UI finishes with `POST /auth/mfa/verify` `{ challengeToken, code }` (no `portal` field).
- `POST /auth/forgot-password` — `{ email, portal }`. Sends a 6-digit code by email. When the account has a phone number, core-backend also sends it WhatsApp-first, then SMS. The portal does not call the phone provider itself.
- `POST /auth/verify-reset-code` — `{ email, code, portal }`
- `POST /auth/reset-password` — `{ email, code, password, portal }`
- `POST /auth/logout`

Password reset is an OTP flow, not an email link. `/reset-password?token=` is no longer accepted.

After sign-in the client reads `GET /orgs/me` or `GET /ehr/partner` only to fill the organization name in the sidebar. Those are the org routes core-backend exposes today.

### Dashboard routes not on core-backend yet

`lib/api-client.ts` still requests the employer dashboard paths below. Live care-api responds `404 Route not found` for them. They previously lived on Laravel `https://ehr.vitaway.org/api/organization` and have not been reimplemented under `/api/v1`. Do not prefix them with `/api/organization` on care-api.

- `GET/PUT /profile`
- `GET /dashboard/overview`
- `GET /analytics/population-health`, `GET /analytics/engagement`
- `GET/POST /employees`, `POST /employees/bulk`, program assignment, `POST /notifications`
- `GET/POST /programs` and nested modules, lessons, quizzes, assign, progress
- `GET/POST /reports`, report download
- `GET /audit/exports`, `GET /audit/access`
- `GET/POST /appointments` and `/employee/appointments` (providers, booking, status, statistics, partners)

`POST /auth/refresh` does not exist. Core-backend has `POST /auth/session/keep`; this portal does not call it.

### Laravel EHR client (unchanged)

`lib/ehr-client.ts` still calls `NEXT_PUBLIC_EHR_API_URL` (default `https://ehr.vitaway.org/api`) for EHR cross-calls, using the organization bearer token. A care-api JWT is not a Laravel Sanctum token, so those calls fail until that client is migrated.

## Authentication

Sign-in is email and password against core-backend, limited to `organization_admin`. The session token is stored in `localStorage` (`auth_token`) and an `auth_token` cookie. `lib/auth.ts` still contains unused role helpers and is not the live session.

## Data Models

All TypeScript interfaces and types are defined in `types/index.ts`:

- `UserRole` - Organization admin or analyst
- `RiskCategory` - Low, medium, high
- `DashboardMetrics` - Overview metrics
- `PopulationHealthData` - Health trend data
- `EngagementMetrics` - Usage metrics
- `Employee` - Employee record
- `Report` - Report metadata
- `ExportHistory` - Export audit record

## Development

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Next Steps

1. **Authentication**
   - Sign-in, MFA, and password reset already call core-backend with `portal: "organization"`

2. **Connect remaining dashboard APIs**
   - Employer dashboard routes listed above still 404 on core-backend
   - Keep `NEXT_PUBLIC_API_BASE_URL=https://care-api.vitaway.org/api/v1`

3. **Add Real-time Features**
   - WebSocket integration for live updates
   - Notification system
   - Real-time engagement tracking

4. **Enhance Security**
   - Implement rate limiting
   - Add CSRF protection
   - Configure CSP headers
   - Enable audit logging

5. **Testing**
   - Add unit tests
   - Add integration tests
   - Add E2E tests

6. **Monitoring**
   - Error tracking (e.g., Sentry)
   - Analytics (e.g., Google Analytics)
   - Performance monitoring

## Contributing

1. Follow the established code structure
2. Maintain TypeScript type safety
3. Use shadcn/ui components consistently
4. Follow Tailwind CSS best practices
5. Ensure responsive design
6. Document new features

## License

[Your License Here]

## Support

For questions or issues, please contact your development team.


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
