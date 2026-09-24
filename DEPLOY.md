# Infinity Stone — VPS e Cloudflare

## Instalar na VPS

Requer Docker Engine com Compose. O ficheiro Compose usa a rede externa `web`,
compatível com um Cloudflare Tunnel já existente nessa rede.

```sh
git clone https://github.com/fabiodrbarros/infinity_stone.git
cd infinity_stone
cp .env.example .env
chmod 600 .env
nano .env
docker network inspect web >/dev/null 2>&1 || docker network create web
docker compose up -d --build
docker compose ps
curl --fail http://127.0.0.1:30602/api/health
```

Preencher `APP_ORIGIN` com o domínio HTTPS final, sem barra no fim, e
`ADMIN_PASSWORD` com uma palavra-passe forte. A porta 30602 evita a porta 30601
do Studio 601 e só é publicada em localhost. Alterá-la se já estiver ocupada.
A administração fica em `/admin`. As credenciais só inicializam contas novas;
alterar `.env` não muda a palavra-passe numa base de dados existente.

## Cloudflare

No túnel existente, adicionar um hostname público para o domínio escolhido:

- Serviço HTTP: `http://infinity-stone-web:3000`, se o cloudflared corre em
  Docker e está ligado à rede `web`.
- Serviço HTTP: `http://localhost:30602`, se o cloudflared corre diretamente na VPS.

Preservar o hostname original e o cabeçalho `X-Forwarded-Proto: https`.
`TRUST_PROXY=1` permite cookies Secure atrás do proxy; a rede `web` deve ser usada
apenas por serviços de confiança. `APP_ORIGIN` valida a origem dos pedidos de escrita.
Não criar cache para `/api/*` ou `/admin`. Confirmar login e gravação pelo domínio HTTPS.

Esta configuração não cria um túnel nem modifica DNS automaticamente.
O domínio e o túnel devem ser os configurados na conta Cloudflare do utilizador.

## Persistência e conteúdo existente

SQLite, sessões, credenciais e uploads ficam no volume `infinity-stone-data`.
Não executar `docker compose down -v` se quiser preservar o conteúdo.
O repositório não contém a base de dados nem uploads privados locais.
Um volume vazio começa com os conteúdos demonstrativos do site.

Para migrar o conteúdo local, parar primeiro o servidor local e copiar
`data/catalogue.sqlite` e a pasta `public/uploads` por um canal privado para a VPS.
Parar o contentor de destino antes de restaurar. A base de dados deve ficar em
`/data/catalogue.sqlite` e os ficheiros em `/data/uploads`, com proprietário UID/GID
1000. Isto também migra a conta de administrador existente.
Fazer backup antes de substituir qualquer base de dados na VPS.

## Atualizar e fazer backup

```sh
git pull --ff-only
docker compose up -d --build
docker compose ps
```

Para uma cópia consistente, parar a aplicação e copiar todo `/data`:

```sh
mkdir -p backups
chmod 700 backups
docker compose stop website
docker compose cp website:/data "backups/data-$(date +%Y%m%d-%H%M%S)"
docker compose start website
```

Guardar os backups fora do Git e fora da VPS. Antes de publicar, substituir os
projetos demonstrativos. O formulário de contacto abre a aplicação de email;
não envia mensagens através de SMTP.


## Idiomas e revisão de traduções

O menu permite escolher PT, EN ou FR. A preferência mantém-se neste navegador.
Os textos fixos incluem traduções EN/FR. No admin, **Traduzir e rever** permite selecionar o idioma e os textos do site ou um conteúdo específico, gerar uma proposta, editar, guardar rascunho e publicar a revisão.

Para gerar propostas automáticas de novos conteúdos, adicione uma chave **DeepL API Free ou Pro** ao `.env` da VPS:

```dotenv
DEEPL_API_KEY=
```

Preencha o valor apenas no servidor e recrie o serviço com `docker compose up -d --build`. A chave não é enviada ao navegador. A geração envia os textos portugueses selecionados à API DeepL; o custo/quota depende da conta. Documentação: https://developers.deepl.com/docs/api-reference/translate

Sem chave, o site continua a funcionar nos três idiomas, os textos fixos usam as traduções incluídas e as traduções de conteúdos podem ser introduzidas manualmente. Os conteúdos sem tradução publicada usam o original português. As propostas nunca são publicadas automaticamente. **Publicar revisão** publica os campos preenchidos do grupo selecionado. Alterações no original invalidam a tradução anterior desse campo até nova revisão.

Rascunhos e traduções publicadas ficam na mesma base SQLite do volume persistente `/data`, incluídos nas cópias de segurança existentes.
