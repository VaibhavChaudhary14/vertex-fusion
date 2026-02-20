# 🛡️ Vertex Fusion - Complete Tech Stack Documentation

## Project Overview
**Vertex Fusion** is an enterprise-grade cybersecurity monitoring platform for smart power grids with GNN-powered intrusion detection. It provides real-time threat monitoring, attack detection, and comprehensive analytics for critical infrastructure protection.

**Status**: Authentication system implemented (currently bypassed for demo). Email verification working via Mailtrap sandbox.

---

## 🏗️ Architecture Overview

### Project Structure
```
root/
├── client/                    # React Frontend (SPA)
│   └── src/
│       ├── pages/            # Page components (Login, SignUp, Dashboard, etc.)
│       ├── components/       # Reusable UI components
│       ├── hooks/            # Custom React hooks
│       ├── lib/              # Utilities and helpers
│       └── App.tsx           # Main routing
├── server/                    # Express.js Backend
│   ├── index.ts              # Server entry point
│   ├── routes.ts             # API route definitions
│   ├── replitAuth.ts         # Authentication setup
│   └── sendgridUtil.ts       # Email service (Mailtrap)
├── shared/                    # Shared code
│   └── schema.ts             # Database schema (Drizzle ORM)
├── migrations/               # Database migrations (auto-generated)
└── dist/                     # Production build output

```

---

## 🎨 Frontend Stack

### Core Framework
| Technology | Version | Purpose |
|---|---|---|
| **React** | 18.3.1 | UI library - component-based architecture |
| **TypeScript** | 5.6.3 | Type-safe JavaScript |
| **Vite** | 5.4.20 | Build tool - ultra-fast development server |
| **React Router** | Wouter 3.3.5 | Client-side routing |

### UI & Styling
| Technology | Version | Purpose |
|---|---|---|
| **Tailwind CSS** | 3.4.17 | Utility-first CSS framework |
| **Radix UI** | 1.2.x | Headless component library (30+ components) |
| **Lucide React** | 0.453.0 | Icon library (1000+ icons) |
| **Framer Motion** | 11.13.1 | Animation library |
| **CSS Animations** | tw-animate 1.2.5 | Tailwind animation utilities |

### Form & Validation
| Technology | Version | Purpose |
|---|---|---|
| **React Hook Form** | 7.55.0 | Performant form state management |
| **Zod** | 3.24.2 | TypeScript-first schema validation |
| **@hookform/resolvers** | 3.10.0 | Integration between Hook Form and Zod |

### State Management & Data
| Technology | Version | Purpose |
|---|---|---|
| **TanStack React Query** | 5.60.5 | Server state management & caching |
| **next-themes** | 0.4.6 | Dark/light theme switching |
| **Recharts** | 2.15.2 | React charting library for visualizations |

### UI Components Library (Radix UI)
Pre-built, accessible components including:
- Accordion, Alert Dialog, Avatar, Checkbox, Collapsible
- Context Menu, Dialog, Dropdown Menu, Hover Card
- Label, Menubar, Navigation Menu, Popover, Progress
- Radio Group, Scroll Area, Select, Separator, Slider
- Switch, Tabs, Toast, Toggle, Toggle Group, Tooltip

### Other Frontend Libraries
| Technology | Version | Purpose |
|---|---|---|
| **clsx** | 2.1.1 | Conditional className utility |
| **tailwind-merge** | 2.6.0 | Merge Tailwind CSS classes intelligently |
| **class-variance-authority** | 0.7.1 | Type-safe component variants |
| **embla-carousel-react** | 8.6.0 | Carousel/slider component |
| **react-resizable-panels** | 2.1.7 | Resizable panel layout |
| **input-otp** | 1.4.2 | OTP input component |
| **date-fns** | 3.6.0 | Date manipulation library |
| **react-day-picker** | 8.10.1 | Calendar component |
| **react-icons** | 5.4.0 | Icon library collection |
| **vaul** | 1.1.2 | Drawer component |
| **cmdk** | 1.1.1 | Command menu component |

---

## 🔙 Backend Stack

### Core Framework
| Technology | Version | Purpose |
|---|---|---|
| **Express.js** | 4.21.2 | Web application framework |
| **Node.js** | 20.x | JavaScript runtime |
| **TypeScript** | 5.6.3 | Type-safe backend code |
| **TSX** | 4.20.5 | TypeScript executor (dev runtime) |

### Authentication & Sessions
| Technology | Version | Purpose |
|---|---|---|
| **Passport.js** | 0.7.0 | Authentication middleware |
| **passport-local** | 1.0.0 | Local email/password strategy |
| **passport-google-oauth20** | 2.0.0 | Google OAuth 2.0 strategy |
| **openid-client** | 6.8.1 | Replit OAuth integration |
| **express-session** | 1.18.1 | Session management |
| **connect-pg-simple** | 10.0.0 | PostgreSQL session store |
| **bcryptjs** | 3.0.3 | Password hashing & comparison |
| **memoizee** | 0.4.17 | Function result caching |

