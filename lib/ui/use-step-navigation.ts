"use client";

import { useEffect, useRef } from "react";
import { focusStepStart } from "./step-navigation";

// Only step changes move the viewport. Typing, validation and timers do not.
export function useStepNavigation(stepKey: string | number) {
  const startRef = useRef<HTMLDivElement>(null);
  const previousStep = useRef(stepKey);
  useEffect(() => {
    if (previousStep.current === stepKey) return;
    previousStep.current = stepKey;
    if (startRef.current) focusStepStart(startRef.current);
  }, [stepKey]);
  return startRef;
}
