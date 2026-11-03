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
    var estado = { texto: '', marca: '', gama: '', anio: '', orden: 'catalogo', pagina: 1 };
    var ultimaLista = [];
    var paginaActual = [];
    var focoDetalle = null;
    var ORDEN_LINEA = {};
    var fichas = {};
    var fichasListas = false;
    var fichaPendiente = null;

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
        paneles: document.querySelectorAll('.panel'),
        detalle: document.getElementById('detalle'),
        detalleFigura: document.getElementById('detalle-figura'),
        detalleMarca: document.getElementById('detalle-marca'),
        detalleTitulo: document.getElementById('detalle-titulo'),
        detalleSub: document.getElementById('detalle-sub'),
        detallePrecio: document.getElementById('detalle-precio'),
        detalleSpecs: document.getElementById('detalle-specs'),
        detalleFuente: document.getElementById('detalle-fuente'),
        detalleCerrar: document.getElementById('detalle-cerrar')
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

    function lentesDe(c) {
        var ficha = fichas[c.marca + '|' + c.modelo] || fichaEstimada(c);
        if (!ficha || !ficha.camara) return null;

        var cuantas = String(ficha.camara).split('+').length;
        return Math.max(1, Math.min(4, cuantas));
    }

    function fichaEstimada(c) {
        var anio = Number(c.anio) || 2020;
        var gama = c.gama;
        var pantalla, chip, ram, bateria, camara, frontal, antutu, soporte;

        if (gama === 'alta') {
            pantalla = '6.7" AMOLED 120 Hz';
            chip = 'Chipset de gama alta (8 nucleos)';
            ram = anio >= 2022 ? '12 GB' : '8 GB';
            bateria = '4600 mAh';
            camara = '50 MP + 12 MP + 10 MP';
            frontal = '12 MP';
            antutu = anio >= 2022 ? '~1.200.000' : '~750.000';
            soporte = '4 años';
        } else if (gama === 'media-alta') {
            pantalla = '6.6" AMOLED 120 Hz';
            chip = 'Chipset de gama media alta (8 nucleos)';
            ram = '8 GB';
            bateria = '5000 mAh';
            camara = '50 MP + 8 MP + 2 MP';
            frontal = '16 MP';
            antutu = anio >= 2022 ? '~650.000' : '~450.000';
            soporte = '3 años';
        } else if (gama === 'media') {
            pantalla = '6.6" IPS 90 Hz';
            chip = 'Chipset de gama media (8 nucleos)';
            ram = anio >= 2021 ? '6 GB' : '4 GB';
            bateria = '5000 mAh';
            camara = '50 MP + 5 MP + 2 MP';
            frontal = '13 MP';
            antutu = anio >= 2022 ? '~420.000' : '~300.000';
            soporte = '2 años';
        } else if (gama === 'media-baja') {
            pantalla = '6.5" IPS 90 Hz';
            chip = 'Chipset de gama media baja (8 nucleos)';
            ram = '4 GB';
            bateria = '5000 mAh';
            camara = '50 MP + 2 MP';
            frontal = '8 MP';
            antutu = anio >= 2022 ? '~300.000' : '~200.000';
            soporte = '2 años';
        } else {
            pantalla = '6.5" IPS 60 Hz';
            chip = 'Chipset de gama baja (8 nucleos)';
            ram = anio >= 2020 ? '3 GB' : '2 GB';
            bateria = '5000 mAh';
            camara = '13 MP + 2 MP';
            frontal = '5 MP';
            antutu = anio >= 2022 ? '~180.000' : '~110.000';
            soporte = '1 año';
        }

        if (anio <= 2017) {
            pantalla = pantalla.replace('120 Hz', '60 Hz').replace('90 Hz', '60 Hz');
            ram = (gama === 'alta' || gama === 'media-alta') ? '3 GB' : '2 GB';
            bateria = '3300 mAh';
        }

        return {
            pantalla: pantalla, chipset: chip, ram: ram, bateria: bateria,
            camara: camara, frontal: frontal, antutu: antutu, soporte: soporte,
            real: false
        };
    }

    function iniciar() {
        if (document.body.classList.contains('locked')) {
            document.addEventListener('tt:unlock', iniciar, { once: true });
            return;
        }

        fetch('datos.json', { cache: 'no-store' })
            .then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            })
            .then(function (json) {
                datos = json;
                prepararOrdenLineas();
                prepararFiltros();
                pintarCelulares();
                pintarServicios();
                cargarFichas();
                if (el.fecha) el.fecha.textContent = datos.actualizado || '—';
                if (el.avisoCel) el.avisoCel.textContent = datos.aviso || '';
            })
            .catch(function (error) {
                el.tbodyCel.innerHTML = '<tr><td colspan="6" class="vacio">No se pudo cargar datos.json (' + escapar(error.message) + '). Abrilo desde un servidor HTTP.</td></tr>';
                el.pagInfo.textContent = '—';
            });
    }

    function cargarFichas() {
        fetch('fichas.json', { cache: 'no-store' })
            .then(function (r) {
                return r.ok ? r.json() : {};
            })
            .then(function (json) {
                fichas = json || {};
                fichasListas = true;
                if (fichaPendiente) {
                    var c = fichaPendiente;
                    fichaPendiente = null;
                    if (el.detalle && !el.detalle.hidden) abrirDetalle(c);
                }
            })
            .catch(function () {
                fichasListas = true;
            });
    }

    function prepararOrdenLineas() {
        ORDEN_LINEA = {};

        var mapa = datos.lineas || {};
        Object.keys(mapa).forEach(function (marca) {
            mapa[marca].forEach(function (linea, indice) {
                ORDEN_LINEA[marca + '|' + linea] = indice;
            });
        });
    }

    function ordenDeLinea(c) {
        var valor = ORDEN_LINEA[c.marca + '|' + c.linea];
        return valor === undefined ? 999 : valor;
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
            if (texto && normalizar(c.marca + ' ' + c.modelo + ' ' + (c.variante || '')).indexOf(texto) === -1) return false;
            return true;
        });
    }

    var COLADOR = window.Intl && Intl.Collator
        ? new Intl.Collator('es', { numeric: true, sensitivity: 'base' })
        : null;

    function compararTexto(a, b) {
        if (COLADOR) return COLADOR.compare(a, b);
        return String(a).localeCompare(String(b), 'es');
    }

    // "Galaxy S26" < "Galaxy S26+" < "Galaxy S26 Ultra": el "+" no debe
    // mandar el modelo al final de la linea.
    function claveModelo(modelo) {
        return String(modelo || '').replace(/\+/g, '').trim();
    }

    function tieneMas(modelo) {
        return String(modelo || '').indexOf('+') === -1 ? 0 : 1;
    }

    // 256GB < 512GB < 1TB < 2TB (y las capacidades raras, al final).
    function pesoVariante(variante) {
        var partes = /^(\d+(?:[.,]\d+)?)\s*(GB|TB)$/i.exec(String(variante || '').trim());
        if (!partes) return 1e12;
        var numero = parseFloat(partes[1].replace(',', '.'));
        if (/^TB$/i.test(partes[2])) numero *= 1024;
        return numero;
    }

    function ordenar(lista) {
        var copia = lista.slice();
        switch (estado.orden) {
            case 'catalogo':
                copia.sort(function (a, b) {
                    return compararTexto(a.marca, b.marca) ||
                        (ordenDeLinea(a) - ordenDeLinea(b)) ||
                        (b.anio - a.anio) ||
                        compararTexto(claveModelo(a.modelo), claveModelo(b.modelo)) ||
                        (tieneMas(a.modelo) - tieneMas(b.modelo)) ||
                        compararTexto(a.modelo, b.modelo) ||
                        (pesoVariante(a.variante) - pesoVariante(b.variante));
                });
                break;
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

    function filaHtml(c, indice) {
        var miniatura = window.TT_Marcas
            ? window.TT_Marcas.svg(c.marca, c.gama, '', true, lentesDe(c))
            : '';
        var nombre = c.modelo + (c.variante ? ' · ' + c.variante : '');

        return '<tr class="fila" tabindex="0" data-i="' + indice + '" aria-label="Ver ficha de ' + escapar(c.marca + ' ' + nombre) + '">' +
            '<td class="col-img"><span class="mini">' + miniatura + '</span></td>' +
            '<td>' + escapar(c.marca) + '</td>' +
            '<td>' + escapar(c.modelo) + (c.variante ? ' <span class="cap">' + escapar(c.variante) + '</span>' : '') + '</td>' +
            '<td class="num anio">' + (c.anio || '—') + '</td>' +
            '<td><span class="badge badge-' + escapar(c.gama) + '">' + escapar(ETIQUETA_GAMA[c.gama] || c.gama) + '</span></td>' +
            '<td class="num">' + formatearPrecio(c.precio) + '</td>' +
            '</tr>';
    }

    function pintarCelulares() {
        ultimaLista = ordenar(filtrar());

        var total = ultimaLista.length;
        var totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));

        if (estado.pagina > totalPaginas) estado.pagina = totalPaginas;
        if (estado.pagina < 1) estado.pagina = 1;

        el.conteo.textContent = total.toLocaleString('es-AR');

        if (!total) {
            el.tbodyCel.innerHTML = '<tr><td colspan="6" class="vacio">Sin resultados con esos filtros.</td></tr>';
            el.rango.textContent = '—';
            el.pagInfo.textContent = '—';
            el.pagPrev.disabled = true;
            el.pagNext.disabled = true;
            paginaActual = [];
            return;
        }

        var precios = ultimaLista.map(function (c) { return c.precio; });
        el.rango.textContent = formatearPrecio(Math.min.apply(null, precios)) + ' a ' + formatearPrecio(Math.max.apply(null, precios));

        var desde = (estado.pagina - 1) * POR_PAGINA;
        paginaActual = ultimaLista.slice(desde, desde + POR_PAGINA);

        var filas = [];
        var marcaPrevia = null;
        var lineaPrevia = null;

        paginaActual.forEach(function (c, indice) {
            if (estado.orden === 'catalogo') {
                if (c.marca !== marcaPrevia) {
                    filas.push('<tr class="grupo grupo-marca"><th colspan="6" scope="colgroup">' + escapar(c.marca) + '</th></tr>');
                    marcaPrevia = c.marca;
                    lineaPrevia = null;
                }
                if (c.linea !== lineaPrevia && c.linea !== c.marca) {
                    filas.push('<tr class="grupo grupo-linea"><th colspan="6" scope="colgroup">' + escapar(c.linea) + '</th></tr>');
                    lineaPrevia = c.linea;
                }
            }
            filas.push(filaHtml(c, indice));
        });

        el.tbodyCel.innerHTML = filas.join('');

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

    function pintarFicha(ficha, real) {
        var filas = [
            ['Pantalla', ficha.pantalla],
            ['Chipset', ficha.chipset],
            ['Memoria RAM', ficha.ram],
            ['Batería', ficha.bateria],
            ['Cámara principal', ficha.camara],
            ['Cámara frontal', ficha.frontal],
            ['Potencia (AnTuTu)', ficha.antutu],
            ['Actualizaciones', ficha.soporte]
        ];

        el.detalleSpecs.innerHTML = filas.map(function (fila) {
            return '<div class="spec"><dt>' + escapar(fila[0]) + '</dt><dd>' + escapar(fila[1] || '—') + '</dd></div>';
        }).join('');

        el.detalleFuente.textContent = real
            ? 'Datos de referencia del modelo.'
            : 'Datos estimados según gama y año.';
        el.detalleFuente.className = 'detalle-fuente ' + (real ? 'real' : 'estimado');
    }

    function abrirDetalle(c) {
        if (!el.detalle || !c) return;

        var ficha = fichas[c.marca + '|' + c.modelo];
        var nombre = c.modelo + (c.variante ? ' · ' + c.variante : '');

        focoDetalle = document.activeElement;

        el.detalleMarca.textContent = c.marca;
        el.detalleTitulo.textContent = c.modelo;
        el.detalleSub.textContent = (c.variante ? c.variante + ' · ' : '') +
            (c.anio || '—') + ' · ' + (ETIQUETA_GAMA[c.gama] || c.gama);
        el.detallePrecio.textContent = formatearPrecio(c.precio) || '—';

        el.detalleFigura.innerHTML = window.TT_Marcas
            ? window.TT_Marcas.svg(c.marca, c.gama, c.marca + ' ' + nombre, false, lentesDe(c))
            : '';

        if (ficha) {
            pintarFicha(ficha, true);
        } else {
            pintarFicha(fichaEstimada(c), false);
            if (!fichasListas) fichaPendiente = c;
        }

        el.detalle.hidden = false;
        document.body.classList.add('detalle-abierto');

        if (el.detalleCerrar) {
            window.setTimeout(function () { el.detalleCerrar.focus(); }, 30);
        }
    }

    function cerrarDetalle() {
        if (!el.detalle || el.detalle.hidden) return;

        el.detalle.hidden = true;
        document.body.classList.remove('detalle-abierto');

        if (focoDetalle && typeof focoDetalle.focus === 'function') {
            focoDetalle.focus();
        }
    }

    function detalleDeFila(nodo) {
        var fila = nodo && nodo.closest ? nodo.closest('tr.fila') : null;
        if (!fila) return null;

        var indice = Number(fila.getAttribute('data-i'));
        return paginaActual[indice] || null;
    }

    el.tbodyCel.addEventListener('click', function (evento) {
        var c = detalleDeFila(evento.target);
        if (c) abrirDetalle(c);
    });

    el.tbodyCel.addEventListener('keydown', function (evento) {
        if (evento.key !== 'Enter' && evento.key !== ' ') return;

        var c = detalleDeFila(evento.target);
        if (!c) return;

        evento.preventDefault();
        abrirDetalle(c);
    });

    if (el.detalle) {
        el.detalle.addEventListener('click', function (evento) {
            if (evento.target.hasAttribute('data-cerrar')) cerrarDetalle();
        });

        if (el.detalleCerrar) {
            el.detalleCerrar.addEventListener('click', cerrarDetalle);
        }

        document.addEventListener('keydown', function (evento) {
            if (evento.key === 'Escape') cerrarDetalle();
        });
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
        var filas = [['Marca', 'Línea', 'Modelo', 'Almacenamiento', 'Año', 'Gama', 'Precio estimado ARS']];
        ultimaLista.forEach(function (c) {
            filas.push([c.marca, c.linea || '', c.modelo, c.variante || '', c.anio || '', ETIQUETA_GAMA[c.gama] || c.gama, c.precio]);
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
