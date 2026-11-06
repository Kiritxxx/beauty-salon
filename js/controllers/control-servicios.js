/* Capa de control (Control) · ControlServicios (CU07, CU09) */

// ControlServicios (CU07, CU09)
class ControlServicios {
    constructor(db) {
        this.db = db;
    }

    consultarServicios(soloActivos = false) {
        return soloActivos ? this.db.servicios.filter(s => s.estado === 'Activo') : this.db.servicios;
    }

    gestionarServicios(accion, datos) {
        if (accion === 'CREAR') {
            const nuevoId = Math.max(0, ...this.db.servicios.map(s => s.idServicio)) + 1;
            const nuevo = new Servicio(
                nuevoId,
                datos.nombre.trim(),
                datos.descripcion.trim(),
                parseFloat(datos.precio),
                parseInt(datos.duracion),
                datos.categoria || 'Mirada',
                datos.estado || 'Activo'
            );
            this.db.servicios.push(nuevo);
            DatabaseService.save(this.db);
            return { exito: true, mensaje: 'Nuevo servicio registrado en el catálogo de Dulce Mirada.' };
        } else if (accion === 'MODIFICAR') {
            const srv = this.db.servicios.find(s => s.idServicio === parseInt(datos.idServicio));
            if (!srv) return { exito: false, mensaje: 'Servicio no encontrado.' };
            srv.nombre = datos.nombre.trim();
            srv.descripcion = datos.descripcion.trim();
            srv.precio = parseFloat(datos.precio);
            srv.duracion = parseInt(datos.duracion);
            srv.categoria = datos.categoria || srv.categoria;
            srv.estado = datos.estado || srv.estado;
            DatabaseService.save(this.db);
            return { exito: true, mensaje: 'Servicio actualizado correctamente.' };
        } else if (accion === 'ESTADO') {
            const srv = this.db.servicios.find(s => s.idServicio === parseInt(datos.idServicio));
            if (!srv) return { exito: false, mensaje: 'Servicio no encontrado.' };
            srv.estado = srv.estado === 'Activo' ? 'Inactivo' : 'Activo';
            DatabaseService.save(this.db);
            return { exito: true, mensaje: `Estado del servicio cambiado a ${srv.estado}.` };
        }
    }
}
