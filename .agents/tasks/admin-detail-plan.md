# Implementation Plan: Admin Detail Pages & Clickable Rows

## Overview
Add two new admin detail pages for matrimonial profiles and immigration cases, plus update the admin dashboard to make rows clickable and navigate to detail views.

## Files Changed
- Create: `src/app/admin/profiles/[id]/page.tsx` — Matrimonial profile detail page
- Create: `src/app/admin/cases/[id]/page.tsx` — Immigration case detail page  
- Modify: `src/components/portal/AdminDashboard.tsx` — Make rows clickable, link to details

---

## Plan

- [ ] 1. Create matrimonial profile detail page (`src/app/admin/profiles/[id]/page.tsx`).
      'use client' page that reads profile ID from params, fetches profile via `portalApi.getProfileDetails(token, id)`, and displays all sections: Personal & Identity (fullName, dateOfBirth, gender, height, maritalStatus, currentCountry, currentCity, motherTongue), Family Background, Education & Career, Religious Practice, Lifestyle & Values, Partner Preferences, Photos, Consent & Acknowledgment, Contact Information. Include photos display (img tag with proper sizing). Approve button calls `portalApi.approveProfile(token, id)`. Reject button shows inline form for reasonCategory + notes, calls `portalApi.rejectProfile(token, id, reasonCategory, notes)`. Back button navigates to `/admin?tab=profiles`. Use same styling patterns (Tailwind, brand colors) as AdminDashboard.
      Files: `src/app/admin/profiles/[id]/page.tsx`
      Verify: `npm run build` completes without errors.

- [ ] 2. Create immigration case detail page (`src/app/admin/cases/[id]/page.tsx`).
      'use client' page that reads case ID from params, fetches case via `portalApi.getCaseDetails(token, id)`, and displays: caseReference, destinationCountry, applicationType, status, submittedAt, updatedAt, assessment data (all immigration assessment fields), documents list (documentType, fileName, verified, uploadedAt), case notes/history. Status update dropdown with options SUBMITTED | UNDER_REVIEW | APPROVED | COMPLETED | REJECTED plus optional notes textarea, Update Status button calls `portalApi.updateCaseStatus(token, id, newStatus, notes)`. Back button navigates to `/admin?tab=cases`. Use same styling patterns as AdminDashboard.
      Files: `src/app/admin/cases/[id]/page.tsx`
      Verify: `npm run build` completes without errors.

- [ ] 3. Update AdminDashboard to add clickable row links.
      In profiles table: change `onClick={() => loadProfileDetails(p.id)}` to navigate with `router.push()` instead of loading in-modal. Add a View button or make entire row clickable to route to `/admin/profiles/${p.id}`. In cases table: add similar View button or make rows clickable to route to `/admin/cases/${c.id}`. Preserve all existing tab functionality and styling.
      Files: `src/components/portal/AdminDashboard.tsx`
      Verify: `npm run build` completes, dashboard renders without console errors, clicking profile/case rows navigates to detail pages.

---

## Design Decisions

**Dynamic Routes Pattern**: Using Next.js 16 app router `[id]` convention. Both detail pages are 'use client' because they fetch data on mount and manage local state. Params are read via `useParams()` hook.

**Token Retrieval**: Both pages read token from `localStorage.getItem("pioneer_token")` on mount, matching the pattern in `AdminDashboard` and portal pages.

**API Calls**: Using existing `portalApi` methods: `getProfileDetails`, `approveProfile`, `rejectProfile`, `getCaseDetails`, `updateCaseStatus`.

**Navigation**: After approve/reject/update, pages navigate back to admin list view with `router.push('/admin?tab=profiles')` or `router.push('/admin?tab=cases')`. This allows admin dashboard to refresh on re-mount.

**Styling**: Consistent with AdminDashboard — Tailwind classes, brand/immigration/marriage color tokens (from button.tsx), rounded-2xl borders, shadow patterns.

**Photos Display**: In profile detail, photos are rendered as `<img>` tags (no Next.js Image component required; backend serves public URLs). Grid layout for multiple photos.

**Form State**: Reject reason/notes form is inline (not modal), using local state with controlled inputs. Submit button triggers API call.

**Error Handling**: API errors are logged to console and shown as toast/alert to user. On success, confirmation message, then navigation.

