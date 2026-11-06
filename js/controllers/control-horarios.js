/* Capa de control (Control) · ControlHorarios (CU10, CU11) */

// ControlHorarios (CU10, CU11)
class ControlHorarios {
    constructor(db) {
        this.db = db;
    }

    // CU11: Verificar disponibilidad según fecha, idHorario y especialista (Diagrama de Secuencia)
    verificarDisponibilidad(fecha, idHorario, idPersonal = null, excluirIdCita = null) {
        const horarioObj = this.db.horarios.find(h => h.idHorario === parseInt(idHorario));
        if (!horarioObj || horarioObj.estado !== 'Disponible') {
            return {
                disponible: false,
                motivo: 'El bloque horario seleccionado se encuentra inhabilitado por administración.'
            };
        }

        // Verificar si existe una cita activa en esa fecha y hora para ese especialista
        const citasConflicto = this.db.citas.filter(c => {
            if (excluirIdCita && c.idCita === parseInt(excluirIdCita)) return false;
            if (c.estado === 'Cancelada') return false;
            const mismaFechaHora = c.fecha === fecha && (c.idHorario === parseInt(idHorario) || c.hora === horarioObj.horaInicio);
            if (!mismaFechaHora) return false;
            if (idPersonal) {
                return c.idPersonal === parseInt(idPersonal);
            }
            return true;
        });

        if (citasConflicto.length > 0) {
            return {
                disponible: false,
                motivo: 'El horario seleccionado ya se encuentra ocupado con otra reserva activa. Por favor, seleccione otro horario.'
            };
        }

        return {
            disponible: true,
            horario: horarioObj,
            motivo: 'Horario verificado y disponible para reserva.'
        };
    }

    gestionarHorarios(accion, datos) {
        if (accion === 'CREAR') {
            const nuevoId = Math.max(0, ...this.db.horarios.map(h => h.idHorario)) + 1;
            const nuevo = new Horario(nuevoId, datos.dia, datos.horaInicio, datos.horaFin, 'Disponible');
            this.db.horarios.push(nuevo);
            DatabaseService.save(this.db);
            return { exito: true, mensaje: 'Nuevo bloque de horario agregado.' };
        } else if (accion === 'ESTADO') {
            const h = this.db.horarios.find(item => item.idHorario === parseInt(datos.idHorario));
            if (!h) return { exito: false, mensaje: 'Horario no encontrado.' };
            h.estado = h.estado === 'Disponible' ? 'Inactivo' : 'Disponible';
            DatabaseService.save(this.db);
            return { exito: true, mensaje: `Horario ${h.horaInicio} - ${h.horaFin} actualizado a ${h.estado}.` };
        }
    }
}
