# Role-Based Portal Access Control Implementation Plan

## Overview
Refactor the monolithic portal to support four distinct roles (CLIENT, COORDINATOR, MATCHMAKER, ADMIN) with separate dashboards, role-specific API methods, and proper access control. The portal currently renders the same dashboard for all authenticated users regardless of role.

## Architecture Decisions

### 1. Role Routing Logic in portal/page.tsx
**Decision:** Keep authentication in `src/app/portal/page.tsx` but branch on `user.role` after successful login to render the appropriate dashboard component.
**Rationale:** Single entry point maintains existing auth flow (Google + email/password); role branching is deterministic and easy to test. No need for new pages; role logic lives in one place.

### 2. Dashboard Components (Not Pages)
**Decision:** Create separate React components under `src/components/portal/` for each role's dashboard: `ClientDashboard.tsx`, `CoordinatorDashboard.tsx`, `MatchmakerDashboard.tsx`, `AdminDashboard.tsx`.
**Rationale:** Keeps portal page concise, allows shared UI patterns (header, top bar, logout), and makes testing individual dashboards straightforward. Components receive user and token as props.

### 3. API Client Methods in portal-api.ts
**Decision:** Add new async methods to `portalApi` for:
- **Coordinator:** `getQuickInquiries(token)`, `getPendingAssessments(token)`, `acceptAssessment(token, assessmentId)`
- **Matchmaker:** `getMatrimonialProfiles(token)`, `getMatches(token)` (all profiles, not just client's matches)
- **Admin:** `getAllCases(token)`, `getAllLeads(token)`, `getAllProfiles(token)`, `getAllAssessments(token)`
**Rationale:** Centralized API client; backend URL is already defined; methods follow existing pattern (header auth with token). Admin role calls existing endpoints with admin-level access or new admin-specific endpoints.

### 4. API Docs Link Visibility
**Decision:** Move the ExternalLink button rendering logic into a conditional that checks `user.role === "admin"` before rendering.
**Rationale:** Currently shown to all authenticated users in the top bar; this is a simple guard that can be applied in the top bar component or directly in the portal page.

---

## Implementation Steps

### Step 1: Create portal-specific components directory and shared header
**What:** Create `src/components/portal/` directory and a reusable `PortalHeader.tsx` component that displays the user info bar (avatar, name, role badge, API docs link for ADMIN only, logout button).
**Files:** 
- Create `src/components/portal/PortalHeader.tsx`
**Verify:** 
```bash
npm run build
```
Confirm no errors and all TypeScript checks pass.

---

### Step 2: Create ClientDashboard component
**What:** Extract the current dashboard logic from `portal/page.tsx` (immigration cases tab, matrimonial matches tab, document checklist, stage tracker) into `src/components/portal/ClientDashboard.tsx`. Component accepts `{ user, token, onLogout }` as props.
**Files:**
- Create `src/components/portal/ClientDashboard.tsx`
**Verify:**
```bash
npm run build
```
Confirm the extracted component compiles without errors.

---

### Step 3: Create CoordinatorDashboard component
**What:** Build `src/components/portal/CoordinatorDashboard.tsx` with two tabs:
- **QUICK INQUIRIES tab:** Shows quick inquiry lead submissions (from `/api/v1/contact` endpoint or leads table). Display: inquiry ID, submitter name, email, contact form fields, submission date, "Process" action button.
- **FULL ASSESSMENTS tab:** Shows immigration assessments submitted but not yet accepted (status filters for PENDING/SUBMITTED). Display: assessment ID, client name, destination country, application type, submission date, "Accept" action button.
Tab content loads via `portalApi.getQuickInquiries()` and `portalApi.getPendingAssessments()`. "Accept" button calls `portalApi.acceptAssessment()` and refreshes the list.
Coordinator sees only assessments assigned to them (backend filters by coordinator ID).
**Files:**
- Create `src/components/portal/CoordinatorDashboard.tsx`
**Verify:**
```bash
npm run build
```
Confirm component compiles. No backend integration test needed yet; component will render loading state if API calls fail gracefully.

---

### Step 4: Create MatchmakerDashboard component
**What:** Build `src/components/portal/MatchmakerDashboard.tsx` showing matrimonial profiles and potential matches. Display: profile cards with photo placeholder, name, age, profession, location; "Potential Matches" section showing profile-to-profile pair suggestions with matchmaker compatibility rationale. "Approve" and "Decline" action buttons. Only matchmaker-relevant data; no immigration cases or lead/coordinator workflow.
Data loads via `portalApi.getMatrimonialProfiles()` and `portalApi.getMatches()` (returns all pending matches for this matchmaker to review).
**Files:**
- Create `src/components/portal/MatchmakerDashboard.tsx`
**Verify:**
```bash
npm run build
```
Confirm component compiles.

---

### Step 5: Create AdminDashboard component
**What:** Build `src/components/portal/AdminDashboard.tsx` with four tabs:
- **All Immigration Cases:** Calls `portalApi.getAllCases(token)`, displays case ID, client name, destination, status, assigned coordinator.
- **All Leads:** Calls `portalApi.getAllLeads(token)`, displays lead ID, submitter, form type, submission date, status.
- **All Profiles (Matrimonial):** Calls `portalApi.getAllProfiles(token)`, displays profile ID, name, status, matchmaker assigned.
- **Analytics / Overview:** Summary counts and key metrics (e.g., "50 Active Cases", "30 Pending Assessments", "15 Matrimonial Profiles").
Admin sees all data across all coordinators/matchmakers. Top bar includes API Docs link.
**Files:**
- Create `src/components/portal/AdminDashboard.tsx`
**Verify:**
```bash
npm run build
```
Confirm component compiles.

---

### Step 6: Update portal-api.ts with new coordinator, matchmaker, and admin methods
**What:** Add the following methods to the `portalApi` object in `src/lib/portal-api.ts`:

**Coordinator methods:**
- `getQuickInquiries(token: string)` → GET `/contact/inquiries?status=PENDING` (or equivalent backend endpoint for quick inquiry leads)
- `getPendingAssessments(token: string)` → GET `/immigration/assessments?status=PENDING&assigned_to=me`
- `acceptAssessment(token: string, assessmentId: string)` → POST `/immigration/assessments/${assessmentId}/accept`

**Matchmaker methods:**
- `getMatrimonialProfiles(token: string)` → GET `/matrimonial/profiles` (all profiles for this matchmaker)
- `getMatches(token: string)` → GET `/matrimonial/matches?status=PENDING` (pending matches to review)

**Admin methods:**
- `getAllCases(token: string)` → GET `/immigration/cases?admin=true` (all cases, no filter)
- `getAllLeads(token: string)` → GET `/contact/leads?admin=true` (all leads)
- `getAllProfiles(token: string)` → GET `/matrimonial/profiles?admin=true` (all profiles)
- `getAllAssessments(token: string)` → GET `/immigration/assessments?admin=true` (all assessments)

Each method follows the existing pattern: construct URL with backend base URL, include Authorization header with Bearer token, return `res.json()`.

**Files:**
- Modify `src/lib/portal-api.ts`
**Verify:**
```bash
npm run build
```
Confirm TypeScript strict mode passes and all new methods are properly typed.

---

### Step 7: Update portal/page.tsx to branch on user.role and render appropriate dashboard
**What:** Refactor `src/app/portal/page.tsx` to:
1. Keep existing authentication and login/register flow (unchanged).
2. After successful login/token retrieval, check `user.role`.
3. Branch conditionally:
   - If `user.role === "client"` → render `<ClientDashboard user={user} token={token} onLogout={handleLogout} />`
   - Else if `user.role === "coordinator"` → render `<CoordinatorDashboard user={user} token={token} onLogout={handleLogout} />`
   - Else if `user.role === "matchmaker"` → render `<MatchmakerDashboard user={user} token={token} onLogout={handleLogout} />`
   - Else if `user.role === "admin"` → render `<AdminDashboard user={user} token={token} onLogout={handleLogout} />`
   - Else → show error: "Unknown role. Contact support."
4. Move the top user bar and logout logic into each dashboard component (or create a shared PortalHeader used by all dashboards).
5. Remove the old hardcoded immigration + matrimonial tab logic from this page (now lives in ClientDashboard).
6. Remove the API Docs link from the page-level render; let AdminDashboard/PortalHeader handle it based on role.

**Files:**
- Modify `src/app/portal/page.tsx`
**Verify:**
```bash
npm run build
```
Confirm the page compiles and TypeScript strict mode passes. No runtime test needed yet; component tree is wired correctly.

---

### Step 8: Integration verification and build
**What:** Run full build to confirm all imports, types, and components wire correctly. Fix any unused import warnings or type mismatches.
**Files:** N/A (verification only)
**Verify:**
```bash
npm run build
```
Expected: No TypeScript errors, no ESLint errors, build completes successfully.

---

## Acceptance Criteria

1. ✅ Portal page compiles and runs without errors.
2. ✅ Authenticated client user sees ClientDashboard with immigration cases and matrimonial matches tabs.
3. ✅ Authenticated coordinator user sees CoordinatorDashboard with QUICK INQUIRIES and FULL ASSESSMENTS tabs (no matrimonial data).
4. ✅ Authenticated matchmaker user sees MatchmakerDashboard with matrimonial profiles and matches (no immigration cases).
5. ✅ Authenticated admin user sees AdminDashboard with all immigration cases, all leads, all profiles, and analytics.
6. ✅ API Docs link (ExternalLink to https://pioneer-backend-5qhe.onrender.com/api/v1/docs) is visible ONLY to ADMIN role.
7. ✅ Non-admin roles do NOT see the API Docs link.
8. ✅ All new portal-api methods are typed and available for use by dashboard components.
9. ✅ Full build passes with no errors or warnings.

---

## Notes

- **Backend coordination:** Coordinator, matchmaker, and admin endpoint responses are assumed to exist on the backend (https://pioneer-backend-5qhe.onrender.com/api/v1). If endpoints differ or don't exist, the frontend methods will gracefully return API errors that dashboard components can display to users (e.g., "Failed to load assessments").
- **No breaking changes to existing auth flow:** Login, register, Google sign-in all remain unchanged. Existing clients will continue to work; new roles are supported additively.
- **Styling:** All new components reuse existing Tailwind classes and component patterns from the codebase (e.g., rounded-2xl borders, brand/immigration/marriage color tones, Button component).
- **Testing:** Component-level tests are not planned here; they are deferred to a later QA phase. This plan assumes integration with a working backend.

