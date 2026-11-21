# Nellcstudio® — Terminal Experience

Portfolio estático (HTML + CSS + JS vanilla, sin dependencias ni build). Abrí `index.html` o servilo con cualquier hosting estático (Vercel, Netlify, GitHub Pages…).

```
index.html
css/   fonts · tokens · base · boot · layout · components
js/    boot (intro) · ui (acordeones, nav, reveal) · terminal (prompt) · contact (form)
fonts/ README con instrucciones para CY Grotesk STD e Inter
```

## Cosas para completar

| Qué | Dónde |
|---|---|
| Nombre, descripción, imágenes, tools y participación de **APP 01 / APP 02** | `index.html` → `#project-01`, `#project-02` |
| Tools y participación de **Castor** y **No te rindas**; enlace de No te rindas (si existe) | `#project-03`, `#project-04` |
| Imágenes reales | Reemplazar `<figure class="shot">…</figure>` por `<img src="assets/projects/x.webp" width height alt loading="lazy" decoding="async">` |
| Tipografías | `fonts/README.md` y `css/fonts.css` |
| Servicio del formulario | atributo `data-endpoint` de `<form id="contactForm">` |
| `canonical`, `og:url`, `og:image` | `<head>` de `index.html` cuando exista el dominio |

Los campos pendientes se muestran como `[ POR COMPLETAR ]`: no se inventó ningún dato.

## Formulario

Mientras `data-endpoint=""` esté vacío el formulario **no envía nada** y lo informa (error 503 + link a Instagram). Para conectarlo, pegá la URL de un servicio que acepte `POST` con JSON, por ejemplo Formspree (`https://formspree.io/f/xxxx`) o Web3Forms. Solo muestra “mensaje transmitido” si el servidor responde con éxito. Incluye honeypot anti-spam.

## Intro (boot)

| Situación | Resultado |
|---|---|
| Primera visita | Secuencia completa (~4.5 s) |
| Visita posterior (localStorage `nell:boot`) | Versión rápida (~2 s) |
| Misma sesión (sessionStorage `nell:session`), URL con `#sección` | No se muestra |
| `prefers-reduced-motion` | No se muestra |
| `?intro=replay` o comando `replay` en el prompt | Fuerza la secuencia completa |

`SKIP INTRO`, tecla `Esc`, o tabular fuera del botón, la omiten. El contenido de la página siempre está en el DOM, no se oculta ni se bloquea.

## Prompt del hero

Comandos: `help`, `explore`, `cd <dir>`, `open <1-4>`, `whoami`, `instagram`, `clear`, `replay`.
