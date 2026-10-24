"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Archive, ArrowRight, ArrowSquareOut, ArrowUpRight, Buildings, CaretRight, CheckCircle, Compass, ForkKnife, GearSix, House, ImageSquare, Info, List, MagnifyingGlass, MapPin, Mountains, PencilSimple, Plus, ShieldCheck, SignOut, SpinnerGap, Star, Trash, X } from "@phosphor-icons/react";
import { deleteEntry, friendlyError, listEntries, newEntry, saveEntry } from "@/lib/admin-store";
import { entryConfig } from "@/lib/entry-config";
import { adminPreviewMode, backendConfigured, getAdminSession, signIn, signOut, type AdminUser } from "@/lib/admin-api";
import { PasswordSetup } from "./PasswordSetup";
import { PasswordInput } from "./PasswordInput";
import { ENTRY_KINDS, type AdminEntry, type EntryKind } from "@/types/admin";
import { EntryEditor } from "./EntryEditor";
import { DeleteEntryDialog } from "./DeleteEntryDialog";
import "./admin.css";

const catalogViews = { stays: "stay", guides: "guide", food: "food", nature: "nature", destination: "destination" } as const;
type CatalogView = keyof typeof catalogViews;
type View = "overview" | CatalogView | "photos" | "settings" | "all";
const navigation = [
  { id: "overview" as const, label: "Visão geral", icon: House },
  { id: "stays" as const, label: "Pousadas", icon: Buildings },
  { id: "guides" as const, label: "Guias de turismo", icon: Compass },
  { id: "food" as const, label: "Gastronomia", icon: ForkKnife },
  { id: "nature" as const, label: "Trilhas e ecoturismo", icon: Mountains },
  { id: "destination" as const, label: "Destinos imperdíveis", icon: MapPin },
  { id: "photos" as const, label: "Galeria de fotos", icon: ImageSquare },
];
const statusLabels = { published: "Publicado", draft: "Rascunho", archived: "Arquivado" };

function Brand() { return <div className="admin-brand"><Image src="/images/logo-achei-oficial.webp" width={46} height={46} alt="Achei Turismo" /><div><strong>achei<span>turismo</span></strong><small>PAINEL ADMINISTRATIVO</small></div></div>; }

