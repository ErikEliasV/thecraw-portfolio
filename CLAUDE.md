# The Craw: regras do projeto

Estas regras valem para todas as sessões. Siga-as sem exceção.

## 1. Escopo

- Implementar **apenas as telas do Figma indicadas na seção 2**. Não criar páginas extras por conta própria.
- Projeto **estático**: sem backend, banco de dados, CMS ou API própria. Todo o conteúdo vem do design e de arquivos do projeto.
- Next.js em **export estático** (`output: 'export'`, `images: { unoptimized: true }`). Proibido: API routes, middleware, server actions ou qualquer coisa que exija servidor. O `build` gera `out/`, pronto para hospedar em qualquer lugar.

## 2. Design (Figma)

- Link: https://www.figma.com/design/cX46oA5kqiI5oJFo1FQEeb/SITE-DEVELPMENT?node-id=2788-1297
- `fileKey`: `cX46oA5kqiI5oJFo1FQEeb` · node raiz: `2788:1297` (formato do MCP).
- Ler o design **sempre pelo Figma MCP** (`get_metadata`, `get_design_context`, `get_screenshot`, `get_variable_defs`, `download_assets`). Nunca trabalhar de memória ou por suposição.
- Assets (imagens, ícones, fontes) baixados para `public/`.
- Telas **fiéis ao Figma**: layout, proporções, tipografia, espaçamentos e hierarquia, em desktop e mobile (seguir frames mobile se existirem; senão, adaptar mantendo a linguagem visual).
- Se o Figma MCP não responder ou um frame não puder ser lido: **parar e avisar**, nunca inventar o visual.

### Cores (regra crítica)

- Cores **idênticas** às do Figma: valores exatos (hex, opacidade, gradientes) transformados em **tokens do tema do Tailwind**.
- Nos componentes, usar **só tokens do tema**. Nenhum hex solto.
- Ao terminar cada tela, comparar a captura do Figma com o navegador e corrigir qualquer diferença de cor.

## 3. Efeito dither (hero e footer)

- WebGL com **Three.js** e shader próprio. Fragment shader com **ordered dithering** (Bayer 4x4 ou 8x8): luminância → comparação com o limiar da matriz → cor da paleta.
- Paleta do dither: **somente cores extraídas do Figma**, na mesma ordem e proporção do exemplo.
- Tamanho do "pixel" configurável por uniform, nítido (sem suavização).
- GSAP controlando os uniforms:
  - Entrada: a imagem se forma a partir do dither (limiar subindo, "materializando").
  - Movimento contínuo e sutil (ruído ou deslocamento do limiar no tempo).
  - Resposta ao mouse (desktop): distorção ou variação de densidade que segue o cursor com suavidade.
  - ScrollTrigger: dither mais denso/grosso conforme a seção sai da tela.
- Imagem cobre o container como `object-fit: cover`, calculado no shader, e acompanha o resize.
- Um único componente reutilizável (props: imagem, paleta, tamanho do pixel, modo de animação) em `src/features/dither-image/` (`components/`, `hooks/`, `shaders/`, `types.ts`).
- Robustez: `devicePixelRatio` limitado a 2; pausar render fora da tela (`IntersectionObserver`); `dispose` de geometria, material, textura e renderer ao desmontar; carregar com `dynamic import` + `ssr: false` dentro de um Client Component; fallback para imagem estática (com a paleta correta) se não houver WebGL ou se `prefers-reduced-motion` estiver ativo.

## 4. Stack

- **Next.js** (estável mais recente), **App Router**, **TypeScript**.
- **Tailwind CSS** para toda a estilização.
- **Three.js** / WebGL, **GSAP** (+ ScrollTrigger), **Lenis**.
- ESLint e Prettier (com `prettier-plugin-tailwindcss`).
- Gerenciador de pacotes: **npm**.
- Bibliotecas extras são permitidas se forem leves, mantidas, compatíveis com export estático e não duplicarem GSAP/Lenis/Three.js. Instalar a versão estável mais recente e listar no resumo de cada feature o que entrou e por quê.
- Proibido: CSS Modules, styled-components ou outra solução de CSS. `globals.css` guarda só as diretivas do Tailwind e variáveis do tema.

## 5. Animações

