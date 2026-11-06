/**
 * Administración: gestión de clientes (CU08)
 * Se agregan como métodos de DulceMiradaApp (código sin cambios respecto al original).
 */
Object.assign(DulceMiradaApp.prototype, {
    // MÓDULO ADMIN 2: GESTIÓN DE CLIENTES (RF08 / CU08)
    renderAdminClientesView() {
        return `
            <div class="space-y-6">
                <div class="bg-white rounded-3xl p-6 border border-rosequartz shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <span class="text-[11px] font-bold uppercase tracking-wider text-berry">RF08 · CU08 Gestionar Clientes</span>
                        <h2 class="text-2xl font-bold text-plum">Directorio de Clientas Registradas</h2>
                    </div>
                    <button onclick="app.openAdminClienteModal()" class="px-5 py-3 rounded-xl luxury-gradient text-white text-xs font-bold shadow-sm">
                        <i class="fa-solid fa-user-plus mr-1.5"></i> Registrar Nueva Clienta
                    </button>
                </div>

                <div class="bg-white rounded-3xl border border-rosequartz shadow-sm overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr class="bg-rosebg border-b border-rosequartz text-plum uppercase text-[11px]">
                                    <th class="p-4">ID</th>
                                    <th class="p-4">Nombres y Apellidos</th>
                                    <th class="p-4">Usuario</th>
                                    <th class="p-4">Teléfono</th>
                                    <th class="p-4">Correo Electrónico</th>
                                    <th class="p-4">Estado</th>
                                    <th class="p-4 text-right">Acciones (CU08)</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-rosequartz/60">
                                ${this.db.clientes.map(c => {
                                    const u = this.db.usuarios.find(user => user.idUsuario === c.idUsuario);
                                    return `
                                        <tr class="hover:bg-rosebg/40 transition">
                                            <td class="p-4 font-bold text-berry">#${c.idCliente}</td>
                                            <td class="p-4 font-bold text-plum">${c.nombres} ${c.apellidos}</td>
                                            <td class="p-4 font-mono text-berry">${u ? u.nombreUsuario : '-'}</td>
                                            <td class="p-4">${c.telefono}</td>
                                            <td class="p-4">${c.correo}</td>
                                            <td class="p-4">
                                                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${c.estado === 'Activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
                                                    ${c.estado}
                                                </span>
                                            </td>
                                            <td class="p-4 text-right">
                                                <button onclick="app.openAdminClienteModal(${c.idCliente})" class="px-3 py-1.5 rounded-lg bg-rosebg hover:bg-rosequartz text-plum font-bold">
                                                    <i class="fa-solid fa-pen mr-1"></i> Editar / Estado
                                                </button>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    openAdminClienteModal(idCliente = null) {
        const c = idCliente ? this.db.clientes.find(item => item.idCliente === parseInt(idCliente)) : null;
        this.openModal(`
            <div class="p-6 sm:p-8">
                <span class="text-[10px] font-bold uppercase tracking-wider text-berry">RF08 · CU08 Gestionar Clientes</span>
                <h3 class="text-xl font-bold text-plum mt-1 mb-4">${c ? 'Modificar Clienta' : 'Registrar Nueva Clienta'}</h3>
                <form onsubmit="app.handleAdminSaveCliente(event, ${c ? c.idCliente : 'null'})" class="space-y-4 text-xs">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block font-bold text-plum mb-1">Nombres *</label>
                            <input type="text" id="cli-nombres" required value="${c ? c.nombres : ''}" class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz">
                        </div>
                        <div>
                            <label class="block font-bold text-plum mb-1">Apellidos *</label>
                            <input type="text" id="cli-apellidos" required value="${c ? c.apellidos : ''}" class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz">
                        </div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block font-bold text-plum mb-1">Teléfono *</label>
                            <input type="text" id="cli-telefono" required value="${c ? c.telefono : ''}" class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz">
                        </div>
                        <div>
                            <label class="block font-bold text-plum mb-1">Correo *</label>
                            <input type="email" id="cli-correo" required value="${c ? c.correo : ''}" class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz">
                        </div>
                    </div>
                    ${!c ? `
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-rosequartz">
                            <div>
                                <label class="block font-bold text-plum mb-1">Nombre de Usuario *</label>
                                <input type="text" id="cli-user" required class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz">
                            </div>
                            <div>
                                <label class="block font-bold text-plum mb-1">Contraseña Inicial *</label>
                                <input type="text" id="cli-pass" required value="cliente123" class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz">
                            </div>
                        </div>
                    ` : `
                        <div>
                            <label class="block font-bold text-plum mb-1">Estado de Cuenta</label>
                            <select id="cli-estado" class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz font-bold">
                                <option value="Activo" ${c.estado === 'Activo' ? 'selected' : ''}>Activo</option>
                                <option value="Inactivo" ${c.estado === 'Inactivo' ? 'selected' : ''}>Inactivo</option>
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

    handleAdminSaveCliente(e, idCliente) {
        e.preventDefault();
        if (idCliente) {
            const res = this.ctrlClientes.modificarCliente(idCliente, {
                nombres: document.getElementById('cli-nombres').value,
                apellidos: document.getElementById('cli-apellidos').value,
                telefono: document.getElementById('cli-telefono').value,
                correo: document.getElementById('cli-correo').value,
                estado: document.getElementById('cli-estado').value
            });
            this.closeModal();
            this.showToast(res.mensaje, 'success', 'CU08: Clienta Actualizada');
        } else {
            const res = this.ctrlClientes.registrarCliente({
                nombres: document.getElementById('cli-nombres').value,
                apellidos: document.getElementById('cli-apellidos').value,
                telefono: document.getElementById('cli-telefono').value,
                correo: document.getElementById('cli-correo').value,
                nombreUsuario: document.getElementById('cli-user').value,
                contrasena: document.getElementById('cli-pass').value
            });
            if (!res.exito) {
                this.showToast(res.mensaje, 'error');
                return;
            }
            this.closeModal();
            this.showToast(res.mensaje, 'success', 'CU08: Clienta Registrada');
        }
        this.renderViewport();
    },
});
