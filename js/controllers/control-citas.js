/* Capa de control (Control) · ControlCitas (CU12–CU17, CU20) */

// ControlCitas (CU12, CU13, CU14, CU15, CU16, CU17)
class ControlCitas {
    constructor(db, controlHorarios) {
        this.db = db;
        this.controlHorarios = controlHorarios;
    }

    // CU12 & CU13: Registrar cita validando disponibilidad
    registrarCita({ idCliente, idPersonal, idServicio, idHorario, fecha, observacion, creadoPorAdmin = false }) {
        const check = this.controlHorarios.verificarDisponibilidad(fecha, idHorario, idPersonal);
        if (!check.disponible) {
            return { exito: false, mensaje: check.motivo };
        }

        const nuevoId = Math.max(100, ...this.db.citas.map(c => c.idCita)) + 1;
        const estadoInicial = creadoPorAdmin ? 'Confirmada' : 'Confirmada';
        const nuevaCita = new Cita(
            nuevoId,
            parseInt(idCliente),
            parseInt(idPersonal),
            parseInt(idServicio),
            parseInt(idHorario),
            fecha,
            check.horario.horaInicio,
            estadoInicial,
            observacion ? observacion.trim() : ''
        );

        this.db.citas.push(nuevaCita);
        DatabaseService.save(this.db);
        return {
            exito: true,
            cita: nuevaCita,
            mensaje: `Cita #${nuevoId} registrada exitosamente para el ${fecha} a las ${check.horario.horaInicio}.`
        };
    }

    // CU15: Modificar cita
    modificarCita(idCita, { idPersonal, idServicio, idHorario, fecha, estado, observacion }) {
        const cita = this.db.citas.find(c => c.idCita === parseInt(idCita));
        if (!cita) return { exito: false, mensaje: 'Cita no encontrada.' };

        const check = this.controlHorarios.verificarDisponibilidad(fecha, idHorario, idPersonal, cita.idCita);
        if (!check.disponible && estado !== 'Cancelada') {
            return { exito: false, mensaje: check.motivo };
        }

        cita.idPersonal = parseInt(idPersonal);
        cita.idServicio = parseInt(idServicio);
        cita.idHorario = parseInt(idHorario);
        cita.fecha = fecha;
        cita.hora = check.horario ? check.horario.horaInicio : cita.hora;
        cita.estado = estado;
        cita.observacion = observacion;

        DatabaseService.save(this.db);
        return { exito: true, mensaje: `Cita #${idCita} actualizada correctamente.` };
    }

    // CU16: Cancelar cita
    cancelarCita(idCita, motivoCancelacion = '') {
        const cita = this.db.citas.find(c => c.idCita === parseInt(idCita));
        if (!cita) return { exito: false, mensaje: 'No se encontró la cita especificada.' };
        cita.estado = 'Cancelada';
        if (motivoCancelacion) {
            cita.observacion = (cita.observacion ? cita.observacion + ' | ' : '') + `Cancelada: ${motivoCancelacion}`;
        }
        DatabaseService.save(this.db);
        return { exito: true, mensaje: `La cita #${idCita} ha sido cancelada.` };
    }
}
