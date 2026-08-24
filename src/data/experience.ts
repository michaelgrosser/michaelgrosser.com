/**
 * Résumé roles, newest first. Copy is verbatim from docs/ui/README.md — do not
 * edit, extend, or add metrics that are not already here.
 */

export type Role = {
  readonly year: string;
  readonly title: string;
  /** Rendered uppercase by CSS; author in natural case for screen readers. */
  readonly company: string;
  readonly range: string;
  readonly summary: string;
  /** Exactly one role is current; it gets the accent timeline dot. */
  readonly current?: boolean;
};

export const experienceRange = '2010 — Present';

export const roles: readonly Role[] = [
  {
    year: '2024',
    title: 'Principal Software Engineer, Toast Tables',
    company: 'Toast',
    range: 'Present',
    summary:
      'Principal Software Engineer for the Toast Tables Reservations & Waitlist platform, working across backend, frontend, and infrastructure.',
    current: true,
  },
  {
    year: '2022',
    title: 'Principal Engineer / Sr. Engineering Manager, Guest Platform',
    company: 'Toast',
    range: '2022 — 2024',
    summary:
      'Tech lead manager for the Digital Ordering Platform, specializing in designing re-usable systems for Online Ordering and other guest-facing services.',
  },
  {
    year: '2021',
    title: 'Consultant, Enterprise Architecture',
    company: 'Inspire11',
    range: '2021 — 2022',
    summary:
      'Consulted with Enterprise clients to design their migrations from on prem to the cloud.',
  },
  {
    year: '2015',
    title: 'Vice President of Engineering',
    company: 'Neighborhoods.com',
    range: '2015 — 2021',
    summary:
      'Built the internal engineering organization to 30+ people across backend, frontend, DevOps, data science and QA, and designed the cloud-native platform behind ~10M listings and ~100M parcel records.',
  },
  {
    year: '2010',
    title: 'Practice Director, eCommerce · Sr. Technical Architect',
    company: 'Gorilla Group',
    range: '2010 — 2015',
    summary:
      'Architectural lead for high-volume B2B and B2C commerce platforms, and for the practice’s move to cloud-based hosting and reproducible developer environments.',
  },
];
