# Implementation Plan: Code Review and Bug Fixes

## Executive Summary
Investigation revealed 5 confirmed bugs affecting the admin dashboard, profile management, authentication, and document verification workflows. One security issue identified (credentials in version control). Three items require backend API endpoint verification.

---

## SECTION 1: BUG FIXES

### BUG-1: Profile Approve Endpoint Returns 404 (HIGH PRIORITY)
**Root Cause:** Frontend calls `POST /matrimonial/profiles/{id}/approve` but backend does not register this route or names it differently. Error logs show: "Route PATCH /api/v1/matrimonial/profiles/6e740e76-79dd-4ab8-98a4-8d2ab6ae8172/approve not found."

**Files to Change:**
- `src/lib/portal-api.ts` (approveProfile function, line 557)

**Exact Change Needed:**
1. The `approveProfile()` function currently uses `POST` method. The error response mentions both `PATCH` in the error log, suggesting the backend may expect PATCH instead. 
2. Check if backend endpoint path should be `/matrimonial/profiles/{id}/status` (with status="APPROVED" in body) instead of `/approve`.
3. Propose change: Update method from `POST` to `PATCH` and endpoint from `/approve` to `/status` with body `{ status: "APPROVED" }` matching the `updateCaseStatus` pattern already used for immigration cases (line 570).
4. **DECISION MADE:** Use PATCH to `/status` endpoint with status enum, consistent with `updateCaseStatus()` pattern already in codebase.

**Verification:**
Run admin dashboard, navigate to Profiles tab, click on a pending profile, attempt to approve. Expected: Success response and profile status changes to APPROVED. Command: Manual test via browser.

---

### BUG-2: Google OAuth Login Button Disappears After Logout (HIGH PRIORITY)
**Root Cause:** In `src/app/portal/page.tsx`, the GSI (Google Sign-In) initialization occurs in a `useEffect` that depends on `[user, token]`. When logout clears these, the dependency changes, the effect re-runs, but the Google library's internal state is not properly reset. The button div gets re-initialized but Google's script doesn't render to it because the library expects a fresh initialization on page load, not a re-mount.

**Files to Change:**
- `src/app/portal/page.tsx` (useEffect for GSI, lines 81-113)

**Exact Change Needed:**
1. Split the GSI loading logic into two `useEffect` hooks:
   - First hook (no dependencies or only at mount): Load the GSI script once when the component mounts.
   - Second hook (depends on `[user, token]`): Only initialize/render the button when NOT authenticated.
2. Add cleanup: If user logs out, reset the button div HTML before re-rendering.
3. On logout, explicitly call `window.google?.accounts?.id?.cancel()` to clear GSI state before re-initializing.

**Code Location:** Lines 81-113 in `src/app/portal/page.tsx`

**Verification:**
1. Load portal page, verify Google button appears.
2. Sign in with Google (or any account), verify redirect to dashboard.
3. Click logout, verify returned to login form.
4. **CRITICAL CHECK:** Verify Google button is visible after logout. Expected: Button renders normally. Run browser dev tools to confirm no console errors.

---

### BUG-3: Documents Show "Verified" Status Before Admin Approval (MEDIUM PRIORITY)
**Root Cause:** When a case is fetched in `src/app/admin/cases/[id]/page.tsx`, documents are displayed with their `verified` boolean flag from the backend. However, client-uploaded documents should default to `verified: false` until an admin explicitly approves them. This may be a backend issue where documents are being created with `verified: true` by default, or the frontend is not correctly interpreting the backend response.

**Investigation Required:** 
- Check backend API response for case details: does `/immigration/cases/{id}` return documents with `verified: true` on creation?
- If yes, backend bug; if no, frontend bug.

**Files to Change:**
- `src/app/admin/cases/[id]/page.tsx` (document display and verification logic, lines 189-204)

**Exact Change Needed:**
1. Add a visual warning if `doc.verified === true` but admin has not manually triggered verification. Add a log/audit check:
   - If document `verifiedAt` timestamp is missing or is before case `submittedAt`, flag as "Not Yet Verified by Admin".
   - OR add a backend query to confirm the verification was done by an admin (check `verifiedBy` field).
