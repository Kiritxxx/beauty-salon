/**
 * Vistas de la clienta: panel, servicios, reservar cita y mis citas (CU05–CU07, CU11, CU12, CU14, CU16, CU17)
 * Se agregan como métodos de DulceMiradaApp (código sin cambios respecto al original).
 */
Object.assign(DulceMiradaApp.prototype, {
    /**
     * ========================================================================
     * 5. DIAGRAMA DE NAVEGABILIDAD DEL CLIENTE (SECCIÓN 3.1.12)
     * Rutas: Panel del Cliente -> Consultar Servicios | Reservar Cita | Mis Citas -> Detalle / Cancelar / Historial
     * ========================================================================
     */
    renderClientLayout() {
        const subViews = [
            { id: 'CLIENT_PANEL', label: 'Panel del Cliente', icon: 'fa-house-chimney', cu: 'CU05' },
            { id: 'CLIENT_SERVICES', label: 'Consultar Servicios', icon: 'fa-sparkles', cu: 'CU07' },
            { id: 'CLIENT_BOOK', label: 'Reservar Cita', icon: 'fa-calendar-plus', cu: 'CU11/CU12' },
            { id: 'CLIENT_APPOINTMENTS', label: 'Mis Citas e Historial', icon: 'fa-clock-rotate-left', cu: 'CU14/CU17' }
        ];

        let contentHtml = '';
        if (this.currentView === 'CLIENT_SERVICES') contentHtml = this.renderClientServicesView();
        else if (this.currentView === 'CLIENT_BOOK') contentHtml = this.renderClientBookView();
        else if (this.currentView === 'CLIENT_APPOINTMENTS') contentHtml = this.renderClientAppointmentsView();
        else contentHtml = this.renderClientDashboardView();

        return `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <!-- Barra de Navegabilidad del Cliente -->
                <div class="bg-white rounded-2xl p-2 border border-rosequartz shadow-sm mb-8 flex flex-wrap items-center justify-between gap-2">
                    <div class="flex flex-wrap items-center gap-1.5">
                        ${subViews.map(v => `
                            <button onclick="app.navigate('${v.id}')" class="px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${this.currentView === v.id ? 'luxury-gradient text-white shadow-sm' : 'text-plum hover:bg-rosebg'}">
                                <i class="fa-solid ${v.icon}"></i>
                                <span>${v.label}</span>
                                <span class="text-[10px] opacity-75 font-normal">(${v.cu})</span>
                            </button>
                        `).join('')}
                    </div>
                    <span class="hidden lg:inline-block text-[11px] text-berry font-medium px-3">
                        <i class="fa-solid fa-sitemap mr-1"></i> Navegabilidad: Actora Cliente
                    </span>
                </div>
                <div class="animate-fade-in">${contentHtml}</div>
            </div>
        `;
    },

    renderClientDashboardView() {
        const idCliente = this.activeProfile.entidad.idCliente;
        const misCitas = this.db.citas.filter(c => c.idCliente === idCliente).map(c => this.enrichCita(c));
        const citasActivas = misCitas.filter(c => c.estado === 'Pendiente' || c.estado === 'Confirmada' || c.estado === 'En Atención');
        const citasAtendidas = misCitas.filter(c => c.estado === 'Atendida');

        return `
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div class="lg:col-span-8 space-y-6">
                    <div class="luxury-gradient rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
                        <span class="px-3 py-1 rounded-full bg-white/15 text-gold text-[11px] font-bold uppercase tracking-wider">
                            RF05 · CU05 Visualizar Panel Principal (Cliente)
                        </span>
                        <h2 class="text-3xl font-bold mt-3 mb-2">¡Hola, ${this.activeProfile.entidad.nombres}!</h2>
                        <p class="text-xs sm:text-sm text-rosequartz/90 max-w-xl leading-relaxed mb-6">
                            Bienvenida a tu espacio personal en el salón de belleza <b>Dulce Mirada - Chepén</b>. Desde aquí puedes verificar horarios disponibles en tiempo real y reservar tu próxima atención.
                        </p>
                        <div class="flex flex-wrap gap-3">
                            <button onclick="app.navigate('CLIENT_BOOK')" class="px-5 py-2.5 rounded-xl bg-gold text-plum font-bold text-xs shadow hover:opacity-95 transition">
                                <i class="fa-solid fa-calendar-check mr-1.5"></i> Reservar Nueva Cita (CU12)
                            </button>
                            <button onclick="app.navigate('CLIENT_SERVICES')" class="px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs transition">
                                Explorar Catálogo de Servicios (CU07)
                            </button>
                        </div>
                    </div>

                    <!-- Próximas Citas de la Clienta -->
                    <div class="bg-white rounded-3xl p-6 border border-rosequartz shadow-sm">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-bold text-plum">Mis Próximas Reservas Activas</h3>
                            <button onclick="app.navigate('CLIENT_APPOINTMENTS')" class="text-xs font-bold text-berry hover:underline">Ver todas (${misCitas.length}) →</button>
                        </div>
                        ${citasActivas.length === 0 ? `
                            <div class="text-center py-8 bg-rosebg/50 rounded-2xl border border-dashed border-rosequartz">
                                <p class="text-xs text-plum/70 mb-3">No tienes citas pendientes en este momento.</p>
                                <button onclick="app.navigate('CLIENT_BOOK')" class="px-4 py-2 rounded-xl bg-berry text-white text-xs font-bold">Programar Cita</button>
                            </div>
                        ` : `
                            <div class="space-y-3">
                                ${citasActivas.map(c => `
                                    <div class="p-4 rounded-2xl bg-rosebg/60 border border-rosequartz flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <div class="flex items-center gap-2 mb-1">
                                                <span class="text-xs font-bold text-berry">#${c.idCita}</span>
                                                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">${c.estado}</span>
                                                <span class="text-xs text-plum/70"><i class="fa-regular fa-calendar mr-1"></i>${c.fecha} · ${c.hora} hrs</span>
                                            </div>
                                            <p class="font-bold text-plum text-sm">${c.servicio.nombre}</p>
                                            <p class="text-xs text-plum/70">Especialista: ${c.personal.nombres} ${c.personal.apellidos} · Precio: <b>S/ ${c.servicio.precio.toFixed(2)}</b></p>
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <button onclick="app.openClientCitaDetailModal(${c.idCita})" class="px-3.5 py-2 rounded-xl bg-white border border-rosequartz text-plum text-xs font-bold hover:bg-rosequartz/30">
                                                Detalle de Cita
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>
                </div>

                <!-- Perfil de la Clienta y Resumen -->
                <div class="lg:col-span-4 space-y-6">
                    <div class="bg-white rounded-3xl p-6 border border-rosequartz shadow-sm">
                        <h3 class="text-base font-bold text-plum mb-4">Mi Ficha de Clienta</h3>
                        <div class="space-y-3 text-xs">
                            <div class="flex justify-between py-2 border-b border-rosequartz/50">
                                <span class="text-plum/60">Nombre Completo:</span>
                                <span class="font-bold text-plum">${this.activeProfile.entidad.nombres} ${this.activeProfile.entidad.apellidos}</span>
                            </div>
                            <div class="flex justify-between py-2 border-b border-rosequartz/50">
                                <span class="text-plum/60">Teléfono:</span>
                                <span class="font-bold text-plum">${this.activeProfile.entidad.telefono}</span>
                            </div>
                            <div class="flex justify-between py-2 border-b border-rosequartz/50">
                                <span class="text-plum/60">Correo:</span>
                                <span class="font-bold text-plum">${this.activeProfile.entidad.correo}</span>
                            </div>
                            <div class="flex justify-between py-2">
                                <span class="text-plum/60">Atenciones Recibidas:</span>
                                <span class="font-bold text-berry">${citasAtendidas.length} sesiones</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // CU07: Consultar Servicios (Vista Cliente con filtros)
    renderClientServicesView() {
        const categorias = ['Todos', 'Pestañas', 'Cejas', 'Uñas', 'Maquillaje', 'Facial'];
        const todos = this.ctrlServicios.consultarServicios(true);
        const filtrados = todos.filter(s => {
            const matchCat = this.bookingState.categoriaFiltro === 'Todos' || s.categoria === this.bookingState.categoriaFiltro;
            const matchText = s.nombre.toLowerCase().includes(this.bookingState.busquedaServicio.toLowerCase()) ||
                              s.descripcion.toLowerCase().includes(this.bookingState.busquedaServicio.toLowerCase());
            return matchCat && matchText;
        });

        return `
            <div class="space-y-6">
                <div class="bg-white rounded-3xl p-6 border border-rosequartz shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <span class="text-[11px] font-bold uppercase tracking-wider text-berry">RF07 · CU07 Consultar Servicios</span>
                        <h2 class="text-2xl font-bold text-plum">Servicios Disponibles en Dulce Mirada</h2>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                        ${categorias.map(cat => `
                            <button onclick="app.setServiceCategoryFilter('${cat}')" class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${this.bookingState.categoriaFiltro === cat ? 'bg-berry text-white' : 'bg-rosebg text-plum hover:bg-rosequartz/50'}">
                                ${cat}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${filtrados.map(s => `
                        <div class="bg-white rounded-3xl p-6 border border-rosequartz shadow-sm flex flex-col justify-between">
                            <div>
                                <div class="flex justify-between items-center mb-3">
                                    <span class="px-3 py-1 rounded-full bg-rosebg text-berry font-bold text-[11px]">${s.categoria}</span>
                                    <span class="text-xs text-plum/70"><i class="fa-regular fa-clock text-berry mr-1"></i>${s.duracion} minutos</span>
                                </div>
                                <h3 class="text-lg font-bold text-plum mb-2">${s.nombre}</h3>
                                <p class="text-xs text-plum/75 leading-relaxed mb-4">${s.descripcion}</p>
                            </div>
                            <div class="pt-4 border-t border-rosequartz flex items-center justify-between">
                                <span class="text-xl font-bold text-plum">S/ ${s.precio.toFixed(2)}</span>
                                <button onclick="app.startBookingWithService(${s.idServicio})" class="px-4 py-2.5 rounded-xl luxury-gradient text-white text-xs font-bold shadow-sm hover:opacity-95">
                                    Seleccionar y Reservar →
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    setServiceCategoryFilter(cat) {
        this.bookingState.categoriaFiltro = cat;
        this.renderViewport();
    },

    startBookingWithService(idServicio) {
        this.bookingState.idServicio = idServicio;
        this.bookingState.verificado = false;
        this.navigate('CLIENT_BOOK');
    },

    // CU11 & CU12: Reservar Cita (Implementación exacta del Diagrama de Secuencia - Sección 3.1.10)
    renderClientBookView() {
        const servicios = this.ctrlServicios.consultarServicios(true);
        const especialistas = this.db.personal.filter(p => p.estado === 'Activo');
        const horarios = this.db.horarios.filter(h => h.estado === 'Disponible');

        const srvSeleccionado = servicios.find(s => s.idServicio === parseInt(this.bookingState.idServicio)) || servicios[0];
        const espSeleccionado = especialistas.find(p => p.idPersonal === parseInt(this.bookingState.idPersonal)) || especialistas[0];
        const horSeleccionado = this.db.horarios.find(h => h.idHorario === parseInt(this.bookingState.idHorario));

        return `
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <!-- Columna Izquierda: Pasos 1 a 4 del Diagrama de Secuencia -->
                <div class="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-rosequartz shadow-sm space-y-6">
                    <div class="border-b border-rosequartz pb-4">
                        <span class="text-[11px] font-bold uppercase tracking-wider text-berry">RF11 · RF12 · CU12 Reservar Cita (&lt;&lt;include&gt;&gt; CU11 Consultar Disponibilidad)</span>
                        <h2 class="text-2xl font-bold text-plum mt-1">Programar Reserva de Cita</h2>
                        <p class="text-xs text-plum/70">Seleccione el servicio, especialista, fecha y bloque horario para verificar disponibilidad en tiempo real.</p>
                    </div>

                    <!-- 1. Seleccionar servicio, especialista y fecha -->
                    <div class="space-y-4">
                        <div>
                            <label class="block text-xs font-bold text-plum mb-1.5">1. Seleccione el Servicio de Belleza</label>
                            <select onchange="app.updateBookingField('idServicio', this.value)" class="w-full px-4 py-3 rounded-xl border border-rosequartz bg-rosebg/40 text-sm font-medium">
                                ${servicios.map(s => `
                                    <option value="${s.idServicio}" ${s.idServicio === srvSeleccionado.idServicio ? 'selected' : ''}>
                                        ${s.nombre} — S/ ${s.precio.toFixed(2)} (${s.duracion} min)
                                    </option>
                                `).join('')}
                            </select>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-plum mb-1.5">2. Especialista Asignada</label>
                                <select onchange="app.updateBookingField('idPersonal', this.value)" class="w-full px-4 py-3 rounded-xl border border-rosequartz bg-rosebg/40 text-sm font-medium">
                                    ${especialistas.map(p => `
                                        <option value="${p.idPersonal}" ${p.idPersonal === espSeleccionado.idPersonal ? 'selected' : ''}>
                                            ${p.nombres} ${p.apellidos} (${p.cargo})
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-plum mb-1.5">3. Fecha de la Cita</label>
                                <input type="date" value="${this.bookingState.fecha}" min="2026-11-01" onchange="app.updateBookingField('fecha', this.value)"
                                    class="w-full px-4 py-2.5 rounded-xl border border-rosequartz bg-rosebg/40 text-sm font-medium">
                            </div>
                        </div>

                        <!-- Grilla interactiva de Bloques Horarios (CU11 Consultar Disponibilidad) -->
                        <div>
                            <div class="flex items-center justify-between mb-2">
                                <label class="block text-xs font-bold text-plum">4. Seleccione un Bloque Horario (CU11: Verificar Disponibilidad)</label>
                                <div class="flex items-center gap-3 text-[11px]">
                                    <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Libre</span>
                                    <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Ocupado</span>
                                </div>
                            </div>
                            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                ${horarios.map(h => {
                                    const check = this.ctrlHorarios.verificarDisponibilidad(this.bookingState.fecha, h.idHorario, espSeleccionado.idPersonal);
                                    const isSelected = parseInt(this.bookingState.idHorario) === h.idHorario;
                                    let btnStyle = '';
                                    if (isSelected) {
                                        btnStyle = check.disponible
                                            ? 'bg-emerald-700 text-white border-emerald-700 ring-2 ring-emerald-300'
                                            : 'bg-rose-700 text-white border-rose-700 ring-2 ring-rose-300';
                                    } else {
                                        btnStyle = check.disponible
                                            ? 'bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 border-emerald-200'
                                            : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200';
                                    }
                                    return `
                                        <button type="button" onclick="app.selectAndVerifySlot(${h.idHorario})"
                                            class="slot-btn p-3 rounded-xl border text-left transition flex flex-col justify-between ${btnStyle}">
                                            <div class="flex items-center justify-between w-full">
                                                <span class="text-xs font-bold">${h.horaInicio} - ${h.horaFin}</span>
                                                <i class="fa-solid ${check.disponible ? 'fa-circle-check text-emerald-500' : 'fa-ban text-rose-500'} ${isSelected ? '!text-white' : ''} text-xs"></i>
                                            </div>
                                            <span class="text-[10px] mt-1 opacity-85">${check.disponible ? 'Disponible' : 'Horario Ocupado'}</span>
                                        </button>
                                    `;
                                }).join('')}
                            </div>
                            <p class="text-[11px] text-plum/60 mt-2">
                                <i class="fa-solid fa-circle-info text-berry mr-1"></i>
                                Puede hacer clic tanto en un horario <b>Disponible</b> como en uno <b>Ocupado</b> para comprobar ambos caminos del bloque <code>alt</code> del Diagrama de Secuencia.
                            </p>
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-plum mb-1.5">5. Observaciones o Preferencias (Opcional)</label>
                            <textarea id="book-observacion" rows="2" placeholder="Ej. Tengo piel sensible, prefiero curvatura natural..."
                                class="w-full px-4 py-2.5 rounded-xl border border-rosequartz bg-rosebg/40 text-xs"></textarea>
                        </div>
                    </div>
                </div>

                <!-- Columna Derecha: Traza en vivo del Diagrama de Secuencia y Resumen de Reserva -->
                <div class="lg:col-span-5 space-y-6">
                    <div class="bg-white rounded-3xl p-6 sm:p-7 border border-rosequartz shadow-sm">
                        <div class="flex items-center justify-between border-b border-rosequartz pb-3 mb-4">
                            <div>
                                <span class="text-[10px] font-bold uppercase tracking-wider text-berry">Sección 3.1.10 · Diagrama de Secuencia</span>
                                <h3 class="text-lg font-bold text-plum">Resumen y Confirmación de Cita</h3>
                            </div>
                            <i class="fa-solid fa-diagram-project text-berry text-lg"></i>
                        </div>

                        ${!this.bookingState.verificado ? `
                            <div class="p-6 rounded-2xl bg-rosebg/60 border border-dashed border-rosequartz text-center space-y-2">
                                <i class="fa-regular fa-hand-pointer text-2xl text-berry"></i>
                                <p class="text-xs font-bold text-plum">Paso Pendiente: Seleccionar Fecha y Horario</p>
                                <p class="text-[11px] text-plum/70">
                                    Haga clic en uno de los bloques horarios de la izquierda para ejecutar <code>ControlHorarios.verificarDisponibilidad()</code>.
                                </p>
                            </div>
                        ` : this.bookingState.disponible ? `
                            <!-- Bloque ALT: [Horario disponible] -->
                            <div class="space-y-4 animate-fade-in">
                                <div class="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5">
                                    <i class="fa-solid fa-circle-check text-emerald-600 text-base mt-0.5"></i>
                                    <div>
                                        <p class="font-bold">[alt: Horario disponible] — Paso 5 & 6</p>
                                        <p>${this.bookingState.mensajeVerificacion}</p>
                                    </div>
                                </div>

                                <div class="p-4 rounded-2xl bg-rosebg border border-rosequartz space-y-2.5 text-xs">
                                    <p class="font-bold text-berry uppercase tracking-wider text-[10px]">6. Resumen de Reserva</p>
                                    <div class="flex justify-between">
                                        <span class="text-plum/70">Clienta:</span>
                                        <span class="font-bold text-plum">${this.activeProfile.nombreMostrar}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-plum/70">Servicio:</span>
                                        <span class="font-bold text-plum text-right">${srvSeleccionado.nombre}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-plum/70">Especialista:</span>
                                        <span class="font-bold text-plum">${espSeleccionado.nombres} ${espSeleccionado.apellidos}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-plum/70">Fecha y Horario:</span>
                                        <span class="font-bold text-berry">${this.bookingState.fecha} (${horSeleccionado ? horSeleccionado.horaInicio + ' - ' + horSeleccionado.horaFin : ''})</span>
                                    </div>
                                    <div class="flex justify-between pt-2 border-t border-rosequartz">
                                        <span class="font-bold text-plum">Total Estimado:</span>
                                        <span class="text-base font-bold text-plum">S/ ${srvSeleccionado.precio.toFixed(2)}</span>
                                    </div>
                                </div>

                                <button onclick="app.confirmClientBooking()" class="w-full py-3.5 rounded-xl luxury-gradient text-white font-bold text-xs shadow-lg hover:opacity-95 transition flex items-center justify-center gap-2">
                                    <i class="fa-solid fa-check-double text-gold"></i> 7. Confirmar Cita y Registrar (CU12)
                                </button>
                            </div>
                        ` : `
                            <!-- Bloque ALT: [Horario no disponible] -->
                            <div class="space-y-4 animate-fade-in">
                                <div class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3">
                                    <i class="fa-solid fa-triangle-exclamation text-rose-600 text-lg mt-0.5"></i>
                                    <div>
                                        <p class="font-bold text-sm mb-1">[alt: Horario no disponible] — Pasos 13 y 14</p>
                                        <p class="leading-relaxed">${this.bookingState.mensajeVerificacion}</p>
                                    </div>
                                </div>
                                <p class="text-[11px] text-plum/70 text-center">
                                    Por favor, seleccione uno de los bloques marcados en color verde para continuar con su reserva.
                                </p>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
    },

    updateBookingField(field, value) {
        this.bookingState[field] = value;
        this.bookingState.verificado = false;
        this.renderViewport();
    },

    selectAndVerifySlot(idHorario) {
        this.bookingState.idHorario = parseInt(idHorario);
        const res = this.ctrlHorarios.verificarDisponibilidad(
            this.bookingState.fecha,
            idHorario,
            this.bookingState.idPersonal
        );
        this.bookingState.verificado = true;
        this.bookingState.disponible = res.disponible;
        this.bookingState.mensajeVerificacion = res.motivo;
        this.renderViewport();
    },

    confirmClientBooking() {
        const obsEl = document.getElementById('book-observacion');
        const observacion = obsEl ? obsEl.value : '';
        const res = this.ctrlCitas.registrarCita({
            idCliente: this.activeProfile.entidad.idCliente,
            idPersonal: this.bookingState.idPersonal,
            idServicio: this.bookingState.idServicio,
            idHorario: this.bookingState.idHorario,
            fecha: this.bookingState.fecha,
            observacion
        });

        if (!res.exito) {
            this.showToast(res.mensaje, 'error', 'Horario No Disponible');
            return;
        }

        this.bookingState.verificado = false;
        this.bookingState.idHorario = null;
        this.showToast(res.mensaje, 'success', 'Paso 12: Cita Registrada con Éxito');
        this.navigate('CLIENT_APPOINTMENTS');
    },

    // CU14, CU16, CU17: Mis Citas e Historial de Citas
    renderClientAppointmentsView() {
        const idCliente = this.activeProfile.entidad.idCliente;
        const misCitas = this.db.citas
            .filter(c => c.idCliente === idCliente)
            .map(c => this.enrichCita(c))
            .sort((a, b) => (b.fecha + b.hora).localeCompare(a.fecha + a.hora));

        return `
            <div class="space-y-6">
                <div class="bg-white rounded-3xl p-6 border border-rosequartz shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <span class="text-[11px] font-bold uppercase tracking-wider text-berry">RF14 · RF16 · RF17 · CU14 Consultar Citas y CU17 Historial</span>
                        <h2 class="text-2xl font-bold text-plum">Mis Citas y Ficha de Atenciones</h2>
                    </div>
                    <button onclick="app.navigate('CLIENT_BOOK')" class="px-4 py-2.5 rounded-xl luxury-gradient text-white text-xs font-bold shadow-sm">
                        <i class="fa-solid fa-plus mr-1"></i> Nueva Reserva
                    </button>
                </div>

                <div class="bg-white rounded-3xl border border-rosequartz shadow-sm overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr class="bg-rosebg border-b border-rosequartz text-plum uppercase text-[11px]">
                                    <th class="p-4">Código</th>
                                    <th class="p-4">Servicio</th>
                                    <th class="p-4">Especialista</th>
                                    <th class="p-4">Fecha y Hora</th>
                                    <th class="p-4">Precio</th>
                                    <th class="p-4">Estado</th>
                                    <th class="p-4 text-right">Acciones (Navegabilidad)</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-rosequartz/60">
                                ${misCitas.map(c => `
                                    <tr class="hover:bg-rosebg/40 transition">
                                        <td class="p-4 font-bold text-berry">#${c.idCita}</td>
                                        <td class="p-4 font-bold text-plum">${c.servicio.nombre}</td>
                                        <td class="p-4">${c.personal.nombres} ${c.personal.apellidos}</td>
                                        <td class="p-4 font-medium">${c.fecha} · ${c.hora}</td>
                                        <td class="p-4 font-bold">S/ ${c.servicio.precio.toFixed(2)}</td>
                                        <td class="p-4">${this.renderEstadoBadge(c.estado)}</td>
                                        <td class="p-4 text-right space-x-1.5">
                                            <button onclick="app.openClientCitaDetailModal(${c.idCita})" class="px-3 py-1.5 rounded-lg bg-rosebg hover:bg-rosequartz text-plum font-bold transition">
                                                <i class="fa-solid fa-eye mr-1"></i> Detalle
                                            </button>
                                            ${(c.estado === 'Pendiente' || c.estado === 'Confirmada') ? `
                                                <button onclick="app.confirmCancelCitaModal(${c.idCita})" class="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold transition">
                                                    Cancelar (CU16)
                                                </button>
                                            ` : ''}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    renderEstadoBadge(estado) {
        const map = {
            'Pendiente': 'bg-amber-100 text-amber-800 border-amber-300',
            'Confirmada': 'bg-sky-100 text-sky-800 border-sky-300',
            'En Atención': 'bg-purple-100 text-purple-800 border-purple-300',
            'Atendida': 'bg-emerald-100 text-emerald-800 border-emerald-300',
            'Cancelada': 'bg-rose-100 text-rose-800 border-rose-300'
        };
        return `<span class="px-2.5 py-1 rounded-full text-[11px] font-bold border ${map[estado] || 'bg-gray-100'}">${estado}</span>`;
    },

    // Modal Detalle de Cita (Navegabilidad Cliente: Mis Citas -> Detalle de cita -> Modificar o cancelar cita)
    openClientCitaDetailModal(idCita) {
        const c = this.enrichCita(this.db.citas.find(item => item.idCita === parseInt(idCita)));
        this.openModal(`
            <div class="p-6 sm:p-8">
                <div class="flex items-center justify-between border-b border-rosequartz pb-4 mb-5">
                    <div>
                        <span class="text-[10px] font-bold uppercase tracking-wider text-berry">CU14 · CU17 Detalle de Cita #${c.idCita}</span>
                        <h3 class="text-2xl font-bold text-plum">${c.servicio.nombre}</h3>
                    </div>
                    <button onclick="app.closeModal()" class="w-8 h-8 rounded-full bg-rosebg text-plum hover:bg-rosequartz"><i class="fa-solid fa-xmark"></i></button>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-rosebg/60 p-4 rounded-2xl border border-rosequartz mb-5">
                    <div><span class="text-plum/60 block">Fecha y Hora:</span><span class="font-bold text-plum text-sm">${c.fecha} a las ${c.hora} hrs</span></div>
                    <div><span class="text-plum/60 block">Estado Actual:</span><div class="mt-1">${this.renderEstadoBadge(c.estado)}</div></div>
                    <div><span class="text-plum/60 block">Especialista Asignada:</span><span class="font-bold text-plum">${c.personal.nombres} ${c.personal.apellidos}</span></div>
                    <div><span class="text-plum/60 block">Costo del Servicio:</span><span class="font-bold text-berry text-sm">S/ ${c.servicio.precio.toFixed(2)} (${c.servicio.duracion} min)</span></div>
                    <div class="sm:col-span-2"><span class="text-plum/60 block">Observaciones:</span><span class="font-medium text-plum">${c.observacion || 'Sin observaciones registradas.'}</span></div>
                </div>

                ${c.atencion ? `
                    <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-1.5 mb-5">
                        <p class="font-bold text-emerald-900 uppercase tracking-wider text-[10px]"><i class="fa-solid fa-clipboard-check mr-1"></i> Ficha de Atención Registrada (CU21)</p>
                        <p class="text-emerald-950"><b>Procedimiento realizado:</b> ${c.atencion.descripcion}</p>
                        <p class="text-emerald-800"><b>Productos aplicados:</b> ${c.atencion.productosUtilizados || 'Estándar de salón'}</p>
                        <p class="text-[11px] text-emerald-700">Fecha de atención: ${c.atencion.fechaAtencion}</p>
                    </div>
                ` : ''}

                <div class="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-rosequartz">
                    ${(c.estado === 'Pendiente' || c.estado === 'Confirmada') ? `
                        <button onclick="app.confirmCancelCitaModal(${c.idCita})" class="px-4 py-2.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold">
                            <i class="fa-solid fa-ban mr-1"></i> Cancelar esta Cita (CU16)
                        </button>
                    ` : ''}
                    <button onclick="app.closeModal()" class="px-5 py-2.5 rounded-xl luxury-gradient text-white text-xs font-bold">Cerrar</button>
                </div>
            </div>
        `, 'max-w-xl');
    },

    confirmCancelCitaModal(idCita) {
        this.openModal(`
            <div class="p-6 sm:p-8">
                <span class="text-[10px] font-bold uppercase tracking-wider text-rose-700">RF16 · CU16 Cancelar Cita</span>
                <h3 class="text-xl font-bold text-plum mt-1 mb-2">¿Desea cancelar la Cita #${idCita}?</h3>
                <p class="text-xs text-plum/75 mb-4">Al cancelar la cita, el bloque horario quedará liberado inmediatamente para otras clientas del salón.</p>
                <div class="mb-4">
                    <label class="block text-xs font-bold text-plum mb-1">Motivo de cancelación (Opcional)</label>
                    <input type="text" id="cancel-motivo" placeholder="Ej. Reprogramación por viaje..." class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz text-xs">
                </div>
                <div class="flex justify-end gap-2">
                    <button onclick="app.closeModal()" class="px-4 py-2 rounded-xl border border-rosequartz text-xs font-bold">Volver</button>
                    <button onclick="app.executeCancelCita(${idCita})" class="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold">Confirmar Cancelación</button>
                </div>
            </div>
        `, 'max-w-md');
    },

    executeCancelCita(idCita) {
        const motivo = document.getElementById('cancel-motivo') ? document.getElementById('cancel-motivo').value : '';
        const res = this.ctrlCitas.cancelarCita(idCita, motivo);
        this.closeModal();
        this.showToast(res.mensaje, 'info', 'CU16: Cita Cancelada');
        this.renderViewport();
    },
});
