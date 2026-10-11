# Immigration Assessment Form Fix — Implementation Plan

## Summary
Fix three interrelated validation and error-handling bugs in the immigration assessment form:
1. **Next button bypasses validation** — clicking Next advances to the next step without validating the current section
2. **Submit button doesn't surface errors** — API failures are silently treated as success
3. **No submission error UI** — users never see what went wrong on the final Submit

---

## Codebase Context

### Zod Version & Schema Syntax
- **Zod v4.4.3** is installed (confirmed in `package.json`)
- The schema uses Zod v4 syntax: `z.enum([...], { error: "message" })` — this is correct for v4
- Fix: ensure all enum errors use the v4 syntax consistently (all are already correct)

### Field Path Structure
The form uses nested section-based field paths registered via `react-hook-form`:
- **Section A (step 1):** `sectionA.*` — fullLegalName, dateOfBirth, gender, nationality, nidNumber, passportNumber, passportExpiry, previousPassport, previousPassportDetails, maritalStatus, phoneNumber, email, currentAddress
- **Section B (step 2):** `sectionB.*` — destinationCountry, applicationType, targetDate, appliedBefore, appliedBeforeOutcome, specificProgram
- **Section C (step 3):** `sectionC.*` — employmentStatus, employerName, jobTitle, employmentLength, monthlyIncome, currency, businessName, tradeLicenseNumber, businessType
- **Section D (step 4):** `sectionD.*` — bankBalance, financialCurrency, hasSponsor, sponsorName, sponsorRelationship, fundsSource, unusualDeposits, unusualDepositsNotes
- **Section E (step 5):** `sectionE.*` — traveledBefore, countriesVisited, previousRefusal, refusalDetails
- **Section F (step 6):** `sectionF.*` — applicationPurpose, familyInBangladesh, ownProperty, propertyDetails, intendToReturn
- **Section G (step 7):** `sectionG.*` — hasValidPassport, hasNID, hasEmploymentProof, hasBankStatements
- **Section H (step 8):** `sectionH.*` — consentDataProcessing, understandNoGuarantee, confirmTruthful, eSignature

### Current Bugs in the Code

**Bug 1:** The `nextStep()` function is called via `onClick` on a `type="button"`, completely bypassing `react-hook-form`'s validation:
```tsx
<Button type="button" onClick={nextStep} tone="immigration" className="gap-2">
  Next
  <ChevronRight className="h-4 w-4" />
</Button>
```
**Root cause:** `handleSubmit()` wraps the form submit event and triggers validation; `onClick` on a button does not.

**Bug 2:** The `onSubmit` function always sets `submitted=true` regardless of outcome:
```ts
const onSubmit = async (data: ImmigrationAssessment) => {
  try {
    const res = await fetch("/api/immigration/assessment", { ... });
    if (res.ok) {
      setSubmitted(true);  // ✓ success case
    } else {
      setSubmitted(true);  // ✗ failure case — same as success
    }
  } catch (err) {
    console.error("Submission error:", err);
    setSubmitted(true);  // ✗ error case — same as success
  }
};
```
**Root cause:** All branches set the same state; no distinction between success and failure.

**Bug 3:** There is no error UI on step 8 to display submission or validation errors. The success state just shows a checkmark banner.

### API Behavior
The backend route (`/api/immigration/assessment`) at `src/app/api/immigration/assessment/route.ts`:
- Returns `{ ok: true }` on success (HTTP 200)
- Returns `{ ok: false, error: "...", details: ... }` on validation failure (HTTP 422)
- Returns `{ ok: false, error: "Invalid request body." }` on malformed request (HTTP 400)
- Has a graceful fallback at the end: even if the Express backend fails, it returns `{ ok: true }` — this masks real backend errors

The frontend should check `res.ok` and parse JSON error responses to display them.

---

## Implementation Plan

### Decision: Section-by-section validation on Next
Use `react-hook-form`'s `trigger()` method to validate only the fields of the current section before advancing. This is better than validating the entire form (which would show errors for steps 2–8 when the user is still on step 1) and better than disabling validation entirely (which allows bad data to progress).

### Decision: Submit error state and UI
Add a `submitError: string | null` state to track submission failures. On step 8, render an error banner above the Consent section if `submitError` is set. On successful submission, `setSubmitted(true)` as before.

### Decision: Loading state during submission
Add `isSubmitting: boolean` state so the Submit button disables while the fetch is in flight, preventing duplicate submissions and giving the user feedback.

---

## Steps

### Step 1: Fix Next button to validate current section before advancing
**What:** Modify `nextStep()` to call `trigger()` with the section's field prefix. Only advance if validation passes.
- For step 1, trigger: `["sectionA.fullLegalName", "sectionA.dateOfBirth", ..., "sectionA.currentAddress"]`
- For step 2, trigger: all `sectionB.*` fields
- ... and so on for each section
- Use the schema definitions as reference for which fields belong to each section

**Files:** `src/components/forms/immigration-assessment-form.tsx`

**Verify:** 
- `npm run build` — form compiles without errors
- Manual smoke test: click Next on step 1 with empty fields → errors should appear (one error per required field)
- Leave an error unfixed (e.g., empty email) and click Next → button should not advance; error persists
- Fix the error and click Next → button should advance to step 2

---

