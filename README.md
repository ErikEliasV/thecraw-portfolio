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
