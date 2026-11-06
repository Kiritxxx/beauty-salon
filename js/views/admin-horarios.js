/**
 * Administración: gestión de horarios (CU10)
 * Se agregan como métodos de DulceMiradaApp (código sin cambios respecto al original).
 */
Object.assign(DulceMiradaApp.prototype, {
    // MÓDULO ADMIN 4: GESTIÓN DE HORARIOS (RF10 / CU10)
    renderAdminHorariosView() {
        return `
            <div class="space-y-6">
                <div class="bg-white rounded-3xl p-6 border border-rosequartz shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <span class="text-[11px] font-bold uppercase tracking-wider text-berry">RF10 · CU10 Gestionar Horarios</span>
                        <h2 class="text-2xl font-bold text-plum">Turnos y Bloques Horarios de Atención</h2>
                    </div>
                    <button onclick="app.openAdminHorarioModal()" class="px-5 py-3 rounded-xl luxury-gradient text-white text-xs font-bold shadow-sm">
                        <i class="fa-solid fa-clock mr-1.5"></i> Agregar Bloque Horario
                    </button>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${this.db.horarios.map(h => `
                        <div class="bg-white p-5 rounded-2xl border border-rosequartz flex items-center justify-between shadow-sm">
                            <div>
                                <span class="text-[10px] font-bold uppercase text-berry">${h.dia}</span>
                                <p class="text-lg font-bold text-plum">${h.horaInicio} hrs — ${h.horaFin} hrs</p>
                                <span class="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${h.estado === 'Disponible' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
                                    ${h.estado}
                                </span>
                            </div>
                            <button onclick="app.toggleHorarioEstado(${h.idHorario})" class="px-3.5 py-2 rounded-xl border border-rosequartz text-xs font-bold hover:bg-rosebg">
                                ${h.estado === 'Disponible' ? 'Deshabilitar' : 'Habilitar'}
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    openAdminHorarioModal() {
        this.openModal(`
            <div class="p-6 sm:p-8">
                <span class="text-[10px] font-bold uppercase tracking-wider text-berry">RF10 · CU10 Gestionar Horarios</span>
                <h3 class="text-xl font-bold text-plum mt-1 mb-4">Nuevo Bloque de Horario</h3>
                <form onsubmit="app.handleAdminCreateHorario(event)" class="space-y-4 text-xs">
                    <div>
                        <label class="block font-bold text-plum mb-1">Días de aplicación</label>
                        <input type="text" id="hor-dia" required value="Lunes a Sábado" class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block font-bold text-plum mb-1">Hora Inicio *</label>
                            <input type="time" id="hor-inicio" required value="20:00" class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz">
                        </div>
                        <div>
                            <label class="block font-bold text-plum mb-1">Hora Fin *</label>
                            <input type="time" id="hor-fin" required value="21:00" class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz">
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 pt-3 border-t border-rosequartz">
                        <button type="button" onclick="app.closeModal()" class="px-4 py-2 rounded-xl border border-rosequartz font-bold">Cancelar</button>
                        <button type="submit" class="px-5 py-2 rounded-xl luxury-gradient text-white font-bold">Guardar Horario</button>
                    </div>
                </form>
            </div>
        `, 'max-w-md');
    },

    handleAdminCreateHorario(e) {
        e.preventDefault();
        const res = this.ctrlHorarios.gestionarHorarios('CREAR', {
            dia: document.getElementById('hor-dia').value,
            horaInicio: document.getElementById('hor-inicio').value,
            horaFin: document.getElementById('hor-fin').value
        });
        this.closeModal();
        this.showToast(res.mensaje, 'success', 'CU10: Horario Creado');
        this.renderViewport();
    },

    toggleHorarioEstado(idHorario) {
        const res = this.ctrlHorarios.gestionarHorarios('ESTADO', { idHorario });
        this.showToast(res.mensaje, 'info', 'CU10: Estado de Horario');
        this.renderViewport();
    },
});
