/**
 * Technology marks shown in 02 / Expertise, in the approved order.
 *
 * The artwork is vendored from Simple Icons (src/icons/tech/). Each mark is the
 * trademark of its owner and is used here only to identify the technology; see
 * README.md § Third-party assets.
 */

export type TechLogo = {
  /** File name in src/icons/tech/. */
  readonly icon: string;
  readonly name: string;
  /** Claude leads the row and is tinted with the accent so it reads first. */
  readonly accent?: boolean;
};

export const techLogos: readonly TechLogo[] = [
  { icon: 'claude', name: 'Claude', accent: true },
  { icon: 'kotlin', name: 'Kotlin' },
  { icon: 'openjdk', name: 'Java' },
  { icon: 'typescript', name: 'TypeScript' },
  { icon: 'python', name: 'Python' },
  { icon: 'postgresql', name: 'PostgreSQL' },
  { icon: 'amazonwebservices', name: 'Amazon Web Services' },
  { icon: 'cloudflare', name: 'Cloudflare' },
  { icon: 'kubernetes', name: 'Kubernetes' },
  { icon: 'terraform', name: 'Terraform' },
  { icon: 'react', name: 'React' },
  { icon: 'go', name: 'Go' },
];
