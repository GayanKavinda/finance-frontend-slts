# 💰 Finance App Frontend

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-20232a?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

<p align="center">
  <strong>ProcureX — a secure, production-grade finance & procurement dashboard.</strong><br/>
  Built for the Internal Procurement Division with real-time data, RBAC, and an award-letter / PDF-ready workflow.
</p>

<p>
  <a href="#-screenshots">Screenshots</a> •
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-testing">Testing</a> •
  <a href="../finance-backend/README.md">Backend API</a>
</p>

</div>

---

## 📝 About The Project

**Finance App Frontend** (a.k.a. **ProcureX**) is the client interface of the Finance App ecosystem. It is a full finance & procurement operations console — tender pipeline, job portfolio, purchase orders, contractor bills, invoicing and banking — backed by a secure [Laravel API](../finance-backend/README.md) and **Laravel Sanctum** cookie-based authentication.

Built with the **Next.js App Router** and **Tailwind CSS v4**, it delivers fast navigation, server-friendly rendering, light/dark theming, and a component system designed for prod use.

| Design philosophy | Implementation |
| :--- | :--- |
| Zero-trust UI | Every route and action is permission-gated; nothing renders without entitlement |
| Feedback first | Toasts, loading overlays, and workflow roadmaps keep users oriented at all times |
| Keyboard & screen-reader friendly | Radix primitives, semantic landmarks, labelled controls (verified by the Playwright a11y suite) |

## ✨ Features

- **🔐 End-to-end security** — Sanctum SPA auth over HttpOnly cookies with CSRF bootstrapping, auto-logout on idle, and forced password-reset via email OTP.
- **🧭 Permission-aware navigation** — the sidebar, dashboards, and actions re-render per role/permission (`usePermission` + `ProtectedRoute`).
- **📊 Executive dashboard** — KPI tiles, live trend charts (Recharts), collection-efficiency meters, and recent activity.
- **🧾 Invoice lifecycle** — `Draft → Tax Generated → Submitted → Approved → Payment Received → Banked` with audit trail, document uploads, one-click PDF + internal receipt download, CSV export.
- **🏗️ Procurement suite** — tenders, jobs, purchase orders with status history and audit trail, PDF download.
- **👷 Contractor bills** — multi-stage bill workflow: attach documents → verify → submit → approve/reject → pay, with partial payments and retention.
- **🗂️ Master data** — customers, contractors, contractor quotations & selection.
- **🛠️ Administration** — user directory, role & permission designer, audit logs, and system telemetry (Super Admin).
- **🔔 Notifications** — unread counters and an in-app notification center.
- **🎨 Theming** — light/dark mode via `next-themes` with CSS-variable color tokens; motion via Framer Motion + GSAP; cinematic landing slideshow.

## ✨ Features

