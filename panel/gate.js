// TeknoTech Services - puerta del panel interno.
// Si alguien entra directo a /panel/ sin haber pasado por el logo, pide la
// contraseña antes de cargar nada.

(function () {
    'use strict';

    var gate = document.getElementById('gate');
    var form = document.getElementById('gate-form');
    var campo = document.getElementById('gate-pass');
    var error = document.getElementById('gate-error');

    if (!gate || !form || !campo) return;

    function desbloquear() {
        gate.hidden = true;
        document.body.classList.remove('locked');
        document.dispatchEvent(new CustomEvent('tt:unlock'));
    }

    function bloquear() {
        document.body.classList.add('locked');
        gate.hidden = false;
        window.setTimeout(function () { campo.focus(); }, 40);
    }

    var pase = null;
    try {
        pase = sessionStorage.getItem('tt_panel_pass');
    } catch (e) { /* modo privado: se ignora */ }

    if (pase === '1') {
        try {
            sessionStorage.removeItem('tt_panel_pass');
        } catch (e) { /* modo privado: se ignora */ }
        desbloquear();
    } else {
        bloquear();
    }

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
                error.textContent = '';
                campo.value = '';
                desbloquear();
            } else {
                error.textContent = 'Contraseña incorrecta.';
                campo.value = '';
                campo.focus();
            }
        });
    });
})();
