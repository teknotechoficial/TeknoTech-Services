// TeknoTech Services - entrada discreta al panel interno.
// Cinco clics seguidos sobre el logo del encabezado o del pie abren el pedido
// de contraseña. Si es correcta, se pasa al panel.

(function () {
    'use strict';

    var DESTINO = 'panel/';
    var CLICS_NECESARIOS = 5;
    var VENTANA = 2000; // ms máximo entre un clic y el siguiente

    var contador = 0;
    var ultimoClic = 0;

    var modal = document.getElementById('access-modal');
    var form = document.getElementById('access-form');
    var campo = document.getElementById('access-pass');
    var error = document.getElementById('access-error');
    var cancelar = document.getElementById('access-cancel');
    var disparadores = document.querySelectorAll('.logo, .footer-logo');

    var focoAnterior = null;

    if (!modal || !form || !campo) return;

    function abrir() {
        focoAnterior = document.activeElement;
        error.textContent = '';
        campo.value = '';
        modal.hidden = false;
        document.body.classList.add('modal-abierto');
        window.setTimeout(function () { campo.focus(); }, 30);
    }

    function cerrar() {
        modal.hidden = true;
        document.body.classList.remove('modal-abierto');
        if (focoAnterior && typeof focoAnterior.focus === 'function') {
            focoAnterior.focus();
        }
    }

    function contar(evento) {
        var ahora = Date.now();
        contador = (ahora - ultimoClic <= VENTANA) ? contador + 1 : 1;
        ultimoClic = ahora;

        if (contador >= CLICS_NECESARIOS) {
            contador = 0;
            ultimoClic = 0;
            if (evento && typeof evento.preventDefault === 'function') {
                evento.preventDefault();
            }
            abrir();
        }
    }

    Array.prototype.forEach.call(disparadores, function (elemento) {
        elemento.addEventListener('click', contar);
    });

    form.addEventListener('submit', function (evento) {
        evento.preventDefault();

        var valor = campo.value;
        if (!valor.trim()) {
            error.textContent = 'Escribí la contraseña.';
            campo.focus();
            return;
        }

        window.TT_Access.verificar(valor).then(function (correcta) {
            if (correcta) {
                try {
                    sessionStorage.setItem('tt_panel_pass', '1');
                } catch (e) { /* modo privado: se ignora */ }
                window.location.href = DESTINO;
            } else {
                error.textContent = 'Contraseña incorrecta.';
                campo.value = '';
                campo.focus();
            }
        });
    });

    if (cancelar) {
        cancelar.addEventListener('click', cerrar);
    }

    modal.addEventListener('click', function (evento) {
        if (evento.target.hasAttribute('data-close')) cerrar();
    });

    document.addEventListener('keydown', function (evento) {
        if (evento.key === 'Escape' && !modal.hidden) cerrar();
    });
})();
