/**
 * Administración: gestión de servicios (CU09)
 * Se agregan como métodos de DulceMiradaApp (código sin cambios respecto al original).
 */
Object.assign(DulceMiradaApp.prototype, {
    // MÓDULO ADMIN 3: GESTIÓN DE SERVICIOS (RF09 / CU09)
    renderAdminServiciosView() {
        return `
            <div class="space-y-6">
                <div class="bg-white rounded-3xl p-6 border border-rosequartz shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <span class="text-[11px] font-bold uppercase tracking-wider text-berry">RF09 · CU09 Gestionar Servicios</span>
                        <h2 class="text-2xl font-bold text-plum">Catálogo y Precios de Servicios</h2>
                    </div>
                    <button onclick="app.openAdminServicioModal()" class="px-5 py-3 rounded-xl luxury-gradient text-white text-xs font-bold shadow-sm">
                        <i class="fa-solid fa-plus mr-1.5"></i> Nuevo Servicio
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    ${this.db.servicios.map(s => `
                        <div class="bg-white rounded-3xl p-6 border border-rosequartz shadow-sm flex flex-col justify-between">
                            <div>
                                <div class="flex justify-between items-center mb-2">
                                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rosebg text-berry">${s.categoria}</span>
                                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${s.estado === 'Activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">${s.estado}</span>
                                </div>
                                <h3 class="text-base font-bold text-plum mb-1">${s.nombre}</h3>
                                <p class="text-xs text-plum/70 mb-4">${s.descripcion}</p>
                            </div>
                            <div class="pt-3 border-t border-rosequartz flex items-center justify-between text-xs">
                                <div>
                                    <span class="font-bold text-lg text-plum">S/ ${s.precio.toFixed(2)}</span>
                                    <span class="text-plum/60 ml-1">(${s.duracion} min)</span>
                                </div>
                                <div class="space-x-1">
                                    <button onclick="app.openAdminServicioModal(${s.idServicio})" class="px-3 py-1.5 rounded-lg bg-rosebg hover:bg-rosequartz font-bold text-plum">Editar</button>
                                    <button onclick="app.toggleServicioEstado(${s.idServicio})" class="px-2.5 py-1.5 rounded-lg border border-rosequartz text-plum/80 hover:bg-rose-50">
                                        <i class="fa-solid fa-power-off"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    openAdminServicioModal(idServicio = null) {
        const s = idServicio ? this.db.servicios.find(item => item.idServicio === parseInt(idServicio)) : null;
        this.openModal(`
            <div class="p-6 sm:p-8">
                <span class="text-[10px] font-bold uppercase tracking-wider text-berry">RF09 · CU09 Gestionar Servicios</span>
                <h3 class="text-xl font-bold text-plum mt-1 mb-4">${s ? 'Modificar Servicio' : 'Registrar Nuevo Servicio'}</h3>
                <form onsubmit="app.handleAdminSaveServicio(event, ${s ? s.idServicio : 'null'})" class="space-y-4 text-xs">
                    <div>
                        <label class="block font-bold text-plum mb-1">Nombre del Servicio *</label>
                        <input type="text" id="srv-nombre" required value="${s ? s.nombre : ''}" class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz">
                    </div>
                    <div>
                        <label class="block font-bold text-plum mb-1">Descripción *</label>
                        <textarea id="srv-desc" rows="2" required class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz">${s ? s.descripcion : ''}</textarea>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label class="block font-bold text-plum mb-1">Precio (S/) *</label>
                            <input type="number" step="0.50" id="srv-precio" required value="${s ? s.precio : '60.00'}" class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz">
                        </div>
                        <div>
                            <label class="block font-bold text-plum mb-1">Duración (min) *</label>
                            <input type="number" id="srv-duracion" required value="${s ? s.duracion : '60'}" class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz">
                        </div>
                        <div>
                            <label class="block font-bold text-plum mb-1">Categoría</label>
                            <select id="srv-categoria" class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz">
                                ${['Pestañas', 'Cejas', 'Uñas', 'Maquillaje', 'Facial'].map(cat => `<option value="${cat}" ${s && s.categoria === cat ? 'selected' : ''}>${cat}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 pt-3 border-t border-rosequartz">
                        <button type="button" onclick="app.closeModal()" class="px-4 py-2 rounded-xl border border-rosequartz font-bold">Cancelar</button>
                        <button type="submit" class="px-5 py-2 rounded-xl luxury-gradient text-white font-bold">Guardar Servicio</button>
                    </div>
                </form>
            </div>
        `, 'max-w-lg');
    },

    handleAdminSaveServicio(e, idServicio) {
        e.preventDefault();
        const datos = {
            idServicio,
            nombre: document.getElementById('srv-nombre').value,
            descripcion: document.getElementById('srv-desc').value,
            precio: document.getElementById('srv-precio').value,
            duracion: document.getElementById('srv-duracion').value,
            categoria: document.getElementById('srv-categoria').value
        };
        const res = this.ctrlServicios.gestionarServicios(idServicio ? 'MODIFICAR' : 'CREAR', datos);
        this.closeModal();
        this.showToast(res.mensaje, 'success', 'CU09: Gestión de Servicios');
        this.renderViewport();
    },

    toggleServicioEstado(idServicio) {
        const res = this.ctrlServicios.gestionarServicios('ESTADO', { idServicio });
        this.showToast(res.mensaje, 'info', 'CU09: Estado de Servicio');
        this.renderViewport();
    },
});
