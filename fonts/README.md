# Tipografías

El sitio usa tres familias. Ningún archivo de fuente está incluido en el repositorio.

| Uso | Familia | Licencia | Estado |
|---|---|---|---|
| Titulares | **CY Grotesk STD** | Comercial — requiere licencia propia | Falta el archivo. Fallback: Inter / system-ui |
| Textos | **Inter** | SIL OFL 1.1 (libre) | Falta el archivo. Fallback: system-ui (Segoe UI, SF, Roboto) |
| Comandos / metadatos | Monoespaciada del sistema | — | `ui-monospace`, Cascadia, Consolas, Menlo |

## Cómo activarlas

1. Convertí tus archivos a `.woff2` (podés usar <https://transfonter.org> o `fonttools`).
2. Copiá los archivos en esta carpeta con estos nombres:
   - `CYGroteskSTD-Regular.woff2`
   - `CYGroteskSTD-Bold.woff2`
   - `InterVariable.woff2` (descargable de <https://rsms.me/inter/>)
3. En `css/fonts.css` descomentá las líneas `src: ... url(...)` de cada `@font-face`.
4. (Opcional) En `index.html` agregá un `<link rel="preload" as="font" type="font/woff2" crossorigin href="fonts/InterVariable.woff2">`.

> Respetá la licencia de CY Grotesk STD: la licencia web suele ser por dominio/visitas. No subas el archivo a repositorios públicos si la licencia no lo permite.
