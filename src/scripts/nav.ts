/**
 * Mobile navigation toggle — the only interactive behaviour outside the contact form.
 *
 * Both link lists are already in the DOM; this just flips `aria-expanded` and the
 * panel's `hidden` attribute, which CSS and assistive technology both understand.
 */
const toggle = document.querySelector<HTMLButtonElement>('[data-nav-toggle]');
const menu = document.querySelector<HTMLElement>('[data-nav-menu]');

if (toggle && menu) {
  const setOpen = (open: boolean) => {
    toggle.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  // Choosing a destination closes the menu.
  menu.addEventListener('click', (event) => {
    if ((event.target as HTMLElement).closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !menu.hidden) {
      setOpen(false);
      toggle.focus();
    }
  });

  // Growing past the breakpoint reveals the desktop links; drop the stale panel state.
  window.matchMedia('(min-width: 761px)').addEventListener('change', (event) => {
    if (event.matches) setOpen(false);
  });
}

export {};
