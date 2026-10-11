# Code Review: Pioneer Trio Services Bug Fixes and Improvements

## Summary

This review covers the implementation of five bug fixes and two feature additions across the Pioneer Trio Services frontend. The changes address critical issues with profile management endpoints, Google OAuth login persistence, immigration case visibility, document verification workflows, and client case editability. The implementation includes reasonable fallback strategies for API endpoints, improved GSI session management, and client-side document upload capabilities. All TypeScript compilation passes without warnings. However, three concerns remain: the profile approval/rejection endpoints depend on backend verification, token refresh uses a debounce pattern that may cause issues under high concurrency, and some API response parsing lacks comprehensive error handling.

**Watch for:**
- **(confirmed)** API endpoint fallback strategy assumes both new and legacy backend endpoints exist; if only one path is implemented on backend, one pattern will silently fail
- **(likely)** GSI session cancellation on logout and re-initialization may still have race conditions if user logs out and immediately redirects before React state settles
- **(likely)** Token refresh debounce race condition under multiple concurrent requests; the singleton pattern helps but doesn't guarantee thread safety in multi-tab scenarios

**Verdict**: NEEDS_CHANGES — Three issues require clarification or fixes before shipping.

---

## High-level View

The fix addresses the core ask: profile endpoints now try a unified `/status` path first, then fall back to legacy `/approve` and `/decline` paths. This strategy handles backend evolution gracefully but requires verification that at least one endpoint exists on the deployed backend. Google login button now properly resets on logout by explicitly calling `window.google.accounts.id.cancel()` before re-rendering, eliminating the disappearing button issue. Immigration cases are fetched via the correct `/immigration/cases` endpoint, though response shape parsing handles multiple formats defensively. Documents now show "Pending Verification" status until admin explicitly marks them verified, with a UI toggle to verify/unverify. Clients can view and edit their cases via a new `/portal/cases/[id]` route and upload documents directly. The lead form now properly awaits immigration assessment creation and returns the case ID to the client. Environment variable consistency was improved in the lead route. Token refresh now uses a singleton promise pattern to prevent concurrent refreshes, though debounce timing may still cause issues under simultaneous API calls from multiple tabs.

---

<details>
<summary>Issues (6)</summary>

1. **Backend endpoint strategy mismatch** — Both `approveProfile()` and `rejectProfile()` use dual-endpoint fallback (new `/status` then legacy `/approve`/`decline`). If the backend only implements one pattern, requests will silently fail or use wrong endpoint. Requires backend team confirmation of which endpoint is authoritative.

2. **GSI re-initialization timing gap** — Logout calls `cancel()` and clears state, but button re-render depends on `[user, token]` effect. If user navigates away before React completes the effect, GSI cleanup may be incomplete.

3. **Token refresh concurrency under load** — Debounce pattern (5s window) may cause multiple simultaneous API calls to skip refresh if all see `lastRefreshTime` as stale. Singleton promise helps but doesn't handle expiry edge case where token expires between check and first API call in a batch.

4. **API response shape assumptions** — `getMyCases()`, `getAllCases()`, and similar methods check 4+ response shape variants. If backend returns unexpected structure, caller gets empty array silently instead of error.

5. **Missing case ownership validation** — `getCaseDetails()` and `updateCase()` don't verify the authenticated user owns the case. Backend should enforce this, but frontend should not expose case IDs that allow direct enumeration.

6. **Lead form assessment response not validated** — After creating immigration assessment via lead form, response parsing assumes `result.data?.id` exists. If API changes shape, client receives empty `caseId`.

</details>

---

<details>
<summary>Details</summary>

### Bug 1: Profile Approval Endpoint (Resolved with Caveats)

The `approveProfile()` function in `src/lib/portal-api.ts` (lines 557-590) now attempts a unified approach: first tries `PATCH /matrimonial/profiles/{id}/status` with `{ status: "APPROVED" }`, then falls back to `POST /matrimonial/profiles/{id}/approve` if the first returns 404. The reject flow mirrors this with `/status` + `{ status: "REJECTED", reasonCategory, notes }` fallback to `/decline`.

This is a pragmatic solution for backend evolution, but it creates ambiguity: if both endpoints exist and have different semantics, the client will always prefer the new one, potentially bypassing business logic on the legacy endpoint. The code includes comments warning about this and recommends backend team clarify which path is authoritative before deployment.

**Confirmed issue:** The error log from the original bug report showed `PATCH /api/v1/matrimonial/profiles/6e740e76-79dd-4ab8-98a4-8d2ab6ae8172/status not found`, indicating the backend may not have the `/status` endpoint at all. If so, the fallback to `/approve` will work, but the comment recommending backend consolidation becomes critical.

---

### Bug 2: Google OAuth Button Disappearance (Resolved)

The Google Sign-In (GSI) button now properly persists after logout. Changes in `src/app/portal/page.tsx`:

1. **Script loading split into separate effect (lines 56-83):** GSI script loads once at mount with no dependencies. This ensures the Google library is available globally.

