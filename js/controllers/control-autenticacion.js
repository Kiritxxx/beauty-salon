/* Capa de control (Control) · ControlAutenticacion (CU01–CU04, CU06) */

// ControlAutenticacion (CU02, CU03, CU04, CU06)
class ControlAutenticacion {
    constructor(db) {
        this.db = db;
        this.usuarioActual = null;
    }

    // CU03: Validar credenciales
    validarCredenciales(nombreUsuario, contrasena) {
        const user = this.db.usuarios.find(
            u => u.nombreUsuario.toLowerCase() === nombreUsuario.trim().toLowerCase() && u.contrasena === contrasena
        );
        if (!user) {
            return { valido: false, mensaje: 'El usuario o la contraseña ingresados son incorrectos.' };
        }
        if (user.estado !== 'Activo') {
            return { valido: false, mensaje: 'La cuenta se encuentra Inactiva. Contacte a la administradora.' };
        }
        return { valido: true, usuario: user };
    }

    // Identificar Rol y perfil asociado
    identificarRol(usuario) {
        if (usuario.rol === 'ADMINISTRADOR') {
            return {
                rol: 'ADMINISTRADOR',
                nombreMostrar: 'Rosa Elizabeth Núñez Castillo',
                subtitulo: 'Propietaria y Administradora General',
                entidad: null
            };
        } else if (usuario.rol === 'CLIENTE') {
            const cliente = this.db.clientes.find(c => c.idUsuario === usuario.idUsuario);
            return {
                rol: 'CLIENTE',
                nombreMostrar: cliente ? `${cliente.nombres} ${cliente.apellidos}` : usuario.nombreUsuario,
                subtitulo: 'Clienta Dulce Mirada',
                entidad: cliente
            };
        } else if (usuario.rol === 'PERSONAL') {
            const personal = this.db.personal.find(p => p.idUsuario === usuario.idUsuario);
            return {
                rol: 'PERSONAL',
                nombreMostrar: personal ? `${personal.nombres} ${personal.apellidos}` : usuario.nombreUsuario,
                subtitulo: personal ? personal.cargo : 'Personal de Atención',
                entidad: personal
            };
        }
    }

    // CU04: Recuperar contraseña
    recuperarContrasena(correo, nuevaContrasena) {
        const cliente = this.db.clientes.find(c => c.correo.toLowerCase() === correo.trim().toLowerCase());
        if (!cliente) {
            return { exito: false, mensaje: 'No se encontró ninguna cuenta asociada al correo ingresado.' };
        }
        const usuario = this.db.usuarios.find(u => u.idUsuario === cliente.idUsuario);
        if (!usuario) {
            return { exito: false, mensaje: 'Error al localizar las credenciales de la cuenta.' };
        }
        if (nuevaContrasena && nuevaContrasena.length >= 4) {
            usuario.contrasena = nuevaContrasena;
            DatabaseService.save(this.db);
            return {
                exito: true,
                mensaje: `Contraseña actualizada con éxito para el usuario "${usuario.nombreUsuario}". Ya puede iniciar sesión.`
            };
        }
        return {
            exito: true,
            encontrado: true,
            usuario: usuario.nombreUsuario,
            cliente: `${cliente.nombres} ${cliente.apellidos}`
        };
    }
}