### Database & ORM
| Technology | Version | Purpose |
|---|---|---|
| **Drizzle ORM** | 0.39.1 | Type-safe SQL ORM |
| **drizzle-kit** | 0.31.4 | Migration tool for Drizzle |
| **drizzle-zod** | 0.7.0 | Zod schema generation from Drizzle |
| **@neondatabase/serverless** | 0.10.4 | Neon PostgreSQL serverless driver |
| **PostgreSQL** | (via Neon) | Relational database |

### Email Service
| Technology | Version | Purpose |
|---|---|---|
| **nodemailer** | 6.10.1 | Email sending via SMTP |
| **Mailtrap** | (via SMTP) | Email sandbox/testing service |
| **SendGrid** | 5.2.3 | Email API (installed, alternative) |

### AI/ML Integration
| Technology | Version | Purpose |
|---|---|---|
| **@google/genai** | 1.30.0 | Google Gemini AI API |

### Real-time Communication
| Technology | Version | Purpose |
|---|---|---|
| **WebSocket (ws)** | 8.18.0 | WebSocket server for real-time data |

### Validation & Serialization
| Technology | Version | Purpose |
|---|---|---|
| **Zod** | 3.24.2 | TypeScript schema validation |
| **zod-validation-error** | 3.4.0 | Better error messages for Zod |

---

## 🗄️ Database Schema

### Database Type
- **PostgreSQL** hosted on **Neon** (serverless)
- Accessed via Drizzle ORM

### Key Tables

#### Users Table
```typescript
- id: string (primary key) - email
- email: string - unique
- firstName: string | null
- lastName: string | null
- profileImageUrl: string | null
- passwordHash: string | null
- isEmailVerified: boolean
- emailVerificationToken: string | null
- resetPasswordToken: string | null
- resetPasswordTokenExpiry: timestamp | null
- role: string - "researcher" | "admin"
- subscriptionTier: string - "free" | "pro"
- apiCallsUsed: number
- apiCallsLimit: number
- createdAt: timestamp
- updatedAt: timestamp
```

#### Other Tables
- Sessions table (for express-session)
- Additional tables defined in `shared/schema.ts`

---

## 🛠️ Development Tools & Build Configuration

### Build & Compilation
| Tool | Version | Purpose |
|---|---|---|
| **Vite** | 5.4.20 | Frontend build system |
| **esbuild** | 0.25.0 | Fast JavaScript bundler |
| **TSX** | 4.20.5 | Execute TypeScript files |
| **TypeScript** | 5.6.3 | Static type checking |

### Vite Plugins
| Plugin | Version | Purpose |
|---|---|---|
| **@vitejs/plugin-react** | 4.7.0 | React HMR & JSX support |
| **@replit/vite-plugin-cartographer** | 0.4.4 | Replit-specific code analysis |
| **@replit/vite-plugin-dev-banner** | 0.1.1 | Development banner |
| **@replit/vite-plugin-runtime-error-modal** | 0.0.3 | Runtime error overlay |
| **@tailwindcss/vite** | 4.1.3 | Tailwind CSS Vite integration |

### CSS Processing
| Tool | Version | Purpose |
|---|---|---|
| **Tailwind CSS** | 3.4.17 | CSS framework |
| **PostCSS** | 8.4.47 | CSS transformations |
| **Autoprefixer** | 10.4.20 | Vendor prefixes |
| **@tailwindcss/typography** | 0.5.15 | Prose styling plugin |

### Configuration Files
- **vite.config.ts** - Vite build configuration
- **tsconfig.json** - TypeScript compiler options
- **drizzle.config.ts** - Drizzle ORM migration config
- **package.json** - Dependencies and scripts

---

## 🔐 Authentication & Security

### Authentication Methods
1. **Email/Password (Local Strategy)**
   - Password hashing with bcryptjs
   - Email verification required before login
   - Forgot password with token-based reset

2. **Google OAuth 2.0** (Ready but disabled for demo)
   - Auto email verification
   - Profile data integration

3. **Replit Auth** (Optional)
   - OpenID Connect integration
   - Single sign-on via Replit

### Session Management
- Express session with PostgreSQL store
- Secure cookies (httpOnly)
- 7-day session TTL
- Automatic session serialization

### Security Features
- Password hashing (bcryptjs)
- CSRF protection ready (session middleware)
- SQL injection prevention (Drizzle ORM)
- XSS protection (React escaping)
- Email verification tokens
- Password reset tokens with expiry (24 hours)

---

## 📧 Email System

### Current Setup
- **Service**: Mailtrap SMTP (Sandbox mode)
- **Library**: nodemailer
- **Features**:
  - Email verification on signup
  - Password reset emails
  - Resend verification email
  - Retry logic (3 attempts)
  - Professional HTML templates

### Email Templates
1. **Verification Email**
   - Welcome message
   - Verification link with token
   - 24-hour expiry

2. **Password Reset Email**
   - Reset link with token
   - 24-hour expiry
   - Security notice

### Mailtrap Configuration
```
Host: sandbox.smtp.mailtrap.io
Port: 2525
Credentials: MAILTRAP_USER, MAILTRAP_PASS
```

---

