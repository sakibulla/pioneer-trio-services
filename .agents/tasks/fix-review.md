# Code Review: Pioneer Trio Services Bug Fixes & Feature Implementation

## Summary

Five critical bugs affecting authentication, profile management, and case workflows have been addressed through 7 commits totaling ~1,100 lines of changes. The fixes correct the Google OAuth button disappearing after logout, resolve 404 errors on matrimonial profile approval/rejection endpoints, add client case editability, improve token refresh concurrency, and harden authorization checks. Token substring logging has been removed from the frontend, though backend logging hygiene remains unverified. The build passes with no TypeScript errors.

**Watch for:** Google OAuth button visibility after logout requires manual testing — the fix uses a 100ms timeout heuristic that could fail on slow devices. Profile approval/rejection now assumes a backend PATCH `/status` endpoint exists; if the backend only has legacy `/approve` and `/decline` routes, the implementation includes fallback logic but should be verified before deploying. Client case editing lacks explicit backend-side ownership verification and relies entirely on middleware authorization. Token logging removal is frontend-only; audit backend OAuth endpoints to ensure they don't log credentials server-side.

**Verdict**: NEEDS_CHANGES

---

## High-level view

Google OAuth initialization has been restructured to load the GSI script once at mount and render the button only when unauthenticated, clearing stale state via `window.google.accounts.id.cancel()` before re-initialization. This prevents the button from disappearing after logout by decoupling script loading from auth state changes. The fix includes a 100ms timeout and retry fallback but silently fails if the client ID is misconfigured.

Matrimonial profile approval and rejection now use a unified `PATCH /status` endpoint with explicit status payloads instead of separate POST routes. Both operations include fallback logic that retries with legacy `/approve` and `/decline` routes if the new endpoint returns 404, providing backward compatibility. This aligns with the existing immigration case status pattern and reduces endpoint fragmentation, though the fallback assumes both old and new endpoints won't coexist.

Token refresh now implements a promise-based singleton pattern to prevent concurrent refreshes from multiple simultaneous API calls. The existing 5-second debounce is preserved, but in-flight refreshes are deduplicated — new requests while a refresh is running will await the same promise instead of starting a new one. This mitigates the tab-concurrency race condition where multiple requests could all see stale `lastRefreshTime` and skip refresh.

Client case editing is now possible through a modal form that validates required fields (destination country, application type) and re-fetches the full case after update to ensure UI reflects backend state. The modal attempts to detect concurrent edits via a `_version` field in the payload and gracefully refreshes if conflict is detected. Crucially, the frontend includes an auth check but the implementation depends entirely on the backend enforcing ownership via middleware — if backend doesn't verify the case belongs to the user, any authenticated user could edit any case by guessing the ID.

Admin dashboard data loading switched from `Promise.all` to `Promise.allSettled`, allowing partial failure when one API endpoint is down. Failed requests are tracked in a `dataErrors` object but failures are not surfaced in the UI — an admin sees empty data with no indication that an endpoint failed rather than having no data to display.

Token substring logging (`accessToken.substring(0, 20)`) has been removed from the login flow, reducing console credential exposure. Frontend logs no longer persist tokens, but this assumes the backend doesn't log credentials in auth endpoint logs — the fix is surface-level and depends on backend logging hygiene outside the scope of this review.

---

<details>
<summary>Issues (7)</summary>

1. **Google OAuth initialization timeout is heuristic** — The 100ms delay before checking if the button element exists in DOM is a guess. On slow devices, under heavy JavaScript load, or with lazy-loaded stylesheets, the element might not be ready in 100ms. Silent failure with no error message or fallback.

2. **Profile endpoint unification assumes backend support** — Both `approveProfile` and `rejectProfile` call `PATCH /status` first with fallback to legacy `/approve` and `/decline` routes. Implementation assumes at most one endpoint set exists; if backend has both new and legacy routes, inconsistent behavior could result. Endpoint availability must be verified before deployment.

3. **Missing backend ownership check in case editing** — `CaseEditModal` includes a frontend auth state check but no verification that the case belongs to the current user. If backend doesn't enforce `requireCaseOwnership` middleware on the PATCH endpoint, any authenticated user could edit any case by modifying the `caseData.id`. Frontend check is defense-in-depth only; backend must enforce ownership.

4. **Concurrent case edit race condition not fully addressed** — Modal includes `_version` field for optimistic locking but conflict detection logic only checks if error message contains "version" or "conflict". If backend doesn't return these keywords or uses a different error format, conflicts go undetected and later refresh overwrites the in-flight edit.

5. **Admin dashboard failures silent to end-user** — `Promise.allSettled` with `dataErrors` object tracks which API failed, but `dataErrors` is created in state and not rendered in the UI. Admin sees empty cases/leads/profiles list with no indication that the endpoint failed versus having no data. Error state should be displayed with a warning badge or toast message.

