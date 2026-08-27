// TeknoTech Services - Landing Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('nav');
    const navLinks = document.querySelectorAll('.nav-link');

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });

        // Close menu when clicking a link
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                nav.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
                nav.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });
    }

    // Header scroll effect
    const header = document.getElementById('header');
    let lastScroll = 0;

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.style.background = 'rgba(13, 13, 13, 0.98)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.4)';
        } else {
            header.style.background = '#0d0d0d';
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
        }
        
        lastScroll = currentScroll;
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            // Simple validation
            if (!name || !email || !message) {
                showNotification('Por favor completa todos los campos.', 'error');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showNotification('Por favor ingresa un email valido.', 'error');
                return;
            }

            fetch('https://formsubmit.co/ajax/teknotech.oficial@gmail.com', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    Nombre: name,
                    Email: email,
                    Mensaje: message,
                    _subject: 'Mensaje desde TeknoTech Services - Contacto',
                    _captcha: 'false'
                })
            }).then(function() {
                showNotification('Mensaje enviado correctamente! Te contactaremos pronto.', 'success');
                contactForm.reset();
            }).catch(function() {
                showNotification('Error al enviar. Intentalo de nuevo.', 'error');
            });
        });
    }

    // Notification function
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = 'notification notification-' + type;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 9999;
            animation: slideIn 0.3s ease;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
            background: ${type === 'success' ? '#0066CC' : '#e74c3c'};
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.service-card, .contact-item, .value-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Wizard Logic
let currentStep = '1';
let wizardData = {
    service: '',
    clientType: '',
    softwareType: '',
    projectDesc: '',
    device: '',
    brand: '',
    fault: '',
    problemDesc: ''
};

const stepSequences = {
    software: ['1', '2a', '3a', '4a', 'summary'],
    tecnico: ['1', '2b', '3b', '4b', '5b', 'summary']
};

let currentSequence = [];

