# 🎨 Pesquisa Interativa: "Galeria Digital Ideal para Artistas Visuais"

Aplicação web em formato de quiz interativo, altamente acessível, responsiva e performática. Desenvolvida em **HTML5 semântico, CSS3 puro e JavaScript ES6+ puro**, sem dependência de frameworks ou bibliotecas externas.

Integrada ao ecossistema **Cloudflare Pages** com backend serverless via **Cloudflare Pages Functions** e armazenamento relacional SQLite no **Cloudflare D1**.

---

## 📁 Estrutura de Arquivos

```text
/
├── index.html                  # Interface principal do quiz (tela inicial, perguntas e formulário)
├── obrigado.html               # Página de confirmação e botão de compartilhamento no WhatsApp
├── favicon.svg                 # Ícone da aplicação em SVG nativo
├── css/
│   └── styles.css              # Sistema de design (variáveis :root, BEM e acessibilidade)
├── js/
│   ├── questions.js            # Coleção estruturada com as 10 perguntas e opções (pronto para i18n)
│   ├── app.js                  # Motor do quiz (navegação, localStorage, validações e envio)
│   └── config.example.js       # Exemplo de configuração pública do cliente (API e Turnstile)
├── functions/
│   └── api/
│       └── respostas.js        # Backend Serverless API (validações de segurança e gravação no D1)
├── migrations/
│   └── 0001_create_artist_survey_responses.sql  # Schema SQL e índices para Cloudflare D1
├── wrangler.toml               # Configuração do Cloudflare Pages e binding do banco D1
├── _headers                    # Cabeçalhos HTTP de segurança (CSP, HSTS) e cache
├── _redirects                  # Regras de navegação do Cloudflare Pages
├── .gitignore                  # Arquivos ignorados pelo Git
└── README.md                   # Documentação completa de uso e publicação
```

---

## 🛠️ Passo a Passo de Configuração e Execução

### 1. Requisitos Prévios
- **Node.js** (versão 18 ou superior).
- Conta ativa na **Cloudflare**.

---

### 2. Executando Localmente

Para testar a interface e o backend com o banco D1 local simulado:

1. Abra o terminal na pasta do projeto.
2. Execute o servidor de desenvolvimento do Wrangler:
   ```bash
   npx wrangler pages dev .
   ```
3. Acesse o endereço indicado no terminal (ex: `http://localhost:8788`).

*O Wrangler criará automaticamente um banco de dados SQLite local no diretório `.wrangler` para testes sem afetar a produção.*

---

### 3. Criando o Banco de Dados Cloudflare D1

1. Faça login na sua conta Cloudflare via CLI:
   ```bash
   npx wrangler login
   ```

2. Crie o banco de dados D1 chamado `pesquisa-galeria-artistas`:
   ```bash
   npx wrangler d1 create pesquisa-galeria-artistas
   ```

3. O comando exibirá um resultado similar a este no terminal:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "pesquisa-galeria-artistas"
   database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
   ```

4. Abra o arquivo [`wrangler.toml`](file:///c:/Users/Desktop/Documents/ronaldowebnegocios/Projeto%20Galeria%20Artistas/wrangler.toml) e substitua `"SUBSTITUIR_PELO_ID_DO_D1"` pelo seu `database_id` real.

---

### 4. Executando as Migrations no Banco D1

#### No Ambiente Local (Para desenvolvimento):
```bash
npx wrangler d1 migrations apply pesquisa-galeria-artistas --local
```

#### No Ambiente de Produção (Banco remoto na Cloudflare):
```bash
npx wrangler d1 migrations apply pesquisa-galeria-artistas --remote
```

---

### 5. Configurando o Binding D1 no Painel da Cloudflare Pages

Ao conectar seu repositório no Cloudflare Pages:

1. Acesse o painel da Cloudflare: **Workers & Pages** > **Pages** > **Seu Projeto**.
2. Vá em **Settings (Configurações)** > **Functions**.
3. Em **D1 database bindings**, clique em **Add binding**.
4. Configure exatamente assim:
   - **Variable name (Binding)**: `DB` *(Deve ser exatamente DB em maiúsculas)*.
   - **D1 database**: Selecione `pesquisa-galeria-artistas`.
5. Clique em **Save**.

---

### 6. Configuração Opcional do Cloudflare Turnstile (Proteção Anti-Bot)

Caso deseje ativar o Turnstile:

1. Crie um site no painel **Turnstile** da Cloudflare.
2. Copie a **Site Key** (chave pública) e cole no objeto `SURVEY_CONFIG` em [`js/config.example.js`](file:///c:/Users/Desktop/Documents/ronaldowebnegocios/Projeto%20Galeria%20Artistas/js/config.example.js) ou inclua em um script no `index.html`.
3. Copie a **Secret Key** (chave secreta) e cadastre nas variáveis de ambiente do Cloudflare Pages:
   - **Settings** > **Environment Variables** > **Add Variable**.
   - Name: `TURNSTILE_SECRET_KEY`
   - Value: `Sua_Chave_Secreta_Turnstile`

*Se o Turnstile não for ativado, o sistema continuará protegido pelo campo Honeypot invisível.*

---

### 7. Publicação (Deploy) no Cloudflare Pages

#### Opção A: Publicação Automática via GitHub (Recomendada)
1. Envie o projeto para um repositório no GitHub.
2. No painel da Cloudflare Pages, selecione **Create a project** > **Connect to Git**.
3. Selecione o repositório.
4. Defina as configurações de build:
   - **Framework preset**: `None`
   - **Build command**: (Deixe em branco)
   - **Build output directory**: `.`
5. Clique em **Save and Deploy**.

#### Opção B: Publicação Direta via CLI (Wrangler)
```bash
npx wrangler pages deploy . --project-name=pesquisa-galeria-artistas
```

---

### 8. Como Consultar e Exportar as Respostas em CSV

#### Consultar respostas no terminal (Banco Remoto):
```bash
npx wrangler d1 execute pesquisa-galeria-artistas --remote --command "SELECT id, submission_id, created_at, priority_feature, beta_interest, name, email, whatsapp FROM artist_survey_responses ORDER BY created_at DESC"
```

#### Exportar todas as respostas em formato JSON:
```bash
npx wrangler d1 execute pesquisa-galeria-artistas --remote --command "SELECT * FROM artist_survey_responses" --json > respostas.json
```

---

### 9. Como Customizar Perguntas, Textos e Identidade Visual

- **Alterar Perguntas e Opções**: Edite o arquivo [`js/questions.js`](file:///c:/Users/Desktop/Documents/ronaldowebnegocios/Projeto%20Galeria%20Artistas/js/questions.js). Toda a estrutura de etapas e opções está centralizada nele.
- **Alterar Cores e Estilos**: Edite o arquivo [`css/styles.css`](file:///c:/Users/Desktop/Documents/ronaldowebnegocios/Projeto%20Galeria%20Artistas/css/styles.css). Modifique as variáveis no bloco `:root`.

---

### ⚠️ Arquivos que NUNCA devem conter chaves privadas ou segredos

- `wrangler.toml`
- `index.html`
- `js/app.js`
- `js/questions.js`
- `js/config.example.js`

*Todas as chaves secretas (como TURNSTILE_SECRET_KEY) devem ser cadastradas exclusivamente nas variáveis de ambiente do painel Cloudflare Pages.*
