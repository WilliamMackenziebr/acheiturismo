# Painel administrativo — Achei Turismo

O painel fica em `/admin`. O site usa Cloudflare D1 para usuários, sessões e cadastros; Better Auth para o login; Cloudinary Free para as fotos; e Vercel para o aplicativo Next.js. O Firebase não é mais usado pelo código.

## Serviços conectados

- Conta Cloudflare: `c9a043eebb2d4057118daf263b51f53d`.
- Banco exclusivo: `achei-turismo-db`, ID `8be8f940-bb0f-4c96-bd35-c7fa74b4369b`.
- Worker privado: `achei-turismo-db-bridge`. Ele aceita somente consultas autenticadas pelo servidor. O segredo não chega ao navegador.
- Endereço atual do Worker: `https://achei-turismo-db-bridge.macksystem.workers.dev`. Em 24/10/2026, o endereço anterior no subdomínio `vemdeperto.workers.dev` deixou de resolver; a configuração local e os três ambientes da Vercel foram atualizados para o endereço atual, mantendo o mesmo banco e segredo privado.
- Vercel: `macksystem/acheiturismo`, domínio principal `https://www.acheioturismo.com.br` e endereço anterior `https://acheiturismo.vercel.app`.
- Conta administradora solicitada: `acheioturismo@gmail.com`. A conta anterior `acheiturismo2026@gmail.com` é preservada.

Em 24/10/2026, o deployment `dpl_AQhUggc2A37xyEfComYFwLChUFCd` (`acheiturismo-k3x07y3u3-macksystem.vercel.app`) acrescentou o botão de mostrar/ocultar senha ao login e aos dois campos de definição de senha. A visibilidade começa oculta e é independente por campo; o botão tem nome acessível e não envia o formulário. A validação no navegador local confirmou alternância por clique e teclado, preservação dos valores e layout móvel. Typecheck, lint e build passaram, e a versão foi promovida para produção.

Em 24/10/2026, a conta `acheioturismo@gmail.com` foi criada e autorizada no D1, com a senha solicitada processada pelo Better Auth e armazenada somente como hash. Foram verificados login, leitura de sessão e logout com as origens do novo domínio e do endereço anterior, cookies Secure/HttpOnly e recusa de origem externa. As sessões de teste foram encerradas e o arquivo temporário com a senha foi removido. Typecheck, lint e build da Vercel passaram. O deployment `dpl_A3PrD7DAbqqN3LWzYoXEQGC52SaA` (`acheiturismo-qbo26cpl7-macksystem.vercel.app`) foi promovido para produção com a configuração atual do domínio e do serviço privado da Cloudflare.

Em 23/10/2026, a versão `dpl_EgLTw4oKBdQCQP9GqrZfXoWXgMCC` foi compilada com sucesso e promovida para produção, acrescentando Gastronomia, Trilhas e ecoturismo e Destinos imperdíveis, com criação, edição e exclusão. A listagem de aliases da Vercel confirmou `acheiturismo.vercel.app` apontando para `acheiturismo-64a715rcz-macksystem.vercel.app`. A validação das novas operações foi executada localmente com D1 isolado e upload real no Cloudinary; a publicação foi confirmada pelo status e pelos aliases da Vercel. Após a publicação, a consulta direta ao D1 de produção confirmou seis cadastros publicados: duas pousadas, dois estabelecimentos de gastronomia, uma experiência de natureza e um destino, com os registros anteriores preservados e nenhum cadastro temporário de teste.

Em 23/10/2026, a consulta das coleções administrativas do Firebase retornou zero documentos. Uma cópia dessa consulta e das configurações antigas foi guardada em `.playwright-cli/`, ignorado pelo Git. As duas hospedagens originais foram importadas no D1 com os mesmos IDs. O projeto remoto Firebase foi preservado; seus recursos não foram excluídos.

O plano Free do Cloudinary foi confirmado pela API. Foi verificado um envio real pelo navegador, conversão para WebP, seleção da capa, persistência no D1 e acesso público à imagem.

## Configuração local e na Vercel

Copie os nomes de `.env.example` para `.env.local` e configure:

| Variável | Uso |
| --- | --- |
| `NEXT_PUBLIC_ADMIN_BACKEND=cloudflare` | Ativa a conexão do painel e catálogo |
| `CLOUDFLARE_DB_URL` | Endereço HTTPS do Worker privado |
| `CLOUDFLARE_DB_SECRET` | Mesmo valor do segredo `DB_BRIDGE_SECRET` do Worker |
| `BETTER_AUTH_SECRET` | Segredo aleatório de pelo menos 32 caracteres |
| `BETTER_AUTH_URL` | `http://localhost:3005` localmente; `https://www.acheioturismo.com.br` em produção |
| `CLOUDINARY_CLOUD_NAME` | Identificador do ambiente Cloudinary |
| `CLOUDINARY_API_KEY` | Chave da API de imagens |
| `CLOUDINARY_API_SECRET` | Segredo para assinar os uploads, somente no servidor |

