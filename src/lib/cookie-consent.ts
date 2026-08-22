export const COOKIE_CONSENT_KEY = "pts-cookie-consent";
export const COOKIE_CONSENT_EVENT = "pts:cookie-consent-accepted";

export function subscribeToConsent(onChange: () => void) {
  window.addEventListener(COOKIE_CONSENT_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(COOKIE_CONSENT_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function getConsentSnapshot() {
  return window.localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted";
}

export function getConsentServerSnapshot() {
  return false;
}

export function acceptConsent() {
  window.localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
  window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT));
}
