"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DISMISSED_SESSION_KEY = "acheiTurismoInstallPromptDismissed";
const INTRO_COMPLETE_EVENT = "achei:intro-complete";
const PROMPT_DELAY_MS = 6_500;
const INTERACTION_DELAY_MS = 700;

type InstallChoice = {
  outcome: "accepted" | "dismissed";
  platform: string;
};

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallChoice>;
}

declare global {
  interface Navigator {
    standalone?: boolean;
  }

  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

function isStandaloneMode() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function getAppleMobileSafari() {
  const userAgent = window.navigator.userAgent;
  const isIOSDevice = /iPhone|iPad|iPod/i.test(userAgent)
    || (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
  const isSafari = /Safari/i.test(userAgent) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(userAgent);
  return isIOSDevice && isSafari;
}

export function usePWAInstall() {
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [hasInstallPrompt, setHasInstallPrompt] = useState(false);
  const [isEngaged, setIsEngaged] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const standaloneQuery = window.matchMedia("(display-mode: standalone)");

    const syncEnvironment = () => {
      setIsMobile(mobileQuery.matches);
      setIsStandalone(isStandaloneMode());
      setIsIOS(getAppleMobileSafari());
    };

    syncEnvironment();
    setIsDismissed(window.sessionStorage.getItem(DISMISSED_SESSION_KEY) === "true");

    mobileQuery.addEventListener("change", syncEnvironment);
    standaloneQuery.addEventListener("change", syncEnvironment);
    return () => {
      mobileQuery.removeEventListener("change", syncEnvironment);
      standaloneQuery.removeEventListener("change", syncEnvironment);
    };
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      deferredPromptRef.current = event;
      setHasInstallPrompt(true);
    };

    const handleInstalled = () => {
      deferredPromptRef.current = null;
      setHasInstallPrompt(false);
      setIsInstalled(true);
      setIsDismissed(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  useEffect(() => {
    const completeIntro = () => setIsIntroComplete(true);
    const root = document.documentElement;

    if (root.dataset.acheiIntroPlayed === "true" && !root.classList.contains("achei-intro-active")) {
      completeIntro();
    }

    window.addEventListener(INTRO_COMPLETE_EVENT, completeIntro);
    return () => window.removeEventListener(INTRO_COMPLETE_EVENT, completeIntro);
  }, []);

  useEffect(() => {
    if (!isIntroComplete || isDismissed || isStandalone || isInstalled || !isMobile) return;

    const reveal = () => setIsEngaged(true);
    const interactionEvents: Array<keyof WindowEventMap> = ["pointerdown", "touchstart", "scroll"];
    let interactionTimer: number | undefined;
    const removeInteractionListeners = () => {
      interactionEvents.forEach((eventName) => window.removeEventListener(eventName, revealAfterInteraction));
    };
    const revealAfterInteraction = () => {
      removeInteractionListeners();
      interactionTimer = window.setTimeout(reveal, INTERACTION_DELAY_MS);
    };
    const timer = window.setTimeout(reveal, PROMPT_DELAY_MS);

    interactionEvents.forEach((eventName) => {
      window.addEventListener(eventName, revealAfterInteraction, { once: true, passive: true });
    });

    return () => {
      window.clearTimeout(timer);
      if (interactionTimer) window.clearTimeout(interactionTimer);
      removeInteractionListeners();
    };
  }, [isDismissed, isInstalled, isIntroComplete, isMobile, isStandalone]);

  const dismiss = useCallback(() => {
    try {
      window.sessionStorage.setItem(DISMISSED_SESSION_KEY, "true");
    } catch {
      // Hiding the prompt still works when storage is unavailable.
    }
    setIsDismissed(true);
  }, []);

  const install = useCallback(async () => {
    const installPrompt = deferredPromptRef.current;
    if (!installPrompt) return "unavailable" as const;

    setIsInstalling(true);
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      deferredPromptRef.current = null;
      setHasInstallPrompt(false);
      dismiss();
      return choice.outcome;
    } finally {
      setIsInstalling(false);
    }
  }, [dismiss]);

  const canInstall = hasInstallPrompt || isIOS;
  const shouldShow = isMobile
    && canInstall
    && isIntroComplete
    && isEngaged
    && !isDismissed
    && !isStandalone
    && !isInstalled;

  return {
    canInstall,
    dismiss,
    install,
    isIOS,
    isInstalling,
    shouldShow,
  };
}
