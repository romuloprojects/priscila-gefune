import { useEffect } from "react";
/** Shared focus/keyboard handling for the existing modal markup. */
export function useDialogAccessibility() {
  useEffect(() => {
    let current: HTMLElement | null = null;
    const previousOverflow = document.body.style.overflow;
    const restores = new Map<HTMLElement, HTMLElement | null>();
    const focusables = (root: HTMLElement) =>
      Array.from(
        root.querySelectorAll<HTMLElement>(
          'button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],iframe,[tabindex="0"]',
        ),
      ).filter((el) => el.getClientRects().length > 0);
    const observer = new MutationObserver(() => {
      const dialogs = Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"]'));
      const next = dialogs.at(-1) ?? null;
      if (next === current) return;
      const old = current;
      if (old && !old.isConnected) {
        restores.get(old)?.focus();
        restores.delete(old);
      }
      current = next;
      document.body.style.overflow = next ? "hidden" : previousOverflow;
      if (next) {
        if (!restores.has(next)) restores.set(next, document.activeElement as HTMLElement);
        const heading = next.querySelector("h2");
        if (heading && !next.hasAttribute("aria-label"))
          next.setAttribute("aria-label", heading.textContent || "Detalhes");
        if (!next.contains(document.activeElement)) (focusables(next)[0] ?? next).focus();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    const onKey = (e: KeyboardEvent) => {
      if (!current) return;
      if (e.key === "Escape") {
        const close = current.querySelector<HTMLButtonElement>('button[aria-label^="Fechar"]');
        if (close) {
          e.preventDefault();
          close.click();
        }
      }
      if (e.key === "Tab") {
        const list = focusables(current);
        const first = list[0];
        const last = list.at(-1);
        if (!first) return;
        if (
          e.shiftKey &&
          (document.activeElement === first || !current.contains(document.activeElement))
        ) {
          e.preventDefault();
          last?.focus();
        } else if (
          !e.shiftKey &&
          (document.activeElement === last || !current.contains(document.activeElement))
        ) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      observer.disconnect();
      document.removeEventListener("keydown", onKey);
    };
  }, []);
}
