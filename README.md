# Achei Turismo

Site de turismo com catálogo público e painel administrativo para pousadas, guias, gastronomia, trilhas, ecoturismo e destinos.

- Site: [www.acheioturismo.com.br](https://www.acheioturismo.com.br)
- Painel: [www.acheioturismo.com.br/admin](https://www.acheioturismo.com.br/admin)
- Aplicativo: Next.js, React e TypeScript, hospedados na Vercel.
- Dados e sessões: Cloudflare D1, acessado pelo servidor por um Worker privado.
- Login: Better Auth. Fotos: Cloudinary.

## Executar localmente

Requer Node.js 24 e npm.

```powershell
npm ci
Copy-Item .env.example .env.local
```

Preencha `.env.local` com as credenciais dos serviços e execute:

```powershell
npm run dev -- --port 3005
```

Abra `http://localhost:3005`. O painel fica em `/admin`.

## Verificações e build

```powershell
npm run build
npm run typecheck
npm run lint
```

O build também gera os tipos de rotas usados pelo TypeScript. Para executar o build local, são necessárias as variáveis descritas em `.env.example`.

## Configuração e publicação

Consulte [docs/ADMIN.md](docs/ADMIN.md) para configurar o Worker, inicializar o banco, autorizar administradores, enviar fotos e publicar na Vercel. A Vercel recebe as variáveis de ambiente pela configuração do projeto, separadas por ambiente.

O GitHub guarda o código, os arquivos públicos e os scripts de infraestrutura. Os cadastros, usuários e fotos enviados pelo painel permanecem nos serviços correspondentes. Senhas, tokens, arquivos `.env.local`, backups e credenciais locais são ignorados pelo Git e não devem ser adicionados ao repositório.