- **🔐 End-to-end security** — Sanctum SPA auth over HttpOnly cookies with CSRF bootstrapping, auto-logout on idle, and forced password-reset via email OTP.
- **🧭 Permission-aware navigation** — the sidebar, dashboards, and actions re-render per role/permission (`usePermission` + `ProtectedRoute`).
- **📊 Executive dashboard** — KPI tiles, live trend charts (Recharts), collection-efficiency meters, and recent activity.
- **🧾 Invoice lifecycle** — `Draft → Tax Generated → Submitted → Approved → Payment Received → Banked` with audit trail, document uploads, one-click PDF + internal receipt download, CSV export.
- **🏗️ Procurement suite** — tenders, jobs, purchase orders with status history and audit trail, PDF download.
- **👷 Contractor bills** — multi-stage bill workflow: attach documents → verify → submit → approve/reject → pay, with partial payments and retention.
- **🗂️ Master data** — customers, contractors, contractor quotations & selection.
- **👤 Read-only profile** — `/profile` is the details page of record: personal information, security status and activity log, all read-only, with deep links into Settings for every modification.
- **⚙️ Settings owns modification** — the Account tab holds the full profile panel (avatar crop & upload, complete personal information, email change with OTP verification, password change); Security holds 2FA, sessions, login history and a Danger Zone where permanent deletion uses a **type-to-confirm** gate (the user must type `DELETE`) so an irreversible action is never one click away.
- **🛠️ Administration** — user directory, role & permission designer, audit logs, and system telemetry (Super Admin).
- **🔔 Notifications** — unread counters and an in-app notification center.
- **🎨 Theming** — light/dark mode via `next-themes` with CSS-variable color tokens; motion via Framer Motion + GSAP; cinematic landing slideshow.
- **🌍 Three languages** — the entire system localizes to **English, Sinhala and Tamil** (Settings → Regional). A domain-split i18n library drives shell, Help Center, walkthrough and documentation strings, with automatic English fallback.
- **📚 In-app Help Center & documentation library** — searchable FAQs, contacts, release notes, a support-ticket system, a full step-by-step system walkthrough, and developer documentation (API reference, testing guide, setup guide, glossary, data dictionary, onboarding checklists, runbook, database map, use cases, flowcharts).
- **📱 Mobile-ready layout** — every register table is horizontally scrollable with a pinned first column, the breadcrumb collapses on phones, and modals/forms stack to full width.

## 📸 Screenshots

### Core workflow

| Landing & Auth | Executive Dashboard |
| :---: | :---: |
| <img src="docs/screenshots/landing.png" width="100%" alt="Landing page"/> | <img src="docs/screenshots/dashboard.png" width="100%" alt="Dashboard"/> |

| Invoice Ledger | Invoice Detail & Workflow |
| :---: | :---: |
| <img src="docs/screenshots/invoices.png" width="100%" alt="Invoices"/> | <img src="docs/screenshots/invoice-detail.png" width="100%" alt="Invoice detail"/> |

| Contractor Bills | Job Detail & Bid Award |
| :---: | :---: |
| <img src="docs/screenshots/contractor-bills.png" width="100%" alt="Contractor bills"/> | <img src="docs/screenshots/job-detail.png" width="100%" alt="Job detail"/> |

| Purchase Orders | Tenders |
| :---: | :---: |
| <img src="docs/screenshots/purchase-orders.png" width="100%" alt="Purchase orders"/> | <img src="docs/screenshots/tenders.png" width="100%" alt="Tenders"/> |

| Jobs | Master Data |
| :---: | :---: |
| <img src="docs/screenshots/jobs.png" width="100%" alt="Jobs"/> | <img src="docs/screenshots/customers.png" width="100%" alt="Customers"/> |

| Contractors | Profile |
| :---: | :---: |
| <img src="docs/screenshots/contractors.png" width="100%" alt="Contractors"/> | <img src="docs/screenshots/profile.png" width="100%" alt="Profile"/> |

### Help Center & documentation

| Help Center | Documentation Library |
| :---: | :---: |
| <img src="docs/screenshots/help.png" width="100%" alt="Help Center"/> | <img src="docs/screenshots/docs.png" width="100%" alt="Documentation library"/> |

| System Walkthrough | API Reference |
| :---: | :---: |
| <img src="docs/screenshots/walkthrough.png" width="100%" alt="System walkthrough"/> | <img src="docs/screenshots/api-reference.png" width="100%" alt="API reference"/> |

<details>
<summary><b>More documentation — testing, setup, glossary, data dictionary, onboarding, runbook, release notes, demo data</b></summary>
<br/>

| Testing Guide | Setup & Deployment |
| :---: | :---: |
| <img src="docs/screenshots/testing-guide.png" width="100%" alt="Testing guide"/> | <img src="docs/screenshots/setup-guide.png" width="100%" alt="Setup guide"/> |

