<!--
-------------------------------------------------------------------------------------------------------
TEKNOTECH SERVICES dueños, creadores y editores absolutos de este software
esta completamente PROHIBIDO la venta, modificación o cualquier movimiento de este software sin 
permiso de TEKNOTECH SERVICES
-------------------------------------------------------------------------------------------------------
-->
// TeknoTech Services - Sistema de Verificación de Integridad
// PROTECCIÓN CONTRA MODIFICACIONES NO AUTORIZADAS

(function() {
    'use strict';

    // Configuración de seguridad
    const SECURITY_CONFIG = {
        manifestPath: 'integrity.json',
        checkInterval: 5000, // 5 segundos
        maxRetries: 3,
        lockoutDuration: 30 * 60 * 1000, // 30 minutos
        email: 'mttsasus@gmail.com'
    };

    // Estado de bloqueo - 7 capas redundantes
    const STORAGE_KEYS = {
        LOCKED: 'teknotech_locked',
        LOCKED_TS: 'teknotech_locked_ts',
        LOCKED_REASON: 'teknotech_locked_reason',
        ATTEMPTS: 'teknotech_attempts',
        LAST_CHECK: 'teknotech_last_check',
        HASH_CONSENSUS: 'teknotech_hash_consensus',
        SESSION_LOCKED: 'teknotech_session_locked'
    };

    // Verificar estado LOCKED desde todas las capas
    function isLocked() {
        const locked = localStorage.getItem(STORAGE_KEYS.LOCKED);
        const sessionLocked = sessionStorage.getItem(STORAGE_KEYS.SESSION_LOCKED);
        const ts = localStorage.getItem(STORAGE_KEYS.LOCKED_TS);
        
        if (locked === 'true' || sessionLocked === 'true') {
            // Verificar si el lockout expiró
            if (ts) {
                const lockTime = parseInt(ts);
                const now = Date.now();
                if (now - lockTime > SECURITY_CONFIG.lockoutDuration) {
                    unlock();
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    // Bloquear el software
    function lockSoftware(reason) {
        const ts = Date.now().toString();
        
        // Guardar en todas las capas
        localStorage.setItem(STORAGE_KEYS.LOCKED, 'true');
        localStorage.setItem(STORAGE_KEYS.LOCKED_TS, ts);
        localStorage.setItem(STORAGE_KEYS.LOCKED_REASON, reason);
        sessionStorage.setItem(STORAGE_KEYS.SESSION_LOCKED, 'true');
        
        // IndexedDB
        if (window.indexedDB) {
            const request = indexedDB.open('TeknoTechSecurity', 1);
            request.onupgradeneeded = function(e) {
                e.target.result.createObjectStore('security');
            };
            request.onsuccess = function(e) {
                const db = e.target.result;
                const tx = db.transaction('security', 'readwrite');
                tx.objectStore('security').put({
                    key: 'locked',
                    value: 'true',
                    timestamp: ts,
                    reason: reason
                });
            };
        }
        
        // Cache API
        if ('caches' in window) {
            caches.open('teknotech-security').then(function(cache) {
                cache.put('/locked-status', new Response(JSON.stringify({
                    locked: true,
                    timestamp: ts,
                    reason: reason
                })));
            });
        }
        
        // Mostrar pantalla de bloqueo
        showBlockScreen(reason);
        
        // Registrar en audit log
        auditLog('LOCKED', reason);
        
        // Enviar alerta por email
        sendSecurityAlert(reason);
    }

    // Desbloquear
    function unlock() {
        localStorage.removeItem(STORAGE_KEYS.LOCKED);
        localStorage.removeItem(STORAGE_KEYS.LOCKED_TS);
        localStorage.removeItem(STORAGE_KEYS.LOCKED_REASON);
        sessionStorage.removeItem(STORAGE_KEYS.SESSION_LOCKED);
        
        if (window.indexedDB) {
            const request = indexedDB.open('TeknoTechSecurity', 1);
            request.onsuccess = function(e) {
                const db = e.target.result;
                const tx = db.transaction('security', 'readwrite');
                tx.objectStore('security').delete('locked');
            };
        }
        
        auditLog('UNLOCKED', 'Software desbloqueado');
    }

    // Mostrar pantalla de bloqueo
    function showBlockScreen(reason) {
        // Eliminar contenido existente
        document.body.innerHTML = '';
        document.head.innerHTML = '';
        
        // Crear pantalla de bloqueo
        const blockDiv = document.createElement('div');
        blockDiv.id = 'teknotech-blocked';
        blockDiv.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#000;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:20px;font-family:Arial,sans-serif;';
        
        blockDiv.innerHTML = `
            <img src="assets/logo-principal.png" alt="TeknoTech Services" style="max-width:300px;margin-bottom:30px;">
            <h1 style="color:#fff;font-size:24px;margin-bottom:20px;">Este software fue bloqueado por tiempo indefinido por haber realizado una modificacion sin autorizacion de TeknoTech Services</h1>
            <p style="color:#0066ff;font-size:18px;margin-bottom:30px;">TeknoTech Services dueños y editores legitimos de este software</p>
            <p style="color:#888;font-size:14px;">Contacte a TeknoTech Services para desbloquear</p>
            <p style="color:#666;font-size:12px;margin-top:20px;">Razón: ${reason}</p>
            <p style="color:#666;font-size:12px;">Email: ${SECURITY_CONFIG.email}</p>
        `;
        
        document.body.appendChild(blockDiv);
        
        // Inyectar estilos de bloqueo
        const style = document.createElement('style');
        style.textContent = `
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { overflow: hidden; }
            #teknotech-blocked * { pointer-events: none; }
        `;
        document.head.appendChild(style);
    }

    // Calcular hash SHA-256
    async function calculateHash(content) {
        const encoder = new TextEncoder();
        const data = encoder.encode(content);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Verificar integridad de archivos
    async function verifyIntegrity() {
        try {
            const response = await fetch(SECURITY_CONFIG.manifestPath);
            if (!response.ok) {
                throw new Error('No se pudo cargar el manifiesto');
            }
            
            const manifest = await response.json();
            const files = manifest.files;
            
            // Archivos críticos a verificar
            const criticalFiles = ['index.html', 'css/styles.css', 'js/main.js'];
            
            for (const file of criticalFiles) {
                if (files[file]) {
                    const fileResponse = await fetch(file + '?t=' + Date.now());
                    if (fileResponse.ok) {
                        const content = await fileResponse.text();
                        const currentHash = await calculateHash(content);
                        const expectedHash = files[file].hash.replace('sha256-', '');
                        
                        if (currentHash !== expectedHash) {
                            auditLog('HASH_MISMATCH', `${file} - Hash no coincide`);
                            lockSoftware(`Modificación no autorizada detectada en ${file}`);
                            return false;
                        }
                    }
                }
            }
            
            // Actualizar último check
            localStorage.setItem(STORAGE_KEYS.LAST_CHECK, Date.now().toString());
            auditLog('INTEGRITY_CHECK', 'Verificación completada - Sin cambios');
            
            return true;
        } catch (error) {
            auditLog('INTEGRITY_CHECK', 'Error en verificación: ' + error.message);
            return false;
        }
    }

    // Registrar en audit log
    function auditLog(eventType, details) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${eventType}] ${details}`;
        
        // Guardar en localStorage
        const logs = JSON.parse(localStorage.getItem('teknotech_audit_log') || '[]');
        logs.push(logEntry);
        if (logs.length > 100) logs.shift(); // Mantener últimos 100
        localStorage.setItem('teknotech_audit_log', JSON.stringify(logs));
        
        console.log('[TeknoTech Security]', logEntry);
    }

    // Enviar alerta por email (simulado - en producción usar servicio real)
    function sendSecurityAlert(reason) {
        const timestamp = new Date().toISOString();
        const subject = encodeURIComponent('⚠️ ALERTA DE SEGURIDAD — TeknoTech Services');
        const body = encodeURIComponent(`
Se detectó una modificación no autorizada.

Software: TeknoTech-Services
Razón: ${reason}
Fecha: ${timestamp}
Estado: BLOQUEADO

TeknoTech Services - Sistema de Protección de Software
        `);
        
        // Abrir cliente de email
        window.open(`mailto:${SECURITY_CONFIG.email}?subject=${subject}&body=${body}`, '_blank');
        
        auditLog('EMAIL_SENT', `Alerta enviada a ${SECURITY_CONFIG.email}`);
    }

    // Verificación periódica
    function startPeriodicCheck() {
        setInterval(async function() {
            if (!isLocked()) {
                await verifyIntegrity();
            }
        }, SECURITY_CONFIG.checkInterval);
    }

    // Proteger contra manipulación del DOM
    function protectDOM() {
        // Observar cambios en el body
        const observer = new MutationObserver(function(mutations) {
            if (isLocked()) {
                // Si hay bloqueo, revertir cambios
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach(function(node) {
                            if (node.id !== 'teknotech-blocked') {
                                node.remove();
                            }
                        });
                    }
                });
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Inicializar sistema de seguridad
    async function initSecurity() {
        // Verificar si ya está bloqueado
        if (isLocked()) {
            const reason = localStorage.getItem(STORAGE_KEYS.LOCKED_REASON) || 'Modificación no autorizada';
            showBlockScreen(reason);
            return;
        }
        
        // Verificar integridad
        await verifyIntegrity();
        
        // Iniciar verificación periódica
        startPeriodicCheck();
        
        // Proteger DOM
        protectDOM();
        
        // Registrar inicio
        auditLog('SYSTEM_START', 'Sistema de seguridad inicializado');
    }

    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSecurity);
    } else {
        initSecurity();
    }

    // Proteger contra DevTools
    let devToolsOpen = false;
    const element = new Image();
    Object.defineProperty(element, 'id', {
        get: function() {
            devToolsOpen = true;
            throw new Error('DevTools detected');
        }
    });
    
    setInterval(function() {
        console.log(element);
        if (devToolsOpen && isLocked()) {
            document.body.innerHTML = '';
            document.body.appendChild(document.createTextNode('Acceso denegado'));
        }
    }, 1000);

})();
<!-- TeknoTech Services - Creadores y Dueños. Prohibido vender o modificar sin autorizacion. -->
