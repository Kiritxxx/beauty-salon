/**
 * Capa de interfaz (Boundary) · núcleo
 * Clase principal: inicialización, modales, notificaciones, sesión y navegación. Las vistas se agregan desde js/views/*.js.
 */

class DulceMiradaApp {
    constructor() {
        this.db = DatabaseService.load();
        this.initControllers();

        // Estado de navegación actual
        this.currentRole = 'PUBLIC'; // 'PUBLIC' | 'ADMINISTRADOR' | 'CLIENTE' | 'PERSONAL'
        this.currentView = 'LANDING'; // Sub-vista dentro de cada diagrama de navegabilidad
        this.activeProfile = null;

        // Estado temporal para el flujo del Diagrama de Secuencia "Reservar Cita" (CU11 / CU12)
        this.bookingState = {
            idServicio: 1,
            idPersonal: 1,
            fecha: '2026-11-05',
            idHorario: null,
            verificado: false,
            disponible: false,
            mensajeVerificacion: '',
            categoriaFiltro: 'Todos',
            busquedaServicio: ''
        };

        this.init();
    }

    initControllers() {
        this.ctrlAuth = new ControlAutenticacion(this.db);
        this.ctrlClientes = new ControlClientes(this.db);
        this.ctrlServicios = new ControlServicios(this.db);
        this.ctrlHorarios = new ControlHorarios(this.db);
        this.ctrlCitas = new ControlCitas(this.db, this.ctrlHorarios);
        this.ctrlAtencion = new ControlAtencion(this.db);
    }

    init() {
        this.updateDemoBarHighlight();
        this.renderHeader();
        this.renderViewport();
    }

    // Auxiliar para obtener entidades relacionadas de una Cita
    enrichCita(cita) {
        const cliente = this.db.clientes.find(c => c.idCliente === cita.idCliente) || { nombres: 'Clienta', apellidos: 'General', telefono: '-', correo: '-' };
        const personal = this.db.personal.find(p => p.idPersonal === cita.idPersonal) || { nombres: 'Especialista', apellidos: '', cargo: 'Salón' };
        const servicio = this.db.servicios.find(s => s.idServicio === cita.idServicio) || { nombre: 'Servicio', precio: 0, duracion: 60 };
        const horario = this.db.horarios.find(h => h.idHorario === cita.idHorario) || { horaInicio: cita.hora, horaFin: '' };
        const atencion = this.db.atenciones.find(a => a.idCita === cita.idCita) || null;
        return { ...cita, cliente, personal, servicio, horario, atencion };
    }

    // Notificaciones Toast elegantes (Reemplazo total de alert)
    showToast(mensaje, tipo = 'success', titulo = '') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        const styles = {
            success: { bg: 'bg-emerald-900 text-white border-emerald-500', icon: 'fa-circle-check text-emerald-300', defaultTitle: 'Operación Exitosa' },
            error: { bg: 'bg-rose-950 text-white border-rose-500', icon: 'fa-circle-exclamation text-rose-300', defaultTitle: 'Atención' },
            info: { bg: 'bg-plum text-white border-gold', icon: 'fa-wand-magic-sparkles text-gold', defaultTitle: 'Dulce Mirada' }
        }[tipo] || { bg: 'bg-plum text-white border-gold', icon: 'fa-bell text-gold', defaultTitle: 'Aviso' };

