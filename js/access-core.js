// TeknoTech Services - verificación de la contraseña del panel interno.
//
// AVISO: esto NO es seguridad real. Cualquiera puede leer este archivo y
// probar la contraseña sin límite. La protección efectiva es Cloudflare Access
// sobre /panel/. Esta clave solo evita que un curioso entre de casualidad.

(function () {
    'use strict';

    // SHA-256 de la contraseña. No se guarda en texto plano.
    var HASH = '26421194e212c5b98707ab02182e65b598576cf241c2168811148e0178abd76a';
    // Respaldo para navegadores sin crypto.subtle (contexto no seguro).
    var RESPALDO = 'NTAuNTY5LjYxMw==';

    function aHex(buffer) {
        var bytes = new Uint8Array(buffer);
        var salida = '';
        for (var i = 0; i < bytes.length; i++) {
            salida += ('0' + bytes[i].toString(16)).slice(-2);
        }
        return salida;
    }

    function verificar(texto) {
        var valor = String(texto == null ? '' : texto).trim();

        if (window.crypto && window.crypto.subtle && window.TextEncoder) {
            try {
                var datos = new TextEncoder().encode(valor);
                return window.crypto.subtle.digest('SHA-256', datos).then(function (buffer) {
                    return aHex(buffer) === HASH;
                })['catch'](function () {
                    return btoa(valor) === RESPALDO;
                });
            } catch (e) {
                return Promise.resolve(btoa(valor) === RESPALDO);
            }
        }

        return Promise.resolve(btoa(valor) === RESPALDO);
    }

    window.TT_Access = { verificar: verificar };
})();