Em previews Vercel, o login usa automaticamente o domínio do deployment. Os segredos de banco, login e imagens devem ser cadastrados como Sensitive/Secret em Production e Preview. No Development, a Vercel permite somente variáveis comuns; elas continuam fora do código público. Nunca use o prefixo `NEXT_PUBLIC_` em um segredo.

O domínio `acheioturismo.com.br` redireciona para `www.acheioturismo.com.br` na Vercel. O login de produção resolve o endereço por requisição, aceitando somente os domínios explícitos do projeto em `src/lib/server/auth-origin.ts`, com HTTPS e cookies próprios de cada endereço. O endereço anterior na Vercel continua aceito. Em desenvolvimento, o endereço local permanece configurável; previews usam o hostname do deployment. Ao configurar outro domínio, atualize a lista permitida e `BETTER_AUTH_URL` antes de publicar. Senhas são cadastradas pelo Better Auth com hash e nunca devem ser gravadas no código ou na documentação.

`.env.local` e `.env.cloudinary.local` são ignorados pelo Git e pelo deploy. O arquivo separado do Cloudinary serve para preencher as credenciais localmente; o aplicativo lê as variáveis efetivas de `.env.local` ou da Vercel.

## Infraestrutura e administração

O Worker está em `cloudflare/worker.js` e a ligação com o D1 em `cloudflare/wrangler.jsonc`. Não há autenticação de usuário nem hashing de senha no Worker: isso roda no servidor Node.js da Vercel. O Worker não fornece uma API pública de SQL sem a chave privada.

Para instalar e publicar o Worker, usando uma conta Cloudflare autorizada:

```powershell
npm ci --prefix cloudflare
npx --prefix cloudflare wrangler deploy --config cloudflare/wrangler.jsonc
npx --prefix cloudflare wrangler secret put DB_BRIDGE_SECRET --config cloudflare/wrangler.jsonc
```

Digite no prompt o mesmo segredo definido em `CLOUDFLARE_DB_SECRET`. Nenhum plano pago ou R2 é necessário para esta integração. As franquias gratuitas dos serviços continuam sujeitas aos respectivos limites; não ative upgrades automáticos.

O script abaixo requer Node.js 24 e as variáveis locais. Ele usa o adaptador nativo D1 do Better Auth, aplica as migrações necessárias e preserva linhas existentes:

```powershell
node --experimental-transform-types --env-file=.env.local scripts/provision-cloudflare.mts init
```

O schema do Better Auth está em `cloudflare/auth-schema.sql`; o catálogo e as permissões estão em `cloudflare/schema.sql`. Não execute o primeiro SQL novamente sobre tabelas existentes: use o comando `init` para detectar alterações.

Criar/autorizar o administrador e gerar um link de definição de senha:

```powershell
node --experimental-transform-types --env-file=.env.local scripts/provision-cloudflare.mts admin novo-admin@example.com
```

Substitua o e-mail do exemplo pela conta desejada. Para renovar o link da conta já configurada:

```powershell
node --experimental-transform-types --env-file=.env.local scripts/provision-cloudflare.mts password-link acheiturismo2026@gmail.com
```

O link fica em `.local/admin-password-link.json`, fora do Git e do deploy. Ele é de uso único e expira após uma hora. Nenhum e-mail é enviado automaticamente. A senha é definida pelo proprietário na tela do painel, com no mínimo 12 caracteres. A troca de senha revoga as sessões anteriores. O cadastro público de contas está desabilitado; somente contas presentes em `administrators` podem acessar os cadastros privados e assinar uploads.

## Cadastros e fotos

1. Entre em `/admin` e escolha Pousadas, Guias de turismo, Gastronomia, Trilhas e ecoturismo ou Destinos imperdíveis. Cada seção permite criar e editar seus cadastros.
2. Preencha nome e cidade para salvar um rascunho. Para publicar, informe também descrição de pelo menos 30 caracteres e uma foto. Telefone válido com DDD é obrigatório para pousadas, guias e gastronomia; é opcional para trilhas, ecoturismo e destinos.
3. Adicione até 12 fotos JPG, PNG ou WebP de até 5 MB cada. O navegador reduz o lado maior para 1.600 px e converte para WebP. Escolha a capa antes de salvar.
4. Clique em **Salvar e publicar** para exibir no site. Os arquivos são enviados diretamente ao Cloudinary com assinatura emitida apenas para administradores autenticados.
5. **Arquivar** retira o cadastro do site; o filtro Arquivados permite restaurá-lo como rascunho.
6. O botão de lixeira abre uma confirmação com o nome do cadastro. **Excluir cadastro** remove os dados do painel e do site. Para apenas suspender a divulgação e manter os dados, use Arquivar.