export function AdminDashboard() {
  const [view, setView] = useState<View>("overview");
  const [entries, setEntries] = useState<AdminEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(backendConfigured && !adminPreviewMode);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [authorized, setAuthorized] = useState(adminPreviewMode);
  const [storageReady, setStorageReady] = useState(false);
  const [setupToken, setSetupToken] = useState("");
  const [passwordNotice, setPasswordNotice] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editor, setEditor] = useState<AdminEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<AdminEntry | null>(null);
  const [newKind, setNewKind] = useState<EntryKind>("stay");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [busyId, setBusyId] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");
    const update = () => setIsMobile(media.matches);
    update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!mobileMenu) return;
    sidebarRef.current?.querySelector("button")?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setMobileMenu(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileMenu]);

  useEffect(() => {
    const token = new URLSearchParams(window.location.hash.slice(1)).get("setup");
    if (token) { setSetupToken(token); window.history.replaceState(null, "", window.location.pathname); }
    if (!backendConfigured || adminPreviewMode) return;
    let active = true;
    async function refreshSession() {
      try {
        const session = await getAdminSession();
        if (active) { setUser(session.user); setAuthorized(session.authorized); setStorageReady(session.storageReady); }
      } catch (cause) { if (active) setError(friendlyError(cause)); }
      finally { if (active) setAuthLoading(false); }
    }
    const expired = () => { setUser(null); setAuthorized(false); setEntries([]); };
    void refreshSession();
    window.addEventListener("achei:session-expired", expired);
    return () => { active = false; window.removeEventListener("achei:session-expired", expired); };
  }, []);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setEntries(await listEntries()); }
    catch (cause) { setError(friendlyError(cause)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { if (authorized) void load(); }, [authorized, load]);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(""), 5000); return () => clearTimeout(timer); }, [notice]);

  const stays = entries.filter(entry => entry.kind === "stay" && entry.status !== "archived");
  const guides = entries.filter(entry => entry.kind === "guide" && entry.status !== "archived");
  const published = entries.filter(entry => entry.status === "published");
  const drafts = entries.filter(entry => entry.status === "draft");
  const allPhotos = entries.filter(entry => entry.status !== "archived").flatMap(entry => entry.photos.map(photo => ({ ...photo, entry })));
  const currentKind = catalogViews[view as CatalogView] || null;
  const config = entryConfig[currentKind || newKind];
  const counts = Object.fromEntries(ENTRY_KINDS.map(kind => [kind, entries.filter(entry => entry.kind === kind && entry.status !== "archived").length]));
  const candidates = entries.filter(entry => !currentKind || entry.kind === currentKind);
  const filtered = candidates.filter(entry => (status === "all" || entry.status === status) && `${entry.name} ${entry.city} ${entry.state}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(search.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()));

  function changeView(next: View) { setView(next); setMobileMenu(false); setSearch(""); setStatus("all"); }
  function create(kind: EntryKind) { setEditor(newEntry(kind)); }
  async function remove(entry: AdminEntry) {
    await deleteEntry(entry.id);
    setEntries(current => current.filter(item => item.id !== entry.id));
    setEntryToDelete(null);
    setNotice("Cadastro excluído do painel e do site.");
  }
  async function save(entry: AdminEntry) {
    const saved = await saveEntry(entry);
    setEntries(current => [saved, ...current.filter(item => item.id !== saved.id)]);
    setEditor(null);
    setNotice(entry.status === "published" ? backendConfigured ? "Cadastro publicado no site." : "Cadastro publicado na prévia deste navegador." : "Rascunho salvo com sucesso.");
  }
  async function archive(entry: AdminEntry) {
    if (entry.status !== "archived" && !window.confirm(`Arquivar “${entry.name}”? O cadastro sairá do site e poderá ser restaurado como rascunho.`)) return;
    setBusyId(entry.id); setError("");
    try {
      const saved = await saveEntry({ ...entry, status: entry.status === "archived" ? "draft" : "archived" });
      setEntries(current => current.map(item => item.id === saved.id ? saved : item));
      setNotice(saved.status === "archived" ? "Cadastro arquivado. Você pode restaurá-lo pelo filtro Arquivados." : "Cadastro restaurado como rascunho.");
    } catch (cause) { setError(friendlyError(cause)); }
    finally { setBusyId(""); }
  }
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoginBusy(true);
    const data = new FormData(event.currentTarget);
    try {
      const session = await signIn(String(data.get("email")), String(data.get("password")));
      setUser(session.user); setAuthorized(session.authorized); setStorageReady(session.storageReady);
      if (!session.authorized) setError("Esta conta não tem acesso de administrador.");
    }
    catch (cause) { setError(friendlyError(cause)); }
    finally { setLoginBusy(false); }
  }
  async function logout() {
    setError("");
    try { await signOut(); setUser(null); setAuthorized(false); setEntries([]); }
    catch (cause) { setError(friendlyError(cause)); }
  }

  if (setupToken) return <PasswordSetup token={setupToken} onComplete={() => { setUser(null); setAuthorized(false); setEntries([]); setError(""); setSetupToken(""); setPasswordNotice("Senha definida com sucesso. Entre com seu e-mail e a nova senha."); }} onBack={() => setSetupToken("")} />;
  if (authLoading) return <div className="admin-app admin-loading"><SpinnerGap className="admin-spin" size={32} /><p>Preparando seu painel…</p></div>;

  if (!backendConfigured && !adminPreviewMode) return <div className="admin-app admin-loading"><div><Brand /><h1>Configuração necessária</h1><p>A conexão do painel está sendo preparada. Tente novamente em instantes.</p><Link className="admin-button" href="/">Voltar ao site</Link></div></div>;

  if (!authorized) return <div className="admin-app admin-login"><section className="admin-login-story"><Brand /><div><span className="admin-eyebrow">CUIDE DOS SEUS MELHORES ACHADOS</span><h1>Grandes experiências.<br /><em>Começam aqui.</em></h1><p>Um espaço para conectar pousadas, guias e viajantes ao melhor da nossa região.</p></div><small>Serra da Mantiqueira · Brasil</small></section><section className="admin-login-form"><div><ShieldCheck size={36} /><span className="admin-eyebrow">ACESSO RESTRITO</span><h2>Bem-vindo de volta.</h2><p>Entre na sua conta para gerenciar o Achei Turismo.</p>{error && <div className="admin-alert admin-alert--error" role="alert">{error}</div>}{passwordNotice && <div className="admin-alert" role="status">{passwordNotice}</div>}{user ? <><p className="admin-account-email">{user.email}</p><p className="admin-subtle">Peça ao responsável pelo site para liberar o acesso desta conta.</p><button className="admin-button" onClick={() => void logout()}>Entrar com outra conta</button></> : <form onSubmit={login}><div className="admin-field"><label htmlFor="admin-email">E-mail</label><input id="admin-email" name="email" type="email" required autoComplete="username" placeholder="seu@email.com.br" /></div><div className="admin-field"><label htmlFor="admin-password">Senha</label><PasswordInput id="admin-password" name="password" required autoComplete="current-password" placeholder="Sua senha" /></div><button className="admin-button" disabled={loginBusy}>{loginBusy ? <SpinnerGap className="admin-spin" /> : <ArrowRight />} {loginBusy ? "Entrando…" : "Entrar no painel"}</button></form>}<Link className="admin-back-link" href="/">← Voltar ao site</Link></div></section></div>;

  function renderTable(rows: AdminEntry[], compact = false) {
    return rows.length ? <div className="admin-table-wrap"><table className={`admin-table ${compact ? "" : "admin-table--full"}`}><thead><tr><th>{currentKind === "guide" ? "Guia" : "Cadastro"}</th><th>Localização</th><th>Status</th>{!compact && <th>Fotos</th>}<th><span className="admin-visually-hidden">Ações</span></th></tr></thead><tbody>{rows.map(entry => <tr key={entry.id}><td><div className="admin-table-name">{entry.photos[0] ? <Image src={entry.photos[0].url} alt="" width={102} height={88} unoptimized /> : <span className="admin-thumbnail-placeholder"><ImageSquare size={22} /></span>}<div><strong>{entry.name}{entry.featured && <Star weight="fill" size={13} aria-label="Destaque" />}</strong><small>{entry.category || entryConfig[entry.kind].title}</small></div></div></td><td><span className="admin-table-location"><MapPin size={14} />{entry.city}, {entry.state}</span></td><td><span className={`admin-status admin-status--${entry.status}`}><i />{statusLabels[entry.status]}</span></td>{!compact && <td className="admin-photo-count"><ImageSquare size={16} />{entry.photos.length}</td>}<td><div className="admin-row-actions"><button className="admin-icon-button" aria-label={`Editar ${entry.name}`} onClick={() => setEditor(entry)}><PencilSimple size={18} /></button>{!compact && <button className="admin-icon-button" aria-label={`${entry.status === "archived" ? "Restaurar" : "Arquivar"} ${entry.name}`} onClick={() => void archive(entry)} disabled={busyId === entry.id}>{busyId === entry.id ? <SpinnerGap className="admin-spin" /> : <Archive size={18} />}</button>}{!compact && <button className="admin-icon-button admin-icon-button--danger" aria-label={`Excluir ${entry.name}`} onClick={() => setEntryToDelete(entry)} disabled={busyId === entry.id}><Trash size={18} /></button>}</div></td></tr>)}</tbody></table></div> : <div className="admin-empty"><Compass size={38} weight="duotone" /><h3>{search || status !== "all" ? "Nenhum resultado por aqui" : "Seu próximo achado começa aqui"}</h3><p>{search || status !== "all" ? "Tente outro nome, cidade ou filtro." : config.description}</p>{search || status !== "all" ? <button className="admin-button admin-button--outline" onClick={() => { setSearch(""); setStatus("all"); }}>Limpar filtros</button> : <button className="admin-button" onClick={() => create(currentKind || newKind)}><Plus />{config.createLabel}</button>}</div>;
  }

  return <div className="admin-app">
    {mobileMenu && <button className="admin-menu-backdrop" aria-label="Fechar menu" onClick={() => setMobileMenu(false)} />}
    <aside ref={sidebarRef} inert={isMobile && !mobileMenu} className={`admin-sidebar ${mobileMenu ? "is-open" : ""}`}><button className="admin-sidebar-close admin-icon-button" aria-label="Fechar navegação" onClick={() => setMobileMenu(false)}><X size={20} /></button><Brand /><span className="admin-nav-label">ESPAÇO DE GESTÃO</span><nav aria-label="Menu administrativo">{navigation.map(({ id, label, icon: Icon }) => <button key={id} className={view === id ? "is-active" : ""} aria-current={view === id ? "page" : undefined} onClick={() => changeView(id)}><Icon size={21} weight={view === id ? "fill" : "regular"} />{label}{catalogViews[id as CatalogView] && <span>{counts[catalogViews[id as CatalogView]]}</span>}</button>)}</nav><div className="admin-sidebar-bottom"><div className="admin-sidebar-tip"><span><Compass size={23} /></span><strong>Mais histórias para contar.</strong><p>Cada novo cadastro é um convite para descobrir a nossa região.</p><Link href="/" target="_blank">Explorar o site <ArrowUpRight size={16} /></Link></div><button className={view === "settings" ? "is-active" : ""} onClick={() => changeView("settings")}><GearSix size={21} />Configurações</button><div className="admin-account"><span className="admin-avatar">A</span><div><strong>Administrador</strong><small>{backendConfigured ? user?.email : "Prévia local"}</small></div>{backendConfigured && <button aria-label="Sair do painel" onClick={() => void logout()}><SignOut size={20} /></button>}</div></div></aside>
    <div className="admin-workspace"><header className="admin-topbar"><div><button className="admin-mobile-toggle admin-icon-button" aria-label="Abrir menu" onClick={() => setMobileMenu(true)}><List size={24} /></button><span>Espaço de gestão</span><CaretRight size={13} /><strong>{navigation.find(item => item.id === view)?.label || (view === "all" ? "Todos os cadastros" : "Configurações")}</strong></div><Link href="/" target="_blank">Ver site <ArrowSquareOut size={17} /></Link></header>
      <main id="admin-main" className="admin-main">
        {!backendConfigured && <div className="admin-demo-banner"><Info size={19} /><p><strong>Modo de prévia.</strong> Os dados e fotos ficam apenas neste navegador. Conecte o painel para publicar para todos.</p><button onClick={() => changeView("settings")}>Configurar <ArrowRight size={15} /></button></div>}
        {error && <div className="admin-alert admin-alert--error" role="alert">{error}<button onClick={() => void load()}>Tentar novamente</button></div>}
        {notice && <div className="admin-toast" role="status"><CheckCircle size={21} weight="fill" />{notice}<button aria-label="Fechar aviso" onClick={() => setNotice("")}><X /></button></div>}
        {view === "overview" && <>
          <div className="admin-page-heading"><div><span className="admin-eyebrow">SEJA BEM-VINDO AO ACHEI</span><h1>Cuidar de cada <em>achado.</em></h1><p>Seu ponto de partida para conectar pessoas a lugares incríveis.</p></div><button className="admin-button" onClick={() => create("stay")}><Plus size={18} />Nova pousada</button></div>
          <section className="admin-stats" aria-label="Resumo do catálogo">{[{ label: "Pousadas cadastradas", value: stays.length, icon: Buildings, sub: "Refúgios para descobrir", view: "stays" as View }, { label: "Guias de turismo", value: guides.length, icon: Compass, sub: "Quem conhece o caminho", view: "guides" as View }, { label: "Fotos na galeria", value: allPhotos.length, icon: ImageSquare, sub: "Imagens que inspiram", view: "photos" as View }, { label: "Cadastros publicados", value: published.length, icon: CheckCircle, sub: backendConfigured ? "Disponíveis no site" : "Disponíveis na prévia", view: "all" as View }].map(({ label, value, icon: Icon, sub, view: target }, index) => <button className={`admin-stat ${index === 3 ? "admin-stat--green" : ""}`} key={label} onClick={() => { changeView(target); if (index === 3) setStatus("published"); }}><div><span>{label}</span><Icon size={23} weight="duotone" /></div><strong>{loading ? "—" : String(value).padStart(2, "0")}</strong><small>{sub}<ArrowUpRight size={14} /></small></button>)}</section>
          <section className="admin-category-shortcuts" aria-label="Novas categorias do catálogo">{[{ kind: "food" as const, icon: ForkKnife }, { kind: "nature" as const, icon: Mountains }, { kind: "destination" as const, icon: MapPin }].map(({ kind, icon: Icon }) => <button key={kind} onClick={() => changeView(kind)}><Icon size={26} /><span><strong>{entryConfig[kind].title}</strong><small>{counts[kind]} cadastro{counts[kind] === 1 ? "" : "s"}</small></span><ArrowUpRight size={18} /></button>)}</section>
          <section className="admin-welcome-grid"><div className="admin-feature-card"><Image src="/images/hero-mantiqueira-poster.webp" alt="Montanhas e vales da Serra da Mantiqueira" fill sizes="(max-width: 760px) 100vw, 50vw" /><div><span className="admin-eyebrow">A NOSSA REGIÃO MERECE SER VISTA</span><h2>Novos lugares.<br /><em>Boas descobertas.</em></h2><p>Apresente uma pousada, compartilhe uma história<br className="admin-desktop-break" /> e inspire a próxima viagem.</p><button className="admin-button admin-button--lime" onClick={() => create("stay")}>Cadastrar pousada<ArrowUpRight size={18} /></button></div><span className="admin-feature-location"><MapPin weight="fill" size={13} />Serra da Mantiqueira</span></div><div className="admin-guide-card"><span className="admin-guide-icon"><Compass size={31} weight="duotone" /></span><span className="admin-eyebrow">CONEXÕES QUE TRANSFORMAM</span><h2>Quem conhece,<br />guia melhor.</h2><p>Valorize quem transforma um passeio em uma experiência inesquecível.</p><button onClick={() => create("guide")}>Cadastrar guia <ArrowRight size={20} /></button><div className="admin-guide-decoration" aria-hidden="true"><Compass size={180} weight="thin" /></div></div></section>
          <section className="admin-panel"><div className="admin-panel-heading"><div><h2>Últimos cadastros</h2><p>Seus achados mais recentes, em um só lugar.</p></div><button className="admin-text-button" onClick={() => changeView("all")}>Ver todos<ArrowRight size={17} /></button></div>{loading ? <div className="admin-loading-inline"><SpinnerGap className="admin-spin" />Carregando cadastros…</div> : renderTable(entries.slice(0, 5), true)}</section>
          <div className="admin-bottom-note"><ShieldCheck size={17} /><span>{drafts.length ? `${drafts.length} cadastro${drafts.length > 1 ? "s" : ""} em rascunho. Publique quando estiver tudo pronto.` : "Tudo no seu tempo. Salve rascunhos e publique quando estiver pronto."}</span><span>Feito para descobrir. E para conectar.</span></div>
        </>}
        {(currentKind || view === "all") && <><div className="admin-page-heading"><div><span className="admin-eyebrow">SEUS ACHADOS, BEM CUIDADOS</span><h1>{view === "all" ? "Todos os cadastros" : config.title}<span className="admin-title-count">{candidates.length}</span></h1><p>{view === "all" ? "Gerencie todos os achados do site em um só lugar." : config.description}</p></div><div className="admin-create-control">{view === "all" && <label><span className="admin-visually-hidden">Tipo do novo cadastro</span><select aria-label="Tipo do novo cadastro" value={newKind} onChange={event => setNewKind(event.target.value as EntryKind)}>{ENTRY_KINDS.map(kind => <option key={kind} value={kind}>{entryConfig[kind].title}</option>)}</select></label>}<button className="admin-button" onClick={() => create(currentKind || newKind)}><Plus size={18} />{config.createLabel}</button></div></div><section className="admin-panel"><div className="admin-list-toolbar"><div className="admin-filter-tabs" aria-label="Filtrar por status">{[["all", "Todos"], ["published", "Publicados"], ["draft", "Rascunhos"], ["archived", "Arquivados"]].map(([key, label]) => <button key={key} aria-pressed={status === key} className={status === key ? "is-active" : ""} onClick={() => setStatus(key)}>{label}<span>{key === "all" ? candidates.length : candidates.filter(item => item.status === key).length}</span></button>)}</div><label className="admin-search"><MagnifyingGlass size={19} /><input aria-label="Buscar por nome ou cidade" value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar por nome ou cidade…" /></label></div>{loading ? <div className="admin-loading-inline"><SpinnerGap className="admin-spin" />Carregando…</div> : renderTable(filtered)}<div className="admin-table-footer">{filtered.length} de {candidates.length} cadastros<span>Organize. Inspire. Conecte.</span></div></section></>}
        {view === "photos" && <><div className="admin-page-heading"><div><span className="admin-eyebrow">CADA IMAGEM, UMA NOVA DESCOBERTA</span><h1>Galeria de fotos<span className="admin-title-count">{allPhotos.length}</span></h1><p>As imagens que dão vida a todos os achados do Achei.</p></div></div><div className="admin-note"><Info size={19} />Para adicionar fotos ou mudar a capa, abra o cadastro do achado.</div>{allPhotos.length ? <section className="admin-media-grid">{allPhotos.map(photo => <button key={`${photo.entry.id}-${photo.id}`} onClick={() => setEditor(photo.entry)}><div><Image src={photo.url} alt={photo.name} width={640} height={426} unoptimized /><span><PencilSimple size={17} />Gerenciar fotos</span></div><strong>{photo.entry.name}</strong><small>{photo.entry.city}, {photo.entry.state}</small></button>)}</section> : <div className="admin-panel admin-empty"><ImageSquare size={40} /><h3>As próximas histórias merecem uma foto.</h3><p>Cadastre seu primeiro achado para começar a galeria.</p><button className="admin-button" onClick={() => create("stay")}><Plus />Cadastrar pousada</button></div>}</>}
        {view === "settings" && <><div className="admin-page-heading"><div><span className="admin-eyebrow">SEU ESPAÇO, CONECTADO</span><h1>Configurações</h1><p>Acesso e publicação dos seus achados.</p></div></div><section className="admin-panel admin-settings"><ShieldCheck size={32} /><div><h2>{adminPreviewMode ? "Prévia neste navegador" : "Painel conectado"}</h2><p>{adminPreviewMode ? "Os cadastros desta prévia ficam somente neste navegador." : "Seus cadastros ficam salvos na nuvem. Ao publicar um cadastro, as informações aparecem na categoria correspondente do site."}</p><p>Você está usando a conta <strong>{user?.email || "de prévia"}</strong>.</p><p>{storageReady || adminPreviewMode ? "O envio de fotos está disponível. Adicione imagens pelo formulário de cada cadastro." : "O envio de novas fotos está aguardando a conexão com o armazenamento. Os cadastros podem ser salvos como rascunho."}</p><p className="admin-subtle">Arquivar retira o cadastro do site. Você pode restaurá-lo depois pelo filtro Arquivados.</p></div></section></>}
      </main><footer className="admin-footer"><span>© {new Date().getFullYear()} Achei Turismo</span><span>Um olhar especial para o que é daqui.<span className="admin-footer-dot" /></span></footer>
    </div>{entryToDelete && <DeleteEntryDialog entry={entryToDelete} onClose={() => setEntryToDelete(null)} onDelete={remove} />}{editor && <EntryEditor key={editor.id} initial={editor} existingSlugs={entries.filter(item => item.id !== editor.id).map(item => item.slug)} onClose={() => setEditor(null)} onSave={save} />}
  </div>;
}
