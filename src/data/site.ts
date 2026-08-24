/** Site-wide facts. Every value here is public and comes from the approved brief. */

export const site = {
  name: 'Michael Grosser',
  role: 'Principal Software Engineer',
  url: 'https://www.michaelgrosser.com',
  email: 'michael@michaelgrosser.com',
  description:
    'I’m a principal software engineer who enjoys turning complicated systems into something simpler, faster, and easier to build on.',
  copyrightYear: 2026,
} as const;

export type SocialLink = {
  /** Icon module name in src/icons/. */
  readonly icon: 'envelope-simple' | 'linkedin-logo' | 'x-logo' | 'github';
  readonly href: string;
  /** Accessible name — icon-only controls have no visible text. */
  readonly label: string;
  readonly title: string;
  /** Optical size in px; the X mark reads heavier than the rest at 22. */
  readonly size?: 20 | 22;
};

export const socialLinks: readonly SocialLink[] = [
  {
    icon: 'envelope-simple',
    href: `mailto:${site.email}`,
    label: `Email ${site.email}`,
    title: site.email,
  },
  {
    icon: 'linkedin-logo',
    href: 'https://www.linkedin.com/in/michaelgrosser',
    label: 'LinkedIn',
    title: 'LinkedIn',
  },
  {
    icon: 'x-logo',
    href: 'https://x.com/michaelgrosser',
    label: 'X, @michaelgrosser',
    title: '@michaelgrosser',
    size: 20,
  },
  { icon: 'github', href: 'https://github.com/michaelgrosser', label: 'GitHub', title: 'GitHub' },
];

export type NavLink = { readonly href: string; readonly label: string; readonly accent?: boolean };

export const navLinks: readonly NavLink[] = [
  { href: '#experience', label: 'Experience' },
  { href: '#technical', label: 'Expertise' },
  { href: '#education', label: 'Education' },
  { href: '#contact', label: 'Contact', accent: true },
];
