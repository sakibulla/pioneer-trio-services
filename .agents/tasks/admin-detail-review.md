# Admin Profile and Case Detail Pages

The implementation adds two new detail pages (`/admin/profiles/[id]` and `/admin/cases/[id]`) that let administrators review, approve, reject, and update matrimonial profiles and immigration cases. The admin list page gains clickable table rows that navigate to these details. The feature surfaces all profile and case data at a granular level with specific actions (approve/reject for profiles, status update for cases) that feed back to the database immediately.

**Verdict**: APPROVED

## High-level view

Both detail pages follow a consistent architecture: load data from localStorage token + URL param, guard against non-admin access by redirecting to `/portal`, display all available fields organized into semantic sections, then expose admin actions. The matrimonial profile page shows 8 sections (personal, family, education, religious, lifestyle, preferences, photos, metadata) with an inline rejection form that captures reason + notes; the immigration case page shows case overview, assessment subsections, documents table, and case notes, with a status dropdown that sends updates back to the backend. The admin list page now has click-through rows for both tables, making the detail pages discoverable. All three pages use `use client` and `useParams()`/`useRouter()` from next/navigation as required. The API layer already had the needed functions (`getProfileDetails`, `approveProfile`, `rejectProfile`, `getCaseDetails`, `updateCaseStatus`); no duplicates were introduced. TypeScript build passed, confirming no type errors.

<details>
<summary>Issues (0)</summary>

No blocking concerns identified.

</details>

<details>
<summary>Details</summary>

## Auth guard and token retrieval

Both detail pages guard access by checking `localStorage.getItem("pioneer_token")` in a `useEffect` and returning early if missing. The `/admin` wrapper page (`/app/admin/page.tsx`) does the same check plus verifies `role === "ADMIN"` and redirects to `/portal` if either fails. This gating is consistent but relies on localStorage being populated correctly by the login flow — if the login flow failed to set the token, these pages show "No authentication token found" inline rather than redirecting. The pattern is acceptable for a client-rendered dashboard where token lifecycle is already established.

## Profile detail page structure and display

The matrimonial profile page renders eight collapsible logical sections: Personal & Identity (name, DOB, gender, height, marital status, language, country, city), Family Background (parents, sibling count), Education & Career (education level, institution, degree, profession, income), Religious Practice (practice type, prayer frequency), Lifestyle & Values (dietary, smoking, drinking, hobbies), Partner Preferences (age/height/profession/location ranges), Photos (grid of uploaded images with fallback SVG), and Metadata (timestamps). Each section is conditionally rendered — if all fields in a section are falsy, the section is omitted. This is a reasonable UX trade-off: prevents empty cards but loses visual consistency if some users have complete profiles and others don't. Fields that are undefined display "N/A" consistently.

## Approve/Reject workflow

The page shows action buttons only when `status !== "APPROVED" && status !== "REJECTED"`, preventing double-action on finalized profiles. Approve immediately calls `portalApi.approveProfile(token, profileId)` and updates local state to reflect the new status. Reject exposes a form that requires selecting a reason category (STATUS_MOTIVATED, TRAFFICKING_RISK, FALSE_INFORMATION, INCOMPLETE_PROFILE, VERIFICATION_FAILED, OTHER) and optionally adding notes, then calls `portalApi.rejectProfile(token, profileId, reasonCategory, notes)`. Both actions set success messages and navigate back to the admin list (`/admin?tab=profiles`) after 1.5 seconds. The rejection reason enum is hardcoded in the component; if the backend adds or removes reasons, this select will fall out of sync with what the API accepts, but that's a deployment coordination concern rather than a code concern.

## Case detail page structure

The case page follows a similar organization: Case Overview (reference, destination, application type, client name, dates), Coordinator Info (if assigned), Assessment subsections (personal info, education, employment, language, financial, dependants — each rendered only if data exists), Documents table, and Case Notes. The assessment subsections drill into nested objects within the case record; if the backend structure changes, these pages will render "N/A" for missing fields rather than crashing, which is safe but silent.

## Case status update flow

The page renders a status update form (initially hidden, shown on button click) with a dropdown of 8 statuses (SUBMITTED, UNDER_REVIEW, DOCUMENTS_PENDING, QC_REVIEW, APPROVED, REFERRED, REJECTED, CLOSED), optional notes textarea, and buttons to confirm or cancel. The status options are hardcoded; like the rejection reasons, they should match the backend enum. The update calls `portalApi.updateCaseStatus(token, caseId, newStatus, statusNotes || undefined)` and refreshes local state. Confirmation and cancellation clear the form and hide it.

## Admin list page integration

The cases and profiles tables in AdminDashboard now have `onClick={() => router.push(...)}` handlers that navigate to the detail pages. The rows show visual feedback (hover state changes color based on theme). This makes discovery of detail pages intuitive. No modal state or modal functions remain in the AdminDashboard code — they were removed as expected.

## Data fetching and error handling

Both detail pages follow the same pattern: set loading state, call the API with token from localStorage, handle errors by showing inline message but not redirecting (allowing user to stay on page and retry), and render a fallback UI ("Profile Not Found") if the response is null. This is slightly different from the auth guard (which redirects) but consistent with error handling (which doesn't). The pages load data only once on mount (`useEffect` with `[profileId]` or `[caseId]` dependency), so refreshing requires a page reload rather than a refresh button.

## Build and type safety

The build log confirms TypeScript compilation and Next.js build both passed. The pages use `useParams()` and `useRouter()` correctly from `next/navigation`. All API calls are typed via the existing `portalApi` exports. No new npm packages were added.

## Potential gaps (informational)

The photo display on the profile page uses `onError` to fall back to a placeholder SVG if an image URL fails to load. This is defensive but doesn't report why images failed (CORS, network, missing file). The documents table on the case page shows a Download/View link only if `doc.url` exists; if documents are stored but URLs aren't populated by the backend, the table will show rows with no action possible. Neither is a bug — both are graceful — but worth noting if document retrieval becomes a support issue.

</details>

## File map

<details>
<summary>Files changed</summary>

- **`src/app/admin/profiles/[id]/page.tsx`** (new) — Matrimonial profile detail page with full data display, approve button, and inline rejection form. Approx. 550 lines.
- **`src/app/admin/cases/[id]/page.tsx`** (new) — Immigration case detail page with case overview, assessment sections, documents table, case notes, and status update form. Approx. 450 lines.
- **`src/app/admin/page.tsx`** (new/wrapper) — Route wrapper that guards admin access and passes user + token to AdminDashboard component.
- **`src/components/portal/AdminDashboard.tsx`** (modified) — Removed modal state, updated cases and profiles table rows to be clickable and navigate to detail pages.
- **`src/lib/portal-api.ts`** (verified no change) — Already contained all required functions: `getProfileDetails`, `approveProfile`, `rejectProfile`, `getCaseDetails`, `updateCaseStatus`, `getAllCases`, `getAllProfiles`, `getAllLeads`.

See full diff with `git diff`.

</details>
