/* Capa de control (Control) · ControlAtencion (CU19, CU21) */

// ControlAtencion (CU19, CU20, CU21)
class ControlAtencion {
    constructor(db) {
        this.db = db;
    }

    // CU19: Consultar agenda asignada a un personal
    consultarAgenda(idPersonal, filtroFecha = '') {
        return this.db.citas.filter(c => {
            const coincidePersonal = c.idPersonal === parseInt(idPersonal);
            const coincideFecha = filtroFecha ? c.fecha === filtroFecha : true;
            return coincidePersonal && coincideFecha;
        }).sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
    }

    // CU20: Actualizar estado de cita
    actualizarEstado(idCita, nuevoEstado) {
        const cita = this.db.citas.find(c => c.idCita === parseInt(idCita));
        if (!cita) return { exito: false, mensaje: 'Cita no localizada.' };
        cita.estado = nuevoEstado;
        DatabaseService.save(this.db);
        return { exito: true, mensaje: `Estado de la cita #${idCita} actualizado a "${nuevoEstado}".` };
    }

    // CU21: Registrar atención técnica realizada a una clienta
    registrarAtencion({ idCita, fechaAtencion, descripcion, productosUtilizados }) {
        const cita = this.db.citas.find(c => c.idCita === parseInt(idCita));
        if (!cita) return { exito: false, mensaje: 'La cita especificada no existe.' };

        const existente = this.db.atenciones.find(a => a.idCita === parseInt(idCita));
        if (existente) {
            existente.fechaAtencion = fechaAtencion;
            existente.descripcion = descripcion.trim();
            existente.productosUtilizados = productosUtilizados.trim();
        } else {
            const nuevoId = Math.max(0, ...this.db.atenciones.map(a => a.idAtencion)) + 1;
            const nuevaAtencion = new Atencion(
                nuevoId,
                parseInt(idCita),
                fechaAtencion,
                descripcion.trim(),
                productosUtilizados.trim(),
                'Completada'
            );
            this.db.atenciones.push(nuevaAtencion);
        }

        cita.estado = 'Atendida';
        DatabaseService.save(this.db);
        return { exito: true, mensaje: `Atención técnica registrada y vinculada con la Cita #${idCita}.` };
    }
}
