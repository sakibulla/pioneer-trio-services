# Dark Mode & Forgot Password Implementation Review

## Summary

Dark mode has been implemented across the Next.js 15 frontend using a custom theme provider with React Context, localStorage persistence, and system preference detection. The forgot password flow is complete with both email submission and token-based password reset pages. Both features have proper dark mode support and are functional, though several components lack complete dark mode styling coverage, and one UI element is missing dark mode color support in an interactive button.

**Watch for:** Missing dark mode classes on the password visibility toggle icon in the login form (portal page line 306); geo-banner needs dark mode background and text styling; section-heading component is missing dark mode text color on eyebrow elements; cookie-consent needs dark mode support; button component toneOutline mapping lacks dark mode hover backgrounds.

**Verdict**: CHANGES_REQUESTED

---

## High-level view

Theme infrastructure is solid. The custom ThemeProvider uses React Context with localStorage and system preference detection, avoiding next-themes as intended. The layout.tsx wraps the app with ThemeProvider and sets appropriate body classes. Tailwind v4 with `@tailwindcss/postcss` supports dark: classes natively when `<html class="dark">` is set by theme-provider.tsx — no additional Tailwind darkMode config needed.

Forgot password pages are complete and functional. Both `/forgot-password` and `/reset-password/[token]` pages have proper form handling, validation rules, error states, and dark mode support. The portal login form includes a "Forgot password?" link correctly pointing to `/forgot-password`. The password reset calls are made to external backend endpoints (stubs returning success), which is acceptable per the plan. The API route stubs mentioned in the plan do not exist as internal routes; instead, the frontend calls the backend directly, which is valid for this architecture.

Most high-traffic pages and components have dark mode coverage: portal page (login and dashboard), both password reset pages, home page hero and sections, how-it-works page table, immigration-consultancy page headers. However, several shared components and one interactive element are incomplete. The geo-banner component lacks any dark mode styling, causing visibility issues in dark mode. The section-heading component is missing dark mode text colors on eyebrow elements. The cookie-consent banner needs dark mode styling. The password visibility toggle button in the login form is missing dark mode hover state on the icon.

Demo account section has been successfully removed from the portal page. The login form includes a proper "Forgot password?" link with dark mode support. Smooth transitions are configured in the body element.

---

<details>
<summary>Issues (5)</summary>

1. **Password eye icon missing dark mode hover** — The password visibility toggle button in portal login (line 306) has `hover:text-stone-600` but no dark mode hover class. In dark mode, hovering the eye icon shows no visual feedback. Add `dark:hover:text-stone-300` to the button.

2. **GeoBanner lacks dark mode styling** — The banner has hardcoded light-mode gradient (`from-teal-50 to-cyan-50`) and light-mode border/text. Add dark mode background (`dark:bg-gradient-to-r dark:from-teal-950 dark:to-cyan-950`), border (`dark:border-teal-800`), and text color (`dark:text-stone-300`) classes.

3. **SectionHeading eyebrow colors not in dark mode** — The eyebrow text (small accent text above headings) uses light-mode color classes only (`text-brand-700`, `text-immigration-700`, etc.) with no dark mode equivalents. Add `dark:text-brand-400 dark:text-immigration-400 dark:text-marriage-400` mappings.

4. **CookieConsent banner missing dark mode** — The fixed cookie consent banner at bottom has light mode background and text only. Add dark mode classes: `dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300` to the wrapper div.

5. **Button component outline variant lacks dark mode hover background** — The `toneOutline` variant hover states (e.g., `hover:bg-immigration-50`) don't have dark mode equivalents. When in dark mode, outline buttons show no background change on hover. Add dark mode hover backgrounds to toneOutline mappings (e.g., `dark:hover:bg-stone-800`).

</details>

---

<details>
<summary>Details</summary>

### Theme Provider and Infrastructure

Theme provider is correctly implemented with React Context, localStorage persistence, and system preference detection. The `useEffect` hook properly hydrates the theme from localStorage on mount and falls back to system preference if no stored value exists. The theme class (`light` or `dark`) is applied to `document.documentElement` and persisted to localStorage. Layout.tsx wraps the entire app with ThemeProvider and applies body-level dark mode classes (`dark:bg-stone-900 dark:text-stone-100`) with smooth transitions (`transition-colors duration-300`). The theme toggle button correctly uses `useTheme()` hook and displays Sun/Moon icons appropriately. Tailwind v4's native `dark:` prefix support works because the ThemeProvider sets the class on the html element.