### Step 2: Add `submitError` and `isSubmitting` state variables
**What:** Add two new state hooks:
```ts
const [submitError, setSubmitError] = useState<string | null>(null);
const [isSubmitting, setIsSubmitting] = useState(false);
```

**Files:** `src/components/forms/immigration-assessment-form.tsx`

**Verify:** `npm run build` — compiles without errors

---

### Step 3: Refactor `onSubmit` to distinguish success from failure
**What:** Rewrite the function to:
1. Set `isSubmitting=true` at the start
2. On `res.ok`, keep `submitted=true` but clear any prior error
3. On failure, parse the JSON response body and extract the error message, then set `submitError` to display it and keep `submitted=false` (do not advance)
4. On catch (network error), set `submitError` to a user-friendly message
5. Always set `isSubmitting=false` at the end (in a finally block)

**Details:** 
- When `res.ok` is true, the form submission succeeded → clear `submitError` and set `submitted=true`
- When `res.ok` is false, parse the response JSON to extract `error` or `error.message` and show it in `submitError`
- Wrap the fetch in try-catch; on catch, set `submitError` to "Failed to submit. Please check your connection and try again."
- After the try-catch-finally completes, `isSubmitting` must be false whether success or failure

**Files:** `src/components/forms/immigration-assessment-form.tsx`

**Verify:** `npm run build` — compiles without errors

---

### Step 4: Add submission error banner to step 8
**What:** On step 8, add an error banner that displays if `submitError` is truthy. Render it above the Consent section. Use the same border/color pattern as the existing UI (e.g., red text, red border, light red background, matching the style of validation errors elsewhere in the form).

Example structure:
```tsx
{submitError && (
  <div className="rounded-lg border border-red-300 bg-red-50 p-4">
    <p className="text-sm font-semibold text-red-900">Submission Error</p>
    <p className="mt-1 text-sm text-red-800">{submitError}</p>
  </div>
)}
```

**Files:** `src/components/forms/immigration-assessment-form.tsx`

**Verify:** `npm run build` — compiles without errors

---

### Step 5: Disable Submit button while submitting
**What:** Add `disabled={isSubmitting}` to the Submit button so it cannot be clicked twice. Optionally add loading text or a spinner.

**Files:** `src/components/forms/immigration-assessment-form.tsx`

**Verify:** `npm run build` — compiles without errors

---

### Step 6: Clear submission error when user changes any field on step 8
**What:** When the user edits any field on step 8, clear the `submitError` so they don't see a stale error. Use a `watch()` hook or attach an `onChange` handler to each field that calls `setSubmitError(null)` after a submission error occurs.

Alternative (simpler): Clear `submitError` when the user advances to any step. Add `setSubmitError(null)` inside `nextStep()` and `prevStep()` so switching steps clears any prior submission error.

**Rationale:** If the user retries submission after fixing fields, they should not see a cached error from the previous attempt.

**Files:** `src/components/forms/immigration-assessment-form.tsx`

**Verify:** `npm run build` — compiles without errors

---

### Step 7: Build and verify the full flow
**What:** Compile the form and smoke-test the end-to-end flow:
1. Fill all required fields on each step, advancing with Next
2. On step 8, try to submit without checking the consent checkboxes → validation errors should appear for sectionH fields, Submit button should not fire
3. Check all three consent checkboxes and add e-signature
4. Mock the API to fail (or use the dev server and trigger an API error): click Submit → submission error banner should appear with the error message, Submit button should re-enable
5. Fix the issue and resubmit (simulate success): form should show the success screen

**Files:** `src/components/forms/immigration-assessment-form.tsx`

**Verify:** 
- `npm run build` — build succeeds
- `npm run dev` — dev server runs without errors
- Manual test as described above

---

## Design Decisions Rationale

1. **Validate only the current section on Next:** Validating the entire form would show errors for all 8 sections as soon as the user reaches step 2, which is confusing. Validating only the current section keeps errors scoped and actionable.

2. **Use `trigger()` instead of `handleSubmit()`:** `trigger()` is designed exactly for partial validation. It returns `true/false` without invoking the form submit handler.

3. **Track `submitError` separately from `submitted`:** Allows the form to stay open on step 8 if submission fails, letting the user fix the error and retry. `submitted` is only set to `true` after a successful submission.

4. **Add `isSubmitting` state:** Prevents the user from clicking Submit multiple times while the request is in flight, and gives visual feedback (disabled button).

5. **Zod v4 enum syntax is already correct:** No schema changes needed; the existing `{ error: "..." }` syntax is valid for v4. This was flagged as a potential issue, but inspection confirms it's already right.

---

## Files Changed

- `src/components/forms/immigration-assessment-form.tsx` — add trigger-based validation, error state, loading state, error banner, and button disable logic

## Files Not Changed

- `src/lib/immigration-assessment-schema.ts` — no schema changes needed
- `src/app/api/immigration/assessment/route.ts` — no backend changes needed (already returns proper error responses)

---

## Verification Commands

After all steps are complete:
```bash
npm run build
npm run dev
```

Then:
1. Open the form in the browser at `http://localhost:3000/`
2. Navigate to the immigration assessment form
3. Test advancing without filling fields (errors should block next step)
4. Test submission on step 8 (submission error should display if API fails)
5. Test successful submission (success screen should appear)
