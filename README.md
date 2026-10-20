# Pioneer Trio Services - Frontend

A modern, fully digital immigration and marriage consultancy platform for Bangladeshi individuals and families worldwide. Built with Next.js 16, TypeScript, React 19, and Tailwind CSS.

**🌐 [Live Application](https://www.pioneertrioservices.com)** | **📖 [Documentation](./Pioneer_Trio_Services_Website_Documentation.md)**

---

## ✨ Features

### Immigration Consultancy
- 📋 Multi-section immigration assessment intake
- 🌍 Support for 10+ destination countries (Canada, UK, Australia, US, EU, Gulf, Malaysia)
- 📄 Secure document upload and management
- ✅ Step-by-step case tracking
- 🔄 Automated coordinator assignment

### Marriage Consultancy
- 👤 Verified profile creation with multi-photo support
- 🔍 Profile verification and safety screening
- 💬 Human-led matchmaker introductions
- 🛡️ Privacy and safety controls
- 📊 Relationship intent filtering

### General Features
- 🎨 Responsive, accessible UI with Tailwind CSS
- 📱 Mobile-first design
- ⚡ Next.js App Router with server/client components
- 🔐 Form validation with Zod
- 📧 Email notifications via Gmail SMTP
- 📈 SEO optimized (sitemap, robots.txt, meta tags)
- 🍪 Cookie consent banner with Plausible analytics
- ♿ WCAG 2.1 accessibility compliance

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Backend API running at `https://pioneer-backend-5qhe.onrender.com/api/v1`

### Local Development

```bash
# Clone and install
git clone <repository>
cd pioneer-trio-services
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create `.env.local` file:

```env
# Optional: Lead delivery via Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@pioneertrioservices.com
LEAD_EMAIL_TO=info@pioneertrioservices.com

# Optional: Analytics
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=pioneertrioservices.com

# Optional: Site URL (for metadata, sitemap, robots.txt)
NEXT_PUBLIC_SITE_URL=https://www.pioneertrioservices.com

# Backend API URL (required for production)
NEXT_PUBLIC_BACKEND_API_URL=https://pioneer-backend-5qhe.onrender.com/api/v1
```

**Note:** All environment variables are optional. The site runs without them, but features like lead delivery and analytics require configuration.

---

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── about/                   # About us page
│   ├── admin/                   # Admin dashboard (role-protected)
│   ├── contact/                 # Contact & inquiry form
│   ├── immigration/             # Immigration consultancy landing
│   ├── marriage/                # Marriage consultancy landing
│   ├── portal/                  # Client portal (requires auth)
│   ├── resources/               # Guides & blog content
│   ├── api/                     # API routes
│   ├── layout.tsx               # Root layout with nav/footer
│   ├── page.tsx                 # Homepage
│   ├── sitemap.ts               # Dynamic sitemap
│   ├── robots.ts                # robots.txt generation
│   └── opengraph-image.tsx      # OG image generation
│
├── components/                   # Reusable React components
│   ├── forms/                   # Form components
│   │   ├── contact-form.tsx
│   │   ├── immigration-assessment-form.tsx
│   │   ├── marriage-profile-form.tsx
│   │   └── form-field.tsx
│   ├── header.tsx               # Navigation header
│   ├── footer.tsx               # Site footer
│   ├── cookie-consent.tsx       # Cookie banner
│   └── ...other UI components
│
├── data/                         # Static content
│   ├── navigation.ts            # Nav menu structure
│   ├── destinations.ts          # Immigration destinations data
│   ├── testimonials.ts          # Success stories & reviews
│   └── ...other static data
│
├── lib/                          # Utilities & helpers
│   ├── immigration-assessment-schema.ts  # Zod validation
│   ├── marriage-profile-schema.ts
│   ├── lead-notify.ts           # Email notification helpers
│   ├── config.ts                # Site configuration
│   └── ...other utilities
│
├── styles/                       # Global CSS
│   └── globals.css              # Tailwind + custom styles
│
├── types/                        # TypeScript type definitions
│   └── ...type files
│
└── public/                       # Static assets
    ├── logo.png
    ├── favicon.ico
    ├── favicon-*.png            # Various favicon sizes
    ├── apple-touch-icon.png
    └── android-chrome-*.png
```

---

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload

# Production
npm run build            # Build optimized Next.js bundle
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues
npm run format           # Format code with Prettier

# Types
npm run type-check       # Check TypeScript types
```

---

## 🎯 Main Pages & Routes

| Page | Route | Purpose |
|------|-------|---------|
| **Homepage** | `/` | Brand intro, dual-service showcase |
| **About Us** | `/about` | Mission, team, brand story |
| **Immigration** | `/immigration` | Service overview, destinations, CTA |
| **Marriage** | `/marriage` | Matchmaking service details, CTA |
| **How It Works** | `/how-it-works` | Side-by-side process walkthrough |
| **Trust & Safety** | `/trust-safety` | Verification, screening, safeguards |
| **Resources** | `/resources` | Guides, destination checklists, blog |
| **Contact** | `/contact` | General inquiry form |
| **Portal** | `/portal` | Client dashboard (auth required) |
| **Privacy Policy** | `/privacy` | Data handling & legal |
| **Terms of Service** | `/terms` | Service terms & legal |

---

## 🔐 Form Integrations

### Contact & Lead Forms
- **Immigration Assessment Form**: Multi-section intake → Backend API `/api/v1/immigration/assessment`
- **Marriage Profile Form**: Profile data + 2 photos → Backend API `/api/v1/matrimonial/profiles`
- **General Contact Form**: Email inquiries → Email notification + Backend `/api/v1/lead`

All forms use **Zod validation** for client-side validation and **React Hook Form** for state management.

---

## 🚀 Deployment

### Deploy to Render (Recommended)

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Create Render Service**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click **New +** → **Web Service**
   - Connect GitHub repo and select `pioneer-trio-services` folder

3. **Configure**
   - **Name**: `pioneer-frontend`
   - **Environment**: Node
   - **Plan**: Free or Paid
   - **Region**: Ohio (same as backend)
   - **Build Command**: `npm ci --include=dev && npm run build`
   - **Start Command**: `npm start`

4. **Environment Variables** (in Render Dashboard)
   ```
   NODE_ENV=production
   NEXT_PUBLIC_BACKEND_API_URL=https://pioneer-backend-5qhe.onrender.com/api/v1
   NEXT_PUBLIC_SITE_URL=<your-frontend-url>
   SMTP_USER=<gmail-address>
   SMTP_PASS=<gmail-app-password>
   LEAD_EMAIL_TO=<recipient-email>
   NEXT_PUBLIC_PLAUSIBLE_DOMAIN=<your-domain>
   ```

5. **Deploy**
   - Click **Create Web Service**
   - Render builds and deploys (3-5 min)
   - Access live at assigned URL

### Custom Domain

Once live on Render:

1. Go to **Settings** → **Custom Domains**
2. Add: `www.pioneertrioservices.com`
3. Add CNAME record to your domain provider pointing to your Render URL

---

## 🔌 API Integration

### Backend Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/immigration/assessment` | POST | Submit 8-section intake |
| `/api/v1/matrimonial/profiles` | POST | Create marriage profile |
| `/api/v1/matrimonial/profiles/:id/photos` | POST | Upload profile photos |
| `/api/v1/lead` | POST | General contact form submission |
| `/api/v1/health` | GET | Backend health check |

**Base URL**: Set via `NEXT_PUBLIC_BACKEND_API_URL` environment variable

---

## 📊 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Email**: [Nodemailer](https://nodemailer.com/)
- **Linting**: [ESLint 10](https://eslint.org/)
- **Type Safety**: TypeScript Strict Mode

---

## ♿ Accessibility

- WCAG 2.1 AA compliance targeted
- Semantic HTML structure
- ARIA labels and descriptions
- Keyboard navigation support
- Color contrast ratios verified (4.5:1+)
- Form field associations with labels
- Skip navigation links

**Note**: Full accessibility validation requires manual testing with screen readers and assistive technologies. Refer to WCAG 2.1 guidelines for comprehensive compliance checks.

---

## 🧪 Testing

Currently, no automated tests are configured. To add testing:

```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Create jest.config.ts and setup tests/
# See Next.js testing guide: https://nextjs.org/docs/app/building-your-application/testing
```

---

## 📚 Documentation

- **Full Feature Brief**: See `Pioneer_Trio_Services_Website_Documentation.md`
- **Deployment Guide**: See `FRONTEND_DEPLOYMENT.md`
- **Backend Setup**: See `pioneer-trio-services-backend/README.md`
- **Deployment Summary**: See `DEPLOYMENT_SUMMARY.md`

---

## 🔗 Links & Resources

| Resource | URL |
|----------|-----|
| **Live Frontend** | https://www.pioneertrioservices.com |
| **Render Dashboard** | https://dashboard.render.com |
| **GitHub** | https://github.com/your-org/Pioneer |

---

## ⚙️ Configuration Files

- **`next.config.ts`** - Next.js configuration, redirects, headers
- **`tailwind.config.ts`** - Tailwind CSS customization
- **`tsconfig.json`** - TypeScript compiler options (strict mode)
- **`eslint.config.mjs`** - ESLint rules and warnings
- **`postcss.config.mjs`** - PostCSS + Tailwind setup
- **`.env.example`** - Environment variable template
- **`render.yaml`** - Render deployment configuration

---

## 🐛 Troubleshooting

### Build Errors
- **ESLint error**: Run `npm run lint:fix`
- **Type errors**: Run `npm run type-check` for full TypeScript analysis
- **Module not found**: Delete `node_modules` and `.next`, then `npm install && npm run build`

### Runtime Issues
- **Backend connection fails**: Verify `NEXT_PUBLIC_BACKEND_API_URL` is set correctly
- **CORS errors**: Check backend CORS configuration allows your frontend URL
- **Forms not submitting**: Check browser console for validation errors; verify backend is running

### Development Server
- **Port already in use**: `npm run dev -- -p 3001` to use port 3001
- **Hot reload not working**: Restart dev server
- **File changes not detected**: Check file watcher limits on your system

---

## 📝 Legal & Compliance

- **Privacy Policy**: Located at `/privacy` - reviews data handling
- **Terms of Service**: Located at `/terms` - covers service terms for both offerings
- **Status**: Privacy Policy and Terms include "pending legal review" banner
- **Note**: All compliance copy should be reviewed by local counsel before final publication

---

## 👥 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -am 'Add feature'`
3. Push to GitHub: `git push origin feature/your-feature`
4. Create a Pull Request with clear description

**Code Style**:
- Use TypeScript strict mode
- Follow ESLint rules (run `npm run lint:fix`)
- Format with Prettier (built into pre-commit hooks if available)

---

## 📄 License

ISC

---

## 🤝 Support

- **Issues**: Report bugs via GitHub Issues
- **Questions**: Contact `info@pioneertrioservices.com`
- **Backend Issues**: See backend README at `pioneer-trio-services-backend/README.md`

---

**Last Updated**: October 2026  
**Status**: 🟢 Production Ready  
**Version**: 1.0.0

