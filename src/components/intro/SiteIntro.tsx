"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./SiteIntro.module.css";

const SESSION_KEY = "acheiTurismoIntroPlayed";
const SKIP_DELAY_MS = 2_000;
const SAFETY_TIMEOUT_MS = 11_000;
const REDUCED_MOTION_DURATION_MS = 1_000;
const HOME_REVEAL_DURATION_MS = 900;
const INTRO_COMPLETE_EVENT = "achei:intro-complete";

export function SiteIntro() {
  const prefersReducedMotion = useReducedMotion();
  const [isMounted, setIsMounted] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [canSkip, setCanSkip] = useState(false);
  const hasStartedRef = useRef(false);
  const isExitingRef = useRef(false);
  const previousOverflowRef = useRef<{ body: string; html: string } | null>(null);

  const unlockPageScroll = useCallback(() => {
    const previousOverflow = previousOverflowRef.current;
    if (!previousOverflow) return;

    document.body.style.overflow = previousOverflow.body;
    document.documentElement.style.overflow = previousOverflow.html;
    previousOverflowRef.current = null;
  }, []);

  const finishIntro = useCallback(() => {
    if (isExitingRef.current) return;

    isExitingRef.current = true;

    try {
      window.sessionStorage.setItem(SESSION_KEY, "true");
    } catch {
      // Continue normally if storage is unavailable (for example in private modes).
    }

    document.documentElement.classList.remove("achei-intro-active");
    document.documentElement.classList.add("achei-intro-revealing");
    unlockPageScroll();
    setIsVisible(false);

    window.setTimeout(() => {
      document.documentElement.classList.remove("achei-intro-revealing");
    }, HOME_REVEAL_DURATION_MS);
  }, [unlockPageScroll]);

  useEffect(() => {
    let hasPlayed = false;

    try {
      hasPlayed = window.sessionStorage.getItem(SESSION_KEY) === "true";
    } catch {
      // The intro can still run without session storage.
    }

    if (hasPlayed && !hasStartedRef.current) {
      document.documentElement.dataset.acheiIntroPlayed = "true";
      setIsMounted(false);
      window.dispatchEvent(new Event(INTRO_COMPLETE_EVENT));
      return;
    }

    hasStartedRef.current = true;
    try {
      window.sessionStorage.setItem(SESSION_KEY, "true");
    } catch {
      // Continue normally if storage is unavailable.
    }

    document.documentElement.classList.add("achei-intro-active");

    previousOverflowRef.current = {
      body: document.body.style.overflow,
      html: document.documentElement.style.overflow,
    };
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const skipTimer = window.setTimeout(() => setCanSkip(true), SKIP_DELAY_MS);
    const endTimer = window.setTimeout(
      finishIntro,
      prefersReducedMotion ? REDUCED_MOTION_DURATION_MS : SAFETY_TIMEOUT_MS,
    );

    return () => {
      window.clearTimeout(skipTimer);
      window.clearTimeout(endTimer);
      unlockPageScroll();
      document.documentElement.classList.remove("achei-intro-active");
    };
  }, [finishIntro, prefersReducedMotion, unlockPageScroll]);

  const handleExitComplete = useCallback(() => {
    unlockPageScroll();
    document.documentElement.dataset.acheiIntroPlayed = "true";
    setIsMounted(false);
    window.dispatchEvent(new Event(INTRO_COMPLETE_EVENT));
  }, [unlockPageScroll]);

  if (!isMounted) return null;

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {isVisible ? (
        <motion.div
          className={styles.intro}
          initial={false}
          exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 1.02 }}
          transition={{ duration: prefersReducedMotion ? 0.2 : 0.75, ease: [0.22, 1, 0.36, 1] }}
          role="dialog"
          aria-label="Introdução Achei Turismo"
          aria-modal="true"
        >
          {prefersReducedMotion ? (
            <Image
              className={styles.reducedMotionLogo}
              src="/images/achei-turismo-intro-logo.webp"
              alt="Achei o Turismo"
              width={1280}
              height={720}
              priority
            />
          ) : (
            <video
              className={styles.video}
              autoPlay
              muted
              playsInline
              preload="auto"
              poster="/images/achei-turismo-intro-poster.webp"
              onEnded={finishIntro}
              onError={finishIntro}
              aria-hidden="true"
              tabIndex={-1}
            >
              <source media="(max-width: 767px)" src="/videos/achei-turismo-intro-mobile.mp4" type="video/mp4" />
              <source media="(min-width: 768px)" src="/videos/achei-turismo-intro-desktop.mp4" type="video/mp4" />
            </video>
          )}

          {!prefersReducedMotion && canSkip ? (
            <motion.button
              className={styles.skipButton}
              type="button"
              onClick={finishIntro}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              Pular intro
            </motion.button>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