| Glossary | Data Dictionary |
| :---: | :---: |
| <img src="docs/screenshots/glossary.png" width="100%" alt="Glossary"/> | <img src="docs/screenshots/data-dictionary.png" width="100%" alt="Data dictionary"/> |

| Onboarding Checklists | Operations Runbook |
| :---: | :---: |
| <img src="docs/screenshots/onboarding.png" width="100%" alt="Onboarding"/> | <img src="docs/screenshots/runbook.png" width="100%" alt="Runbook"/> |

| Release Notes | Demo Data Reference |
| :---: | :---: |
| <img src="docs/screenshots/release-notes.png" width="100%" alt="Release notes"/> | <img src="docs/screenshots/demo-data.png" width="100%" alt="Demo data"/> |

</details>

<details>
<summary><b>Developer documentation — database map, use cases, flowcharts (admin tier)</b></summary>
<br/>

| Database Map (ER diagram) | Use Cases |
| :---: | :---: |
| <img src="docs/screenshots/database-map.png" width="100%" alt="Database map"/> | <img src="docs/screenshots/use-cases.png" width="100%" alt="Use cases"/> |

| Flowcharts | |
| :---: | :---: |
| <img src="docs/screenshots/flowcharts.png" width="100%" alt="Flowcharts"/> | |

</details>

### Administration & account

| Roles & Permissions | User Management |
| :---: | :---: |
| <img src="docs/screenshots/admin-roles.png" width="100%" alt="Roles & permissions"/> | <img src="docs/screenshots/admin-users.png" width="100%" alt="User management"/> |

| Profile (read-only details) | Settings — Account (profile panel) |
| :---: | :---: |
| <img src="docs/screenshots/profile.png" width="100%" alt="Profile details"/> | <img src="docs/screenshots/settings.png" width="100%" alt="Settings account tab"/> |

| Settings — Security | Type-to-Confirm Deletion |
| :---: | :---: |
| <img src="docs/screenshots/settings-security.png" width="100%" alt="Settings security"/> | <img src="docs/screenshots/type-to-confirm.png" width="100%" alt="Type-to-confirm deletion dialog"/> |

| System Telemetry | Notifications |
| :---: | :---: |
| <img src="docs/screenshots/system-logs.png" width="100%" alt="System logs"/> | <img src="docs/screenshots/notifications.png" width="100%" alt="Notifications"/> |

| Audit Logs | |
| :---: | :---: |
| <img src="docs/screenshots/audit-logs.png" width="100%" alt="Audit logs"/> | |

| Sign-in | Sign-up |
| :---: | :---: |
| <img src="docs/screenshots/signin.png" width="100%" alt="Sign in"/> | <img src="docs/screenshots/signup.png" width="100%" alt="Sign up"/> |

### Mobile (390px)

| Dashboard | Tenders |
| :---: | :---: |
| <img src="docs/screenshots/mobile-dashboard.png" width="45%" alt="Mobile dashboard"/> | <img src="docs/screenshots/mobile-tenders.png" width="45%" alt="Mobile tenders"/> |

| Invoices | Customers |
| :---: | :---: |
| <img src="docs/screenshots/mobile-invoices.png" width="45%" alt="Mobile invoices"/> | <img src="docs/screenshots/mobile-customers.png" width="45%" alt="Mobile customers"/> |

| Contractor bills | Purchase orders |
| :---: | :---: |
| <img src="docs/screenshots/mobile-contractor-bills.png" width="45%" alt="Mobile contractor bills"/> | <img src="docs/screenshots/mobile-purchase-orders.png" width="45%" alt="Mobile purchase orders"/> |

| Help Center | Documentation Library |
| :---: | :---: |
| <img src="docs/screenshots/mobile-help.png" width="45%" alt="Mobile help"/> | <img src="docs/screenshots/mobile-docs.png" width="45%" alt="Mobile docs"/> |

> Screenshots are captured against the seeded demo dataset. Sample credentials after `php artisan migrate --seed`: `admin@finance.com` / `password`.