## 📦 NPM Scripts

```json
{
  "dev": "NODE_ENV=development tsx server/index.ts",
  "build": "npx tsx script/build.ts",
  "start": "NODE_ENV=production node dist/index.cjs",
  "check": "tsc",
  "db:push": "drizzle-kit push"
}
```

---

## 🔄 API Endpoints

### Authentication Routes
```
POST   /api/auth/signup              - Create new account
POST   /api/auth/login               - Login with email/password
GET    /api/auth/google              - Google OAuth initiation
GET    /api/auth/google/callback     - Google OAuth callback
GET    /api/logout                   - Logout current user
GET    /api/auth/user                - Get current user profile
POST   /api/auth/forgot-password     - Request password reset
GET    /api/auth/reset-password      - Validate reset token
POST   /api/auth/verify              - Verify email with token
POST   /api/auth/resend-verification - Resend verification email
```

### Dashboard Routes
```
GET    /api/health                   - System health status
GET    /api/alerts                   - Get alerts
POST   /api/alerts/:id/acknowledge   - Acknowledge alert
GET    /api/simulations              - Get simulations
...and more
```

---

## 🌐 Frontend Routes

```
/                    - Landing page (homepage)
/login               - Login page
/signup              - Sign up page
/forgot-password     - Forgot password page
/reset-password      - Reset password page
/verify-email        - Email verification page
/check-email         - Check email status page
/dashboard           - Main dashboard
/virtual-lab         - Virtual lab page
/knowledge           - Knowledge base
/assistant           - AI assistant
/threats             - Threats monitoring
/datasets            - Datasets management
/profile             - User profile
/backend-setup       - Backend configuration
/ml-datasets         - ML datasets and models
/python-utilities    - Python utilities
```

---

## ⚙️ Environment Variables

### Required
```
DATABASE_URL                 - PostgreSQL connection string
NODE_ENV                     - development | production
SESSION_SECRET               - Session encryption key
MAILTRAP_USER               - Mailtrap SMTP username
MAILTRAP_PASS               - Mailtrap SMTP password
```

### Optional (for OAuth)
```
GOOGLE_OAUTH_CLIENT_ID      - Google OAuth client ID
GOOGLE_OAUTH_CLIENT_SECRET  - Google OAuth client secret
REPL_ID                     - Replit app ID (auto-set)
ISSUER_URL                  - OpenID issuer URL
```

---

## 🎯 Current Status & Implementation Details

### ✅ Completed Features
- Full authentication system (email/password, Google OAuth, Replit Auth)
- Email verification on signup
- Password reset with token validation
- User session management
- Database schema with Drizzle ORM
- Professional UI with Radix UI & Tailwind CSS
- Dashboard with multiple pages
- Email service integration (Mailtrap)
- Form validation with Zod
- API endpoint structure

### 🔄 Current Configuration (Demo Mode)
- Authentication temporarily bypassed
- Users skip auth and go directly to dashboard
- Email verification code commented out but preserved
- Google OAuth disabled (credentials needed)
- All authentication routes still accessible for testing

### 📝 Authentication Code Status
All authentication code is **preserved and commented out** in:
- `client/src/App.tsx` - Auth gating logic
- `client/src/pages/Login.tsx` - Login form
- `client/src/pages/SignUp.tsx` - Signup form
- `server/routes.ts` - Auth API endpoints

To re-enable: Uncomment the code blocks and provide Google OAuth credentials.

---

## 🚀 Deployment & Performance

### Build Process
```bash
npm run build  # Creates production bundle
npm start      # Runs production server
```

### Frontend Build Output
- Location: `dist/public/`
- Framework: React SPA
- Module system: ESNext
- Optimization: Vite's production optimization

### Backend Runtime
- Node.js 20.x
- ESM (ECMAScript modules)
- TypeScript compilation via tsx

### Database Connection
- Neon serverless PostgreSQL
- Connection pooling via driver
- Migrations: `npm run db:push`

---

## 📚 Key Dependencies Summary

**Total: 84 dependencies**

### By Category
- **UI Components**: 30+ Radix UI components
- **Forms**: React Hook Form + Zod
- **Styling**: Tailwind CSS + utilities
- **State**: React Query
- **Database**: Drizzle ORM
- **Authentication**: Passport.js strategies
- **Email**: Nodemailer
- **AI**: Google Gemini API
- **Build**: Vite + esbuild
- **Development**: TypeScript, tsx

---

## 🔗 Integration Points

1. **Google OAuth** - OAuth 2.0 provider
2. **Neon PostgreSQL** - Database hosting
3. **Mailtrap/SendGrid** - Email service
4. **Google Gemini** - AI integration
5. **Replit Auth** - Alternative authentication
6. **WebSocket** - Real-time communication

---

## 📋 Type Safety

- **Full TypeScript** throughout codebase
- **Strict mode** enabled in tsconfig
- **Zod validation** for runtime type checking
- **Drizzle ORM** generates types from schema
- **React Hook Form** with TypeScript inference

---

**Last Updated**: December 1, 2025
**Project Version**: 1.0.0
**License**: MIT
