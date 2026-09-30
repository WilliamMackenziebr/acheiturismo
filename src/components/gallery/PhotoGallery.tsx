"use client";

import Image from "next/image";
import { ArrowsOut, CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./PhotoGallery.module.css";

type PhotoGalleryProps = {
  images: string[];
  placeName: string;
};

export function PhotoGallery({ images, placeName }: PhotoGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);
  const previous = useCallback(() => {
    setActiveIndex((current) => current === null ? null : (current - 1 + images.length) % images.length);
  }, [images.length]);
  const next = useCallback(() => {
    setActiveIndex((current) => current === null ? null : (current + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (activeIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") previous();
      if (event.key === "ArrowRight") next();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      lastTriggerRef.current?.focus();
    };
  }, [activeIndex, close, next, previous]);

  return (
    <>
      <div className="gallery">
        {images.map((src, index) => (
          <button
            className={styles.thumbnail}
            type="button"
            onClick={(event) => {
              lastTriggerRef.current = event.currentTarget;
              setActiveIndex(index);
            }}
            aria-label={`Abrir foto ${index + 1} de ${placeName}`}
            key={`${src}-${index}`}
          >
            <Image src={src} alt={`${placeName} — foto ${index + 1}`} fill sizes="(max-width: 700px) 50vw, 25vw" />
            <span className={styles.expandIcon} aria-hidden="true"><ArrowsOut size={18} /></span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {activeIndex !== null ? (
          <motion.div
            className={styles.lightbox}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Foto ampliada de ${placeName}`}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) close();
            }}
          >
            <button ref={closeButtonRef} className={styles.closeButton} type="button" onClick={close} aria-label="Fechar foto">
              Fechar
            </button>

            <button className={`${styles.navButton} ${styles.previousButton}`} type="button" onClick={previous} aria-label="Foto anterior">
              <CaretLeft size={28} weight="bold" />
            </button>

            <motion.figure
              className={styles.fullImage}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src={images[activeIndex]}
                alt={`${placeName} — foto ${activeIndex + 1} ampliada`}
                fill
                sizes="100vw"
                priority
              />
              <figcaption>{activeIndex + 1} / {images.length}</figcaption>
            </motion.figure>

            <button className={`${styles.navButton} ${styles.nextButton}`} type="button" onClick={next} aria-label="Próxima foto">
              <CaretRight size={28} weight="bold" />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
