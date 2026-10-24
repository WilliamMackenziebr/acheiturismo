"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, Check, ImageSquare, Plus, SpinnerGap, Star, Trash, UploadSimple, X } from "@phosphor-icons/react";
import { friendlyError, preparePhoto, slugify } from "@/lib/admin-store";
import { entryConfig } from "@/lib/entry-config";
import type { AdminEntry, EntryStatus } from "@/types/admin";

const states = "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" ");

export function EntryEditor({ initial, existingSlugs, onClose, onSave }: {
  initial: AdminEntry; existingSlugs: string[]; onClose: () => void; onSave: (entry: AdminEntry) => Promise<void>;
}) {
  const [entry, setEntry] = useState(initial);
  const [tab, setTab] = useState("info");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  const dirty = JSON.stringify(entry) !== JSON.stringify(initial);
  const isGuide = entry.kind === "guide";
  const config = entryConfig[entry.kind];

  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function close() {
    if (busy || uploading) return;
    if (!dirty || window.confirm("Descartar as alterações que ainda não foram salvas?")) onClose();
  }
  function update<K extends keyof AdminEntry>(key: K, value: AdminEntry[K]) { setEntry(current => ({ ...current, [key]: value })); }
  function toggle(key: "amenities" | "languages", value: string) {
    setEntry(current => ({ ...current, [key]: current[key].includes(value) ? current[key].filter(item => item !== value) : [...current[key], value] }));
  }
  async function addPhotos(files: FileList | File[]) {
    if (uploading || busy) return;
    setError("");
    if (entry.photos.length + files.length > 12) { setError("Cada cadastro pode ter até 12 fotos."); return; }
    setUploading(true);
    try {
      const photos = await Promise.all(Array.from(files).map(preparePhoto));
      setEntry(current => ({ ...current, photos: [...current.photos, ...photos] }));
    } catch (cause) { setError(friendlyError(cause)); }
    finally { setUploading(false); if (picker.current) picker.current.value = ""; }
  }
  async function save(status: EntryStatus) {
    setError("");
    const clean = { ...entry, name: entry.name.trim(), city: entry.city.trim(), description: entry.description.trim(), phone: entry.phone.trim() };
    if (!clean.name || !clean.city) { setTab("info"); setError("Preencha o nome e a cidade para salvar o cadastro."); return; }
    if (clean.name.length > 120 || clean.description.length > 5000) { setTab("info"); setError("Use até 120 caracteres no nome e 5.000 na descrição."); return; }
    if (status === "published" && clean.description.length < 30) { setTab("info"); setError("Para publicar, escreva uma descrição com pelo menos 30 caracteres."); return; }
    if (clean.phone && !/^\d{10,15}$/.test(clean.phone.replace(/\D/g, ""))) { setTab("contact"); setError("Informe um telefone válido com DDD (10 a 15 dígitos)."); return; }
    if (clean.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) { setTab("contact"); setError("Informe um e-mail válido."); return; }
    if (clean.website && !/^https?:\/\/[^\s]+$/i.test(clean.website)) { setTab("contact"); setError("O endereço do site deve começar com https:// ou http://."); return; }
    if (status === "published" && config.phoneRequired && !clean.phone) { setTab("contact"); setError("Adicione um telefone de contato antes de publicar."); return; }
    if (status === "published" && !clean.photos.length) { setTab("photos"); setError("Adicione pelo menos uma foto antes de publicar."); return; }
    let slug = initial.slug || slugify(clean.name) || clean.id;
    if (!initial.slug && existingSlugs.includes(slug)) slug += `-${clean.id.slice(0, 8)}`;
    setBusy(true);
    try { await onSave({ ...clean, slug, status }); }
    catch (cause) { setError(friendlyError(cause)); }
    finally { setBusy(false); }
  }
  function submit(event: FormEvent) { event.preventDefault(); void save("published"); }

  return <dialog className="admin-editor" ref={dialog} aria-labelledby="editor-title" onCancel={event => { event.preventDefault(); close(); }} data-lenis-prevent>
    <form onSubmit={submit} noValidate>
      <header className="admin-editor-header"><div><span className="admin-eyebrow">{config.title.toUpperCase()}</span><h2 id="editor-title">{initial.name ? "Editar cadastro" : config.createLabel}</h2><p>Boas experiências começam com boas informações.</p></div><button type="button" className="admin-icon-button" aria-label="Fechar cadastro" onClick={close} disabled={busy || uploading}><X size={22} /></button></header>
      <div className="admin-editor-tabs" role="tablist" aria-label="Etapas do cadastro">{[["info", "Informações"], ["contact", "Local e contato"], ["photos", `Fotos (${entry.photos.length})`]].map(([key, label]) => <button key={key} type="button" role="tab" id={`tab-${key}`} aria-selected={tab === key} aria-controls={`panel-${key}`} tabIndex={tab === key ? 0 : -1} onKeyDown={event => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); const tabs = ["info", "contact", "photos"]; const next = tabs[(tabs.indexOf(tab) + (event.key === "ArrowRight" ? 1 : 2)) % 3]; setTab(next); document.getElementById(`tab-${next}`)?.focus(); } }} onClick={() => setTab(key)}>{label}</button>)}</div>
      <div className="admin-editor-body">
        {error && <div className="admin-alert admin-alert--error" role="alert">{error}</div>}
        <section id="panel-info" role="tabpanel" aria-labelledby="tab-info" hidden={tab !== "info"}>
          <div className="admin-field"><label htmlFor="entry-name">{config.nameLabel} <span>*</span></label><input autoFocus id="entry-name" value={entry.name} onChange={event => update("name", event.target.value)} maxLength={120} placeholder={config.placeholder} /></div>
          <div className="admin-field"><label htmlFor="entry-description">{config.aboutLabel}</label><textarea id="entry-description" rows={4} value={entry.description} onChange={event => update("description", event.target.value)} maxLength={5000} placeholder="Conte o que torna este achado especial e o que o visitante precisa saber..." /><small>{entry.description.length}/5.000 · Mínimo de 30 caracteres para publicar.</small></div>
          <div className="admin-form-grid"><div className="admin-field"><label htmlFor="entry-category">{config.categoryLabel}</label><select id="entry-category" value={entry.category} onChange={event => update("category", event.target.value)}>{[...new Set([...config.categories, entry.category])].filter(Boolean).map(value => <option key={value}>{value}</option>)}</select></div>{(entry.kind === "stay" || isGuide) && <div className="admin-field"><label htmlFor="entry-cadastur">Registro Cadastur</label><input id="entry-cadastur" value={entry.cadastur} onChange={event => update("cadastur", event.target.value)} placeholder="Número do registro (opcional)" maxLength={40} /></div>}</div>
          <fieldset className="admin-checks"><legend>{config.featuresLabel}</legend>{[...new Set([...config.features, ...entry.amenities])].map(value => <label key={value}><input type="checkbox" checked={entry.amenities.includes(value)} onChange={() => toggle("amenities", value)} />{value}</label>)}</fieldset>
          {isGuide && <fieldset className="admin-checks"><legend>Idiomas</legend>{["Português", "Inglês", "Espanhol", "Francês", "Libras"].map(value => <label key={value}><input type="checkbox" checked={entry.languages.includes(value)} onChange={() => toggle("languages", value)} />{value}</label>)}</fieldset>}
          <label className="admin-feature-toggle"><Star size={25} weight={entry.featured ? "fill" : "regular"} /><span><strong>Destacar no Achei</strong><small>Dê mais visibilidade a este achado na página inicial.</small></span><input type="checkbox" checked={entry.featured} onChange={event => update("featured", event.target.checked)} /></label>
        </section>
        <section id="panel-contact" role="tabpanel" aria-labelledby="tab-contact" hidden={tab !== "contact"}>
          <div className="admin-form-grid"><div className="admin-field"><label htmlFor="entry-city">Cidade <span>*</span></label><input id="entry-city" value={entry.city} onChange={event => update("city", event.target.value)} placeholder="Ex.: Campos do Jordão" maxLength={100} /></div><div className="admin-field"><label htmlFor="entry-state">Estado</label><select id="entry-state" value={entry.state} onChange={event => update("state", event.target.value)}>{states.map(state => <option key={state}>{state}</option>)}</select></div></div>
          <div className="admin-field"><label htmlFor="entry-address">{isGuide ? "Ponto de encontro / região atendida" : "Endereço"}</label><input id="entry-address" value={entry.address} onChange={event => update("address", event.target.value)} placeholder="Rua, número, bairro ou região" maxLength={250} /></div>
          <div className="admin-form-grid"><div className="admin-field"><label htmlFor="entry-phone">WhatsApp / telefone</label><input id="entry-phone" type="tel" value={entry.phone} onChange={event => update("phone", event.target.value)} placeholder="(12) 99999-9999" maxLength={25} /><small>{config.phoneRequired ? "Inclua o DDD. Obrigatório para publicar." : "Opcional. Informe o contato do responsável, se houver."}</small></div><div className="admin-field"><label htmlFor="entry-email">E-mail de contato</label><input id="entry-email" type="email" value={entry.email} onChange={event => update("email", event.target.value)} placeholder="contato@exemplo.com.br" maxLength={150} /></div></div>
          <div className="admin-field"><label htmlFor="entry-website">Site ou Instagram</label><input id="entry-website" type="url" value={entry.website} onChange={event => update("website", event.target.value)} placeholder="https://" maxLength={500} /></div><div className="admin-note">Os contatos cadastrados serão exibidos no perfil público quando você publicar.</div>
        </section>
        <section id="panel-photos" role="tabpanel" aria-labelledby="tab-photos" hidden={tab !== "photos"}>
          <div className="admin-section-heading"><div><h3>Um lugar para se encantar</h3><p>Adicione até 12 fotos. A primeira será a capa do cadastro.</p></div><ImageSquare size={28} /></div>
          <input className="admin-visually-hidden" ref={picker} type="file" multiple accept="image/jpeg,image/png,image/webp" aria-label="Selecionar fotos" onChange={event => { if (event.target.files) void addPhotos(event.target.files); }} />
          <button type="button" className={`admin-upload ${dragging ? "is-dragging" : ""}`} disabled={busy || uploading} onClick={() => picker.current?.click()} onDragOver={event => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={event => { event.preventDefault(); setDragging(false); void addPhotos(event.dataTransfer.files); }}>{uploading ? <SpinnerGap className="admin-spin" size={32} /> : <UploadSimple size={32} />}<strong>{uploading ? "Preparando suas fotos…" : "Arraste suas fotos ou clique para selecionar"}</strong><span>JPG, PNG ou WebP · Até 5 MB por foto</span></button>
          <div className="admin-photo-editor">{entry.photos.map((photo, index) => <div key={photo.id}><Image src={photo.url} alt={photo.name} width={480} height={250} unoptimized />{index === 0 && <span className="admin-cover-badge"><Star size={12} weight="fill" />Capa</span>}<div><button type="button" disabled={index === 0 || busy} onClick={() => update("photos", [photo, ...entry.photos.filter(item => item.id !== photo.id)])}>{index === 0 ? <><Check size={14} />Capa atual</> : "Usar como capa"}</button><button type="button" disabled={busy} aria-label={`Remover foto ${photo.name}`} onClick={() => update("photos", entry.photos.filter(item => item.id !== photo.id))}><Trash size={16} /></button></div></div>)}</div>
          <p className="admin-subtle">As fotos são otimizadas automaticamente. Remover aqui desvincula a foto do cadastro; o arquivo original é preservado.</p>
        </section>
      </div>
      <footer className="admin-editor-footer"><button type="button" className="admin-button admin-button--ghost" onClick={close} disabled={busy || uploading}><ArrowLeft />Cancelar</button><div><button type="button" className="admin-button admin-button--outline" disabled={busy || uploading} onClick={() => void save("draft")}>Salvar rascunho</button><button type="submit" className="admin-button" disabled={busy || uploading}>{busy ? <SpinnerGap className="admin-spin" /> : <Plus />} {busy ? "Salvando…" : "Salvar e publicar"}</button></div></footer>
    </form>
  </dialog>;
}
