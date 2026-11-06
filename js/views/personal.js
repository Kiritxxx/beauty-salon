/**
 * Personal de atención: agenda, estado de citas y registro de atención (CU19–CU21)
 * Se agregan como métodos de DulceMiradaApp (código sin cambios respecto al original).
 */
Object.assign(DulceMiradaApp.prototype, {
    /**
     * ========================================================================
     * 7. DIAGRAMA DE NAVEGABILIDAD DEL PERSONAL DE ATENCIÓN (SECCIÓN 3.1.12)
     * Flujo exacto: Panel del Personal -> Consultar Agenda -> Seleccionar Cita ->
     *               Consultar Detalle -> Actualizar Estado (CU20) | Registrar Atención (CU21)
     * ========================================================================
     */
    renderStaffLayout() {
        const idPersonal = this.activeProfile.entidad.idPersonal;
        const agenda = this.ctrlAtencion.consultarAgenda(idPersonal).map(c => this.enrichCita(c));
        const pendientesHoy = agenda.filter(c => c.estado === 'Confirmada' || c.estado === 'En Atención');
        const completadas = agenda.filter(c => c.estado === 'Atendida');

        return `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
                <!-- Banner del Personal -->
                <div class="luxury-gradient rounded-3xl p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <span class="px-3 py-1 rounded-full bg-emerald-400 text-plum font-bold text-[10px] uppercase tracking-wider">
                            RF19 · RF20 · RF21 · Panel del Personal de Atención
                        </span>
                        <h2 class="text-3xl font-bold mt-2">Agenda de ${this.activeProfile.nombreMostrar}</h2>
                        <p class="text-xs sm:text-sm text-rosequartz/90 mt-1">
                            Especialidad: <b>${this.activeProfile.subtitulo}</b> · Seleccione una cita asignada para consultar su detalle, actualizar su estado o registrar la ficha de atención.
                        </p>
                    </div>
                    <div class="flex gap-4 bg-white/10 p-4 rounded-2xl border border-white/15 text-center">
                        <div class="px-3">
                            <p class="text-2xl font-luxury font-bold text-gold">${agenda.length}</p>
                            <p class="text-[11px] text-rosequartz">Citas Asignadas</p>
                        </div>
                        <div class="border-l border-white/15 px-3">
                            <p class="text-2xl font-luxury font-bold text-emerald-300">${pendientesHoy.length}</p>
                            <p class="text-[11px] text-rosequartz">Por Atender</p>
                        </div>
                        <div class="border-l border-white/15 px-3">
                            <p class="text-2xl font-luxury font-bold text-white">${completadas.length}</p>
                            <p class="text-[11px] text-rosequartz">Atendidas</p>
                        </div>
                    </div>
                </div>

                <!-- Selector Rápido de Especialista (Para probar las agendas de las 3 trabajadoras) -->
                <div class="bg-white rounded-2xl p-4 border border-rosequartz flex flex-wrap items-center justify-between gap-3 text-xs">
                    <span class="font-bold text-plum"><i class="fa-solid fa-users-Rectangle text-berry mr-1.5"></i> Cambiar especialista en vista de agenda:</span>
                    <div class="flex flex-wrap gap-2">
                        ${this.db.personal.map(p => `
                            <button onclick="app.switchActiveStaffMember(${p.idPersonal})" class="px-3.5 py-1.5 rounded-xl font-bold transition ${p.idPersonal === idPersonal ? 'bg-berry text-white' : 'bg-rosebg text-plum hover:bg-rosequartz/50'}">
                                ${p.nombres} ${p.apellidos.split(' ')[0]}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- Lista de Agenda Asignada (CU19 Consultar Agenda de Atención) -->
                <div class="space-y-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="text-[11px] font-bold uppercase tracking-wider text-berry">CU19 Consultar Agenda Asignada</span>
                            <h3 class="text-xl font-bold text-plum">Citas Programadas en mi Agenda</h3>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                        ${agenda.map(c => `
                            <div class="bg-white rounded-3xl p-6 border border-rosequartz shadow-sm flex flex-col justify-between hover:border-berry transition">
                                <div>
                                    <div class="flex items-center justify-between gap-2 mb-3">
                                        <span class="text-xs font-bold text-berry bg-rosebg px-3 py-1 rounded-full">Cita #${c.idCita} · ${c.fecha} (${c.hora} hrs)</span>
                                        ${this.renderEstadoBadge(c.estado)}
                                    </div>
                                    <h4 class="text-lg font-bold text-plum mb-1">${c.servicio.nombre}</h4>
                                    <p class="text-xs text-plum/80 mb-2">
                                        <i class="fa-solid fa-user text-berry mr-1"></i> Clienta: <b>${c.cliente.nombres} ${c.cliente.apellidos}</b> (Tel: ${c.cliente.telefono})
                                    </p>
                                    <p class="text-xs text-plum/70 bg-rosebg/50 p-3 rounded-xl border border-rosequartz/60 mb-4">
                                        <b>Observación de la cita:</b> ${c.observacion || 'Sin observaciones.'}
                                    </p>
                                    ${c.atencion ? `
                                        <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 mb-4">
                                            <p class="font-bold"><i class="fa-solid fa-check-circle mr-1"></i> Atención Registrada (${c.atencion.fechaAtencion}):</p>
                                            <p class="mt-0.5">${c.atencion.descripcion}</p>
                                        </div>
                                    ` : ''}
                                </div>

                                <div class="pt-4 border-t border-rosequartz flex flex-wrap items-center justify-between gap-2">
                                    <button onclick="app.openStaffCitaDetailModal(${c.idCita})" class="px-4 py-2 rounded-xl bg-rosebg hover:bg-rosequartz text-plum font-bold text-xs transition">
                                        <i class="fa-solid fa-magnifying-glass mr-1"></i> Seleccionar y Consultar Detalle
                                    </button>
                                    <div class="flex gap-2">
                                        <button onclick="app.openStaffUpdateStatusModal(${c.idCita})" class="px-3.5 py-2 rounded-xl border border-berry text-berry hover:bg-rosebg font-bold text-xs transition">
                                            Estado (CU20)
                                        </button>
                                        <button onclick="app.openStaffRegisterAtencionModal(${c.idCita})" class="px-4 py-2 rounded-xl luxury-gradient text-white font-bold text-xs shadow-sm hover:opacity-95 transition">
                                            <i class="fa-solid fa-file-signature mr-1"></i> Registrar Atención (CU21)
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    switchActiveStaffMember(idPersonal) {
        const p = this.db.personal.find(item => item.idPersonal === parseInt(idPersonal));
        if (!p) return;
        const u = this.db.usuarios.find(user => user.idUsuario === p.idUsuario);
        if (u) this.loginWithUserObject(u);
        this.renderHeader();
        this.renderViewport();
    },

    // Paso Navegabilidad Personal: Seleccionar Cita -> Consultar Detalle
    openStaffCitaDetailModal(idCita) {
        const c = this.enrichCita(this.db.citas.find(item => item.idCita === parseInt(idCita)));
        this.openModal(`
            <div class="p-6 sm:p-8">
                <div class="flex justify-between items-center border-b border-rosequartz pb-4 mb-5">
                    <div>
                        <span class="text-[10px] font-bold uppercase tracking-wider text-berry">Navegabilidad Personal · Consultar Detalle de Cita #${c.idCita}</span>
                        <h3 class="text-xl font-bold text-plum">${c.servicio.nombre}</h3>
                    </div>
                    <button onclick="app.closeModal()" class="w-8 h-8 rounded-full bg-rosebg"><i class="fa-solid fa-xmark"></i></button>
                </div>

                <div class="space-y-3 text-xs bg-rosebg/50 p-4 rounded-2xl border border-rosequartz mb-5">
                    <p><b>Clienta:</b> ${c.cliente.nombres} ${c.cliente.apellidos} · <b>Teléfono:</b> ${c.cliente.telefono}</p>
                    <p><b>Fecha y Hora programada:</b> ${c.fecha} a las ${c.hora} hrs (${c.servicio.duracion} min)</p>
                    <p><b>Estado Actual:</b> ${c.estado}</p>
                    <p><b>Observación previa:</b> ${c.observacion || 'Ninguna'}</p>
                </div>

                <div class="flex flex-wrap justify-end gap-2.5 pt-3 border-t border-rosequartz">
                    <button onclick="app.openStaffUpdateStatusModal(${c.idCita})" class="px-4 py-2.5 rounded-xl border border-berry text-berry font-bold text-xs">
                        <i class="fa-solid fa-arrows-rotate mr-1"></i> Actualizar Estado (CU20)
                    </button>
                    <button onclick="app.openStaffRegisterAtencionModal(${c.idCita})" class="px-5 py-2.5 rounded-xl luxury-gradient text-white font-bold text-xs">
                        <i class="fa-solid fa-clipboard-check mr-1"></i> Registrar Atención Realizada (CU21)
                    </button>
                </div>
            </div>
        `, 'max-w-lg');
    },

    // CU20: Actualizar estado de cita
    openStaffUpdateStatusModal(idCita) {
        const c = this.db.citas.find(item => item.idCita === parseInt(idCita));
        const estados = ['Pendiente', 'Confirmada', 'En Atención', 'Atendida', 'Cancelada'];
        this.openModal(`
            <div class="p-6 sm:p-8">
                <span class="text-[10px] font-bold uppercase tracking-wider text-berry">RF20 · CU20 Actualizar Estado de Cita</span>
                <h3 class="text-xl font-bold text-plum mt-1 mb-4">Actualizar Estado — Cita #${c.idCita}</h3>
                <form onsubmit="app.handleStaffStatusSubmit(event, ${c.idCita})" class="space-y-4 text-xs">
                    <div>
                        <label class="block font-bold text-plum mb-1.5">Seleccione el nuevo estado según el avance de la atención:</label>
                        <select id="staff-nuevo-estado" class="w-full px-4 py-3 rounded-xl border border-rosequartz bg-rosebg/40 font-bold text-sm">
                            ${estados.map(est => `<option value="${est}" ${est === c.estado ? 'selected' : ''}>${est}</option>`).join('')}
                        </select>
                    </div>
                    <div class="flex justify-end gap-2 pt-3 border-t border-rosequartz">
                        <button type="button" onclick="app.closeModal()" class="px-4 py-2 rounded-xl border border-rosequartz font-bold">Cancelar</button>
                        <button type="submit" class="px-5 py-2.5 rounded-xl luxury-gradient text-white font-bold">Confirmar Estado (CU20)</button>
                    </div>
                </form>
            </div>
        `, 'max-w-md');
    },

    handleStaffStatusSubmit(e, idCita) {
        e.preventDefault();
        const nuevoEstado = document.getElementById('staff-nuevo-estado').value;
        const res = this.ctrlAtencion.actualizarEstado(idCita, nuevoEstado);
        this.closeModal();
        this.showToast(res.mensaje, 'success', 'CU20: Estado Actualizado');
        this.renderViewport();
    },

    // CU21: Registrar atención de cita
    openStaffRegisterAtencionModal(idCita) {
        const c = this.enrichCita(this.db.citas.find(item => item.idCita === parseInt(idCita)));
        const at = c.atencion;
        this.openModal(`
            <div class="p-6 sm:p-8">
                <div class="flex justify-between items-center border-b border-rosequartz pb-4 mb-5">
                    <div>
                        <span class="text-[10px] font-bold uppercase tracking-wider text-berry">RF21 · CU21 Registrar Atención de Cita</span>
                        <h3 class="text-xl font-bold text-plum">Ficha Técnica de Atención — Cita #${c.idCita}</h3>
                    </div>
                    <button onclick="app.closeModal()" class="w-8 h-8 rounded-full bg-rosebg"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <form onsubmit="app.handleStaffAtencionSubmit(event, ${c.idCita})" class="space-y-4 text-xs">
                    <div class="p-3.5 rounded-xl bg-rosebg border border-rosequartz">
                        <p><b>Clienta:</b> ${c.cliente.nombres} ${c.cliente.apellidos}</p>
                        <p><b>Servicio:</b> ${c.servicio.nombre} (S/ ${c.servicio.precio.toFixed(2)})</p>
                    </div>
                    <div>
                        <label class="block font-bold text-plum mb-1">Fecha de Atención *</label>
                        <input type="date" id="at-fecha" required value="${at ? at.fechaAtencion : c.fecha}" class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz">
                    </div>
                    <div>
                        <label class="block font-bold text-plum mb-1">Descripción detallada del procedimiento realizado *</label>
                        <textarea id="at-desc" rows="3" required placeholder="Describa el resultado, técnica empleada y recomendaciones para la clienta..."
                            class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz">${at ? at.descripcion : ''}</textarea>
                    </div>
                    <div>
                        <label class="block font-bold text-plum mb-1">Productos e Insumos Utilizados</label>
                        <input type="text" id="at-prod" value="${at ? at.productosUtilizados : ''}" placeholder="Ej. Adhesivo hipoalergénico, Keratina, Tinte..."
                            class="w-full px-3.5 py-2.5 rounded-xl border border-rosequartz">
                    </div>
                    <div class="flex justify-end gap-2 pt-3 border-t border-rosequartz">
                        <button type="button" onclick="app.closeModal()" class="px-4 py-2 rounded-xl border border-rosequartz font-bold">Cancelar</button>
                        <button type="submit" class="px-5 py-2.5 rounded-xl luxury-gradient text-white font-bold">
                            <i class="fa-solid fa-check mr-1"></i> Guardar Atención y Marcar Atendida (CU21)
                        </button>
                    </div>
                </form>
            </div>
        `, 'max-w-lg');
    },

    handleStaffAtencionSubmit(e, idCita) {
        e.preventDefault();
        const res = this.ctrlAtencion.registrarAtencion({
            idCita,
            fechaAtencion: document.getElementById('at-fecha').value,
            descripcion: document.getElementById('at-desc').value,
            productosUtilizados: document.getElementById('at-prod').value
        });
        this.closeModal();
        this.showToast(res.mensaje, 'success', 'CU21: Atención Registrada');
        this.renderViewport();
    },
});
