/* Capa de control (Control) · ControlClientes (CU08) */

// ControlClientes (CU01, CU08)
class ControlClientes {
    constructor(db) {
        this.db = db;
    }

    // CU01 & CU08: Registrar cliente y crear cuenta
    registrarCliente({ nombres, apellidos, telefono, correo, nombreUsuario, contrasena }) {
        if (!nombres || !apellidos || !telefono || !correo || !nombreUsuario || !contrasena) {
            return { exito: false, mensaje: 'Todos los campos son obligatorios.' };
        }
        const existeCorreo = this.db.clientes.some(c => c.correo.toLowerCase() === correo.trim().toLowerCase());
        if (existeCorreo) {
            return { exito: false, mensaje: 'El correo electrónico ya se encuentra registrado en el sistema.' };
        }
        const existeUser = this.db.usuarios.some(u => u.nombreUsuario.toLowerCase() === nombreUsuario.trim().toLowerCase());
        if (existeUser) {
            return { exito: false, mensaje: 'El nombre de usuario elegido ya está en uso. Intente con otro.' };
        }

        const nuevoIdUsuario = Math.max(0, ...this.db.usuarios.map(u => u.idUsuario)) + 1;
        const nuevoIdCliente = Math.max(0, ...this.db.clientes.map(c => c.idCliente)) + 1;

        const nuevoUsuario = new Usuario(nuevoIdUsuario, nombreUsuario.trim(), contrasena, 'CLIENTE', 'Activo');
        const nuevoCliente = new Cliente(nuevoIdCliente, nuevoIdUsuario, nombres.trim(), apellidos.trim(), telefono.trim(), correo.trim(), 'Activo');

        this.db.usuarios.push(nuevoUsuario);
        this.db.clientes.push(nuevoCliente);
        DatabaseService.save(this.db);

        return { exito: true, cliente: nuevoCliente, usuario: nuevoUsuario, mensaje: 'Cuenta de clienta registrada exitosamente.' };
    }

    // CU08: Modificar cliente
    modificarCliente(idCliente, { nombres, apellidos, telefono, correo, estado }) {
        const cliente = this.db.clientes.find(c => c.idCliente === parseInt(idCliente));
        if (!cliente) return { exito: false, mensaje: 'Cliente no encontrado.' };

        cliente.nombres = nombres.trim();
        cliente.apellidos = apellidos.trim();
        cliente.telefono = telefono.trim();
        cliente.correo = correo.trim();
        if (estado) {
            cliente.estado = estado;
            const user = this.db.usuarios.find(u => u.idUsuario === cliente.idUsuario);
            if (user) user.estado = estado;
        }
        DatabaseService.save(this.db);
        return { exito: true, mensaje: 'Datos de la clienta actualizados correctamente.' };
    }
}
