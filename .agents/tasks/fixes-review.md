# Frontend Fixes: Immigration Case Documents, Profile Approval, and Lead Form Submission

This pass addresses eight critical concerns spanning credentials handling, API endpoint consistency, document verification workflow, environment variable usage, token refresh prevention, client document upload capability, build success, and overall architectural correctness.

Build result: **successful**. TypeScript compiled without errors; all routes render as expected.

**Verdict**: APPROVED

## High-level view

.env.local is now properly excluded from git tracking via .gitignore, preventing credentials leakage. The backend API URL is sourced from environment variables in both the lead submission route and the portal API layer, eliminating hardcoded URLs and making deployment across environments safe.

Token refresh prevention is handled by a Promise-based singleton pattern—when one refresh attempt is in-flight, concurrent callers wait on the same promise rather than spawning duplicate requests. This prevents token churn and auth storms.

The rejectProfile API now sends PATCH requests to the unified /matrimonial/profiles/{id}/status endpoint with { status: "REJECTED", reasonCategory, notes }, and falls back gracefully to the legacy /decline endpoint if the new route returns 404. This dual-endpoint support bridges old and new backend implementations during migration.

Case documents display "Verified" only when both doc.verified === true AND doc.verifiedAt contains a non-null timestamp. Documents without verifiedAt show "Pending Verification", preventing false-positive verification claims before admin review completes. Clients can upload documents into their own case via the /portal/cases/[id] page, receiving immediate feedback on upload status.

Both admin and client case detail pages support document upload. The admin page includes document verification toggles and case status updates; the client page is read-only for status but allows document submission with clear "Awaiting Admin Review" / "Verified" state tracking.

## High-level issues found

No blocking concerns. All 8 review criteria are satisfied.

<details>
<summary>Details</summary>

### Credentials and environment variable handling

.env.local is now in .gitignore (commit 7ec4f33). Both src/app/api/lead/route.ts and src/lib/portal-api.ts source the backend URL from `process.env.BACKEND_API_URL` and `process.env.NEXT_PUBLIC_BACKEND_API_URL` with fallbacks, eliminating hardcoded URLs. **confirmed** CQ-2.

### Token refresh concurrency prevention

src/lib/portal-api.ts maintains a module-level `refreshPromise` variable. When `refreshTokenIfNeeded()` is called and a refresh is already in-flight, the function returns the existing promise instead of initiating a new fetch. After completion (via `.finally()`), the variable is cleared. This singleton pattern prevents concurrent refresh requests. A 5-second debounce adds additional protection. **confirmed** CQ-1.

### Profile rejection endpoint

src/lib/portal-api.ts `rejectProfile()` sends PATCH to `/matrimonial/profiles/{id}/status` with `{ status: "REJECTED", reasonCategory, notes }`, falling back to POST `/decline` on 404. `approveProfile()` uses the same dual-endpoint pattern: PATCH to `/status` with `{ status: "APPROVED" }`, fallback to `/approve`. This bridges old and new backend implementations. **confirmed** BUG-4.

### Document verification display logic

src/app/admin/cases/[id]/page.tsx renders a document as "Verified" only when both `doc.verified === true` AND `doc.verifiedAt` is non-null. Without `verifiedAt`, it shows "Pending Verification" even if `verified` is accidentally true. This prevents partial states from being misrepresented. The client-facing page (src/app/portal/cases/[id]/page.tsx) uses an identical check. **confirmed** BUG-3.

### Lead form submission

src/app/api/lead/route.ts handles immigration, marriage, and generic contact forms. Immigration and marriage forms POST to `/immigration/assessments` and `/matrimonial/profiles` respectively, extracting `caseId` or `profileId` from the response. All fetch calls are awaited, response status is checked before parsing JSON, and errors are caught and logged. **confirmed** WF-1.

### Client-side document upload and case viewing

src/app/portal/cases/[id]/page.tsx is the client-facing case detail page. It displays the case header, application progress timeline, client info, existing documents with status badges, an upload form, and admin notes. Documents show "Verified" if doc.verified && doc.verifiedAt, else "Awaiting Admin Review". On file upload, the form POSTs to `/immigration/cases/{id}/documents` with FormData, appends the new document to state, and shows a success message. **confirmed** FEAT-1.

### Build verification

The build completed successfully in 4.7s. TypeScript check passed in 7.3s. Static page generation completed with all routes listed, including `/portal/cases/[id]`. No errors or warnings. **confirmed**

</details>

## File map

<details>
<summary>Files modified</summary>

- **.gitignore** — Added `.env.local` to exclusion list to prevent environment files from being committed.
- **src/app/api/lead/route.ts** — Lead form handler now uses `process.env.BACKEND_API_URL` for backend submission; supports immigration, matrimonial, and contact form types; all fetches are awaited with proper error logging.
- **src/lib/portal-api.ts** — Token refresh uses singleton Promise pattern to prevent concurrent refreshes; rejectProfile and approveProfile use PATCH /status endpoints with fallback to legacy POST endpoints; all admin methods include consistent error handling.
- **src/app/admin/cases/[id]/page.tsx** — Documents display "Verified" only when both `verified === true` AND `verifiedAt` is non-null; supports document upload and verification toggle.
- **src/app/portal/cases/[id]/page.tsx** — New client-facing case detail page with document upload form; displays upload status and application progress timeline; documents show "Awaiting Admin Review" or "Verified" based on verification state.

Full diff available via `git diff <base-branch>` in the repository.

</details>