- Modernas e suaves.
- **Lenis** sincronizado com GSAP: um único loop via `gsap.ticker`, `lenis.on('scroll', ScrollTrigger.update)` e `gsap.ticker.lagSmoothing(0)`.
- Registro de plugins do GSAP e provider do Lenis em `src/lib/`; provider usado no layout.
- Em React: `useGSAP` ou `gsap.context`, limpando tudo ao desmontar.
- Reveals no scroll (linhas/palavras, fade com `y`, stagger), parallax em imagens, microinterações em botões e links, header que reage ao scroll.
- Easings: `power3.out`, `expo.out`, `power2.inOut`. Nunca `linear` em movimento de interface. Entradas 0,6–1,2 s; interações 0,2–0,4 s.
- Meta de 60 fps; animar preferencialmente `transform` e `opacity`.
- Respeitar `prefers-reduced-motion`: reduzir/desligar animações e smooth scroll.

## 6. Git Flow (regra permanente)

- `main`: só código pronto para produção. **Nunca** commitar direto.
- `develop`: integração. **Nunca** commitar direto.
- `feature/<nome-da-feature>`: uma branch nova por feature, sempre a partir da `develop`.

Fluxo de cada feature:

1. Atualizar a `develop`.
2. Criar `feature/<nome>` a partir dela.
3. Implementar só aquela feature, com commits pequenos e frequentes.
4. Rodar lint, checagem de tipos e `build` antes de finalizar.
5. Merge na `develop`; só então começar a próxima feature, em outra branch.

Mensagens: **Conventional Commits** (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `style:`, `test:`), curtas e no imperativo.

### Autoria dos commits

- **Nunca** adicionar trailers de coautoria (`Co-Authored-By`), rodapés do tipo "Generated with ..." ou qualquer menção a ferramentas de IA em mensagens, trailers, PRs, comentários de código ou arquivos do projeto.
- **Não alterar** `user.name` nem `user.email` do Git.
- A atribuição automática de commits/PRs da ferramenta fica desativada nas configurações locais (`attribution.commit` e `attribution.pr` vazios).

## 7. Estrutura de pastas (obrigatória)

```
├── public/                  # imagens, fontes, ícones estáticos
├── src/
│   ├── app/                 # rotas, layouts e páginas (apenas roteamento)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── (nome-da-rota)/
│   │       └── page.tsx
│   ├── components/
│   │   ├── ui/              # componentes base reutilizáveis (Button, Input, Card)
│   │   ├── layout/          # Header, Footer, Container, Navbar
│   │   └── sections/        # seções de página (Hero, Features, CTA)
│   ├── features/            # código agrupado por funcionalidade
│   │   └── <feature>/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── services/
│   │       └── types.ts
│   ├── hooks/               # hooks globais
│   ├── lib/                 # configuração de bibliotecas e helpers de terceiros
│   ├── services/            # chamadas a APIs externas
│   ├── constants/           # constantes e dados fixos
│   ├── utils/               # funções utilitárias puras
│   ├── types/               # tipos globais
│   └── styles/
│       └── globals.css
├── CLAUDE.md
└── ...arquivos de configuração
```

Convenções:

- Arquivos e pastas em `kebab-case`. Componentes em `PascalCase`, um por arquivo.
- Hooks com prefixo `use`. Constantes em `UPPER_SNAKE_CASE`. Alias `@/` → `src/`.
- `app/` contém só rotas e composição. Lógica em `features/`, `components/` e `hooks/`.
- Server Components por padrão. `"use client"` só onde houver interação, GSAP, Lenis ou Three.js.
- Subpastas dentro desta estrutura são permitidas (ex.: `shaders/`). Pastas novas na raiz ou em `src/` exigem perguntar antes.

## 8. Qualidade

- HTML semântico, `alt` em todas as imagens, contraste adequado, navegação por teclado.
- `next/font` e `metadata` do Next.js para fontes e SEO.
- Sem `any`. Feature só está pronta com lint, tipos e `build` (export estático) sem erros.

## 9. Comunicação

- Ao fim de cada feature: resumo de uma ou duas frases do que foi feito e quais bibliotecas extras entraram.
- Só parar para perguntar se faltar uma informação essencial.