6. **Token logging reduction incomplete** — Frontend no longer logs token substrings, but backend OAuth endpoints (`/auth/login`, `/auth/google`, `/auth/refresh`) are outside the scope of this review. Backend logging audit needed to ensure credentials aren't persisted in server-side logs; frontend fix alone is insufficient.

7. **GSI initialization missing error messaging for misconfiguration** — If `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is missing or invalid, the button silently fails to render with only a console warning. Admins may not see console messages. Should display a visible error message or fallback login method.

</details>

<details>
<summary>Details</summary>

### Google OAuth Button Lifecycle: Split Effects

The original single `useEffect` hook with dependency `[user, token]` caused the button to vanish after logout because Google's GSI library doesn't handle re-mounting well — when auth state cleared, the effect re-ran and attempted to reinitialize the script that was already loaded, causing rendering to fail.

The fix splits into two effects:
- First effect (no dependencies, runs once at mount): Loads the GSI script or checks if already loaded, setting `gsiInitializedRef.current = true`
- Second effect (depends on `[user, token]`): Runs when auth state changes; if not authenticated, clears previous state with `window.google.accounts.id.cancel()`, then calls `renderButton()` to initialize fresh

The button div is cleared with `btn.innerHTML = ""` before re-rendering to prevent stale button state. The code includes a 100ms timeout before attempting to render, waiting for the DOM element to exist.

**Concern:** The 100ms timeout is empirical, not defensive. On a slow device with network congestion or heavy JavaScript load, the element may not be in the DOM after 100ms. The retry logic uses another 200ms timeout but still doesn't log errors if element remains missing — just silently exits the effect. Manual testing on a range of devices is critical before deploying.

**Concern:** If `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is missing or invalid, the code logs a warning to console but renders nothing visible to the user. On a deployed instance where admins don't check browser console, the login form would silently be unusable.

### Token Refresh Deduplication: Promise Singleton

The `refreshTokenIfNeeded()` function previously used only a timestamp (`lastRefreshTime`) to debounce refresh attempts to once per 5 seconds. Under concurrent load (e.g., multiple API calls in rapid succession), the race condition was: request A checks `lastRefreshTime`, sees it's stale, but before the refresh completes, request B also checks the same timestamp, also thinks it's stale, and starts a second refresh. Both requests could run concurrently.

The fix stores a `refreshPromise` in module scope. If refresh is in-flight when a new request calls `refreshTokenIfNeeded()`, it returns the same promise instead of starting a new refresh. After the promise settles, `refreshPromise` is cleared (via `.finally()`) so subsequent refresh attempts after the debounce window can proceed.

This is correct and follows the singleton pattern. The 5-second debounce remains in place. Concurrent requests during the debounce window will now properly deduplicate instead of spinning up multiple refresh attempts.

**Verified:** The code wraps the refresh logic in an async IIFE, captures it in `refreshPromise`, and clears it after completion. This prevents concurrent refresh race conditions.

### Matrimonial Profile Approval/Rejection: Unified Endpoint with Fallback

Both `approveProfile` and `rejectProfile` now call `PATCH /matrimonial/profiles/{id}/status` first:
- `approveProfile` sends `{ status: "APPROVED" }`
- `rejectProfile` sends `{ status: "REJECTED", reasonCategory, notes }`

If the new endpoint returns 404, both functions retry with legacy routes:
- `approveProfile` falls back to `POST /approve`
- `rejectProfile` falls back to `POST /decline`

This design assumes the backend will eventually move to the unified `/status` endpoint, but for now supports both old and new versions.

