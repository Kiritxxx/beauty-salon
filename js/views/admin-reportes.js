/**
 * Administración: reportes (CU22)
 * Se agregan como métodos de DulceMiradaApp (código sin cambios respecto al original).
 */
Object.assign(DulceMiradaApp.prototype, {
    // MÓDULO ADMIN 6: GESTIÓN DE REPORTES (RF22 / CU22)
    renderAdminReportesView() {
        const citas = this.db.citas.map(c => this.enrichCita(c));
        const porEstado = {
            Confirmada: citas.filter(c => c.estado === 'Confirmada').length,
            Pendiente: citas.filter(c => c.estado === 'Pendiente').length,
            'En Atención': citas.filter(c => c.estado === 'En Atención').length,
            Atendida: citas.filter(c => c.estado === 'Atendida').length,
            Cancelada: citas.filter(c => c.estado === 'Cancelada').length
        };

        return `
            <div class="space-y-6">
                <div class="bg-white rounded-3xl p-6 border border-rosequartz shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <span class="text-[11px] font-bold uppercase tracking-wider text-berry">RF22 · CU22 Gestionar Reportes</span>
                        <h2 class="text-2xl font-bold text-plum">Reportes Administrativos y Estadísticas</h2>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <button onclick="app.generarNuevoReporte('Reporte Consolidado de Citas e Ingresos')" class="px-4 py-2.5 rounded-xl luxury-gradient text-white text-xs font-bold shadow-sm">
                            <i class="fa-solid fa-file-circle-plus mr-1.5"></i> Generar Nuevo Reporte (CU22)
                        </button>
                        <button onclick="window.print()" class="px-4 py-2.5 rounded-xl border border-rosequartz bg-white text-plum text-xs font-bold hover:bg-rosebg">
                            <i class="fa-solid fa-print mr-1"></i> Imprimir
                        </button>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Distribución por Estado de Cita -->
                    <div class="bg-white rounded-3xl p-6 border border-rosequartz shadow-sm">
                        <h3 class="text-base font-bold text-plum mb-4">Distribución de Citas por Estado</h3>
                        <div class="space-y-3 text-xs">
                            ${Object.entries(porEstado).map(([estado, cant]) => {
                                const pct = citas.length ? Math.round((cant / citas.length) * 100) : 0;
                                return `
                                    <div>
                                        <div class="flex justify-between mb-1">
                                            <span class="font-bold text-plum">${estado}</span>
                                            <span class="text-plum/70">${cant} citas (${pct}%)</span>
                                        </div>
                                        <div class="w-full h-2.5 bg-rosebg rounded-full overflow-hidden">
                                            <div class="h-full luxury-gradient rounded-full" style="width: ${pct}%"></div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <!-- Rendimiento por Servicio -->
                    <div class="bg-white rounded-3xl p-6 border border-rosequartz shadow-sm">
                        <h3 class="text-base font-bold text-plum mb-4">Demanda e Ingresos por Servicio</h3>
                        <div class="space-y-3 text-xs max-h-60 overflow-y-auto pr-2">
                            ${this.db.servicios.map(s => {
                                const citasSrv = citas.filter(c => c.idServicio === s.idServicio && c.estado !== 'Cancelada');
                                const subtotal = citasSrv.length * s.precio;
                                return `
                                    <div class="flex items-center justify-between p-3 rounded-xl bg-rosebg/50 border border-rosequartz/60">
                                        <div>
                                            <p class="font-bold text-plum">${s.nombre}</p>
                                            <p class="text-[11px] text-plum/60">${citasSrv.length} reservas activas/atendidas</p>
                                        </div>
                                        <span class="font-bold text-berry text-sm">S/ ${subtotal.toFixed(2)}</span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>

                <!-- Historial de Objetos Reporte Generados (Clase Reporte del Diagrama de Clases) -->
                <div class="bg-white rounded-3xl p-6 border border-rosequartz shadow-sm">
                    <h3 class="text-base font-bold text-plum mb-4">Historial de Reportes Emitidos (Entidad <code>Reporte</code>)</h3>
                    <div class="space-y-2.5 text-xs">
                        ${this.db.reportes.map(r => `
                            <div class="p-4 rounded-2xl bg-rosebg/60 border border-rosequartz flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <span class="text-[10px] font-bold text-berry">REPORTE #${r.idReporte} · ${r.fechaGeneracion}</span>
                                    <p class="font-bold text-plum text-sm">${r.tipo}</p>
                                    <p class="text-plum/75">${r.resumen}</p>
                                </div>
                                <span class="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">Almacenado</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    generarNuevoReporte(tipo) {
        const nuevoId = Math.max(0, ...this.db.reportes.map(r => r.idReporte)) + 1;
        const activas = this.db.citas.filter(c => c.estado !== 'Cancelada');
        const atendidas = this.db.citas.filter(c => c.estado === 'Atendida');
        const totalSoles = activas.reduce((acc, c) => {
            const srv = this.db.servicios.find(s => s.idServicio === c.idServicio);
            return acc + (srv ? srv.precio : 0);
        }, 0);

        const ahora = new Date().toISOString().slice(0, 16).replace('T', ' ');
        const resumen = `Citas totales: ${this.db.citas.length} | Atendidas: ${atendidas.length} | Clientas activas: ${this.db.clientes.length} | Ingresos estimados: S/ ${totalSoles.toFixed(2)}`;
        this.db.reportes.unshift(new Reporte(nuevoId, tipo, ahora, resumen));
        DatabaseService.save(this.db);
        this.showToast(`Reporte #${nuevoId} generado y registrado correctamente.`, 'success', 'CU22: Generar Reporte');
        this.renderViewport();
    },
});