function selectService(btn) {
    document.querySelectorAll('[data-step="1"] .option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    wizardData.service = btn.dataset.value;
    currentSequence = stepSequences[btn.dataset.value];
    document.getElementById('btn-next').disabled = false;
}

function selectClientType(btn) {
    document.querySelectorAll('[data-step="2a"] .option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    wizardData.clientType = btn.dataset.value;
    document.getElementById('btn-next').disabled = false;
}

function selectSoftwareType(btn) {
    document.querySelectorAll('[data-step="3a"] .option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    wizardData.softwareType = btn.dataset.value;
    document.getElementById('btn-next').disabled = false;
}

function selectDevice(btn) {
    document.querySelectorAll('[data-step="2b"] .option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    wizardData.device = btn.dataset.value;
    document.getElementById('btn-next').disabled = false;
}

function selectBrand(btn) {
    document.querySelectorAll('[data-step="3b"] .option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    wizardData.brand = btn.dataset.value;
    document.getElementById('btn-next').disabled = false;
}

function selectFault(btn) {
    document.querySelectorAll('[data-step="4b"] .option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    wizardData.fault = btn.dataset.value;
    document.getElementById('btn-next').disabled = false;
}

document.getElementById('project-desc').addEventListener('input', function() {
    if (currentStep === '4a') document.getElementById('btn-next').disabled = this.value.trim() === '';
});

document.getElementById('problem-desc').addEventListener('input', function() {
    if (currentStep === '5b') document.getElementById('btn-next').disabled = this.value.trim() === '';
});

function nextStep() {
    if (currentStep === '1' && !wizardData.service) return;
    
    if (wizardData.service === 'software') {
        if (currentStep === '4a') {
            wizardData.projectDesc = document.getElementById('project-desc').value;
        }
    } else {
        if (currentStep === '5b') {
            wizardData.problemDesc = document.getElementById('problem-desc').value;
        }
    }
    
    const nextIndex = currentSequence.indexOf(currentStep) + 1;
    if (nextIndex < currentSequence.length) {
        const nextStepNum = currentSequence[nextIndex];
        if (nextStepNum === 'summary') {
            sendToFormSubmit();
        } else {
            showStep(nextStepNum);
        }
    }
}

function prevStep() {
    const prevIndex = currentSequence.indexOf(currentStep) - 1;
    if (prevIndex >= 0) {
        const prevStepNum = currentSequence[prevIndex];
        showStep(prevStepNum);
    }
}

function showStep(step) {
    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('active'));
    document.querySelector('[data-step="' + step + '"]').classList.add('active');
    currentStep = step;
    
    const btnBack = document.getElementById('btn-back');
    const btnNext = document.getElementById('btn-next');
    const btnSend = document.getElementById('btn-send');
    
    btnBack.style.display = currentSequence.indexOf(currentStep) > 0 ? 'inline-block' : 'none';
    
    if (step === 'summary' || step === 'sent') {
        btnNext.style.display = 'none';
        btnSend.style.display = 'none';
        btnBack.style.display = 'none';
    } else {
        btnNext.style.display = 'inline-block';
        btnSend.style.display = 'none';
        if (step === '4a') {
            btnNext.disabled = document.getElementById('project-desc').value.trim() === '';
        } else if (step === '5b') {
            btnNext.disabled = document.getElementById('problem-desc').value.trim() === '';
        } else {
            btnNext.disabled = true;
        }
    }
    
    const progress = ((currentSequence.indexOf(currentStep) + 1) / currentSequence.length) * 100;
    document.getElementById('progress-bar').style.width = progress + '%';
}

function showSummary() {
    const summaryDiv = document.getElementById('summary-content');
    let html = '';
    
    html += '<div class="summary-item"><span class="summary-label">Servicio:</span><span class="summary-value">' + (wizardData.service === 'software' ? 'Desarrollo de Software' : 'Servicio Tecnico') + '</span></div>';
    
    if (wizardData.service === 'software') {
        html += '<div class="summary-item"><span class="summary-label">Para:</span><span class="summary-value">' + (wizardData.clientType === 'empresa' ? 'Empresa' : 'Marca Personal') + '</span></div>';
        html += '<div class="summary-item"><span class="summary-label">Tipo:</span><span class="summary-value">' + getSoftwareTypeLabel(wizardData.softwareType) + '</span></div>';
        if (wizardData.projectDesc) {
            html += '<div class="summary-item"><span class="summary-label">Descripcion:</span><span class="summary-value">' + wizardData.projectDesc + '</span></div>';
        }
    } else {
        html += '<div class="summary-item"><span class="summary-label">Dispositivo:</span><span class="summary-value">' + capitalize(wizardData.device) + '</span></div>';
        html += '<div class="summary-item"><span class="summary-label">Marca:</span><span class="summary-value">' + capitalize(wizardData.brand) + '</span></div>';
        html += '<div class="summary-item"><span class="summary-label">Problema:</span><span class="summary-value">' + getFaultLabel(wizardData.fault) + '</span></div>';
        if (wizardData.problemDesc) {
            html += '<div class="summary-item"><span class="summary-label">Descripcion:</span><span class="summary-value">' + wizardData.problemDesc + '</span></div>';
        }
    }
    
    summaryDiv.innerHTML = html;
}

function getSoftwareTypeLabel(type) {
    const labels = { web: 'Pagina Web', app: 'App Movil', sistema: 'Sistema a Medida' };
    return labels[type] || type;
}

function getFaultLabel(fault) {
    const labels = {
        pantalla: 'Pantalla rota', bateria: 'Problema de bateria', carga: 'No carga',
        lento: 'Funciona lento', virus: 'Virus / Malware', audio: 'Problema de audio',
        botones: 'Botones no funcionan', otro: 'Otro'
    };
    return labels[fault] || fault;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function sendToWhatsApp() {
    let message = '*Nueva consulta desde TeknoTech Services*\n\n';
    
    if (wizardData.service === 'software') {
        message += '*Servicio:* Desarrollo de Software\n';
        message += '*Para:* ' + (wizardData.clientType === 'empresa' ? 'Empresa' : 'Marca Personal') + '\n';
        message += '*Tipo:* ' + getSoftwareTypeLabel(wizardData.softwareType) + '\n';
        if (wizardData.projectDesc) message += '*Descripcion:* ' + wizardData.projectDesc + '\n';
    } else {
        message += '*Servicio:* Servicio Tecnico\n';
        message += '*Dispositivo:* ' + capitalize(wizardData.device) + '\n';
        message += '*Marca:* ' + capitalize(wizardData.brand) + '\n';
        message += '*Problema:* ' + getFaultLabel(wizardData.fault) + '\n';
        if (wizardData.problemDesc) message += '*Descripcion:* ' + wizardData.problemDesc + '\n';
    }
    
    const phone = '5493754476761';
    const url = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(message);
    window.open(url, '_blank');
}



function sendToFormSubmit() {
    showStep('sent');

    let serviceText = wizardData.service === 'software' ? 'Desarrollo de Software' : 'Servicio Tecnico';
    let details = '';
    
    if (wizardData.service === 'software') {
        details = 'Para: ' + (wizardData.clientType === 'empresa' ? 'Empresa' : 'Marca Personal') + '\n';
        details += 'Tipo: ' + getSoftwareTypeLabel(wizardData.softwareType) + '\n';
        if (wizardData.projectDesc) details += 'Descripcion: ' + wizardData.projectDesc;
    } else {
        details = 'Dispositivo: ' + capitalize(wizardData.device) + '\n';
        details += 'Marca: ' + capitalize(wizardData.brand) + '\n';
        details += 'Problema: ' + getFaultLabel(wizardData.fault) + '\n';
        if (wizardData.problemDesc) details += 'Descripcion: ' + wizardData.problemDesc;
    }

    fetch('https://formsubmit.co/ajax/teknotech.oficial@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            Servicio: serviceText,
            Detalles: details,
            _subject: 'Nueva solicitud desde TeknoTech Services',
            _captcha: 'false'
        })
    }).catch(function() {});
}

function resetWizard() {
    wizardData = {
        service: '', clientType: '', softwareType: '', projectDesc: '',
        device: '', brand: '', fault: '', problemDesc: ''
    };
    currentSequence = [];
    currentStep = '1';
    
    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('active'));
    document.querySelector('[data-step="1"]').classList.add('active');
    
    document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
    document.getElementById('project-desc').value = '';
    document.getElementById('problem-desc').value = '';
    
    document.getElementById('btn-next').style.display = 'inline-block';
    document.getElementById('btn-next').disabled = true;
    document.getElementById('btn-back').style.display = 'none';
    document.getElementById('btn-send').style.display = 'none';
    document.getElementById('progress-bar').style.width = '0%';
    
    window.scrollTo({ top: document.getElementById('wizard').offsetTop - 100, behavior: 'smooth' });
}


