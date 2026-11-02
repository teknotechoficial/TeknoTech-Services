// Panel interno de TeknoTech Services
// Uso privado: protegido por Cloudflare Access y noindex.

(function () {
    'use strict';

    var ORDEN_GAMA = { 'alta': 1, 'media-alta': 2, 'media': 3, 'media-baja': 4, 'baja': 5 };
    var ETIQUETA_GAMA = {
        'alta': 'Gama alta',
        'media-alta': 'Gama media alta',
        'media': 'Gama media',
        'media-baja': 'Gama media baja',
        'baja': 'Gama baja'
    };

    var POR_PAGINA = 50;

    var datos = null;
    var estado = { texto: '', marca: '', gama: '', anio: '', orden: 'precio-desc', pagina: 1 };
    var ultimaLista = [];

    var el = {
        fecha: document.getElementById('fecha-actualizado'),
        buscar: document.getElementById('buscar'),
        marca: document.getElementById('filtro-marca'),
        gama: document.getElementById('filtro-gama'),
        anio: document.getElementById('filtro-anio'),
        orden: document.getElementById('orden'),
        exportar: document.getElementById('exportar'),
        exportarServ: document.getElementById('exportar-serv'),
        conteo: document.getElementById('conteo'),
        rango: document.getElementById('rango'),
        avisoCel: document.getElementById('aviso-cel'),
        tbodyCel: document.querySelector('#tabla-cel tbody'),
        tbodyServ: document.querySelector('#tabla-serv tbody'),
        conteoServ: document.getElementById('conteo-serv'),
        pagPrev: document.getElementById('pag-prev'),
        pagNext: document.getElementById('pag-next'),
        pagInfo: document.getElementById('pag-info'),
        tabs: document.querySelectorAll('.tab'),
        paneles: document.querySelectorAll('.panel')
    };

    function escapar(valor) {
        return String(valor)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function formatearPrecio(valor) {
        if (valor === null || valor === undefined || valor === '') return null;
        return '$ ' + Number(valor).toLocaleString('es-AR');
    }

    function normalizar(texto) {
        return String(texto).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function iniciar() {
        fetch('datos.json', { cache: 'no-store' })
            .then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            })
            .then(function (json) {
                datos = json;
                prepararFiltros();
                pintarCelulares();
                pintarServicios();
                if (el.fecha) el.fecha.textContent = datos.actualizado || '—';
                if (el.avisoCel) el.avisoCel.textContent = datos.aviso || '';
            })
            .catch(function (error) {
                el.tbodyCel.innerHTML = '<tr><td colspan="5" class="vacio">No se pudo cargar datos.json (' + escapar(error.message) + '). Abrilo desde un servidor HTTP.</td></tr>';
                el.pagInfo.textContent = '—';
            });
    }

    function prepararFiltros() {
        var marcas = {};
        var anios = {};

        datos.celulares.forEach(function (c) {
            marcas[c.marca] = true;
            if (c.anio) anios[c.anio] = true;
        });

        Object.keys(marcas).sort(function (a, b) { return a.localeCompare(b, 'es'); }).forEach(function (m) {
            var opcion = document.createElement('option');
            opcion.value = m;
            opcion.textContent = m;
            el.marca.appendChild(opcion);
        });

        Object.keys(anios).map(Number).sort(function (a, b) { return b - a; }).forEach(function (a) {
            var opcion = document.createElement('option');
            opcion.value = String(a);
            opcion.textContent = String(a);
            el.anio.appendChild(opcion);
        });
    }

    function filtrar() {
        var texto = normalizar(estado.texto);
        return datos.celulares.filter(function (c) {
            if (estado.marca && c.marca !== estado.marca) return false;
            if (estado.gama && c.gama !== estado.gama) return false;
            if (estado.anio && String(c.anio) !== estado.anio) return false;
            if (texto && normalizar(c.marca + ' ' + c.modelo).indexOf(texto) === -1) return false;
            return true;
        });
    }

    function ordenar(lista) {
        var copia = lista.slice();
        switch (estado.orden) {
            case 'precio-asc':
                copia.sort(function (a, b) { return a.precio - b.precio; });
                break;
            case 'anio-desc':
                copia.sort(function (a, b) { return (b.anio - a.anio) || (b.precio - a.precio); });
                break;
            case 'anio-asc':
                copia.sort(function (a, b) { return (a.anio - b.anio) || (b.precio - a.precio); });
                break;
            case 'marca':
                copia.sort(function (a, b) {
                    return a.marca.localeCompare(b.marca, 'es') || (b.anio - a.anio);
                });
                break;
            case 'gama':
                copia.sort(function (a, b) {
                    return (ORDEN_GAMA[a.gama] - ORDEN_GAMA[b.gama]) || (b.precio - a.precio);
                });
                break;
            default:
                copia.sort(function (a, b) { return b.precio - a.precio; });
        }
        return copia;
    }

    function pintarCelulares() {
        ultimaLista = ordenar(filtrar());

        var total = ultimaLista.length;
        var totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));

        if (estado.pagina > totalPaginas) estado.pagina = totalPaginas;
        if (estado.pagina < 1) estado.pagina = 1;

        el.conteo.textContent = total.toLocaleString('es-AR');

        if (!total) {
            el.tbodyCel.innerHTML = '<tr><td colspan="5" class="vacio">Sin resultados con esos filtros.</td></tr>';
            el.rango.textContent = '—';
            el.pagInfo.textContent = '—';
            el.pagPrev.disabled = true;
            el.pagNext.disabled = true;
            return;
        }

        var precios = ultimaLista.map(function (c) { return c.precio; });
        el.rango.textContent = formatearPrecio(Math.min.apply(null, precios)) + ' a ' + formatearPrecio(Math.max.apply(null, precios));

        var desde = (estado.pagina - 1) * POR_PAGINA;
        var pagina = ultimaLista.slice(desde, desde + POR_PAGINA);

        el.tbodyCel.innerHTML = pagina.map(function (c) {
            return '<tr>' +
                '<td>' + escapar(c.marca) + '</td>' +
                '<td>' + escapar(c.modelo) + '</td>' +
                '<td class="num anio">' + (c.anio || '—') + '</td>' +
                '<td><span class="badge badge-' + escapar(c.gama) + '">' + escapar(ETIQUETA_GAMA[c.gama] || c.gama) + '</span></td>' +
                '<td class="num">' + formatearPrecio(c.precio) + '</td>' +
                '</tr>';
        }).join('');

        el.pagInfo.textContent = 'Página ' + estado.pagina + ' de ' + totalPaginas +
            ' · ' + (desde + 1) + '–' + Math.min(desde + POR_PAGINA, total) + ' de ' + total.toLocaleString('es-AR');

        el.pagPrev.disabled = estado.pagina <= 1;
        el.pagNext.disabled = estado.pagina >= totalPaginas;
    }

    function pintarServicios() {
        var servicios = datos.servicios || [];

        el.tbodyServ.innerHTML = servicios.map(function (s) {
            var precio = formatearPrecio(s.precio);
            return '<tr>' +
                '<td>' + escapar(s.rubro) + '</td>' +
                '<td>' + escapar(s.detalle || '') + '</td>' +
                '<td class="num">' + (precio ? precio : '<span class="vacio">A completar</span>') + '</td>' +
                '</tr>';
        }).join('');

        if (el.conteoServ) {
            el.conteoServ.textContent = servicios.length + ' rubros cargados';
        }
    }

    function descargarCSV(nombre, filas) {
        var contenido = '\ufeff' + filas.map(function (fila) {
            return fila.map(function (celda) {
                var valor = celda === null || celda === undefined ? '' : String(celda);
                return '"' + valor.replace(/"/g, '""') + '"';
            }).join(';');
        }).join('\r\n');

        var blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
        var url = URL.createObjectURL(blob);
        var enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = nombre;
        document.body.appendChild(enlace);
        enlace.click();
        document.body.removeChild(enlace);
        URL.revokeObjectURL(url);
    }

    function reiniciarPagina() {
        estado.pagina = 1;
        pintarCelulares();
    }

    el.buscar.addEventListener('input', function () {
        estado.texto = this.value;
        reiniciarPagina();
    });

    el.marca.addEventListener('change', function () {
        estado.marca = this.value;
        reiniciarPagina();
    });

    el.gama.addEventListener('change', function () {
        estado.gama = this.value;
        reiniciarPagina();
    });

    el.anio.addEventListener('change', function () {
        estado.anio = this.value;
        reiniciarPagina();
    });

    el.orden.addEventListener('change', function () {
        estado.orden = this.value;
        reiniciarPagina();
    });

    el.pagPrev.addEventListener('click', function () {
        if (estado.pagina > 1) {
            estado.pagina -= 1;
            pintarCelulares();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    el.pagNext.addEventListener('click', function () {
        var totalPaginas = Math.ceil(ultimaLista.length / POR_PAGINA);
        if (estado.pagina < totalPaginas) {
            estado.pagina += 1;
            pintarCelulares();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    el.exportar.addEventListener('click', function () {
        var filas = [['Marca', 'Modelo', 'Año', 'Gama', 'Precio estimado ARS']];
        ultimaLista.forEach(function (c) {
            filas.push([c.marca, c.modelo, c.anio || '', ETIQUETA_GAMA[c.gama] || c.gama, c.precio]);
        });
        descargarCSV('celulares-teknotech-' + (datos.actualizado || '') + '.csv', filas);
    });

    el.exportarServ.addEventListener('click', function () {
        var filas = [['Rubro', 'Detalle', 'Precio ARS']];
        (datos.servicios || []).forEach(function (s) {
            filas.push([s.rubro, s.detalle || '', s.precio === null ? '' : s.precio]);
        });
        descargarCSV('servicio-tecnico-teknotech-' + (datos.actualizado || '') + '.csv', filas);
    });

    el.tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            el.tabs.forEach(function (t) {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            el.paneles.forEach(function (p) { p.classList.remove('active'); });

            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            document.getElementById(tab.getAttribute('aria-controls')).classList.add('active');
        });
    });

    iniciar();
})();
