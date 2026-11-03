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
│   ├── panel.js          Filtros, tablas, ficha y exportación CSV
│   ├── marcas.js         Ilustraciones SVG por marca y gama
│   ├── datos.json        ← catálogo y precios (lo que edita el panel)
│   └── fichas.json       Fichas técnicas reales, se cargan al abrir una ficha
├── robots.txt
├── sitemap.xml
└── _headers              Headers de Cloudflare Pages
```

## Cómo actualizar los precios

Todo se edita en `panel/datos.json`:

- `actualizado`: fecha que se muestra en el panel.
- `celulares[]`: cada fila es un modelo con una capacidad. Tiene `marca`, `linea`, `modelo`,
  `variante` (almacenamiento, ej. `128GB`), `anio`, `gama` y `precio` (ARS, sin decimales).
  - Valores válidos de `gama`: `alta`, `media-alta`, `media`, `media-baja`, `baja`.
  - Un mismo modelo puede repetirse con distintas capacidades, cada una con su precio.
  - `anio` es el año de lanzamiento; el panel lo muestra y permite filtrar por él.
  - `linea` es la familia comercial del modelo (`Galaxy S`, `iPhone Pro Max`, `Redmi Note`…).
    Si la marca no tiene familias, coincide con la marca.
- `lineas`: orden en que se muestran las líneas dentro de cada marca. Es un objeto
  `{ "Samsung": ["Galaxy S", "Galaxy Note", …] }`; el panel respeta ese orden en la vista
  de catálogo. Si agregás una línea nueva y no la listás acá, va al final de su marca.
- `fichas` ya no vive en `datos.json`: está en `panel/fichas.json`, con la misma clave
  `"Marca|Modelo"` (ej. `"Apple|iPhone 15"`). El panel lo pide recién cuando abrís una ficha,
  así el listado no arrastra 1,8 MB extra.
  - Campos: `pantalla`, `chipset`, `ram`, `bateria`, `camara`, `frontal`, `antutu`, `soporte`.
  - `real: true` muestra “Datos de referencia del modelo”; `false` muestra “Datos estimados según gama y año”.
  - Si un modelo no está en `fichas.json`, el panel arma una ficha estimada con la gama y el año.
- `servicios[]`: cada rubro tiene `rubro`, `detalle` y `precio`.
  - Mientras `precio` sea `null`, el panel muestra “A completar”.

El catálogo actual tiene **11.133 filas (10.621 modelos) de 101 marcas (2010–2026)**, con
9.436 fichas técnicas reales. Los precios son estimados: se calculan por gama, se ajustan por
capacidad y se deprecian según el año de lanzamiento, con un piso por gama para que un equipo
viejo no quede en un valor irreal. Verificar antes de cotizar.

### Origen de los datos

El catálogo se genera con `build-catalog.py` a partir de:

- **GSMArena** (`gsmarena-raw.json`): las 128 marcas de su buscador, 12.685 equipos, de los
  cuales 10.826 son de 2010–2026. Aporta modelo, año, tipo (smartphone / tablet / feature phone),
  pantalla, chipset, RAM, batería, cámara y almacenamiento.
- **Lista curada** (la sección `CATALOGO` del generador): los modelos y gamas de las marcas
  principales, que tienen prioridad y variantes de capacidad verificadas a mano.

Reglas de armado:

- Se excluyen relojes, bandas y pulseras inteligentes (GSMArena los publica como “phone”).
- Se incluyen smartphones, tablets y feature phones; los feature phones van siempre a gama baja.
- La gama sale del chipset cuando está; si no, del año y del nombre, y la RAM solo ajusta dentro
  de su época (2 GB era gama alta en 2014 y baja en 2020). Un sufijo “Pro Max”/“Ultra” sube un
  escalón, pero no convierte por sí solo un equipo de gama media en gama alta.
- El almacenamiento se normaliza a la capacidad comercial (`1024GB` → `1TB`, `13.3GB` → `16GB`).
  Si GSMArena no publica capacidad, el modelo queda con una sola fila y `variante: "s/d"`.
- Deduplicación por nombre exacto y por nombre base (ignora `5G`/`4G`/`LTE`).

### Orden del catálogo

El panel abre en **Catálogo (marca y línea)**, que ordena en este orden:

1. Marca, alfabético (`localeCompare` en español).
2. Línea, según el orden de `lineas` (ej. en Samsung: Galaxy S, Note, A, Z Fold, Z Flip, M…).
3. Año, del más nuevo al más viejo.
4. Modelo, con orden natural cuando comparten año (`S9` antes que `S10`, `S26` antes que
   `S26+` antes que `S26 Ultra`).
5. Capacidad, de menor a mayor (`256GB`, `512GB`, `1TB`).

En ese modo la tabla muestra encabezados de grupo por marca y por línea. Los demás órdenes
(Mayor precio, Menor precio, Más nuevo, Más viejo, Marca, Gama) son planos, sin encabezados.

### Imágenes

No se usan fotos: `panel/marcas.js` dibuja un SVG en el navegador con el color de cada marca y la
cantidad de cámaras del modelo (según `fichas.camara`, o según la gama si no hay ficha). No hay
archivos, no pesa y no tiene derechos de autor. Para agregar una marca nueva, sumar su color al
objeto `COLORES` de ese archivo.

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
- Fichas técnicas: 9.436 modelos con datos reales de GSMArena; el resto se estima según gama y año.
- La marca de agua a pantalla completa del `index.html` se mantiene por decisión del dueño; pesa ~470 KB en base64.
- Sin dominio propio: cuando haya uno, actualizar las URLs listadas arriba.