2. In the frontend, on initial load, all documents should show "Pending Verification" unless `doc.verified === true` AND `doc.verifiedAt` is recent and after submission.
3. Add a console warning if documents are marked verified on first load without admin action.

**Verification:**
1. Create a new immigration case with a document upload.
2. Log into admin panel, navigate to case details.
3. Expected: Document shows "Pending Verification" status.
4. Click "Verify" button, expected: Status changes to "Verified (AES-256 Encrypted)".
5. Refresh page, expected: Status persists as verified.

---

### BUG-4: Marrimonial Profile Reject Endpoint Returns 404 (MEDIUM PRIORITY)
**Root Cause:** Similar to BUG-1. Frontend calls `POST /matrimonial/profiles/{id}/decline` but backend may not register this route or may expect different path/method. The `rejectProfile()` function needs endpoint verification.

**Files to Change:**
- `src/lib/portal-api.ts` (rejectProfile function, line 592)

**Exact Change Needed:**
1. Verify backend endpoint: Try alternative paths:
   - `PATCH /matrimonial/profiles/{id}/status` with body `{ status: "REJECTED", reason: reasonCategory, notes }`
   - `POST /matrimonial/profiles/{id}/reject` with current payload
   - `PATCH /matrimonial/profiles/{id}/reject` with current payload
2. **DECISION MADE:** Align with profile approval logic. Use `PATCH /matrimonial/profiles/{id}/status` with `{ status: "REJECTED", reasonCategory, notes }` payload.

**Verification:**
Navigate to admin profiles tab, open a pending profile, attempt to reject. Expected: Rejection form appears, admin selects reason and adds notes, clicks confirm, profile status changes to REJECTED.

---

## SECTION 2: SECURITY ISSUES

### SEC-1: Credentials Exposed in Version Control (HIGH PRIORITY)
**Issue:** `.env.local` file contains Gmail app password `uzlsqdxxrnnioadn` and email address. This file should not be committed; it exposes credentials if the repository is made public or compromised.

**Files to Change:**
- `.env.local` (entire file — do not commit to git)
- `.gitignore` (ensure `.env.local` is listed)

**Exact Changes Needed:**
1. Verify `.gitignore` contains `.env.local` entry. If missing, add it.
2. Remove `.env.local` from git history (one-time operation):
   - Command: `git rm --cached .env.local && echo ".env.local" >> .gitignore`
