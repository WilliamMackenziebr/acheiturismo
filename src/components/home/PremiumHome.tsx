"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Buildings,
  CalendarDots,
  Compass,
  ForkKnife,
  Gift,
  MapPin,
} from "@phosphor-icons/react";
import { Reveal } from "@/components/motion/Reveal";
import { events } from "@/data/events";
import { useCatalog } from "@/components/tourism/CatalogProvider";
import { CinematicHero } from "./CinematicHero";
import { ExperienceSlider } from "./ExperienceSlider";
import { HomePlaceCard } from "./HomePlaceCard";

export function PremiumHome() {
  const { places } = useCatalog();
  const stays = places.filter((place) => place.kind === "hospedagem").sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  const food = places.filter((place) => place.kind === "restaurante").sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  const nature = places.filter(place => place.entryKind === "nature").sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  const destinations = places.filter(place => place.entryKind === "destination").sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  const featuredGuides = places.filter(place => place.kind === "guia" && place.featured);

  return (
    <div className="premium-home">
      <CinematicHero />

      <section id="regiao" className="story-section container">
        <Reveal className="section-intro">
          <span className="section-index">01 — A REGIÃO · ACHEI</span>
          <h2>
            Achei uma serra para sentir
            <br />
            com todos os sentidos.
          </h2>
          <p>
            Entre vales, araucárias e pequenas cidades, o Achei conecta você
            ao extraordinário da Mantiqueira, sempre sem pressa.
          </p>
        </Reveal>
        <Reveal className="story-image">
          <Image
            src="/images/rio-destino.jpg"
            alt="Paisagem da Serra da Mantiqueira"
            fill
            sizes="(max-width: 700px) 100vw, 70vw"
          />
        </Reveal>
        <div className="story-facts">
          <Reveal>
            <strong>1.800m</strong>
            <span>acima do nível do mar</span>
          </Reveal>
          <Reveal delay={0.08}>
            <strong>4 estações</strong>
            <span>cada uma com seu encanto</span>
          </Reveal>
          <Reveal delay={0.16}>
            <strong>∞</strong>
            <span>achados para viver</span>
          </Reveal>
        </div>
      </section>

      <section className="dark-section">
        <div className="container">
          <Reveal className="editorial-heading">
            <span className="section-index">02 — EXPERIÊNCIAS ACHEI</span>
            <div>
              <h2>
                Achei a serra
                <br />
                <em>por inteiro.</em>
              </h2>
              <p>Escolhas do Achei para quem quer ir além do roteiro.</p>
            </div>
          </Reveal>
          <ExperienceSlider />
        </div>
      </section>

      <section className="collection-section container">
        <Reveal className="collection-heading">
          <div>
            <Buildings />
            <span className="section-index">03 — ONDE FICAR COM O ACHEI</span>
            <h2>
              Achei seu refúgio
              <br />
              entre montanhas.
            </h2>
          </div>
          <Link href="/onde-ficar">
            Ver os achados para ficar <ArrowRight />
          </Link>
        </Reveal>
        <div className="premium-grid">
          {stays.map((place, index) => (
            <HomePlaceCard place={place} index={index} key={place.id} />
          ))}
        </div>
      </section>

      {!!featuredGuides.length && <section className="stays-section container"><Reveal className="collection-heading"><div><Compass /><span className="section-index">GUIAS DO ACHEI</span><h2>Quem conhece, mostra o caminho.</h2></div><Link href="/guias">Conhecer os guias <ArrowRight /></Link></Reveal><div className="premium-grid">{featuredGuides.map((place, index) => <HomePlaceCard place={place} index={index} key={place.id} />)}</div></section>}

      <section className="food-feature">
        <div className="food-feature__media">
          <Image
            src="/images/sabores-achei-chef.webp"
            alt="Chef preparando um prato da gastronomia da Mantiqueira"
            fill
            sizes="50vw"
          />
        </div>
        <div className="food-feature__copy">
          <Reveal>
            <ForkKnife size={34} />
            <span className="section-index">04 — SABORES ACHEI</span>
            <h2>Achei sabores que contam histórias.</h2>
            <p>
              Da cozinha de raiz aos cafés especiais, o Achei apresenta quem
              transforma ingredientes locais em experiências memoráveis.
            </p>
            <Link className="button button--lime" href="/onde-comer">
              Ver sabores do Achei <ArrowRight />
            </Link>
          </Reveal>
          <div className="food-mini-list">
            {food.map((item) => (
              <Link href={`/lugares/${item.slug}`} key={item.id}>
                <span>{item.category}</span>
                <strong>{item.name}</strong>
                <ArrowRight />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {[{ items: nature, title: "Trilhas e ecoturismo", subtitle: "NATUREZA PARA VIVER", href: "/trilhas-ecoturismo", icon: Compass }, { items: destinations, title: "Destinos imperdíveis", subtitle: "LUGARES PARA GUARDAR NA MEMÓRIA", href: "/destinos", icon: MapPin }].filter(section => section.items.length).map(({ items, title, subtitle, href, icon: Icon }) => <section className="collection-section container" key={href}><Reveal className="collection-heading"><div><Icon /><span className="section-index">{subtitle}</span><h2>{title}</h2></div><Link href={href}>Ver todos os achados <ArrowRight /></Link></Reveal><div className="premium-grid">{items.slice(0, 4).map((place, index) => <HomePlaceCard place={place} index={index} key={place.id} />)}</div></section>)}

      <section className="events-section container">
        <Reveal className="collection-heading">
          <div>
            <CalendarDots />
            <span className="section-index">05 — AGENDA ACHEI</span>
            <h2>Achamos encontros que viram histórias.</h2>
          </div>
          <Link href="/eventos">
            Ver agenda completa <ArrowRight />
          </Link>
        </Reveal>
        <div className="premium-events">
          {events.map((event, index) => (
            <Reveal key={event.id} delay={index * 0.1}>
              <Link href={`/eventos/${event.slug}`}>
                <div className="premium-event__date">
                  <span>{event.date.split(" ")[0]}</span>
                  <small>{event.date.split(" ").slice(1).join(" ")}</small>
                </div>
                <div className="premium-event__media">
                  <Image src={event.image} alt="" fill sizes="220px" />
                </div>
                <div className="premium-event__copy">
                  <small>{event.category}</small>
                  <h3>{event.name}</h3>
                  <p>
                    <MapPin />
                    {event.location}
                  </p>
                </div>
                <ArrowRight className="premium-event__arrow" />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="coupon-section container">
        <Reveal className="coupon-card">
          <div>
            <Gift size={34} />
            <span className="section-index">06 — BENEFÍCIOS ACHEI+</span>
            <h2>
              Mais experiências.
              <br />
              <em>Vantagens que a gente achou.</em>
            </h2>
            <p>
              Cupons e benefícios do Achei para aproveitar a região e apoiar
              negócios locais.
            </p>
            <Link className="button button--light" href="/cupons">
              Ver benefícios Achei <ArrowRight />
            </Link>
          </div>
          <div className="coupon-visual">
            <span>ACHEI+</span>
            <strong>15% OFF</strong>
            <small>Experiências selecionadas</small>
          </div>
        </Reveal>
      </section>

      <section className="final-cta">
        <Image
          src="/images/cachoeira-final-cta.webp"
          alt="Cachoeira cercada pela natureza"
          fill
          sizes="100vw"
        />
        <div className="final-cta__overlay" />
        <Reveal className="final-cta__copy">
          <span>
            Seu próximo destino está mais perto. O Achei mostra o caminho.
          </span>
          <h2>
            A serra
            <br />
            te espera.
          </h2>
          <Link className="button button--lime" href="/explorar">
            Explorar com o Achei <ArrowRight />
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
