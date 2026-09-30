"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import type { Place } from "@/types/tourism";
export function HomePlaceCard({ place, index = 0 }: { place: Place; index?: number }) { const reduce = useReducedMotion(); return <motion.article className="premium-place-card" initial={reduce ? false : { opacity: 0, y: 32 }} whileInView={reduce ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: .18 }} transition={{ duration: .65, delay: index * .08, ease: [.22, 1, .36, 1] }} whileHover={reduce ? undefined : { y: -8 }}><Link href={`/lugares/${place.slug}`}><div className="premium-place-card__media"><Image src={place.image} alt="" fill sizes="(max-width: 700px) 90vw, 33vw" />{place.partner && <span className="partner-badge">Parceiro Achei</span>}<span className="round-action"><ArrowUpRight /></span></div><div className="premium-place-card__body"><div><small>{place.category}</small><h3>{place.name}</h3></div><p><MapPin weight="fill" />{place.city}, {place.state}</p></div></Link></motion.article>; }