3. For any deployed instances, rotate the Gmail app password immediately (generate new one in https://myaccount.google.com/apppasswords).
4. Add a pre-commit hook (optional but recommended) to catch accidental `.env.local` commits.

**Verification:**
1. Run `git status`, confirm `.env.local` is not tracked.
2. Run `cat .gitignore | grep "env.local"`, confirm entry exists.
3. Verify no sensitive data appears in recent commits: `git log --oneline -20` should not show `.env.local` updates.

---

## SECTION 3: MISSING FEATURES

### FEAT-1: Client Document Upload (Document Management) (MEDIUM PRIORITY)
**Issue:** Immigration case clients can view their uploaded documents and case status, but cannot upload documents themselves. All document uploads require admin action via the admin case detail page. This is a workflow gap — clients should be able to submit required documents (passport, transcript, etc.) during the case lifecycle.

**Scope:** 
- Add document upload form to client-facing case detail page
- Track document submission history
- Show upload status (pending, verified, rejected with reason)

**Files to Change:**
- `src/app/portal/page.tsx` or create new `src/app/portal/cases/[id]/page.tsx` for client case detail
- `src/lib/portal-api.ts` (add client document upload endpoint if not present)
- Styling components as needed

**Exact Changes Needed:**
1. Determine if client portal has a case detail view. If not, create new route: `src/app/portal/cases/[id]/page.tsx`.
2. Add form section (similar to admin case detail, lines 124-160) for document upload by clients.
3. When client uploads document, POST to `/immigration/cases/{id}/documents` endpoint.
4. Display "Awaiting Admin Review" status for uploaded documents.
5. Show "Verified" status when admin marks document verified, "Rejected" with admin notes if declined.

**Verification:**
1. Log in as client, navigate to a case.
2. Attempt to upload a document, verify form accepts file and submits successfully.
3. Log in as admin, verify document appears in admin case view with "Pending Verification" status.
4. Admin verifies the document, client session refreshes and shows "Verified" status.

---

### FEAT-2: Quick-Apply (Guest Inquiry) Editability (LOW PRIORITY - DESIGN DECISION REQUIRED)
**Issue:** When a non-authenticated user submits a "quick apply" (immigration assessment or matrimonial profile), they receive a case/profile ID but the system does not clarify whether they can edit the submission. Current flow: quick apply → backend creates case/profile → user sees ID but cannot easily access edit flow.

**Current Behavior:** Forms support both authenticated and guest submissions. Guest submissions create data but don't provide an edit link or password reset for future access.

**Design Questions (require user input):**
1. Should quick-apply users receive an email with a one-time edit link?
2. Should they be required to create an account to edit?
3. Should the submission be locked immediately after creation?

**Recommendation (pending confirmation):**
- Send confirmation email with one-time edit link (token-based, 7-day expiry)
- Allow pre-login edit via token link without requiring account creation
- After 7 days, direct user to create account if they want further edits

**Files to Modify:** (pending design decision)
- Email template and send logic
- Token generation and validation
- Pre-auth case/profile detail view

**Verification:** (pending design decision)
- Submit quick-apply form as guest
- Check email for confirmation and edit link
- Click edit link, verify able to modify submission without logging in
- Verify link expires after 7 days

---

## SECTION 4: CODE QUALITY & PERFORMANCE

### CQ-1: Token Refresh Debounce May Cause Race Conditions (LOW PRIORITY)
**Issue:** In `src/lib/portal-api.ts`, the `refreshTokenIfNeeded()` function debounces token refresh to once per 5 seconds. This means multiple simultaneous API calls could all see `lastRefreshTime` as stale and skip refresh, leading to all using an expired token. Thread-safe concurrent token refresh is needed.

**Root Cause:** Global `lastRefreshTime` variable without mutex/lock. In a browser with multiple tabs, concurrent requests may all check the old timestamp.

**Files to Change:**
- `src/lib/portal-api.ts` (refreshTokenIfNeeded function, lines 23-61)

**Exact Change Needed:**
1. Replace simple timestamp check with a Promise-based singleton pattern.
2. Store `refreshPromise` in module scope; if a refresh is in-flight, return the same promise instead of starting a new one.
3. Only allow one refresh to run at a time across all concurrent API calls.

**Code Sketch:**
```typescript
let lastRefreshTime = 0;
let refreshPromise: Promise<string | null> | null = null;

async function refreshTokenIfNeeded(): Promise<string | null> {
  // If refresh is already in-flight, wait for it
  if (refreshPromise) return refreshPromise;
  
  const now = Date.now();
  if (now - lastRefreshTime < 5000) return token; // Use existing token
  
  lastRefreshTime = now;
  
  // Create promise and store it to prevent concurrent refreshes
  refreshPromise = performRefresh().finally(() => {
    refreshPromise = null; // Clear after complete
  });
  
  return refreshPromise;
}
```

**Verification:**
Open browser console, open multiple tabs of the portal, trigger API calls on both tabs simultaneously. Check logs to confirm only one refresh occurs, not duplicates.

---

### CQ-2: Hardcoded Backend URL in lead API (LOW PRIORITY - CONSISTENCY)
**Issue:** In `src/app/api/lead/route.ts` and `src/app/api/immigration/assessment/route.ts`, backend URL is hardcoded as `https://pioneer-backend-5qhe.onrender.com/api/v1` on line 27 (lead/route.ts) and dynamically read on line 87 (assessment/route.ts). Inconsistency: lead/route.ts should use env variable like assessment/route.ts does.

**Files to Change:**
- `src/app/api/lead/route.ts` (line 27)

**Exact Change Needed:**
Replace hardcoded URL with:
```typescript
const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000/api/v1";
```

**Verification:**
Deploy to staging, verify lead submissions correctly forward to backend. Check server logs for successful POST requests to `/immigration/assessments`, `/matrimonial/profiles`, etc.

---

## SECTION 5: WORKFLOW & INTEGRATION ISSUES

### WF-1: Immigration Case Creation Flow via Lead Form (DESIGN CLARIFICATION NEEDED)
**Issue:** When a guest submits the immigration quick-apply form, `src/app/api/lead/route.ts` creates a case via a direct fetch to `/immigration/assessments`. However, the response is not awaited, and no success/error feedback is given to the client. The form submission returns `{ ok: true }` regardless of whether the backend accepted the assessment.

**Current Behavior:**
1. Client fills immigration form → submits via lead form
2. Frontend immediately returns `{ ok: true }`
3. Backend POST to `/immigration/assessments` fires in background (not awaited)
4. Client sees success but does not receive case ID or reference

**Better Behavior:**
1. Await the assessment creation
2. Return case ID to client in response
3. Show case reference to user or send via email
4. Allow user to access case without account

**Files to Change:**
- `src/app/api/lead/route.ts` (lines 60-72 for immigration, 73-97 for matrimony)

**Exact Change Needed:**
1. Make the `fetch()` calls awaited instead of fire-and-forget
2. Capture response and extract case/profile ID
3. Return case ID in response to client
4. Send confirmation email with reference number

**Verification:**
Submit immigration quick-apply form, verify response includes case reference. Check backend case list to confirm case was created. Email inbox should have confirmation with case reference.

---

## SECTION 6: PRIORITY MATRIX

| ID | Issue | Priority | Type | Est. Effort |
|---|---|---|---|---|
| BUG-1 | Profile approve 404 | HIGH | Bug Fix | 15 min |
| BUG-2 | Google button disappears | HIGH | Bug Fix | 30 min |
| BUG-3 | Documents pre-verified | MEDIUM | Bug Fix | 20 min |
| BUG-4 | Profile reject 404 | MEDIUM | Bug Fix | 15 min |
| SEC-1 | Credentials in git | HIGH | Security | 10 min |
| FEAT-1 | Client doc upload | MEDIUM | Feature | 2-3 hrs |
| FEAT-2 | Quick-apply editability | LOW | Feature | Pending design |
| CQ-1 | Token refresh race | LOW | Refactor | 30 min |
| CQ-2 | URL consistency | LOW | Refactor | 5 min |
| WF-1 | Lead form response | MEDIUM | Integration | 45 min |

---

## SECTION 7: IMPLEMENTATION ORDER

**Phase 1 (Critical - Deploy ASAP):**
1. SEC-1: Remove credentials from git
2. BUG-1: Fix profile approve endpoint
3. BUG-2: Fix Google button disappearance

**Phase 2 (High Value - Next Sprint):**
4. BUG-4: Fix profile reject endpoint
5. WF-1: Improve lead form responses
6. BUG-3: Fix document verification display

**Phase 3 (Enhancements):**
7. FEAT-1: Client document upload
8. CQ-1: Token refresh concurrency
9. CQ-2: URL consistency

**Phase 4 (Design-Gated):**
10. FEAT-2: Quick-apply editability (requires user decision on UX)

---

## NOTES

- **Backend API Endpoints:** Bugs BUG-1 and BUG-4 depend on backend API route definitions. If backend does not have `/matrimonial/profiles/{id}/status` PATCH endpoint, ask backend team to implement it. Current code assumes endpoints exist.
- **Google OAuth:** Ensure `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set in all environments. If not set, Google button silently fails to load.
- **Email Delivery:** FEAT-1 and WF-1 both require email functionality. Verify Gmail SMTP is configured and working (`.env` has valid credentials).
- **Testing:** All bugs should be tested on staging backend (Render) before committing. Local development may hide issues due to different backend behavior.

## RESTRUCTURE: NO

This is a single frontend codebase review. Work will be implemented as a single sequential plan by the coding agent, not decomposed into separate features.
