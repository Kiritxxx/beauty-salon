/**
 * Vistas públicas: portada, inicio de sesión, registro y recuperación (CU01–CU04)
 * Se agregan como métodos de DulceMiradaApp (código sin cambios respecto al original).
 */
Object.assign(DulceMiradaApp.prototype, {
    /**
     * ========================================================================
     * VISTAS PÚBLICAS: LANDING, LOGIN (CU02/CU03), REGISTRO (CU01), RECUPERAR (CU04)
     * ========================================================================
     */
    renderPublicLandingView() {
        const serviciosActivos = this.ctrlServicios.consultarServicios(true);
        return `
            <!-- Hero Banner Dulce Mirada -->
            <section class="relative overflow-hidden py-12 sm:py-16 px-4 sm:px-6 lg:px-8 rose-gradient border-b border-rosequartz">
                <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                    <div class="lg:col-span-7 space-y-6 animate-fade-in">
                        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-rosequartz shadow-sm">
                            <span class="w-2 h-2 rounded-full bg-berry animate-ping"></span>
                            <span class="text-xs font-bold text-berry uppercase tracking-wider">Salón de Belleza en Chepén · Agenda Online 2026</span>
                        </div>
                        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-plum leading-tight">
                            Realza el encanto de tu mirada en <span class="text-berry italic">Dulce Mirada</span>
                        </h1>
                        <p class="text-base sm:text-lg text-plum/80 leading-relaxed max-w-2xl">
                            Plataforma web oficial para la reserva de citas y consulta de servicios especializados en pestañas, cejas, manicure rusa, cuidado facial y maquillaje social en la ciudad de Chepén.
                        </p>
                        <div class="flex flex-wrap gap-3 pt-2">
                            <button onclick="app.navigate('LOGIN')" class="px-6 py-3.5 rounded-2xl luxury-gradient text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition flex items-center gap-2">
                                <i class="fa-solid fa-calendar-check text-gold"></i> Reservar una Cita Ahora
                            </button>
                            <button onclick="app.navigate('REGISTER')" class="px-6 py-3.5 rounded-2xl bg-white text-plum font-semibold border border-rosequartz shadow-sm hover:bg-rosequartz/30 transition flex items-center gap-2">
                                <i class="fa-solid fa-user-plus text-berry"></i> Crear Cuenta de Clienta
                            </button>
                        </div>
                        <div class="grid grid-cols-3 gap-4 pt-4 border-t border-rosequartz/80 max-w-lg">
                            <div>
                                <p class="text-2xl font-luxury font-bold text-berry">${serviciosActivos.length}+</p>
                                <p class="text-xs text-plum/70">Servicios Exclusivos</p>
                            </div>
                            <div>
                                <p class="text-2xl font-luxury font-bold text-berry">100%</p>
                                <p class="text-xs text-plum/70">Disponibilidad en Vivo</p>
                            </div>
                            <div>
                                <p class="text-2xl font-luxury font-bold text-berry">Chepén</p>
                                <p class="text-xs text-plum/70">Atención Personalizada</p>
                            </div>
                        </div>
                    </div>

                    <!-- Tarjeta Interactiva de Vista Rápida -->
                    <div class="lg:col-span-5">
                        <div class="glass-card rounded-3xl p-6 sm:p-8 shadow-xl relative">
                            <div class="flex items-center justify-between border-b border-rosequartz pb-4 mb-5">
                                <div>
                                    <span class="text-[11px] font-bold uppercase tracking-wider text-berry">Organigrama & Atención</span>
                                    <h3 class="text-xl font-bold text-plum">Dulce Mirada Salón</h3>
                                </div>
                                <div class="w-11 h-11 rounded-2xl bg-rosequartz/50 flex items-center justify-center text-berry">
                                    <i class="fa-solid fa-wand-magic-sparkles text-lg"></i>
                                </div>
                            </div>
                            <div class="space-y-3 text-xs">
                                <div class="p-3.5 rounded-2xl bg-rosebg border border-rosequartz flex items-center gap-3.5">
                                    <div class="w-10 h-10 rounded-xl luxury-gradient text-white flex items-center justify-center font-bold shrink-0">RN</div>
                                    <div>
                                        <p class="font-bold text-plum text-sm">Rosa Elizabeth Núñez Castillo</p>
                                        <p class="text-berry font-medium">Propietaria y Administradora General</p>
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                                    ${this.db.personal.filter(p => p.estado === 'Activo').map(p => `
                                        <div class="p-3 rounded-xl bg-white border border-rosequartz/80 text-center">
                                            <div class="w-8 h-8 rounded-full bg-rosequartz/60 text-berry font-bold flex items-center justify-center mx-auto mb-1.5">
                                                ${p.nombres.charAt(0)}${p.apellidos.charAt(0)}
                                            </div>
                                            <p class="font-bold text-plum truncate">${p.nombres} ${p.apellidos.split(' ')[0]}</p>
                                            <p class="text-[10px] text-plum/70 line-clamp-1">${p.cargo}</p>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            <div class="mt-6 pt-4 border-t border-rosequartz flex items-center justify-between text-xs">
                                <span class="text-plum/80"><i class="fa-solid fa-shield-heart text-berry mr-1"></i> Reserva digital sin esperas</span>
                                <button onclick="app.switchDemoRole('CLIENTE')" class="font-bold text-berry hover:underline">
                                    Probar como Clienta →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Catálogo Público de Servicios (RF07 / CU07) -->
            <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                    <div>
                        <span class="text-xs font-bold uppercase tracking-widest text-berry">RF07 · CU07 Consultar Servicios</span>
                        <h2 class="text-3xl font-bold text-plum mt-1">Catálogo de Servicios de Belleza</h2>
                    </div>
                    <p class="text-xs text-plum/70 max-w-md">
                        Precios expresados en Soles (S/) con tiempos estimados de atención profesional en nuestro estudio de Chepén.
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    ${serviciosActivos.map(s => `
                        <div class="bg-white rounded-3xl p-6 border border-rosequartz shadow-sm hover:shadow-md transition flex flex-col justify-between group">
                            <div>
                                <div class="flex items-center justify-between gap-2 mb-3">
                                    <span class="px-3 py-1 rounded-full text-[11px] font-bold bg-rosebg text-berry border border-rosequartz">
                                        ${s.categoria}
                                    </span>
                                    <span class="text-xs text-plum/70 font-medium">
                                        <i class="fa-regular fa-clock text-berry mr-1"></i>${s.duracion} min
                                    </span>
                                </div>
                                <h3 class="text-lg font-bold text-plum group-hover:text-berry transition mb-2">${s.nombre}</h3>
                                <p class="text-xs text-plum/75 leading-relaxed mb-4">${s.descripcion}</p>
                            </div>
                            <div class="pt-4 border-t border-rosequartz/60 flex items-center justify-between">
                                <div>
                                    <span class="text-[10px] uppercase text-plum/60 block">Precio</span>
                                    <span class="text-xl font-bold text-plum">S/ ${s.precio.toFixed(2)}</span>
                                </div>
                                <button onclick="app.SelectServiceFromPublic(${s.idServicio})" class="px-4 py-2 rounded-xl bg-berry hover:bg-berrydark text-white text-xs font-semibold transition shadow-sm">
                                    Reservar <i class="fa-solid fa-arrow-right ml-1"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>
        `;
    },

    SelectServiceFromPublic(idServicio) {
        this.bookingState.idServicio = idServicio;
        this.navigate('LOGIN');
        this.showToast('Inicie sesión o seleccione una cuenta de demostración para reservar este servicio.', 'info', 'Reservación Dulce Mirada');
    },

    // Vista Iniciar Sesión (CU02 / CU03)
    renderLoginView() {
        return `
            <div class="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
                <div class="bg-white rounded-3xl shadow-xl border border-rosequartz overflow-hidden grid grid-cols-1 md:grid-cols-12">
                    <!-- Columna Izquierda: Formulario Login -->
                    <div class="md:col-span-7 p-8 sm:p-10">
                        <span class="text-[11px] font-bold uppercase tracking-widest text-berry">RF02 · RF03 · CU02 Iniciar Sesión</span>
                        <h2 class="text-2xl sm:text-3xl font-bold text-plum mt-1 mb-2">Bienvenida a Dulce Mirada</h2>
                        <p class="text-xs text-plum/70 mb-6">Ingrese sus credenciales para acceder al panel correspondiente a su rol.</p>

                        <form onsubmit="app.handleLoginSubmit(event)" class="space-y-4">
                            <div>
                                <label class="block text-xs font-bold text-plum mb-1.5">Nombre de Usuario</label>
                                <div class="relative">
                                    <i class="fa-solid fa-user absolute left-3.5 top-3.5 text-berry/60 text-sm"></i>
                                    <input type="text" id="login-username" required placeholder="Ej. mtorres, rnunez, vmendoza"
                                        class="w-full pl-10 pr-4 py-3 rounded-xl border border-rosequartz bg-rosebg/50 text-sm focus:outline-none focus:border-berry">
                                </div>
                            </div>
                            <div>
                                <div class="flex items-center justify-between mb-1.5">
                                    <label class="block text-xs font-bold text-plum">Contraseña</label>
                                    <button type="button" onclick="app.navigate('RECOVER')" class="text-xs font-semibold text-berry hover:underline">
                                        ¿Olvidó su contraseña? (CU04)
                                    </button>
                                </div>
                                <div class="relative">
                                    <i class="fa-solid fa-lock absolute left-3.5 top-3.5 text-berry/60 text-sm"></i>
                                    <input type="password" id="login-password" required placeholder="••••••••"
                                        class="w-full pl-10 pr-4 py-3 rounded-xl border border-rosequartz bg-rosebg/50 text-sm focus:outline-none focus:border-berry">
                                </div>
                            </div>
                            <button type="submit" class="w-full py-3.5 rounded-xl luxury-gradient text-white font-bold text-sm shadow-md hover:opacity-95 transition">
                                Ingresar al Sistema
                            </button>
                        </form>

                        <div class="mt-6 pt-5 border-t border-rosequartz text-center text-xs">
                            <span class="text-plum/70">¿Es nueva clienta en Dulce Mirada?</span>
                            <button onclick="app.navigate('REGISTER')" class="ml-1 font-bold text-berry hover:underline">
                                Registrar cuenta aquí (CU01)
                            </button>
                        </div>
                    </div>

                    <!-- Columna Derecha: Autocompletado de Credenciales para Pruebas -->
                    <div class="md:col-span-5 luxury-gradient text-white p-8 flex flex-col justify-between">
                        <div>
                            <span class="px-2.5 py-1 rounded-full bg-gold text-plum font-bold text-[10px] uppercase">Acceso Rápido Evaluador</span>
                            <h3 class="text-xl font-bold mt-3 mb-2">Cuentas Precargadas</h3>
                            <p class="text-xs text-rosequartz/90 leading-relaxed mb-5">
                                Haga clic en cualquiera de los 3 actores del sistema para autocompletar sus credenciales e iniciar sesión:
                            </p>

                            <div class="space-y-2.5 text-xs">
                                <button onclick="app.fillAndSubmitLogin('rnunez', 'admin123')" class="w-full p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-left transition flex items-center justify-between">
                                    <div>
                                        <p class="font-bold text-gold"><i class="fa-solid fa-crown mr-1"></i> Administradora</p>
                                        <p class="text-[11px] text-white/90">Rosa Núñez (user: <b>rnunez</b>)</p>
                                    </div>
                                    <i class="fa-solid fa-arrow-right"></i>
                                </button>

                                <button onclick="app.fillAndSubmitLogin('mtorres', 'cliente123')" class="w-full p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-left transition flex items-center justify-between">
                                    <div>
                                        <p class="font-bold text-pink-200"><i class="fa-solid fa-user-check mr-1"></i> Actora: Cliente</p>
                                        <p class="text-[11px] text-white/90">María Torres (user: <b>mtorres</b>)</p>
                                    </div>
                                    <i class="fa-solid fa-arrow-right"></i>
                                </button>

                                <button onclick="app.fillAndSubmitLogin('vmendoza', 'personal123')" class="w-full p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-left transition flex items-center justify-between">
                                    <div>
                                        <p class="font-bold text-emerald-200"><i class="fa-solid fa-wand-magic-sparkles mr-1"></i> Personal de Atención</p>
                                        <p class="text-[11px] text-white/90">Valeria Mendoza (user: <b>vmendoza</b>)</p>
                                    </div>
                                    <i class="fa-solid fa-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                        <div class="pt-6 text-[11px] text-rosequartz/70">
                            Incluye validación automática de caso de uso <b>&lt;&lt;include&gt;&gt; CU03 Validar Credenciales</b>.
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    fillAndSubmitLogin(u, p) {
        const uInput = document.getElementById('login-username');
        const pInput = document.getElementById('login-password');
        if (uInput && pInput) {
            uInput.value = u;
            pInput.value = p;
        }
        const res = this.ctrlAuth.validarCredenciales(u, p);
        if (res.valido) {
            this.loginWithUserObject(res.usuario);
            this.updateDemoBarHighlight();
            this.renderHeader();
            this.renderViewport();
        }
    },

    handleLoginSubmit(e) {
        e.preventDefault();
        const u = document.getElementById('login-username').value;
        const p = document.getElementById('login-password').value;
        const res = this.ctrlAuth.validarCredenciales(u, p);
        if (!res.valido) {
            this.showToast(res.mensaje, 'error', 'CU03: Error de Autenticación');
            return;
        }
        this.loginWithUserObject(res.usuario);
        this.updateDemoBarHighlight();
        this.renderHeader();
        this.renderViewport();
    },

    // Vista Registrar Cuenta (RF01 / CU01)
    renderRegisterView() {
        return `
            <div class="max-w-2xl mx-auto px-4 py-12 animate-fade-in">
                <div class="bg-white rounded-3xl shadow-xl border border-rosequartz p-8 sm:p-10">
                    <span class="text-[11px] font-bold uppercase tracking-widest text-berry">RF01 · CU01 Registrar Cuenta de Clienta</span>
                    <h2 class="text-2xl sm:text-3xl font-bold text-plum mt-1 mb-2">Crear Cuenta en Dulce Mirada</h2>
                    <p class="text-xs text-plum/70 mb-6">Complete sus datos personales para reservar citas y consultar su historial de atenciones.</p>

                    <form onsubmit="app.handleRegisterSubmit(event)" class="space-y-4">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-plum mb-1">Nombres *</label>
                                <input type="text" id="reg-nombres" required placeholder="Ej. Luciana" class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz bg-rosebg/40 text-sm">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-plum mb-1">Apellidos *</label>
                                <input type="text" id="reg-apellidos" required placeholder="Ej. Castañeda Silva" class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz bg-rosebg/40 text-sm">
                            </div>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-plum mb-1">Teléfono Celular (Chepén) *</label>
                                <input type="tel" id="reg-telefono" required pattern="[0-9]{9}" placeholder="9 dígitos (Ej. 948123456)" class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz bg-rosebg/40 text-sm">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-plum mb-1">Correo Electrónico *</label>
                                <input type="email" id="reg-correo" required placeholder="ejemplo@correo.com" class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz bg-rosebg/40 text-sm">
                            </div>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-rosequartz">
                            <div>
                                <label class="block text-xs font-bold text-plum mb-1">Usuario de Acceso *</label>
                                <input type="text" id="reg-usuario" required placeholder="Ej. lcastaneda" class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz bg-rosebg/40 text-sm">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-plum mb-1">Contraseña *</label>
                                <input type="password" id="reg-pass" required minlength="4" placeholder="Mínimo 4 caracteres" class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz bg-rosebg/40 text-sm">
                            </div>
                        </div>

                        <div class="pt-3 flex items-center justify-end gap-3">
                            <button type="button" onclick="app.navigate('LOGIN')" class="px-5 py-2.5 rounded-xl border border-rosequartz text-xs font-semibold text-plum hover:bg-rosebg">
                                Cancelar
                            </button>
                            <button type="submit" class="px-6 py-3 rounded-xl luxury-gradient text-white text-xs font-bold shadow-md hover:opacity-95">
                                <i class="fa-solid fa-check mr-1"></i> Completar Registro (CU01)
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    handleRegisterSubmit(e) {
        e.preventDefault();
        const res = this.ctrlClientes.registrarCliente({
            nombres: document.getElementById('reg-nombres').value,
            apellidos: document.getElementById('reg-apellidos').value,
            telefono: document.getElementById('reg-telefono').value,
            correo: document.getElementById('reg-correo').value,
            nombreUsuario: document.getElementById('reg-usuario').value,
            contrasena: document.getElementById('reg-pass').value
        });
        if (!res.exito) {
            this.showToast(res.mensaje, 'error', 'Flujo Alternativo CU01');
            return;
        }
        this.showToast(res.mensaje, 'success', 'CU01: Cuenta Creada');
        this.loginWithUserObject(res.usuario);
        this.updateDemoBarHighlight();
        this.renderHeader();
        this.renderViewport();
    },

    // Vista Recuperar Contraseña (RF04 / CU04)
    renderRecoverPasswordView() {
        return `
            <div class="max-w-lg mx-auto px-4 py-12 animate-fade-in">
                <div class="bg-white rounded-3xl shadow-xl border border-rosequartz p-8">
                    <span class="text-[11px] font-bold uppercase tracking-widest text-berry">RF04 · CU04 Recuperar Contraseña</span>
                    <h2 class="text-2xl font-bold text-plum mt-1 mb-2">Restablecer Acceso</h2>
                    <p class="text-xs text-plum/70 mb-5">
                        Ingrese el correo electrónico asociado a su cuenta (ej. <b>mtorres@gmail.com</b>) y asigne su nueva clave de acceso.
                    </p>
                    <form onsubmit="app.handleRecoverSubmit(event)" class="space-y-4">
                        <div>
                            <label class="block text-xs font-bold text-plum mb-1">Correo Electrónico Registrado</label>
                            <input type="email" id="rec-correo" required value="mtorres@gmail.com" class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz bg-rosebg/40 text-sm">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-plum mb-1">Nueva Contraseña</label>
                            <input type="password" id="rec-pass" required minlength="4" placeholder="Nueva contraseña" class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz bg-rosebg/40 text-sm">
                        </div>
                        <div class="flex justify-end gap-2 pt-2">
                            <button type="button" onclick="app.navigate('LOGIN')" class="px-4 py-2.5 rounded-xl border border-rosequartz text-xs font-semibold">Volver al Login</button>
                            <button type="submit" class="px-5 py-2.5 rounded-xl bg-berry text-white text-xs font-bold">Restablecer Clave</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    handleRecoverSubmit(e) {
        e.preventDefault();
        const correo = document.getElementById('rec-correo').value;
        const pass = document.getElementById('rec-pass').value;
        const res = this.ctrlAuth.recuperarContrasena(correo, pass);
        if (!res.exito) {
            this.showToast(res.mensaje, 'error', 'CU04: Correo no identificado');
            return;
        }
        this.showToast(res.mensaje, 'success', 'CU04: Recuperación Exitosa');
        this.navigate('LOGIN');
    },
});