## 🛠 Tech Stack

| Concern | Technology |
| :--- | :--- |
| Framework | [Next.js 16](https://nextjs.org/) (App Router, React Compiler enabled) |
| UI Runtime | [React 19](https://react.dev/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) with CSS-variable tokens |
| Components | [Radix UI](https://www.radix-ui.com/) primitives (`src/components/ui`) |
| Charts | [Recharts](https://recharts.org/) |
| Animation | [Framer Motion](https://www.framer.com/motion/) · [GSAP](https://gsap.com/) |
| Forms | [React Hook Form](https://react-hook-form.com/) + [Yup](https://github.com/jquense/yup) |
| HTTP | [Axios](https://axios-http.com/) with `withCredentials` Sanctum sessions |
| Feedback | [Notistack](https://notistack.com/) · [React Hot Toast](https://react-hot-toast.com/) |
| Icons | [Lucide](https://lucide.dev/) |
| Testing | [Playwright](https://playwright.dev/) (QA, visual regression, responsive, a11y, RBAC) |

## 🏗 Architecture

The browser never talks to the API cross-domain — Next.js **rewrites proxy** `/api/*` and `/sanctum/*` to the Laravel backend, so sessions always appear same-origin (works in dev and behind Netlify/NGINX).

```mermaid
graph LR
    A[Browser<br/>localhost:3000] -->|/api/*, /sanctum/*<br/>rewritten| B[Next.js Server]
    B -->|proxy| C[Laravel API<br/>127.0.0.1:8000]
    C --> D[(MySQL)]
    C -->|HttpOnly XSRF + session cookies| A
```

## 📂 Folder Structure

```text
finance-frontend/
├── src/
│   ├── app/                        # App Router pages
│   │   ├── layout.js               # Root layout + providers
│   │   ├── page.js                 # Cinematic landing page
│   │   ├── dashboard/              # Executive dashboard
│   │   ├── invoices/               # Ledger + [id] detail, /create
│   │   ├── contractor-bills/       # Bill workflow + components/
│   │   ├── purchase-orders/        # PO register + components/
│   │   ├── tenders/ · jobs/ · customers/ · contractors/
│   │   ├── admin/                  # users/ · roles/ · audit-logs/
│   │   ├── profile/ · settings/ · notifications/ · system-logs/
│   │   ├── help/                   # Help Center · guides/ (walkthrough) · docs/ (library)
│   │   │   ├── docs/               # api · testing · setup · glossary · data-dictionary
│   │   │   │                       # onboarding · runbook · releases · demo-data · dev/
│   │   │   └── dev/                # database-map · use-cases · flowcharts
│   │   └── signin/ · signup/ · forgot-password/ · reset-password/
│   ├── components/                 # Layout, Navbar, Sidebar, ProtectedRoute …
│   │   └── ui/                     # Radix-based design system primitives
│   ├── contexts/                   # Auth · Theme · Scroll · Language · Preferences · Notifications
│   ├── hooks/                      # usePermission · useAutoLogout · useSystemStatus …
│   ├── lib/
│   │   ├── i18n/                   # Domain-split dictionaries (ui · help · guides · docs · dev)
│   │   ├── axios.js                # API client with CSRF + JSON 401 handling
│   │   ├── preferences.js          # density / language / timezone / currency persistence
│   │   └── api/ · toast.js         # API modules · toast bridge
│   ├── constants/                  # navigation registry, slides, config
│   └── tests/                      # Playwright QA suite
├── docs/screenshots/               # README imagery (desktop + mobile)
├── next.config.mjs                 # rewrites, image hosts, redirects
├── playwright.config.js            # QA config (chromium)
└── package.json
```

## 🌐 Localization

The interface ships in **English, Sinhala and Tamil**, switchable in **Settings → Regional** (persisted as `procurex_language`). Translation lives in `src/lib/i18n/`, split by domain so each file stays reviewable:

| Module | Scope |
| :--- | :--- |
| `ui.js` | Core shell — navigation, common actions, forms, settings |
| `help.js` | Help Center — FAQs, contacts, resources, support tickets |
| `guides.js` | System Walkthrough — every step, field and callout |
| `docs*.js` | Documentation library — API, testing, setup, glossary, onboarding, chrome |
| `dev.js` | Developer docs — database map, use cases, flowcharts |

Missing keys fall back to the English source, so untranslated strings always render. Add a language by adding a dictionary object to `src/lib/i18n/index.js`.

## 🚀 Getting Started

### Prerequisites

- Node.js **18+** (Node 20 LTS recommended)
- A running **Finance App Backend** (see [backend README](../finance-backend/README.md)) at `http://127.0.0.1:8000`

### Installation

1. **Clone & install**

   ```bash
   git clone <your-repo-url> finance-frontend
   cd finance-frontend
   npm install
   ```

2. **Configure the API target (optional)**

   ```bash
   # .env.local — defaults to http://127.0.0.1:8000 when unset
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
   ```

3. **Run the dev server**

   ```bash
   npm run dev
   ```

4. **Open the app** — [http://localhost:3000](http://localhost:3000)

> Use `http://localhost:3000` or `http://127.0.0.1:3000` consistently; mixing hostnames can break cookie scoping with Sanctum.

### Common Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Dev server on port 3000 |
| `npm run build` | Production build |
| `npm start` | Serve a production build |
| `npm run lint` | ESLint (Next.js config) |
| `npx playwright test` | Full QA suite (requires both servers running) |

## 🧪 Testing

The Playwright suite in `src/tests/` covers security, resilience, and visuals:

| Spec | Focus |
| :--- | :--- |
| `rbac_security.spec.js` | Permission gating, route guards, session behavior |
| `edge_cases.spec.js` | Validation boundaries, throttling, wrong-password flows, empty states |
| `file_workflows.spec.js` | Document upload/download across modules |
| `mock_api.spec.js` | Mocked API payloads, empty-state rendering, confirm dialogs |
| `qa_full_suite.spec.js` | End-to-end module walkthrough (bills, ledger, users, notifications) |
| `responsive_devices.spec.js` | Mobile / tablet / desktop layouts |
| `visual_regression.spec.js` | Snapshot diffs for header, sidebar, sign-in |
| `network_resilience.spec.js` | Offline / slow-API behavior |
| `accessibility.spec.js` | Landmarks, labels, contrast checks |
| `support_ticket.spec.js` | Help Center ticket submission and listing |
| `profile_relocation.spec.js` | Profile page read-only; all modification owned by Settings |
| `settings_profile.spec.js` | Avatar crop modal robustness, OTP email change, upload round-trip |
| `account_danger_zone.spec.js` | Self-service account deactivation & permanent deletion (type-to-confirm) |

Run a single area: `npx playwright test src/tests/rbac_security.spec.js`.

## 🌐 Deployment

For a production stack (frontend on Netlify, API on a Docker host, managed MySQL), see the root [`deployment-guide.md`](../deployment-guide.md). Key knobs:

- `NEXT_PUBLIC_API_URL` — the origin Next.js proxies to.
- Set `SESSION_DOMAIN=null` and whitelist the site under `SANCTUM_STATEFUL_DOMAINS` on the API side.
- Build memory headroom: `NODE_OPTIONS=--max-old-space-size=4096` on CI.

## 🤝 Contributing

1. Fork the project and create a branch (`git checkout -b feature/amazing-feature`)
2. Follow the [frontend standards](../frontend-standards.md) — components under 400–500 lines, no inline modals, semantics-first Tailwind tokens
3. Commit with a clear message and open a pull request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  Built with ❤️ by <strong>Gayan Kavinda</strong> · <a href="../finance-backend/README.md">Explore the API →</a>
</div>
