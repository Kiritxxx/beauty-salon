/**
 * Administración: gestión de citas (CU11, CU13–CU17)
 * Se agregan como métodos de DulceMiradaApp (código sin cambios respecto al original).
 */
Object.assign(DulceMiradaApp.prototype, {
    // MÓDULO ADMIN 1: GESTIÓN DE CITAS (CU13, CU14, CU15, CU16, CU17)
    renderAdminCitasView() {
        const citas = this.db.citas.map(c => this.enrichCita(c)).sort((a, b) => (b.fecha + b.hora).localeCompare(a.fecha + a.hora));
        return `
            <div class="space-y-6">
                <div class="bg-white rounded-3xl p-6 border border-rosequartz shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <span class="text-[11px] font-bold uppercase tracking-wider text-berry">RF13 · RF14 · RF15 · RF16 · CU13 Registrar Cita y CU15 Modificar Cita</span>
                        <h2 class="text-2xl font-bold text-plum">Gestión General de Citas</h2>
                    </div>
                    <button onclick="app.openAdminNewCitaModal()" class="px-5 py-3 rounded-xl luxury-gradient text-white text-xs font-bold shadow-md">
                        <i class="fa-solid fa-plus mr-1.5"></i> Registrar Cita (CU13)
                    </button>
                </div>

                <div class="bg-white rounded-3xl border border-rosequartz shadow-sm overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr class="bg-rosebg border-b border-rosequartz text-plum uppercase text-[11px]">
                                    <th class="p-4">ID</th>
                                    <th class="p-4">Clienta</th>
                                    <th class="p-4">Servicio</th>
                                    <th class="p-4">Especialista</th>
                                    <th class="p-4">Fecha / Hora</th>
                                    <th class="p-4">Estado</th>
                                    <th class="p-4 text-right">Operaciones (CU15 / CU16)</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-rosequartz/60">
                                ${citas.map(c => `
                                    <tr class="hover:bg-rosebg/40 transition">
                                        <td class="p-4 font-bold text-berry">#${c.idCita}</td>
                                        <td class="p-4">
                                            <p class="font-bold text-plum">${c.cliente.nombres} ${c.cliente.apellidos}</p>
                                            <p class="text-[11px] text-plum/60">${c.cliente.telefono}</p>
                                        </td>
                                        <td class="p-4 font-medium text-plum">${c.servicio.nombre}<br><span class="text-berry font-bold">S/ ${c.servicio.precio.toFixed(2)}</span></td>
                                        <td class="p-4">${c.personal.nombres} ${c.personal.apellidos}</td>
                                        <td class="p-4 font-bold">${c.fecha}<br><span class="text-berry">${c.hora} hrs</span></td>
                                        <td class="p-4">${this.renderEstadoBadge(c.estado)}</td>
                                        <td class="p-4 text-right space-x-1">
                                            <button onclick="app.openAdminEditCitaModal(${c.idCita})" class="px-3 py-1.5 rounded-lg bg-rosebg hover:bg-rosequartz text-plum font-bold">
                                                <i class="fa-solid fa-pen-to-square"></i> Modificar (CU15)
                                            </button>
                                            ${c.estado !== 'Cancelada' ? `
                                                <button onclick="app.confirmCancelCitaModal(${c.idCita})" class="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold">
                                                    Cancelar
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

    // CU13: Registrar cita desde administración
    openAdminNewCitaModal() {
        const clientes = this.db.clientes.filter(c => c.estado === 'Activo');
        const servicios = this.ctrlServicios.consultarServicios(true);
        const personal = this.db.personal.filter(p => p.estado === 'Activo');
        const horarios = this.db.horarios.filter(h => h.estado === 'Disponible');

        this.openModal(`
            <div class="p-6 sm:p-8">
                <div class="flex justify-between items-center border-b border-rosequartz pb-4 mb-5">
                    <div>
                        <span class="text-[10px] font-bold uppercase tracking-wider text-berry">RF13 · CU13 Registrar Cita (&lt;&lt;include&gt;&gt; CU11 Consultar Disponibilidad)</span>
                        <h3 class="text-xl font-bold text-plum">Registrar Cita para Clienta</h3>
                    </div>
                    <button onclick="app.closeModal()" class="w-8 h-8 rounded-full bg-rosebg"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <form onsubmit="app.handleAdminCreateCita(event)" class="space-y-4 text-xs">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block font-bold text-plum mb-1">Buscar / Seleccionar Clienta *</label>
                            <select id="adm-cita-cliente" required class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz bg-rosebg/40">
                                ${clientes.map(c => `<option value="${c.idCliente}">${c.nombres} ${c.apellidos} (${c.telefono})</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block font-bold text-plum mb-1">Servicio Solicitado *</label>
                            <select id="adm-cita-servicio" required class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz bg-rosebg/40">
                                ${servicios.map(s => `<option value="${s.idServicio}">${s.nombre} (S/ ${s.precio.toFixed(2)})</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label class="block font-bold text-plum mb-1">Especialista *</label>
                            <select id="adm-cita-personal" required class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz bg-rosebg/40">
                                ${personal.map(p => `<option value="${p.idPersonal}">${p.nombres} ${p.apellidos}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block font-bold text-plum mb-1">Fecha *</label>
                            <input type="date" id="adm-cita-fecha" value="2026-11-06" required class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz bg-rosebg/40">
                        </div>
                        <div>
                            <label class="block font-bold text-plum mb-1">Horario *</label>
                            <select id="adm-cita-horario" required class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz bg-rosebg/40">
                                ${horarios.map(h => `<option value="${h.idHorario}">${h.horaInicio} - ${h.horaFin}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label class="block font-bold text-plum mb-1">Observaciones</label>
                        <input type="text" id="adm-cita-obs" placeholder="Indicaciones especiales..." class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz bg-rosebg/40">
                    </div>
                    <div class="flex justify-end gap-2 pt-3 border-t border-rosequartz">
                        <button type="button" onclick="app.closeModal()" class="px-4 py-2.5 rounded-xl border border-rosequartz font-bold">Cancelar</button>
                        <button type="submit" class="px-5 py-2.5 rounded-xl luxury-gradient text-white font-bold">Verificar Disponibilidad y Guardar (CU13)</button>
                    </div>
                </form>
            </div>
        `);
    },

    handleAdminCreateCita(e) {
        e.preventDefault();
        const res = this.ctrlCitas.registrarCita({
            idCliente: document.getElementById('adm-cita-cliente').value,
            idServicio: document.getElementById('adm-cita-servicio').value,
            idPersonal: document.getElementById('adm-cita-personal').value,
            fecha: document.getElementById('adm-cita-fecha').value,
            idHorario: document.getElementById('adm-cita-horario').value,
            observacion: document.getElementById('adm-cita-obs').value,
            creadoPorAdmin: true
        });
        if (!res.exito) {
            this.showToast(res.mensaje, 'error', 'CU11: Horario Ocupado');
            return;
        }
        this.closeModal();
        this.showToast(res.mensaje, 'success', 'CU13: Cita Registrada');
        this.renderViewport();
    },

    // CU15: Modificar cita
    openAdminEditCitaModal(idCita) {
        const c = this.db.citas.find(item => item.idCita === parseInt(idCita));
        const servicios = this.db.servicios;
        const personal = this.db.personal;
        const horarios = this.db.horarios;
        const estados = ['Pendiente', 'Confirmada', 'En Atención', 'Atendida', 'Cancelada'];

        this.openModal(`
            <div class="p-6 sm:p-8">
                <div class="flex justify-between items-center border-b border-rosequartz pb-4 mb-5">
                    <div>
                        <span class="text-[10px] font-bold uppercase tracking-wider text-berry">RF15 · CU15 Modificar Cita</span>
                        <h3 class="text-xl font-bold text-plum">Modificar Reserva #${c.idCita}</h3>
                    </div>
                    <button onclick="app.closeModal()" class="w-8 h-8 rounded-full bg-rosebg"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <form onsubmit="app.handleAdminUpdateCita(event, ${c.idCita})" class="space-y-4 text-xs">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block font-bold text-plum mb-1">Servicio</label>
                            <select id="edit-cita-servicio" class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz bg-rosebg/40">
                                ${servicios.map(s => `<option value="${s.idServicio}" ${s.idServicio === c.idServicio ? 'selected' : ''}>${s.nombre}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block font-bold text-plum mb-1">Especialista</label>
                            <select id="edit-cita-personal" class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz bg-rosebg/40">
                                ${personal.map(p => `<option value="${p.idPersonal}" ${p.idPersonal === c.idPersonal ? 'selected' : ''}>${p.nombres} ${p.apellidos}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label class="block font-bold text-plum mb-1">Fecha</label>
                            <input type="date" id="edit-cita-fecha" value="${c.fecha}" class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz bg-rosebg/40">
                        </div>
                        <div>
                            <label class="block font-bold text-plum mb-1">Horario</label>
                            <select id="edit-cita-horario" class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz bg-rosebg/40">
                                ${horarios.map(h => `<option value="${h.idHorario}" ${h.idHorario === c.idHorario ? 'selected' : ''}>${h.horaInicio} - ${h.horaFin}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block font-bold text-plum mb-1">Estado de Cita</label>
                            <select id="edit-cita-estado" class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz bg-rosebg/40 font-bold">
                                ${estados.map(est => `<option value="${est}" ${est === c.estado ? 'selected' : ''}>${est}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label class="block font-bold text-plum mb-1">Observación</label>
                        <input type="text" id="edit-cita-obs" value="${c.observacion || ''}" class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz bg-rosebg/40">
                    </div>
                    <div class="flex justify-end gap-2 pt-3 border-t border-rosequartz">
                        <button type="button" onclick="app.closeModal()" class="px-4 py-2.5 rounded-xl border border-rosequartz font-bold">Cancelar</button>
                        <button type="submit" class="px-5 py-2.5 rounded-xl luxury-gradient text-white font-bold">Guardar Cambios (CU15)</button>
                    </div>
                </form>
            </div>
        `);
    },

    handleAdminUpdateCita(e, idCita) {
        e.preventDefault();
        const res = this.ctrlCitas.modificarCita(idCita, {
            idServicio: document.getElementById('edit-cita-servicio').value,
            idPersonal: document.getElementById('edit-cita-personal').value,
            fecha: document.getElementById('edit-cita-fecha').value,
            idHorario: document.getElementById('edit-cita-horario').value,
            estado: document.getElementById('edit-cita-estado').value,
            observacion: document.getElementById('edit-cita-obs').value
        });
        if (!res.exito) {
            this.showToast(res.mensaje, 'error', 'Conflicto de Horario');
            return;
        }
        this.closeModal();
        this.showToast(res.mensaje, 'success', 'CU15: Cita Modificada');
        this.renderViewport();
    },
});
