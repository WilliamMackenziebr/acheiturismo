"use client";

import Image from "next/image";
import { CaretDown, DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useState } from "react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { IOSInstallInstructions } from "./IOSInstallInstructions";
import styles from "./InstallAppPrompt.module.css";

export function InstallAppPrompt() {
  const prefersReducedMotion = useReducedMotion();
  const { dismiss, install, isIOS, isInstalling, shouldShow } = usePWAInstall();
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  const handleInstall = useCallback(async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }
    await install();
  }, [install, isIOS]);

  return (
    <>
      <AnimatePresence>
        {shouldShow && !showIOSInstructions ? (
          <motion.aside
            className={styles.prompt}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 22 }}
            transition={{ duration: prefersReducedMotion ? 0.15 : 0.42, ease: [0.22, 1, 0.36, 1] }}
            aria-label="Instalar Achei Turismo"
          >
            <button className={styles.dismissIcon} type="button" onClick={dismiss} aria-label="Agora não">
              <CaretDown size={18} weight="bold" />
            </button>
            <div className={styles.heading}>
              <Image className={styles.logo} src="/images/logo-achei-oficial.webp" alt="" width={64} height={64} />
              <div>
                <span className={styles.eyebrow}>Aplicativo web</span>
                <h2>Leve o Achei Turismo com você</h2>
              </div>
            </div>
            <p>Descubra lugares, hospedagens, gastronomia e experiências pelo Vale do Paraíba.</p>
            <div className={styles.actions}>
              <button className={styles.installButton} type="button" onClick={handleInstall} disabled={isInstalling}>
                <DownloadSimple size={20} weight="bold" />
                {isInstalling ? "Abrindo instalação…" : "Instalar Achei Turismo"}
              </button>
              <button className={styles.laterButton} type="button" onClick={dismiss}>Agora não</button>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showIOSInstructions ? (
          <IOSInstallInstructions onClose={() => setShowIOSInstructions(false)} />
        ) : null}
      </AnimatePresence>
    </>
  );
}
