"use client";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) { const reduce = useReducedMotion(); return <motion.div className={className} initial={reduce ? false : { opacity: 0, y: 34 }} whileInView={reduce ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: .18 }} transition={{ duration: .7, delay, ease: [.22, 1, .36, 1] }}>{children}</motion.div>; }
