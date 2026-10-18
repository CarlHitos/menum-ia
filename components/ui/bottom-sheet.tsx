"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

type BottomSheetProps = {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
};

export function BottomSheet({ title, description, onClose, children }: BottomSheetProps) {
  const id = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const body = document.body;
    const previous = {
      position: body.style.position, top: body.style.top, left: body.style.left,
      right: body.style.right, width: body.style.width, overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    };
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    Object.assign(body.style, {
      position: "fixed", top: `-${scrollY}px`, left: "0", right: "0",
      width: "100%", overflow: "hidden",
      paddingRight: `${parseFloat(getComputedStyle(body).paddingRight) + scrollbar}px`,
    });
    dialog.showModal();

    return () => {
      dialog.close();
      Object.assign(body.style, previous);
      trigger?.focus({ preventScroll: true });
      window.scrollTo({ left: scrollX, top: scrollY, behavior: "instant" });
    };
  }, []);

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-description` : undefined}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden border-0 bg-transparent p-0 text-[var(--color-paper)] backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <div className="flex h-full items-end justify-center sm:items-center sm:p-6" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
        <div className="flex h-[90dvh] max-h-[52rem] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border border-[var(--color-border)] bg-[var(--color-ink)] pb-[env(safe-area-inset-bottom)] shadow-2xl sm:rounded-3xl">
          <header className="flex shrink-0 items-start justify-between gap-3 p-4">
            <div className="min-w-0">
              <h2 id={`${id}-title`} className="text-lg font-semibold leading-snug">{title}</h2>
              {description ? <p id={`${id}-description`} className="mt-1 text-xs leading-5 text-[var(--color-muted)]">{description}</p> : null}
            </div>
            <button type="button" autoFocus onClick={onClose} className="min-h-11 shrink-0 rounded-full border border-[var(--color-border)] px-3 text-sm text-[var(--color-paper)] hover:border-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]">Cancelar</button>
          </header>
          {children}
        </div>
      </div>
    </dialog>,
    document.body,
  );
}
