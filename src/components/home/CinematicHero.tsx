"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, MapPin } from "@phosphor-icons/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function CinematicHero() {
  const hero = useRef<HTMLElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.to(media.current, {
        yPercent: 12,
        scale: 1.06,
        ease: "none",
        scrollTrigger: {
          trigger: hero.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.7,
        },
      });
      gsap.to(content.current, {
        y: -65,
        opacity: 0.15,
        ease: "none",
        scrollTrigger: {
          trigger: hero.current,
          start: "top top",
          end: "75% top",
          scrub: 0.6,
        },
      });
    }, hero);

    return () => context.revert();
  }, []);

  return (
    <section ref={hero} className="cinematic-hero">
      <div ref={media} className="cinematic-hero__media">
        <Image
          src="/images/hero-mantiqueira-poster.webp"
          alt="Amanhecer na Serra da Mantiqueira"
          fill
          priority
          sizes="100vw"
        />
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/hero-mantiqueira-poster.webp"
          aria-hidden="true"
        >
          <source
            media="(max-width: 700px)"
            src="/videos/hero-mantiqueira-mobile.mp4"
            type="video/mp4"
          />
          <source
            src="/videos/hero-mantiqueira-desktop.mp4"
            type="video/mp4"
          />
        </video>
      </div>
      <div className="cinematic-hero__overlay" />
      <div ref={content} className="cinematic-hero__content container">
        <div className="hero-kicker">
          <MapPin weight="fill" /> Serra da Mantiqueira, Brasil
        </div>
        <h1>
          Achei lugares
          <br />
          <em>que ficam.</em>
        </h1>
        <p>
          O Achei reúne natureza, sabores e refúgios para você viver a serra
          com tempo, presença e encanto.
        </p>
        <div className="hero-ctas">
          <Link className="button button--lime" href="/explorar">
            Explorar com o Achei <ArrowRight />
          </Link>
          <Link className="hero-link" href="#regiao">
            Conheça a Mantiqueira
          </Link>
        </div>
      </div>
      <a className="scroll-cue" href="#regiao">
        <span>Veja nossos achados</span>
        <ArrowDown />
      </a>
    </section>
  );
}