### Forgot Password Pages

Forgot password flow is complete and functional. The `/forgot-password/page.tsx` handles email submission, shows success/error states, and has a "Try Another Email" option. The `/reset-password/[token]/page.tsx` validates the token on mount, shows appropriate states for loading/invalid/valid scenarios, accepts new password and confirmation, enforces password requirements (8+ chars, uppercase, number, special char), and shows success with a 3-second redirect. Both pages call external backend endpoints (`https://pioneer-backend-5qhe.onrender.com/api/forgot-password`, `/api/password-reset/validate`, `/api/password-reset/confirm`) which are stubs per the plan.

Both pages have comprehensive dark mode coverage: backgrounds (`dark:bg-stone-900`), text (`dark:text-stone-100`), borders (`dark:border-stone-700`), cards with shadows (`dark:shadow-xl dark:shadow-black/20`), input fields (`dark:bg-stone-900 dark:border-stone-600 dark:text-stone-100`), buttons, error alerts (`dark:bg-red-900/30 dark:text-red-300`), and success states (`dark:bg-emerald-900/30 dark:text-emerald-400`).

The portal login form includes a proper "Forgot password?" link in the password field area (line 323) with dark mode text color (`dark:text-brand-400`), correctly visible in both light and dark modes.

### Portal Page - Login and Dashboard

Portal page login view has extensive dark mode support on containers, tabs, form fields, error messages, and buttons. The card background is `dark:bg-stone-800`, borders are `dark:border-stone-700`, tab text is `dark:text-stone-300`, labels are `dark:text-stone-300`, inputs are `dark:bg-stone-900 dark:border-stone-600 dark:text-stone-100`, and the Google sign-in button area respects dark mode.

However, the password visibility toggle button (line 306) is missing dark mode hover state. The button has `className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"` but lacks `dark:text-stone-400 dark:hover:text-stone-300`. This means the eye icon is barely visible in dark mode and shows no hover feedback.

The authenticated dashboard view has dark mode classes on the user bar, tabs, case/match cards, and dashboard sections.

### Home Page (page.tsx)

Home page hero section has dark mode gradient support: `dark:from-brand-950/40 dark:to-stone-900` on the background. Hero text is `dark:text-stone-100`. The page includes GeoBanner at the top, which lacks dark mode styling (see geo-banner issue below). Feature cards and sections use `dark:bg-stone-900 dark:border-stone-700` patterns. Trust markers and call-to-action buttons are properly styled for dark mode.

### About Page

About page headings, descriptions, and section layouts have dark mode support on text (`dark:text-stone-100`) and backgrounds. The page structure allows for proper dark mode rendering, though specific component dark mode completeness depends on shared components like SectionHeading (which has gaps).

### How-It-Works Page

The comparison table has comprehensive dark mode support: table header background is `dark:bg-stone-800`, body rows are `dark:bg-stone-900`, borders are `dark:border-stone-700`, text is `dark:text-stone-300/400`, and column headers use accent colors with dark mode variants (`dark:text-immigration-400 dark:text-marriage-400`). Table structure and readability are maintained in dark mode.

### GeoBanner Component

The geo-banner component lacks dark mode styling. The background is hardcoded as `bg-gradient-to-r from-teal-50 to-cyan-50` with `border-b border-teal-200` and text as `text-stone-700`. In dark mode, this light teal background remains visible with light text that becomes hard to read. The close button has `text-stone-500 hover:text-stone-700` without dark mode classes. The component needs `dark:bg-gradient-to-r dark:from-teal-950 dark:to-cyan-950 dark:border-teal-800` and `dark:text-stone-300 dark:hover:text-stone-100` additions.

### SectionHeading Component

The SectionHeading component is used across multiple pages (immigration-consultancy, marriage-consultancy, how-it-works, etc.). It supports eyebrow, title, and description text with tone-based color variants. The eyebrow color mapping includes `text-brand-700`, `text-immigration-700`, `text-marriage-700` but lacks dark mode equivalents. In dark mode, eyebrow text becomes hard to read. The title is `text-stone-900` and description is `text-stone-600` — both lacking `dark:text-stone-100` and `dark:text-stone-400` variants. Every page using SectionHeading will have reduced contrast in dark mode until these classes are added.

