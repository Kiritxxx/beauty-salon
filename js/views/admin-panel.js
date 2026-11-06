/**
 * Administración: estructura y panel principal (CU05)
 * Se agregan como métodos de DulceMiradaApp (código sin cambios respecto al original).
 */
Object.assign(DulceMiradaApp.prototype, {
    /**
     * ========================================================================
     * 6. DIAGRAMA DE NAVEGABILIDAD DEL ADMINISTRADOR (ROSA NÚÑEZ - SECCIÓN 3.1.12)
     * Módulos: Panel Administrativo | Gestión de Clientes (CU08) | Gestión de Servicios (CU09) |
     *          Gestión de Horarios (CU10) | Gestión de Citas (CU13/15/16) | Gestión de Personal (CU18) | Gestión de Reportes (CU22)
     * ========================================================================
     */
    renderAdminLayout() {
        const adminTabs = [
            { id: 'ADMIN_PANEL', label: 'Panel Administrativo', icon: 'fa-chart-pie', cu: 'CU05' },
            { id: 'ADMIN_CITAS', label: 'Gestión de Citas', icon: 'fa-calendar-days', cu: 'CU13/15' },
            { id: 'ADMIN_CLIENTES', label: 'Gestión de Clientes', icon: 'fa-users', cu: 'CU08' },
            { id: 'ADMIN_SERVICIOS', label: 'Gestión de Servicios', icon: 'fa-wand-sparkles', cu: 'CU09' },
            { id: 'ADMIN_HORARIOS', label: 'Gestión de Horarios', icon: 'fa-clock', cu: 'CU10' },
            { id: 'ADMIN_PERSONAL', label: 'Gestión de Personal', icon: 'fa-id-badge', cu: 'CU18' },
            { id: 'ADMIN_REPORTES', label: 'Gestión de Reportes', icon: 'fa-file-contract', cu: 'CU22' }
        ];

        let body = '';
        if (this.currentView === 'ADMIN_CITAS') body = this.renderAdminCitasView();
        else if (this.currentView === 'ADMIN_CLIENTES') body = this.renderAdminClientesView();
        else if (this.currentView === 'ADMIN_SERVICIOS') body = this.renderAdminServiciosView();
        else if (this.currentView === 'ADMIN_HORARIOS') body = this.renderAdminHorariosView();
        else if (this.currentView === 'ADMIN_PERSONAL') body = this.renderAdminPersonalView();
        else if (this.currentView === 'ADMIN_REPORTES') body = this.renderAdminReportesView();
        else body = this.renderAdminDashboardView();

        return `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <!-- Menú de Navegabilidad de la Administradora -->
                <div class="bg-white rounded-2xl p-2 border border-rosequartz shadow-sm mb-8 flex flex-wrap items-center gap-1.5">
                    ${adminTabs.map(t => `
                        <button onclick="app.navigate('${t.id}')" class="px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${this.currentView === t.id ? 'luxury-gradient text-white shadow-sm' : 'text-plum hover:bg-rosebg'}">
                            <i class="fa-solid ${t.icon}"></i>
                            <span>${t.label}</span>
                            <span class="text-[10px] opacity-70 font-normal">${t.cu}</span>
                        </button>
                    `).join('')}
                </div>
                <div class="animate-fade-in">${body}</div>
            </div>
        `;
    },

    renderAdminDashboardView() {
        const citasEnriquecidas = this.db.citas.map(c => this.enrichCita(c));
        const citasActivas = citasEnriquecidas.filter(c => c.estado !== 'Cancelada');
        const ingresosTotales = citasActivas.reduce((acc, c) => acc + c.servicio.precio, 0);

        return `
            <div class="space-y-8">
                <!-- Banner Administradora Rosa Elizabeth Núñez Castillo -->
                <div class="luxury-gradient rounded-3xl p-8 text-white shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <span class="px-3 py-1 rounded-full bg-gold text-plum font-bold text-[10px] uppercase tracking-wider">
                            RF05 · CU05 Panel Principal de Administración
                        </span>
                        <h2 class="text-3xl font-bold mt-2">Bienvenida, Rosa Elizabeth Núñez Castillo</h2>
                        <p class="text-xs sm:text-sm text-rosequartz/90 mt-1">
                            Administración centralizada de clientes, catálogo de servicios, horarios, personal y citas de <b>Dulce Mirada — Chepén</b>.
                        </p>
                    </div>
                    <div class="flex flex-wrap gap-3">
                        <button onclick="app.openAdminNewCitaModal()" class="px-5 py-3 rounded-xl bg-gold text-plum font-bold text-xs shadow hover:opacity-95 transition">
                            <i class="fa-solid fa-calendar-plus mr-1.5"></i> + Registrar Cita (CU13)
                        </button>
                        <button onclick="app.navigate('ADMIN_REPORTES')" class="px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs transition">
                            <i class="fa-solid fa-chart-column mr-1.5"></i> Generar Reportes (CU22)
                        </button>
                    </div>
                </div>

                <!-- KPIs en Tiempo Real -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div class="bg-white p-6 rounded-3xl border border-rosequartz shadow-sm">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-xs font-bold text-plum/60 uppercase">Total Citas Registradas</span>
                            <div class="w-9 h-9 rounded-xl bg-rosebg text-berry flex items-center justify-center"><i class="fa-solid fa-calendar-check"></i></div>
                        </div>
                        <p class="text-3xl font-luxury font-bold text-plum">${this.db.citas.length}</p>
                        <p class="text-[11px] text-emerald-700 font-semibold mt-1">${this.db.citas.filter(c => c.estado === 'Atendida').length} atendidas con ficha técnica</p>
                    </div>

                    <div class="bg-white p-6 rounded-3xl border border-rosequartz shadow-sm">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-xs font-bold text-plum/60 uppercase">Ingresos Proyectados</span>
                            <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center"><i class="fa-solid fa-sack-dollar"></i></div>
                        </div>
                        <p class="text-3xl font-luxury font-bold text-plum">S/ ${ingresosTotales.toFixed(2)}</p>
                        <p class="text-[11px] text-plum/60 mt-1">Citas activas y completadas</p>
                    </div>

                    <div class="bg-white p-6 rounded-3xl border border-rosequartz shadow-sm">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-xs font-bold text-plum/60 uppercase">Clientas Registradas</span>
                            <div class="w-9 h-9 rounded-xl bg-pink-50 text-berry flex items-center justify-center"><i class="fa-solid fa-users"></i></div>
                        </div>
                        <p class="text-3xl font-luxury font-bold text-plum">${this.db.clientes.length}</p>
                        <p class="text-[11px] text-plum/60 mt-1">${this.db.clientes.filter(c => c.estado === 'Activo').length} cuentas activas</p>
                    </div>

                    <div class="bg-white p-6 rounded-3xl border border-rosequartz shadow-sm">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-xs font-bold text-plum/60 uppercase">Servicios & Personal</span>
                            <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
                        </div>
                        <p class="text-3xl font-luxury font-bold text-plum">${this.db.servicios.length} / ${this.db.personal.length}</p>
                        <p class="text-[11px] text-plum/60 mt-1">${this.db.servicios.length} servicios · ${this.db.personal.length} especialistas</p>
                    </div>
                </div>

                <!-- Tarjetas de Acceso a los 6 Módulos del Diagrama de Navegabilidad Administrador -->
                <div>
                    <h3 class="text-lg font-bold text-plum mb-4">Módulos del Diagrama de Navegabilidad Administrativo</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div onclick="app.navigate('ADMIN_CLIENTES')" class="bg-white p-6 rounded-3xl border border-rosequartz hover:border-berry cursor-pointer transition group shadow-sm">
                            <span class="text-[10px] font-bold text-berry uppercase">RF08 · CU08</span>
                            <h4 class="text-lg font-bold text-plum group-hover:text-berry mt-1">1. Gestión de Clientes</h4>
                            <p class="text-xs text-plum/70 mt-1 mb-4">Registrar, consultar, modificar y desactivar información de las clientas de Dulce Mirada.</p>
                            <span class="text-xs font-bold text-berry">Abrir módulo →</span>
                        </div>
                        <div onclick="app.navigate('ADMIN_SERVICIOS')" class="bg-white p-6 rounded-3xl border border-rosequartz hover:border-berry cursor-pointer transition group shadow-sm">
                            <span class="text-[10px] font-bold text-berry uppercase">RF09 · CU09</span>
                            <h4 class="text-lg font-bold text-plum group-hover:text-berry mt-1">2. Gestión de Servicios</h4>
                            <p class="text-xs text-plum/70 mt-1 mb-4">Administrar catálogo de servicios, precios en Soles (S/), duración en minutos y estado.</p>
                            <span class="text-xs font-bold text-berry">Abrir módulo →</span>
                        </div>
                        <div onclick="app.navigate('ADMIN_HORARIOS')" class="bg-white p-6 rounded-3xl border border-rosequartz hover:border-berry cursor-pointer transition group shadow-sm">
                            <span class="text-[10px] font-bold text-berry uppercase">RF10 · CU10</span>
                            <h4 class="text-lg font-bold text-plum group-hover:text-berry mt-1">3. Gestión de Horarios</h4>
                            <p class="text-xs text-plum/70 mt-1 mb-4">Establecer, consultar y habilitar/deshabilitar los bloques de horarios para la atención.</p>
                            <span class="text-xs font-bold text-berry">Abrir módulo →</span>
                        </div>
                        <div onclick="app.navigate('ADMIN_CITAS')" class="bg-white p-6 rounded-3xl border border-rosequartz hover:border-berry cursor-pointer transition group shadow-sm">
                            <span class="text-[10px] font-bold text-berry uppercase">RF13 · RF14 · RF15 · RF16</span>
                            <h4 class="text-lg font-bold text-plum group-hover:text-berry mt-1">4. Gestión de Citas</h4>
                            <p class="text-xs text-plum/70 mt-1 mb-4">Registrar citas solicitadas por clientas, verificar disponibilidad, modificar y cancelar reservas.</p>
                            <span class="text-xs font-bold text-berry">Abrir módulo →</span>
                        </div>
                        <div onclick="app.navigate('ADMIN_PERSONAL')" class="bg-white p-6 rounded-3xl border border-rosequartz hover:border-berry cursor-pointer transition group shadow-sm">
                            <span class="text-[10px] font-bold text-berry uppercase">RF18 · CU18</span>
                            <h4 class="text-lg font-bold text-plum group-hover:text-berry mt-1">5. Gestión de Personal</h4>
                            <p class="text-xs text-plum/70 mt-1 mb-4">Registrar, consultar, modificar y desactivar las cuentas del personal de atención del salón.</p>
                            <span class="text-xs font-bold text-berry">Abrir módulo →</span>
                        </div>
                        <div onclick="app.navigate('ADMIN_REPORTES')" class="bg-white p-6 rounded-3xl border border-rosequartz hover:border-berry cursor-pointer transition group shadow-sm">
                            <span class="text-[10px] font-bold text-berry uppercase">RF22 · CU22</span>
                            <h4 class="text-lg font-bold text-plum group-hover:text-berry mt-1">6. Gestión de Reportes</h4>
                            <p class="text-xs text-plum/70 mt-1 mb-4">Generar y consultar reportes estadísticos sobre clientes, servicios, ingresos y citas.</p>
                            <span class="text-xs font-bold text-berry">Abrir módulo →</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
});
