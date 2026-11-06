/**
 * Capa de entidades (Entity)
 * Clases del diagrama de clases (sección 3.1.11 del informe).
 */

class Usuario {
    constructor(idUsuario, nombreUsuario, contrasena, rol, estado = 'Activo') {
        this.idUsuario = idUsuario;
        this.nombreUsuario = nombreUsuario;
        this.contrasena = contrasena;
        this.rol = rol; // 'ADMINISTRADOR' | 'CLIENTE' | 'PERSONAL'
        this.estado = estado; // 'Activo' | 'Inactivo'
    }
}

class Cliente {
    constructor(idCliente, idUsuario, nombres, apellidos, telefono, correo, estado = 'Activo') {
        this.idCliente = idCliente;
        this.idUsuario = idUsuario;
        this.nombres = nombres;
        this.apellidos = apellidos;
        this.telefono = telefono;
        this.correo = correo;
        this.estado = estado;
    }
    get nombreCompleto() {
        return `${this.nombres} ${this.apellidos}`;
    }
}

class Personal {
    constructor(idPersonal, idUsuario, nombres, apellidos, telefono, cargo, estado = 'Activo') {
        this.idPersonal = idPersonal;
        this.idUsuario = idUsuario;
        this.nombres = nombres;
        this.apellidos = apellidos;
        this.telefono = telefono;
        this.cargo = cargo;
        this.estado = estado;
    }
    get nombreCompleto() {
        return `${this.nombres} ${this.apellidos}`;
    }
}

class Servicio {
    constructor(idServicio, nombre, descripcion, precio, duracion, categoria = 'Mirada', estado = 'Activo') {
        this.idServicio = idServicio;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precio = parseFloat(precio);
        this.duracion = parseInt(duracion);
        this.categoria = categoria;
        this.estado = estado;
    }
}

class Horario {
    constructor(idHorario, dia, horaInicio, horaFin, estado = 'Disponible') {
        this.idHorario = idHorario;
        this.dia = dia;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
        this.estado = estado; // 'Disponible' | 'Inactivo'
    }
}

class Cita {
    constructor(idCita, idCliente, idPersonal, idServicio, idHorario, fecha, hora, estado = 'Pendiente', observacion = '') {
        this.idCita = idCita;
        this.idCliente = parseInt(idCliente);
        this.idPersonal = parseInt(idPersonal);
        this.idServicio = parseInt(idServicio);
        this.idHorario = parseInt(idHorario);
        this.fecha = fecha; // YYYY-MM-DD
        this.hora = hora;   // HH:MM
        this.estado = estado; // 'Pendiente' | 'Confirmada' | 'En Atención' | 'Atendida' | 'Cancelada'
        this.observacion = observacion;
    }
}

class Atencion {
    constructor(idAtencion, idCita, fechaAtencion, descripcion, productosUtilizados = '', estado = 'Completada') {
        this.idAtencion = idAtencion;
        this.idCita = parseInt(idCita);
        this.fechaAtencion = fechaAtencion;
        this.descripcion = descripcion;
        this.productosUtilizados = productosUtilizados;
        this.estado = estado;
    }
}

class Reporte {
    constructor(idReporte, tipo, fechaGeneracion, resumen) {
        this.idReporte = idReporte;
        this.tipo = tipo;
        this.fechaGeneracion = fechaGeneracion;
        this.resumen = resumen;
    }
}
