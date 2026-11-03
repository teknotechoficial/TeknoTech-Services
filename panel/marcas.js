// TeknoTech Services - ilustraciones de celulares.
// Dibuja la parte trasera de un telefono en SVG segun la marca (color) y la
// gama (cantidad de camaras y tamano del modulo). Sin archivos ni derechos de
// autor: se genera en el navegador y se adapta a cualquier tamano.

(function () {
    'use strict';

    var COLORES = {
        'Apple': '#b9c0c7',
        'Samsung': '#2f4bd6',
        'Xiaomi': '#ff6900',
        'POCO': '#ffc400',
        'Motorola': '#3a5bd9',
        'Huawei': '#cf0a2c',
        'Honor': '#00a0e9',
        'Oppo': '#00875a',
        'Realme': '#ffc915',
        'vivo': '#415fff',
        'OnePlus': '#eb0029',
        'Google': '#4285f4',
        'Nokia': '#124191',
        'Sony': '#4a5568',
        'LG': '#a50034',
        'ZTE': '#0072bc',
        'TCL': '#e4002b',
        'Alcatel': '#00a0df',
        'Infinix': '#00a651',
        'Tecno': '#0057b8',
        'Itel': '#f5a623',
        'Asus': '#00539b',
        'Nothing': '#2e2e33',
        'Lenovo': '#e2231a',
        'HTC': '#69be28',
        'BlackBerry': '#333333',
        'Meizu': '#00a0e9',
        'Nubia': '#d7000f',
        'Sharp': '#e60012',
        'Microsoft': '#0078d4'
    };

    var GAMAS = {
        'alta': { isla: 96, lentes: 4, acento: '#ff7aa2' },
        'media-alta': { isla: 86, lentes: 3, acento: '#ffc247' },
        'media': { isla: 76, lentes: 2, acento: '#6cb8ff' },
        'media-baja': { isla: 68, lentes: 2, acento: '#6fd39a' },
        'baja': { isla: 60, lentes: 1, acento: '#bdbdbd' }
    };

    var POSICIONES = {
        4: [[0.30, 0.30], [0.70, 0.30], [0.30, 0.70], [0.70, 0.70]],
        3: [[0.30, 0.28], [0.70, 0.28], [0.50, 0.70]],
        2: [[0.30, 0.50], [0.70, 0.50]],
        1: [[0.50, 0.50]]
    };

    function escapar(texto) {
        return String(texto)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function svg(marca, gama, etiqueta, compacto, lentes) {
        var color = COLORES[marca] || '#4a4a4a';
        var g = GAMAS[gama] || GAMAS['media'];
        var isla = g.isla;

        var cuantas = Number(lentes);
        if (!cuantas || cuantas < 1 || cuantas > 4) cuantas = g.lentes;

        var id = 'tt' + Math.random().toString(36).slice(2, 8);

        // Cuerpo trasero con un degradado suave para dar volumen.
        var cuerpo =
            '<defs>' +
            '<linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0" stop-color="#ffffff" stop-opacity="0.16"/>' +
            '<stop offset="0.55" stop-color="#ffffff" stop-opacity="0"/>' +
            '<stop offset="1" stop-color="#000000" stop-opacity="0.22"/>' +
            '</linearGradient>' +
            '</defs>' +
            '<rect x="24" y="12" width="192" height="456" rx="30" fill="' + color + '"/>' +
            '<rect x="24" y="12" width="192" height="456" rx="30" fill="url(#' + id + ')"/>' +
            '<rect x="24.75" y="12.75" width="190.5" height="454.5" rx="29.25" ' +
            'fill="none" stroke="#ffffff" stroke-opacity="0.22" stroke-width="1.5"/>';

        // Modulo de camaras.
        var pos = POSICIONES[cuantas] || POSICIONES[2];
        var r = isla * 0.155;
        var lentes = '';

        for (var i = 0; i < pos.length; i++) {
            var cx = 44 + isla * pos[i][0];
            var cy = 40 + isla * pos[i][1];
            lentes +=
                '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + r.toFixed(1) + '" fill="#0a0a0c"/>' +
                '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + (r * 0.62).toFixed(1) + '" fill="#1d2430"/>' +
                '<circle cx="' + (cx - r * 0.3).toFixed(1) + '" cy="' + (cy - r * 0.3).toFixed(1) +
                '" r="' + (r * 0.26).toFixed(1) + '" fill="#ffffff" opacity="0.3"/>';
        }

        var islaSvg =
            '<rect x="44" y="40" width="' + isla + '" height="' + isla +
            '" rx="20" fill="#0d0d10" fill-opacity="0.88"/>' +
            '<rect x="44" y="40" width="' + isla + '" height="' + isla +
            '" rx="20" fill="none" stroke="#ffffff" stroke-opacity="0.14"/>' +
            lentes +
            '<circle cx="' + (44 + isla - 16) + '" cy="' + (40 + isla - 16) + '" r="5" fill="#fff3c4" opacity="0.85"/>';

        var nombre = String(marca || '');
        var tamano = nombre.length > 8 ? 15 : 19;

        var texto = compacto ? '' :
            '<text x="120" y="372" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" ' +
            'font-size="' + tamano + '" font-weight="700" fill="#ffffff" opacity="0.92" ' +
            'letter-spacing="0.5">' + escapar(nombre) + '</text>';

        var acento = compacto ? '' :
            '<rect x="88" y="392" width="64" height="5" rx="2.5" fill="' + g.acento + '"/>';

        return '<svg viewBox="0 0 240 480" xmlns="http://www.w3.org/2000/svg" ' +
            'preserveAspectRatio="xMidYMid meet" role="img" aria-label="' + escapar(etiqueta || marca) + '">' +
            cuerpo + islaSvg + texto + acento + '</svg>';
    }

    window.TT_Marcas = {
        svg: svg,
        color: function (marca) { return COLORES[marca] || '#4a4a4a'; },
        acento: function (gama) { return (GAMAS[gama] || GAMAS['media']).acento; }
    };
})();
