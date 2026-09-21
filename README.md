# Infinity Stone

Site multipage em português, com React, Vite, Express e SQLite. As microinterações usam CSS e Web Animations API. Requer Node.js 24. Os textos editoriais e entradas do catálogo são demonstrativos. Os contactos e o logótipo são os fornecidos.

## Arrancar em localhost

```powershell
npm install
npm run dev
```

Abrir http://localhost:3000. Administração: http://localhost:3000/admin.

No Windows também pode executar `INICIAR.cmd`. Se o servidor já estiver em execução, basta abrir o endereço acima.

No primeiro arranque, é criado um utilizador `admin` com palavra-passe aleatória. Consultar `data/acesso-local.txt` (privado, ignorado pelo Git). Podem definir-se `ADMIN_USER` e `ADMIN_PASSWORD` antes do primeiro arranque. Valores posteriores não substituem uma conta já existente.

## Catálogo

Criar, editar e eliminar produtos ou projetos. Definir título, tipo, material, descrição, imagem e estado de publicação. Aceita upload de JPG/PNG/WebP até 5 MB; rascunhos são visíveis apenas na administração. Base de dados em `data/catalogue.sqlite`, imagens carregadas em `public/uploads`. Fazer cópia de segurança de ambos com o servidor parado. A autenticação usa scrypt, cookies HttpOnly/SameSite, sessões de 8 horas e limitação de tentativas. Em desenvolvimento, o servidor escuta em 127.0.0.1. No Docker, escuta em 0.0.0.0 dentro do contentor; a porta publicada na VPS fica restrita a localhost.

## Build e verificação

```powershell
npm run build
npm start
# Com o servidor em execução:
npm test
node scripts/verify.mjs
node scripts/verify-motion.mjs
```

O teste visual usa Microsoft Edge instalado. Os testes de catálogo criam entradas temporárias e removem-nas. Não executar simultaneamente os dois servidores na porta 3000.

O formulário de contacto prepara uma mensagem na aplicação de email do visitante; não existe envio SMTP. Antes de publicação externa: substituir conteúdo demonstrativo, rever direitos das imagens e configurar domínio/HTTPS e requisitos legais aplicáveis.

## Imagens e tipografia

Logótipo e stone.jpg: ficheiros fornecidos pelo utilizador. Fotografias ilustrativas, sem associação a projetos da empresa: Pexels https://www.pexels.com/photo/marble-surface-2341290/ (marble.jpg); Unsplash photo-1600210492486-724fe5c67fb0 (interior.jpg). Outfit via Google Fonts, guardado localmente. Os volumes do hero são geometria CSS com texturas de pedra. Referência visual: Tura fornecida no pedido.


## Docker na VPS e Cloudflare

Ver [DEPLOY.md](DEPLOY.md) para instalação, domínio, persistência e backups.
O Compose usa a rede `web`, o serviço `infinity-stone-web:3000` e a porta local 30602.
Base de dados, credenciais, uploads e ficheiros `.env` são privados e não seguem para o GitHub.