### CookieConsent Component

The cookie consent banner at the bottom of the page is missing dark mode support. The wrapper `<div>` has light-mode classes only: `border-t border-stone-200 bg-white` with `text-stone-600`. In dark mode, the white background and text remain light, creating poor readability. The banner needs `dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300` on the wrapper and `dark:text-stone-400` on the description text.

### Button Component

The Button and ButtonLink components have tone-solid and toneOutline variants. The toneSolid variant has good dark mode support in the portal form (`dark:bg-brand-800 dark:hover:bg-brand-700`). However, the toneOutline variant (used for secondary buttons) lacks dark mode hover background colors. The toneOutline mapping includes `hover:bg-immigration-50`, `hover:bg-marriage-50`, `hover:bg-brand-50`, etc., but no `dark:hover:bg-*` classes. When users hover an outline button in dark mode, there's no visual feedback. Add dark mode hover backgrounds: `dark:hover:bg-stone-800` for neutral, `dark:hover:bg-brand-900/30` for brand, etc.

### Immigration and Marriage Consultancy Pages

Both consultancy pages use SectionHeading with tone variants and have backgrounds with dark mode support (`dark:bg-stone-900 dark:border-stone-700`). However, SectionHeading's missing eyebrow dark mode classes affect these pages. The ProcessSteps, FaqAccordion, and DestinationsGrid components are referenced but dark mode coverage on these child components was not fully traced.

### Password Reset Form Fields

Both password reset pages have complete dark mode coverage on input fields, labels, error messages, and success/loading states. The password validation helper text is properly styled with `dark:text-stone-400`.

### Build and TypeScript

No build log is available to confirm zero TypeScript errors. The code structure and existing implementation suggest no compilation issues, but this cannot be verified without the build output.

### Smooth Transitions

The body element in layout.tsx includes `transition-colors duration-300`, enabling smooth theme transitions when toggling between light and dark modes.

</details>

---

<details>
<summary>File Map</summary>

- **theme-provider.tsx** — Custom React Context-based theme provider with localStorage and system preference detection; applies theme class to document root.
- **layout.tsx** — Root layout wrapping app with ThemeProvider; applies dark mode classes to body element with smooth transitions.
- **theme-toggle.tsx** — Theme toggle button using useTheme hook; displays Sun/Moon icons with appropriate dark mode styling.
- **forgot-password/page.tsx** — Forgot password email submission page with error/success states and complete dark mode support.
- **reset-password/[token]/page.tsx** — Password reset page with token validation, password requirements, and comprehensive dark mode styling.
- **portal/page.tsx** — Client portal with login/signup form and authenticated dashboard; extensive dark mode on most elements except password eye icon button.
- **page.tsx** (home) — Hero section, feature cards, CTAs with dark mode gradient backgrounds and text colors; includes GeoBanner component.
- **about/page.tsx** — About page sections and layouts with dark mode text support; uses SectionHeading component.
- **how-it-works/page.tsx** — Comparison table with full dark mode styling on headers, borders, and text.
- **immigration-consultancy/page.tsx** — Page sections with dark mode backgrounds; uses SectionHeading (which has gaps).
- **marriage-consultancy/page.tsx** — Similar structure to immigration page; uses SectionHeading.
- **site-footer.tsx** — Footer with full dark mode support on background, borders, text, and links.
- **site-header.tsx** — Header with dark mode classes already implemented (not checked in detail).
- **geo-banner.tsx** — Component displaying client location; missing all dark mode styling.
- **cookie-consent.tsx** — Cookie banner at page bottom; missing dark mode classes on wrapper and text.
- **button.tsx** — Button component; solid variant has dark mode, outline variant missing dark mode hover backgrounds.
- **section-heading.tsx** — Reusable section title component; eyebrow color mapping lacks dark mode variants; title/description text missing dark mode colors.
- **globals.css** — Tailwind import, theme customization, and root CSS variables; includes smooth font rendering.

**Full diff**: Compare against `main` branch via `git diff main -- src/` to see all CSS and component changes.

</details>
