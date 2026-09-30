"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
const experiences = [{ title: "Caminhos entre cachoeiras", label: "Ecoturismo", image: "/images/experiencia-cachoeiras.webp", href: "/lugares/trilha-das-cachoeiras-secretas" },{ title: "Sabores com memória", label: "Gastronomia", image: "/images/experiencia-gastronomia.webp", href: "/onde-comer" },{ title: "Horizontes da Mantiqueira", label: "Natureza", image: "/images/experiencia-horizontes.webp", href: "/lugares" },{ title: "Refúgios para desacelerar", label: "Hospedagem", image: "/images/experiencia-refugios.webp", href: "/onde-ficar" }];
export function ExperienceSlider() { return <Swiper className="experience-swiper" modules={[FreeMode]} freeMode grabCursor spaceBetween={16} slidesPerView={1.15} breakpoints={{ 680: { slidesPerView: 2.15, spaceBetween: 22 }, 1080: { slidesPerView: 3.15, spaceBetween: 24 } }}>{experiences.map(item => <SwiperSlide key={item.title}><Link className="experience-card" href={item.href}><Image src={item.image} alt="" fill sizes="(max-width: 680px) 85vw, 36vw" /><span className="experience-card__shade" /><div><small>{item.label}</small><h3>{item.title}</h3><span className="round-action"><ArrowUpRight /></span></div></Link></SwiperSlide>)}</Swiper>; }
