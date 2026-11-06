/**
 * Administración: gestión de personal (CU18)
 * Se agregan como métodos de DulceMiradaApp (código sin cambios respecto al original).
 */
Object.assign(DulceMiradaApp.prototype, {
    // MÓDULO ADMIN 5: GESTIÓN DE PERSONAL (RF18 / CU18)
    renderAdminPersonalView() {
        return `
            <div class="space-y-6">
                <div class="bg-white rounded-3xl p-6 border border-rosequartz shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <span class="text-[11px] font-bold uppercase tracking-wider text-berry">RF18 · CU18 Gestionar Personal</span>
                        <h2 class="text-2xl font-bold text-plum">Equipo de Especialistas del Salón</h2>
                    </div>
                    <button onclick="app.openAdminPersonalModal()" class="px-5 py-3 rounded-xl luxury-gradient text-white text-xs font-bold shadow-sm">
                        <i class="fa-solid fa-user-plus mr-1.5"></i> Registrar Especialista
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    ${this.db.personal.map(p => {
                        const u = this.db.usuarios.find(user => user.idUsuario === p.idUsuario);
                        const citasAsignadas = this.db.citas.filter(c => c.idPersonal === p.idPersonal).length;
                        return `
                            <div class="bg-white rounded-3xl p-6 border border-rosequartz shadow-sm flex flex-col justify-between">
                                <div>
                                    <div class="flex items-center justify-between mb-4">
                                        <div class="w-12 h-12 rounded-2xl luxury-gradient text-white font-bold flex items-center justify-center text-base">
                                            ${p.nombres.charAt(0)}${p.apellidos.charAt(0)}
                                        </div>
                                        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${p.estado === 'Activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
                                            ${p.estado}
                                        </span>
                                    </div>
                                    <h3 class="text-lg font-bold text-plum">${p.nombres} ${p.apellidos}</h3>
                                    <p class="text-xs font-semibold text-berry mb-3">${p.cargo}</p>
                                    <div class="space-y-1 text-xs text-plum/75">
                                        <p><i class="fa-solid fa-phone text-berry mr-1.5"></i> ${p.telefono}</p>
                                        <p><i class="fa-solid fa-user-lock text-berry mr-1.5"></i> Usuario: <b>${u ? u.nombreUsuario : '-'}</b></p>
                                        <p><i class="fa-solid fa-calendar-check text-berry mr-1.5"></i> Citas asignadas: <b>${citasAsignadas}</b></p>
                                    </div>
                                </div>
                                <div class="pt-4 mt-4 border-t border-rosequartz flex justify-end">
                                    <button onclick="app.openAdminPersonalModal(${p.idPersonal})" class="px-3.5 py-2 rounded-xl bg-rosebg hover:bg-rosequartz text-xs font-bold text-plum">
                                        <i class="fa-solid fa-pen mr-1"></i> Modificar Datos / Estado
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },

    openAdminPersonalModal(idPersonal = null) {
        const p = idPersonal ? this.db.personal.find(item => item.idPersonal === parseInt(idPersonal)) : null;
        this.openModal(`
            <div class="p-6 sm:p-8">
                <span class="text-[10px] font-bold uppercase tracking-wider text-berry">RF18 · CU18 Gestionar Personal</span>
                <h3 class="text-xl font-bold text-plum mt-1 mb-4">${p ? 'Modificar Especialista' : 'Registrar Nueva Especialista'}</h3>
                <form onsubmit="app.handleAdminSavePersonal(event, ${p ? p.idPersonal : 'null'})" class="space-y-4 text-xs">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block font-bold text-plum mb-1">Nombres *</label>
                            <input type="text" id="per-nombres" required value="${p ? p.nombres : ''}" class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz">
                        </div>
                        <div>
                            <label class="block font-bold text-plum mb-1">Apellidos *</label>
                            <input type="text" id="per-apellidos" required value="${p ? p.apellidos : ''}" class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block font-bold text-plum mb-1">Teléfono *</label>
                            <input type="text" id="per-tel" required value="${p ? p.telefono : ''}" class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz">
                        </div>
                        <div>
                            <label class="block font-bold text-plum mb-1">Cargo / Especialidad *</label>
                            <input type="text" id="per-cargo" required value="${p ? p.cargo : 'Especialista en Belleza'}" class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz">
                        </div>
                    </div>
                    ${!p ? `
                        <div class="grid grid-cols-2 gap-4 pt-2 border-t border-rosequartz">
                            <div>
                                <label class="block font-bold text-plum mb-1">Usuario de Acceso *</label>
                                <input type="text" id="per-user" required class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz">
                            </div>
                            <div>
                                <label class="block font-bold text-plum mb-1">Contraseña *</label>
                                <input type="text" id="per-pass" required value="personal123" class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz">
                            </div>
                        </div>
                    ` : `
                        <div>
                            <label class="block font-bold text-plum mb-1">Estado</label>
                            <select id="per-estado" class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz font-bold">
                                <option value="Activo" ${p.estado === 'Activo' ? 'selected' : ''}>Activo</option>
                                <option value="Inactivo" ${p.estado === 'Inactivo' ? 'selected' : ''}>Inactivo</option>
                            </select>
                        </div>
                    `}
                    <div class="flex justify-end gap-2 pt-3 border-t border-rosequartz">
                        <button type="button" onclick="app.closeModal()" class="px-4 py-2 rounded-xl border border-rosequartz font-bold">Cancelar</button>
                        <button type="submit" class="px-5 py-2 rounded-xl luxury-gradient text-white font-bold">Guardar</button>
                    </div>
                </form>
            </div>
        `, 'max-w-lg');
    },

    handleAdminSavePersonal(e, idPersonal) {
        e.preventDefault();
        if (idPersonal) {
            const p = this.db.personal.find(item => item.idPersonal === parseInt(idPersonal));
            p.nombres = document.getElementById('per-nombres').value.trim();
            p.apellidos = document.getElementById('per-apellidos').value.trim();
            p.telefono = document.getElementById('per-tel').value.trim();
            p.cargo = document.getElementById('per-cargo').value.trim();
            p.estado = document.getElementById('per-estado').value;
            const u = this.db.usuarios.find(user => user.idUsuario === p.idUsuario);
            if (u) u.estado = p.estado;
            DatabaseService.save(this.db);
            this.showToast('Datos del personal actualizados.', 'success', 'CU18: Personal Modificado');
        } else {
            const nuevoIdU = Math.max(0, ...this.db.usuarios.map(u => u.idUsuario)) + 1;
            const nuevoIdP = Math.max(0, ...this.db.personal.map(p => p.idPersonal)) + 1;
            this.db.usuarios.push(new Usuario(nuevoIdU, document.getElementById('per-user').value.trim(), document.getElementById('per-pass').value, 'PERSONAL', 'Activo'));
            this.db.personal.push(new Personal(nuevoIdP, nuevoIdU, document.getElementById('per-nombres').value.trim(), document.getElementById('per-apellidos').value.trim(), document.getElementById('per-tel').value.trim(), document.getElementById('per-cargo').value.trim(), 'Activo'));
            DatabaseService.save(this.db);
            this.showToast('Nueva especialista incorporada al salón.', 'success', 'CU18: Personal Registrado');
        }
        this.closeModal();
        this.renderViewport();
    },
});