Os publicados aparecem nas páginas correspondentes: gastronomia em `/onde-comer`, trilhas e ecoturismo em `/trilhas-ecoturismo` e destinos em `/destinos`. Os destaques também podem aparecer na página inicial. Os itens originais do site ficam disponíveis para edição no painel.

Uma exclusão remove o registro privado e guarda somente seu identificador e a data em `tourism_entry_deletions`. Esse marcador impede que o catálogo original ou uma edição antiga recrie o item excluído. A exclusão não tem restauração pelo painel. As fotos permanecem na biblioteca Cloudinary, assim como acontece ao remover uma foto individual.

As validações também são aplicadas no servidor. O endereço de cada cadastro é único. A atualização do registro e de seu status é feita em uma gravação atômica. O catálogo público recebe apenas registros publicados ou marcadores mínimos de retirada; descrições, contatos e fotos de rascunhos não são retornados por essa API.

Remover uma foto do cadastro não apaga o arquivo no Cloudinary, preservando referências existentes. Arquivos sem uso podem ser revisados e apagados pelo proprietário na biblioteca Cloudinary. As URLs de imagens são públicas, inclusive as usadas em rascunhos; envie imagens destinadas à divulgação.

O catálogo se atualiza ao navegar, voltar à aba e salvar no mesmo navegador. Em outro dispositivo, recarregue a página para obter a versão recente.

## Migração para as novas categorias

Para bancos criados com apenas pousadas e guias, o comando abaixo amplia os tipos aceitos e cria a tabela de exclusões. Ele salva uma cópia dos registros em `.local/backups/` antes de alterar o banco. O arquivo de backup contém dados privados e não deve ser publicado.

```powershell
node --experimental-transform-types --env-file=.env.local scripts/migrate-catalog.mts
node --experimental-transform-types --env-file=.env.local scripts/migrate-catalog.mts apply
```

O primeiro comando apenas inspeciona o estado. A migração usa uma transação D1 para copiar e substituir a tabela, preservando registros e índices adicionais. Em 23/10/2026 ela foi aplicada ao banco de produção e preservou os dois registros existentes. Backup: `.local/backups/catalog-2026-10-23T14-28-34-948Z.json`.

Depois de publicar o aplicativo com as novas categorias, execute `scripts/provision-cloudflare.mts init` com os parâmetros mostrados acima para importar os demais itens originais. Esse comando não sobrescreve cadastros existentes nem recria itens excluídos. Não importe os novos tipos enquanto uma versão antiga do aplicativo estiver em produção.

## Desenvolvimento e validação

```powershell
npm ci
npm run dev -- --port 3005
npm run typecheck
npm run lint
npm run build
```

Ao executar dev e build simultaneamente, use diretórios separados para não misturar os artefatos:

```powershell
$env:NEXT_DIST_DIR = '.next-cloudflare-dev'
npm run dev -- --port 3005
```

Em outro terminal, execute o build sem essa variável. A prévia local em IndexedDB só é habilitada explicitamente com `NEXT_PUBLIC_ADMIN_PREVIEW=true` em desenvolvimento. Ela fica desativada em produção e não migra dados automaticamente.

Foram verificados: recusa de acesso anônimo e de conta não administradora, login, validação no servidor, proteção de escrita por origem, privacidade dos rascunhos, publicação, arquivamento, restauração, endereço duplicado, upload real e escolha de capa. Usuários, registros e imagens temporárias de teste são removidos ao concluir a validação.

As novas categorias foram verificadas em uma instância local isolada do D1: criação, edição, publicação e exclusão dos três tipos; telefone opcional para natureza e destinos; recusa de exclusão anônima ou por origem inválida; privacidade dos marcadores de retirada; bloqueio de salvamento de uma edição antiga após exclusão; e impossibilidade de recriar itens excluídos pela importação inicial. Na interface, foram conferidos os formulários das três categorias, cancelar e confirmar exclusão, navegação móvel e upload real do Cloudinary aparecendo na página pública de gastronomia. A imagem temporária foi removida do Cloudinary depois dos testes. Typecheck, lint e build passaram.

Para publicar, primeiro confira o projeto vinculado e as variáveis, depois gere a versão de produção:

```powershell
vercel project inspect --scope macksystem
vercel deploy --prod --yes --scope macksystem
```

Não exclua o Firebase remoto como parte de uma atualização rotineira. Para reverter o aplicativo, use o deployment anterior na Vercel; isso não reverte automaticamente os dados gravados no D1.
