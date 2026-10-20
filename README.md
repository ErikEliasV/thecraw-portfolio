# The Graw

Site estático em Next.js (App Router), Tailwind CSS, Three.js, GSAP e Lenis.

## Scripts

| Comando             | O que faz                                       |
| ------------------- | ----------------------------------------------- |
| `npm run dev`       | Servidor de desenvolvimento                     |
| `npm run build`     | Export estático em `out/`                       |
| `npm run lint`      | ESLint                                          |
| `npm run typecheck` | Gera os tipos de rota e roda `tsc`              |
| `npm run format`    | Prettier (com ordenação de classes do Tailwind) |

## Deploy

`npm run build` gera a pasta `out/`, com um `index.html` por rota (`trailingSlash: true`).
Basta publicar essa pasta em qualquer host de arquivos estáticos.

### GitHub Pages

O workflow `.github/workflows/deploy-pages.yml` publica a cada push na `main`. Ele roda lint,
tipos e build com `NEXT_PUBLIC_BASE_PATH` igual ao subcaminho do Pages (`/thecraw-portfolio`).
Caminhos de `public/` usados no código passam por `asset()` (`src/utils/asset.ts`) para receber esse prefixo.

Na primeira vez, ative em **Settings → Pages → Build and deployment → Source: GitHub Actions**.
