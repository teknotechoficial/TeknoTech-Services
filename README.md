# TeknoTech Services — Landing v3

Sitio estático de TeknoTech Services: landing pública + panel interno de precios.

- **Producción:** https://teknotech-services.pages.dev/ (Cloudflare Pages)
- **Panel interno:** https://teknotech-services.pages.dev/panel/ (protegido por Cloudflare Access)
- **Repositorio:** https://github.com/teknotechoficial/TeknoTech-Services

## Estructura

```
/
├── index.html            Landing pública
├── css/styles.css        Estilos de la landing
├── js/main.js            Menú, scroll, formulario y wizard
├── assets/               Logos, favicons e imagen Open Graph
├── panel/
│   ├── index.html        Panel interno (noindex)
│   ├── panel.css         Estilos del panel
│   ├── panel.js          Filtros, tablas y exportación CSV
│   └── datos.json        ← acá se editan precios y modelos
├── robots.txt
├── sitemap.xml
└── _headers              Headers de Cloudflare Pages
```

## Cómo actualizar los precios

Todo se edita en `panel/datos.json`:

- `actualizado`: fecha que se muestra en el panel.
- `celulares[]`: cada equipo tiene `marca`, `modelo`, `anio`, `gama`, `precio` (ARS, sin decimales) e `imagen`.
  - Valores válidos de `gama`: `alta`, `media-alta`, `media`, `media-baja`, `baja`.
  - `anio` es el año de lanzamiento; el panel lo muestra y permite filtrar por él.
  - `imagen` está reservado: si ponés una ruta (ej. `img/iphone-17.png`), queda lista para mostrarse.
- `servicios[]`: cada rubro tiene `rubro`, `detalle` y `precio`.
  - Mientras `precio` sea `null`, el panel muestra “A completar”.

El catálogo actual tiene **1027 modelos de 30 marcas (2012–2026)**. Los precios son estimados:
se calculan por gama y se deprecian según el año de lanzamiento, así que un gama alta de 2013
vale mucho menos que uno de 2026. Verificar antes de cotizar.

Después de editar, commit y push: Cloudflare Pages redeploya solo.

## Desarrollo local

El panel carga `datos.json` por `fetch`, así que necesita un servidor HTTP:

```bash
python -m http.server 8080
```

Luego abrir:

- http://localhost:8080/ → landing
- http://localhost:8080/panel/ → panel

## Deploy en Cloudflare Pages

1. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git.
2. Elegir el repo `teknotechoficial/TeknoTech-Services`.
3. Branch: `main`. Framework preset: `None`. Build command: vacío. Output directory: `/`.
4. Deploy. La URL queda como `https://<nombre-del-proyecto>.pages.dev`.
5. Si el nombre del proyecto no es `teknotech-services`, actualizar la URL en:
   - `index.html` (canonical, `og:url`, `og:image`, Twitter y JSON-LD)
   - `sitemap.xml`
   - `robots.txt`

## Proteger el panel con Cloudflare Access

1. Cloudflare Zero Trust → Access → Applications → Add an application → Self-hosted.
2. Dominio: `<proyecto>.pages.dev`, path `panel`.
3. Policy: `Allow`, regla `Emails` con el email del dueño.
4. Login method: One-time PIN (email).
5. Guardar. La primera visita a `/panel/` pide el código enviado por mail.

> Nota: sin Access, el panel es público aunque tenga `noindex`. `noindex` solo evita que Google lo indexe, no que alguien entre.

## Entrada al panel desde el sitio

- **Cinco clics seguidos** (menos de 2 segundos entre uno y otro) sobre el logo del encabezado
  o del pie abren el pedido de contraseña.
- Con la contraseña correcta se abre `/panel/`.
- Si alguien entra directo a `/panel/` sin pasar por el logo, el panel pide la contraseña
  antes de cargar nada.
- La contraseña no está en texto plano: se guarda como hash SHA-256 en `js/access-core.js`.
  Para cambiarla:

  ```bash
  node -e "console.log(require('crypto').createHash('sha256').update('NUEVA_CLAVE').digest('hex'))"
  ```

  Y reemplazar el valor de `HASH` en `js/access-core.js`.

> Esta contraseña es una barrera de comodidad, no seguridad real: el código es público y
> cualquiera puede leerlo y probar sin límite. La protección efectiva es Cloudflare Access.

## Pendientes conocidos

- Precios de servicio técnico sin cargar (18 rubros con `precio: null`).
- Imágenes por modelo: el campo `imagen` está reservado pero vacío; hay que definir la fuente de las fotos.
- La marca de agua a pantalla completa del `index.html` se mantiene por decisión del dueño; pesa ~470 KB en base64.
- Sin dominio propio: cuando haya uno, actualizar las URLs listadas arriba.