**Concern:** If the backend has both endpoints and they have different behavior (e.g., `/status` validates notes length, `/decline` doesn't), the fallback will mask this — the operation succeeds via fallback but may behave differently than intended. Backend route clarity is needed before deployment.

**Verified:** Fallback logic is sound — 404 detection and retry with correct method and payload structure for each route.

### Client Case Editing: Frontend Ownership Check Only

New `CaseEditModal` component allows authenticated clients to edit submitted immigration cases. Form validates that `destinationCountry` and `applicationType` are not empty; `specificProgram` is optional. On save, calls `portalApi.updateCase()` with the updated payload, then re-fetches all cases via `portalApi.getMyCases()` and updates the UI with the refreshed case.

The modal includes a frontend check: if `currentUser` is falsy, it rejects the save with "Authentication required." However, this is a UI-level check. The backend receives the request with an Authorization header (the token), and then must verify that the case ID belongs to the authenticated user. If the backend middleware is misconfigured or doesn't perform this check, any authenticated user could PATCH any case by guessing the caseId.

**Risk:** Direct Object Reference (IDOR) vulnerability if backend authorization is misconfigured. Frontend check provides defense-in-depth but is not sufficient.

**Verified:** Modal always calls `updateCase()` with the full case ID from `caseData.id`. No filtering or masking of IDs. Ownership verification must occur server-side.

### Case Version/Conflict Detection

The modal includes a `_version` field when calling `updateCase()`, intended for optimistic locking. After the update, if the error message includes "version" or "conflict", the modal treats it as a concurrent-edit conflict, re-fetches the case, and updates the UI.

**Concern:** Error message detection is fragile. If the backend uses a different error message format (e.g., "concurrent update" instead of "conflict"), the conflict goes undetected and the modal shows a generic error. Conflict resolution depends on exact error message wording.

**Verification gap:** No way to verify backend actually sends these error messages without inspecting the backend code or testing against a live backend.

### Case Re-fetch After Edit

After a successful update, the modal calls `portalApi.getMyCases(token)` to fetch all cases, finds the updated case by ID, and passes it to `onSave()`. This ensures the UI reflects whatever the backend actually stored — if the backend truncates, transforms, or rejects some fields, the UI will show the final state.

**Minor inefficiency:** Re-fetches all cases instead of just the one being edited. Could be optimized with a dedicated `getCaseById()` method, but this design is safe and simplifies state management.

### Admin Dashboard Resilience

Changed data loading from `Promise.all()` to `Promise.allSettled()`. This means if the leads API endpoint fails, cases and profiles will still load instead of the entire dashboard failing.

Failed requests are tracked in `dataErrors` object keyed by endpoint name (cases, leads, profiles). However, this state is not currently rendered in the UI. An admin will see empty tables with no indication that an endpoint failed versus having no data. The error messages exist in state but are silently swallowed.

**Recommendation:** Render the `dataErrors` in the UI with a warning badge or inline error message for each tab so admins know when data is stale or missing.

### Token Logging Removal

Removed console.log statements that previously logged:
```javascript
console.log("[Portal] accessToken:", res.data.accessToken?.substring(0, 20) + "...");
console.log("[Portal] refreshToken:", res.data.refreshToken?.substring(0, 20) + "...");
```

Replaced with:
```javascript
console.log("[Portal] Login successful");
```

Even the first 20 characters of a JWT can be used for analysis or phishing. Removing token logging from the frontend is correct.

**Scope limitation:** This review covers only frontend logging. Backend OAuth endpoints (`/auth/login`, `/auth/google`, `/auth/refresh`) may log full tokens in server-side logs, and this is outside the scope of the frontend-focused changes. Recommend auditing backend logging separately before considering the security issue fully resolved.

### Build Verification

The build completes successfully with no TypeScript errors. All route definitions are generated, and static pages compile without warnings. The generated routes include dynamic segments like `/admin/cases/[id]` and `/portal/cases/[id]`, confirming the new case detail routes are registered.

</details>

<details>
<summary>File map</summary>

- `src/app/portal/page.tsx` — Split GSI initialization into two effects; removed token substring logging; added retry logic with 100ms timeout and 200ms fallback
- `src/lib/portal-api.ts` — Implemented token refresh promise deduplication; added `updateCase()` method; changed `approveProfile` and `rejectProfile` to use `/status` endpoint with fallback to legacy routes; added security comment about backend logging
- `src/components/portal/CaseEditModal.tsx` — New component for client case editing with required field validation, version-based conflict detection, and case re-fetch after update
- `src/components/portal/ClientDashboard.tsx` — Integrated case edit modal when case status is SUBMITTED; passes `currentUser` to modal for ownership check
- `src/components/portal/AdminDashboard.tsx` — Changed to `Promise.allSettled` for resilient partial data loading; tracks failures in `dataErrors` but does not yet render them to UI
- `src/app/api/lead/route.ts` — Uses env variable for backend URL (consistency with assessment route, not shown in diff but noted in plan)
- Build outputs and task files (not functional code)

**Full diff range:** `git diff origin/main HEAD` spans 7 commits from `039cf47` (remove .env from git) through `7fa5f22` (address review findings)

</details>

---

## Recommendations

1. **Manual test:** Load the portal in a browser, log in with Google, then log out. Verify the Google button appears after logout (watch for blank space where button should be). Test on a slow device or with network throttling to verify the 100ms timeout is sufficient.

2. **Verify backend endpoints:** Confirm that `/matrimonial/profiles/{id}/status` PATCH endpoint exists and accepts `{ status, reasonCategory?, notes? }` payload. If only legacy routes exist, the fallback will handle it, but document the backend endpoint situation clearly.

3. **Backend ownership check:** Inspect backend authorization middleware to confirm it validates that the case/profile being updated belongs to the authenticated user. Frontend check is insufficient.

4. **Backend logging audit:** Review server-side logs for `/auth/login`, `/auth/google`, `/auth/refresh` endpoints to ensure tokens are not logged.

5. **Admin dashboard error UI:** Render `dataErrors` state in the admin dashboard so admins can see which APIs failed instead of seeing empty data without context.

6. **Conflict detection robustness:** Coordinate with backend on exact error message format for version conflicts so the modal's conflict detection doesn't miss them due to message string differences.