2. **Button initialization effect (lines 85-145):** Depends on `[user, token]`. When user logs out (both become null), this effect re-runs, explicitly calling `window.google.accounts.id.cancel()` to clear GSI internal state, then re-initializes with exponential backoff retry logic (5 attempts, up to 3.1 seconds total).

3. **Session cleanup on logout (lines 176-185):** Logout handler explicitly cancels GSI session before clearing local auth state.

This resolves the disappearing button issue. However, a timing gap remains: if user logs out and immediately navigates away (e.g., closes tab or redirects), the cleanup effect may not run. This is acceptable for a single-tab scenario but could cause issues if user has multiple tabs and logs out in one tab then uses another.

---

### Bug 3: Immigration Cases Not Fetching (Resolved)

`getMyCases()` in `src/lib/portal-api.ts` (lines 194-230) now correctly fetches from `${BACKEND_URL}/immigration/cases` with proper authorization and timeout (5s). Response parsing is defensive, checking four possible formats:
- `json.data.items` (paginated response)
- `json.items` (unpaginated with items key)
- `json.data` as array (data directly)
- `json` as array (bare array response)

Falls back to empty array on any error. This approach works but masks response shape mismatches; a debug log would be helpful to surface when the backend returns unexpected structure.

---

### Bug 4: Document Verification Status (Resolved)

Documents now show "Pending Verification" by default. In `src/app/admin/cases/[id]/page.tsx` (lines 189-204), each document displays:
- Green "Verified (AES-256 Encrypted)" if `doc.verified === true && doc.verifiedAt` exists
- Yellow "Pending Verification" otherwise

Admin can toggle verification via `verifyDocument()` API call. The UI correctly updates local state immediately, providing instant feedback.

**Concern (likely):** The condition checks both `verified` flag and `verifiedAt` timestamp, which is good for safety, but if backend sends `verified: true` without `verifiedAt`, the document will still show pending. This is correct behavior (waiting for timestamp audit trail), but creates opportunity for stale state if backend is inconsistent. The code log at admin load shows `response: {data: Array(0)}` for cases initially, suggesting potential empty array responses or response shape mismatches.

---

### Bug 5: Quick-Apply Editability (Partial Implementation)

New client case detail page at `src/app/portal/cases/[id]/page.tsx` allows authenticated clients to view their immigration cases and upload documents. The route is properly gated behind authentication (checks for token in localStorage).

**Concern (likely):** The page calls `portalApi.getCaseDetails(token, caseId)` without ownership verification. Frontend should not be relied upon to enforce access control. The backend must validate that the authenticated user owns the requested case, otherwise any user with a valid token could enumerate cases by guessing IDs.

The page provides a document upload form but does not expose an "edit case details" flow. The review plan suggested allowing clients to edit their initial submission (contact info, application type, etc.). This page allows document upload but not editing of the case itself.

---

### Bug 6: Document Auto-Verification Display (Resolved)

When admin uploads or views a document in `src/app/admin/cases/[id]/page.tsx`, the verification status is correctly set to "Pending" until explicitly toggled to verified. The `verifyDocument()` API call in `src/lib/portal-api.ts` (lines 687-710) sends a PATCH request to `/immigration/documents/{id}/verify` with `{ verified: true/false }`.

---

### Bug 7: Quick-Apply Lead Form Response (Improved)

The lead form (`src/app/api/lead/route.ts`) now properly awaits immigration assessment creation (lines 60-72) and returns the case ID to the client:

```typescript
const response = await fetch(`${backendUrl}/immigration/assessments`, {
  method: "POST",
  ...
});

if (response.ok) {
  const result = await response.json();
  const caseId = result.data?.id || result.id;
  if (caseId) {
    console.log("[lead-assessment-created]", caseId);
    return NextResponse.json({ ok: true, caseId });
  }
}
```

This is improved from fire-and-forget, but the response parsing is fragile: if backend returns neither `result.data.id` nor `result.id`, client receives `{ ok: true, caseId: null }`, which looks successful but provides no case reference. A more explicit error response would be better: `{ ok: false, error: "Assessment created but no case ID returned" }`.

---

### Security: Token Logging and Credentials

**Confirmed good:** The codebase now excludes token values from console logs. `getMyCases()` logs `authToken?.substring(0, 20) + "..."` instead of the full token. This prevents token exposure in browser dev tools or cloud logging systems.

**Confirmed fix:** `.env.local` has been removed from git tracking. Commit 7ec4f33 adds `.env.local` to `.gitignore`. The Gmail password credential is no longer stored in version control.

**Note:** The security comment in `src/lib/portal-api.ts` (lines 5-10) correctly flags that frontend token logging fixes are necessary but insufficient — backend `/auth/login`, `/auth/google`, and `/auth/refresh` endpoints should also audit their server-side logs to ensure credentials are not persisted. This is out of scope for this frontend review but important for security.

---

### API Endpoint Consistency

