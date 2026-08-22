export interface NavLink {
  label: string;
  href: string;
}

export const mainNav: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Immigration Consultancy", href: "/immigration-consultancy" },
  { label: "Marriage Consultancy", href: "/marriage-consultancy" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Trust & Safety", href: "/trust-safety" },
  { label: "Resources", href: "/resources" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const footerNav: NavLink[] = [
  { label: "About Us", href: "/about" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
  { label: "Contact", href: "/contact" },
  { label: "Resources", href: "/resources" },
];

export const socialLinks = [
  { label: "Facebook", href: "https://facebook.com" },
  { label: "YouTube", href: "https://youtube.com" },
  { label: "Instagram", href: "https://instagram.com" },
];

export const officeAddress = "Dhaka, Bangladesh";
