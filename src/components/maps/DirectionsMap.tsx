"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./DirectionsMap.module.css";

type DirectionsMapProps = {
  placeName: string;
  city: string;
  state: string;
};

export function DirectionsMap({ placeName, city, state }: DirectionsMapProps) {
  const [isOpen, setIsOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setIsOpen(false), []);
  const query = encodeURIComponent(`${placeName}, ${city} - ${state}`);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      trigger?.focus();
    };
  }, [close, isOpen]);

  return (
    <>
      <button ref={triggerRef} className="button button--outline" type="button" onClick={() => setIsOpen(true)}>
        Como chegar
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Mapa de ${placeName}`}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) close();
            }}
          >
            <motion.section
              className={styles.mapPanel}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.99 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <header className={styles.header}>
                <div>
                  <span>COMO CHEGAR</span>
                  <strong>{placeName}</strong>
                  <small>{city} — {state}</small>
                </div>
                <button ref={closeButtonRef} type="button" onClick={close}>Fechar</button>
              </header>

              <div className={styles.mapFrame}>
                <iframe
                  src={`https://www.google.com/maps?q=${query}&output=embed`}
                  title={`Google Maps — ${placeName}`}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </motion.section>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
