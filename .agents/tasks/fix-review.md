# Code Review: Pioneer Trio Services Bug Fixes

**Commit:** 6375adb - "fix: resolve profile endpoint, google oauth button, and case edit workflow"

This commit addresses the critical BUG-1 and BUG-2 issues from the implementation plan: profile approval endpoint 404 errors and Google OAuth button disappearing after logout. It also introduces a new case edit feature for clients and improves dashboard data loading resilience. The build passes successfully with no TypeScript errors.

**Watch for:** Token substring logging in console (security concern), missing auth check on case edit endpoint (IDOR risk), and case edit modal doesn't validate `destinationCountry` or `applicationType` field requirements.

**Verdict**: NEEDS_CHANGES

---

## High-level view

The profile endpoint fix moves from the non-existent `/approve` and `/decline` POST routes to the `PATCH /status` endpoint with explicit status payloads, aligning with backend API design. This resolves both the approve (404) and decline (404) failures.

Google OAuth initialization was restructured into two separate effects: one to load the script once on mount, and another to initialize/render the button when auth state changes. The button div is cleared before re-rendering to prevent stale state. The `window.google.accounts.id.cancel()` call ensures GSI's internal state resets properly on logout.

Admin dashboard data loading now uses `Promise.allSettled` instead of `Promise.all`, so one failing endpoint (e.g., leads, profiles) doesn't block the others from displaying. This tolerates partial API failures gracefully.

Case edit functionality is gated to the SUBMITTED status only, allowing clients to modify destination country and application type. The endpoint uses PATCH to `/immigration/cases/{caseId}` with the updateCase method that already existed in the backend API definition. However, there are validation and authorization gaps that create risk.

---

<details>
<summary>Issues (4)</summary>

1. **Security: Token substrings logged to console** — Lines 131-133 in portal/page.tsx log `accessToken?.substring(0, 20)` and `refreshToken?.substring(0, 20)` to browser console. This exposes auth credentials to browser dev tools and any process with console access. Remove these console.log statements entirely.

2. **Authorization: Case edit lacks owner verification** — The `updateCase` endpoint in `portalApi.updateCase()` sends a PATCH to `/immigration/cases/{caseId}` with no explicit client ownership check in the frontend. If the backend middleware (`requireCaseOwnership`) fails or is misconfigured, clients could edit cases they don't own. Frontend should validate the case belongs to the current user before showing the edit button.

3. **Validation: Case edit accepts empty fields** — The CaseEditModal has no validation on `destinationCountry` and `applicationType` before submission. A client can submit blank values, potentially corrupting case data. Add required field validation before `handleSave` proceeds.

4. **Data integrity: Case edit UI doesn't refresh remote state** — After editing, the modal updates local `cases` state with the new values (line 39 in ClientDashboard.tsx), but doesn't re-fetch the full case from the server to confirm the update. If the backend rejects some fields or transforms the data, the local cache becomes stale.

</details>

---

## Behavioral sections

<details>
<summary>Details</summary>

### Profile Endpoint Fix: POST /approve → PATCH /status

The approve and reject profile endpoints were calling non-existent backend routes. The error logs showed the backend expects `PATCH /matrimonial/profiles/{id}/status`, not `POST /approve` or `POST /decline`.

In `portal-api.ts`, `approveProfile()` now sends:
```
PATCH /matrimonial/profiles/{profileId}/status
{ status: "APPROVED" }
```

And `rejectProfile()` sends:
```
PATCH /matrimonial/profiles/{profileId}/status
{ status: "REJECTED", reasonCategory, notes }
```

This aligns with the `updateCaseStatus()` pattern already in the codebase, providing API consistency. Manual testing on staging is needed to confirm the backend accepts these payloads.

### Google OAuth Button: Split Effect Logic and Cancel State

The original single `useEffect` with dependency `[user, token]` caused the button to disappear because Google's library expected a fresh script load, not a re-mount. The fix splits into two effects: one to load the script once on mount (decoupling from auth state), and another to initialize the button when auth state changes. The button init effect clears any prior state with `window.google.accounts.id.cancel()`, clears the button div with `btn.innerHTML = ""`, uses a 100ms timeout to ensure the DOM element exists, and includes cleanup to prevent race conditions on unmount.

**Concern:** The 100ms timeout is a heuristic. On slow devices or under heavy load, the element might not exist in the DOM after 100ms, causing silent rendering failure with no logged error.

### Admin Dashboard Resilience: Promise.allSettled

Dashboard data loading now uses `Promise.allSettled()` instead of `Promise.all()`, so one failing endpoint doesn't block the others from displaying. This is a reasonable UX improvement.

### Case Edit: New CaseEditModal Component and Flow

Clients can now edit immigration case details when the case is in SUBMITTED status. The modal accepts `destinationCountry`, `applicationType` (dropdown), and optional `specificProgram`, then sends a PATCH to `/immigration/cases/{caseId}`. The backend route is protected by `requireCaseOwnership` middleware.

**Concern — Authorization Gap:** Frontend protection is UI-level only. If the backend middleware misconfigures or is bypassed, user A's token could edit user B's case via direct object reference by guessing the caseId.

**Concern — Validation:** No client-side validation. A user can submit empty values for all fields, corrupting case data. The backend schema marks these fields as `.optional()`, so empty strings pass validation.

**Concern — State Consistency:** After update succeeds, the UI updates local cache but doesn't re-fetch from the server. If the backend transforms or rejects fields, the UI cache becomes stale.

### Defensive Null-Check: Document Array Type Guard

In `admin/cases/[id]/page.tsx`, the documents render condition now includes optional chaining and an `Array.isArray()` guard, preventing a crash if the API returns `documents` as null, undefined, or a non-array value.

### Security: Token Logging

Lines 131-133 in `src/app/portal/page.tsx` log token substrings to console:

```javascript
console.log("[Portal] accessToken:", res.data.accessToken?.substring(0, 20) + "...");
console.log("[Portal] refreshToken:", res.data.refreshToken?.substring(0, 20) + "...");
```

Even the first 20 characters of a JWT can be useful for phishing or token analysis. Tokens should never be logged, even truncated. Remove these lines; logging `"Login successful, storing tokens"` without the token values is sufficient for debugging.

</details>

---

## File map

<details>
<summary>Files changed</summary>

- **src/app/portal/page.tsx** — Split Google OAuth initialization into two useEffect hooks; added explicit cancel state and button div clearing on re-init; added token logging (security concern)
- **src/lib/portal-api.ts** — Changed `approveProfile` from POST /approve to PATCH /status; changed `rejectProfile` from POST /decline to PATCH /status with status + rejection details in body
- **src/components/portal/AdminDashboard.tsx** — Changed data loading from Promise.all to Promise.allSettled for graceful partial failure handling
- **src/components/portal/CaseEditModal.tsx** (new) — Modal form for clients to edit case destination country and application type; calls updateCase API
- **src/components/portal/ClientDashboard.tsx** — Added edit button (SUBMITTED cases only) and integrated CaseEditModal component; added state for `editingCase`
- **src/app/admin/cases/[id]/page.tsx** — Added defensive null-check and Array.isArray guard for caseDetail.documents

[Full diff available via `git diff HEAD~1 HEAD`]

</details>