        toast.className = `pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border-l-4 ${styles.bg} animate-fade-in`;
        toast.innerHTML = `
            <i class="fa-solid ${styles.icon} text-lg mt-0.5"></i>
            <div class="flex-1 text-xs">
                <p class="font-bold text-sm mb-0.5">${titulo || styles.defaultTitle}</p>
                <p class="opacity-90 leading-relaxed">${mensaje}</p>
            </div>
            <button onclick="this.parentElement.remove()" class="opacity-70 hover:opacity-100 text-sm">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;
        container.appendChild(toast);
        setTimeout(() => {
            if (toast.parentElement) toast.remove();
        }, 4800);
    }

    openModal(htmlContent, maxWidthClass = 'max-w-2xl') {
        const root = document.getElementById('modal-root');
        const content = document.getElementById('modal-content');
        content.className = `bg-white rounded-3xl shadow-2xl border border-rosequartz ${maxWidthClass} w-full overflow-hidden animate-fade-in my-8`;
        content.innerHTML = htmlContent;
        root.classList.remove('hidden');
        root.classList.add('flex');
    }

    closeModal() {
        const root = document.getElementById('modal-root');
        root.classList.add('hidden');
        root.classList.remove('flex');
    }

    // Cambio rápido de Actor desde la barra superior para exposición universitaria
    switchDemoRole(targetRole) {
        if (targetRole === 'PUBLIC') {
            this.ctrlAuth.usuarioActual = null;
            this.activeProfile = null;
            this.currentRole = 'PUBLIC';
            this.currentView = 'LANDING';
            this.showToast('Vista pública activada. Puede explorar el catálogo o iniciar sesión.', 'info', 'Modo Visitante');
        } else if (targetRole === 'ADMINISTRADOR') {
            const user = this.db.usuarios.find(u => u.rol === 'ADMINISTRADOR');
            this.loginWithUserObject(user);
        } else if (targetRole === 'CLIENTE') {
            const user = this.db.usuarios.find(u => u.nombreUsuario === 'mtorres') || this.db.usuarios.find(u => u.rol === 'CLIENTE');
            this.loginWithUserObject(user);
        } else if (targetRole === 'PERSONAL') {
            const user = this.db.usuarios.find(u => u.nombreUsuario === 'vmendoza') || this.db.usuarios.find(u => u.rol === 'PERSONAL');
            this.loginWithUserObject(user);
        }
        this.updateDemoBarHighlight();
        this.renderHeader();
        this.renderViewport();
    }

    loginWithUserObject(user) {
        this.ctrlAuth.usuarioActual = user;
        this.activeProfile = this.ctrlAuth.identificarRol(user);
        this.currentRole = user.rol;
        if (user.rol === 'ADMINISTRADOR') this.currentView = 'ADMIN_PANEL';
        if (user.rol === 'CLIENTE') this.currentView = 'CLIENT_PANEL';
        if (user.rol === 'PERSONAL') this.currentView = 'STAFF_PANEL';
        this.showToast(`Sesión iniciada como ${this.activeProfile.nombreMostrar} (${this.activeProfile.subtitulo}).`, 'success', 'CU02 / CU05: Acceso Autorizado');
    }

    updateDemoBarHighlight() {
        ['PUBLIC', 'ADMINISTRADOR', 'CLIENTE', 'PERSONAL'].forEach(r => {
            const btn = document.getElementById(`demo-btn-${r}`);
            if (!btn) return;
            if (this.currentRole === r) {
                btn.className = 'px-2.5 py-1 rounded-md bg-gold text-plum font-bold transition flex items-center gap-1.5 text-[11px] shadow-sm';
            } else {
                btn.className = 'px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1.5 text-[11px] font-medium';
            }
        });
    }

    handleLogoClick() {
        if (this.currentRole === 'PUBLIC') {
            this.navigate('LANDING');
        } else if (this.currentRole === 'ADMINISTRADOR') {
            this.navigate('ADMIN_PANEL');
        } else if (this.currentRole === 'CLIENTE') {
            this.navigate('CLIENT_PANEL');
        } else if (this.currentRole === 'PERSONAL') {
            this.navigate('STAFF_PANEL');
        }
    }

    navigate(viewName) {
        this.currentView = viewName;
        this.renderHeader();
        this.renderViewport();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // CU06: Cerrar sesión
    cerrarSesion() {
        const nombre = this.activeProfile ? this.activeProfile.nombreMostrar : 'Usuario';
        this.ctrlAuth.usuarioActual = null;
        this.activeProfile = null;
        this.currentRole = 'PUBLIC';
        this.currentView = 'LOGIN';
        this.updateDemoBarHighlight();
        this.renderHeader();
        this.renderViewport();
        this.showToast(`Sesión finalizada de manera segura para ${nombre}.`, 'info', 'CU06: Cerrar Sesión');
    }

    /**
     * ========================================================================
     * RENDERIZADO DE CABECERA SEGÚN ACTOR
     * ========================================================================
     */
    renderHeader() {
        const nav = document.getElementById('header-nav-container');
        if (this.currentRole === 'PUBLIC') {
            nav.innerHTML = `
                <button onclick="app.navigate('LANDING')" class="text-xs sm:text-sm font-semibold px-3 py-2 rounded-xl transition ${this.currentView === 'LANDING' ? 'text-berry bg-rosequartz/40' : 'text-plum hover:bg-rosequartz/20'}">
                    Inicio y Catálogo
                </button>
                <button onclick="app.navigate('REGISTER')" class="text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl border border-berry text-berry hover:bg-rosequartz/30 transition">
                    <i class="fa-solid fa-user-plus mr-1"></i> Registrarse
                </button>
                <button onclick="app.navigate('LOGIN')" class="text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl luxury-gradient text-white shadow-md hover:opacity-95 transition">
                    <i class="fa-solid fa-right-to-bracket mr-1"></i> Iniciar Sesión
                </button>
            `;
        } else {
            const roleBadgeColors = {
                ADMINISTRADOR: 'bg-amber-100 text-amber-900 border-amber-300',
                CLIENTE: 'bg-pink-100 text-berry border-pink-300',
                PERSONAL: 'bg-emerald-100 text-emerald-900 border-emerald-300'
            }[this.currentRole];

            nav.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="hidden sm:flex flex-col items-end">
                        <div class="flex items-center gap-2">
                            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleBadgeColors}">
                                ${this.currentRole}
                            </span>
                            <span class="text-sm font-bold text-plum">${this.activeProfile.nombreMostrar}</span>
                        </div>
                        <span class="text-[11px] text-berry/80">${this.activeProfile.subtitulo}</span>
                    </div>
                    <button onclick="app.cerrarSesion()" class="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-berry font-semibold text-xs border border-rosequartz transition flex items-center gap-1.5">
                        <i class="fa-solid fa-power-off"></i>
                        <span class="hidden md:inline">Cerrar Sesión</span>
                    </button>
                </div>
            `;
        }
    }

    /**
     * ========================================================================
     * ENRUTADOR DE VISTAS (DIAGRAMAS DE NAVEGABILIDAD SECCIÓN 3.1.12)
     * ========================================================================
     */
    renderViewport() {
        const vp = document.getElementById('app-viewport');
        if (this.currentRole === 'PUBLIC') {
            if (this.currentView === 'LOGIN') vp.innerHTML = this.renderLoginView();
            else if (this.currentView === 'REGISTER') vp.innerHTML = this.renderRegisterView();
            else if (this.currentView === 'RECOVER') vp.innerHTML = this.renderRecoverPasswordView();
            else vp.innerHTML = this.renderPublicLandingView();
        } else if (this.currentRole === 'CLIENTE') {
            vp.innerHTML = this.renderClientLayout();
        } else if (this.currentRole === 'ADMINISTRADOR') {
            vp.innerHTML = this.renderAdminLayout();
        } else if (this.currentRole === 'PERSONAL') {
            vp.innerHTML = this.renderStaffLayout();
        }
    }
}