Backend URL handling is now more consistent:
- `src/app/api/lead/route.ts` (line 27) now uses environment variables: `process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL || "https://pioneer-backend-5qhe.onrender.com/api/v1"`
- `src/lib/portal-api.ts` (line 1) uses: `process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000/api/v1"`
- Admin case detail fetches use: `process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000/api/v1"`

Hardcoded fallback URLs differ (`onrender.com` in lead/route vs localhost in portal-api), which could cause confusion in development. Recommend standardizing on a single fallback or removing hardcoded URLs entirely.

---

### Token Refresh Concurrency

`refreshTokenIfNeeded()` in `src/lib/portal-api.ts` (lines 23-87) implements a debounce with singleton promise pattern:

1. Stores `lastRefreshTime` and `refreshPromise` at module scope
2. If refresh already in-flight, returns existing promise
3. Skips refresh if within 5-second debounce window
4. Creates new promise and stores it to prevent concurrent refreshes

This is better than the original fire-and-forget approach, but a race condition remains: if multiple API calls arrive simultaneously (e.g., two tabs), both may see `refreshPromise === null` and `now - lastRefreshTime >= 5000`, causing both to attempt refresh. The actual refresh won't happen concurrently (one will wait for the promise), but the timestamp check is racy.

**Likely concern:** Under very high concurrency (many parallel API calls), some may queue behind a refresh that expires mid-batch, causing later calls to use a token that's about to expire again. The 5-second debounce window is generous, so this is an edge case, but worth noting for high-throughput scenarios (e.g., batch exports, background syncs).

---

### Build and Deployment Status

TypeScript compilation: **PASSED** (no errors, no warnings per build log)

Routes compiled: 33 static pages, 2 SSG pages, 8 dynamic/API routes — all successful.

Build time: 4.0s optimization + 39ms finalization = 4.04s total.

No deployment verification yet; all changes are frontend-only and depend on backend API contracts being correct.

---

### Testing Coverage

The build log indicates successful TypeScript compilation but does not show test runs. No new tests were added for:
- Profile approval/rejection endpoint fallback logic
- GSI session cleanup on logout
- Case ownership validation
- Document verification state persistence
- Lead form case ID extraction

Recommend adding E2E or integration tests to verify at least:
1. Admin can approve a profile and status persists
2. Client logs out and Google button re-appears
3. Admin verifies a document and client sees updated status
4. Lead form case is created and case ID is returned

---

</details>

---

<details>
<summary>File Map</summary>

- `src/lib/portal-api.ts` — Token refresh concurrency fix, profile approval/rejection dual-endpoint strategy, improved case/document API calls with defensive response parsing
- `src/app/portal/page.tsx` — GSI script loading split into separate effect, GSI button re-initialization on logout with exponential backoff, explicit session cancellation
- `src/app/api/lead/route.ts` — Await immigration assessment creation, return case ID to client, use environment variables for backend URL
- `src/app/admin/cases/[id]/page.tsx` — Document verification toggle with "Pending Verification" default status display
- `src/app/portal/cases/[id]/page.tsx` — New client case detail page with document upload form (feature addition, not bug fix)
- `src/components/portal/CaseEditModal.tsx` — New component for client case editing (feature addition)
- `.gitignore` — Added `.env.local` to prevent credentials from being committed
- `src/app/admin/page.tsx` — Minor dashboard updates
- `src/components/portal/AdminDashboard.tsx` — Admin dashboard improvements

[Full diff available via `git diff origin/main`]

</details>

---

## Key Decisions and Trade-offs

1. **Endpoint fallback strategy:** Instead of guessing which backend endpoint is correct, the implementation tries both paths. This is pragmatic for evolving APIs but creates risk if both exist with different semantics. Mitigation: explicit warning in code comments and recommendation to backend team.

2. **GSI initialization retries:** Exponential backoff (5 attempts, up to 3.1s) ensures button renders even if Google library loads slowly. Trade-off: delays button appearance by up to 100ms per retry. Acceptable for infrequent use case.

3. **Defensive API response parsing:** Multiple format checks prevent crashes if backend changes shape, but mask issues. Trade-off: easier debugging with structured error responses instead of silent empty arrays.

4. **Token refresh debounce:** 5-second window is generous; edge cases only occur under very high concurrent load. Trade-off: simpler than full mutex but less safe under extreme concurrency.

---

## Recommendation

**Do not merge to production without:**

1. **Backend verification (required):** Confirm with backend team which endpoint(s) are implemented for profile approval/rejection. Ideally deprecate legacy paths and use only `/status`.

2. **Ownership validation (required):** Verify backend enforces case ownership on `getCaseDetails()` and `updateCase()` calls. Frontend assumes this but cannot rely on it.

3. **Response shape validation (recommended):** Add error handling for unexpected API response formats instead of silently returning empty arrays.

4. **Testing (recommended):** Add E2E tests for profile approval, document verification, and logout/login flows.

5. **Hardcoded URL cleanup (optional):** Standardize backend URL fallback logic across all API routes.
