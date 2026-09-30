"use client";

import { ArrowSquareOut, CaretDown, DownloadSimple, Export } from "@phosphor-icons/react/dist/ssr";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import styles from "./InstallAppPrompt.module.css";

type IOSInstallInstructionsProps = {
  onClose: () => void;
};

const steps = [
  { icon: Export, text: "Toque no botão Compartilhar do Safari." },
  { icon: DownloadSimple, text: "Escolha “Adicionar à Tela de Início”." },
  { icon: ArrowSquareOut, text: "Ative “Abrir como App”." },
  { icon: DownloadSimple, text: "Toque em “Adicionar”." },
];

export function IOSInstallInstructions({ onClose }: IOSInstallInstructionsProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <motion.div
      className={styles.instructionsBackdrop}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.section
        className={styles.instructions}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ios-install-title"
      >
        <div className={styles.sheetHandle} aria-hidden="true" />
        <button ref={closeButtonRef} className={styles.closeButton} type="button" onClick={onClose} aria-label="Fechar instruções">
          <CaretDown size={20} weight="bold" />
        </button>
        <span className={styles.eyebrow}>No Safari do iPhone</span>
        <h2 id="ios-install-title">Instalar Achei Turismo</h2>
        <ol className={styles.steps}>
          {steps.map(({ icon: Icon, text }, index) => (
            <li key={text}>
              <span className={styles.stepIcon}><Icon size={22} weight="bold" /></span>
              <span><strong>{index + 1}.</strong> {text}</span>
            </li>
          ))}
        </ol>
        <button className={styles.doneButton} type="button" onClick={onClose}>Entendi</button>
      </motion.section>
    </motion.div>
  );
}
