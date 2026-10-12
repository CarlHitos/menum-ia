export function focusStepStart(target: Pick<HTMLElement, "focus" | "scrollIntoView">) {
  target.focus({ preventScroll: true });
  target.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    block: "start",
  });
}
