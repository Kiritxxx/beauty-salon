/**
 * Herramientas de ingeniería: trazabilidad, script SQL y restauración de datos (RNF10)
 * Se agregan como métodos de DulceMiradaApp (código sin cambios respecto al original).
 */
Object.assign(DulceMiradaApp.prototype, {
    /**
     * ========================================================================
     * 8. MODAL DE INGENIERÍA RUP, MATRIZ DE TRAZABILIDAD Y SCRIPT SQL SERVER
     * ========================================================================
     */
    openEngineeringModal(tab = 'TRAZABILIDAD') {
        const sqlScript = `-- =============================================================================
-- BASE DE DATOS SQL SERVER: SISTEMA WEB SALÓN DE BELLEZA "DULCE MIRADA" (CHEPÉN 2026)
-- Metodología RUP | Modelo Relacional derivado del Diagrama de Clases (Sección 3.1.11)
-- =============================================================================
CREATE DATABASE DulceMiradaDB;
GO
USE DulceMiradaDB;
GO

CREATE TABLE Usuario (
idUsuario INT IDENTITY(1,1) PRIMARY KEY,
nombreUsuario VARCHAR(50) NOT NULL UNIQUE,
contrasena VARCHAR(120) NOT NULL,
rol VARCHAR(20) NOT NULL CHECK (rol IN ('ADMINISTRADOR', 'CLIENTE', 'PERSONAL')),
estado VARCHAR(15) NOT NULL DEFAULT 'Activo'
);

CREATE TABLE Cliente (
idCliente INT IDENTITY(1,1) PRIMARY KEY,
idUsuario INT NOT NULL UNIQUE,
nombres VARCHAR(80) NOT NULL,
apellidos VARCHAR(80) NOT NULL,
telefono VARCHAR(15) NOT NULL,
correo VARCHAR(100) NOT NULL UNIQUE,
CONSTRAINT FK_Cliente_Usuario FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario)
);

CREATE TABLE Personal (
idPersonal INT IDENTITY(1,1) PRIMARY KEY,
idUsuario INT NOT NULL UNIQUE,
nombres VARCHAR(80) NOT NULL,
apellidos VARCHAR(80) NOT NULL,
telefono VARCHAR(15) NOT NULL,
cargo VARCHAR(100) NOT NULL,
CONSTRAINT FK_Personal_Usuario FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario)
);

CREATE TABLE Servicio (
idServicio INT IDENTITY(1,1) PRIMARY KEY,
nombre VARCHAR(120) NOT NULL,
descripcion VARCHAR(300) NOT NULL,
precio DECIMAL(10,2) NOT NULL,
duracion INT NOT NULL,
estado VARCHAR(15) NOT NULL DEFAULT 'Activo'
);

CREATE TABLE Horario (
idHorario INT IDENTITY(1,1) PRIMARY KEY,
dia VARCHAR(50) NOT NULL,
horaInicio TIME NOT NULL,
horaFin TIME NOT NULL,
estado VARCHAR(20) NOT NULL DEFAULT 'Disponible'
);

CREATE TABLE Cita (
idCita INT IDENTITY(101,1) PRIMARY KEY,
idCliente INT NOT NULL,
idPersonal INT NOT NULL,
idServicio INT NOT NULL,
idHorario INT NOT NULL,
fecha DATE NOT NULL,
hora TIME NOT NULL,
estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
observacion VARCHAR(255) NULL,
CONSTRAINT FK_Cita_Cliente FOREIGN KEY (idCliente) REFERENCES Cliente(idCliente),
CONSTRAINT FK_Cita_Personal FOREIGN KEY (idPersonal) REFERENCES Personal(idPersonal),
CONSTRAINT FK_Cita_Servicio FOREIGN KEY (idServicio) REFERENCES Servicio(idServicio),
CONSTRAINT FK_Cita_Horario FOREIGN KEY (idHorario) REFERENCES Horario(idHorario)
);

CREATE TABLE Atencion (
idAtencion INT IDENTITY(1,1) PRIMARY KEY,
idCita INT NOT NULL UNIQUE,
fechaAtencion DATE NOT NULL,
descripcion VARCHAR(500) NOT NULL,
estado VARCHAR(20) NOT NULL DEFAULT 'Completada',
CONSTRAINT FK_Atencion_Cita FOREIGN KEY (idCita) REFERENCES Cita(idCita)
);

CREATE TABLE Reporte (
idReporte INT IDENTITY(1,1) PRIMARY KEY,
tipo VARCHAR(100) NOT NULL,
fechaGeneracion DATETIME NOT NULL DEFAULT GETDATE(),
resumen VARCHAR(400) NULL
);
GO`;

        const matriz = [
            ['RF01', 'Registrar cuenta', 'CU01', 'Cliente'],
            ['RF02', 'Iniciar sesión', 'CU02', 'Administrador, Cliente, Personal'],
            ['RF03', 'Validar credenciales', 'CU03', '<<include>> en CU02'],
            ['RF04', 'Recuperar contraseña', 'CU04', 'Administrador, Cliente, Personal'],
            ['RF05', 'Visualizar panel principal', 'CU05', 'Administrador, Cliente, Personal'],
            ['RF06', 'Cerrar sesión', 'CU06', 'Administrador, Cliente, Personal'],
            ['RF07', 'Consultar servicios', 'CU07', 'Cliente'],
            ['RF08', 'Gestionar clientes', 'CU08', 'Administrador'],
            ['RF09', 'Gestionar servicios', 'CU09', 'Administrador'],
            ['RF10', 'Gestionar horarios', 'CU10', 'Administrador'],
            ['RF11', 'Consultar disponibilidad', 'CU11', 'Cliente y Administrador (<<include>>)'],
            ['RF12', 'Reservar cita', 'CU12', 'Cliente'],
            ['RF13', 'Registrar cita', 'CU13', 'Administrador'],
            ['RF14', 'Consultar citas', 'CU14', 'Administrador, Cliente, Personal'],
            ['RF15', 'Modificar cita', 'CU15', 'Administrador'],
            ['RF16', 'Cancelar cita', 'CU16', 'Cliente y Administrador'],
            ['RF17', 'Consultar historial de citas', 'CU17', 'Cliente y Administrador'],
            ['RF18', 'Gestionar personal', 'CU18', 'Administrador'],
            ['RF19', 'Consultar agenda de atención', 'CU19', 'Personal de atención'],
            ['RF20', 'Actualizar estado de cita', 'CU20', 'Personal de atención'],
            ['RF21', 'Registrar atención de cita', 'CU21', 'Personal de atención'],
            ['RF22', 'Gestionar reportes', 'CU22', 'Administrador']
        ];

        this.openModal(`
            <div class="p-6 sm:p-8 max-h-[85vh] overflow-y-auto">
                <div class="flex items-center justify-between border-b border-rosequartz pb-4 mb-5">
                    <div>
                        <span class="text-[10px] font-bold uppercase tracking-wider text-berry">Universidad César Vallejo · Ingeniería de Sistemas VI Ciclo (B1T1)</span>
                        <h3 class="text-xl font-bold text-plum">Especificación RUP, Trazabilidad y Script SQL Server</h3>
                    </div>
                    <button onclick="app.closeModal()" class="w-8 h-8 rounded-full bg-rosebg"><i class="fa-solid fa-xmark"></i></button>
                </div>

                <div class="flex flex-wrap gap-2 mb-5">
                    <button onclick="app.openEngineeringModal('TRAZABILIDAD')" class="px-4 py-2 rounded-xl text-xs font-bold ${tab === 'TRAZABILIDAD' ? 'luxury-gradient text-white' : 'bg-rosebg text-plum'}">
                        1. Matriz de Trazabilidad (RF01–RF22 / CU01–CU22)
                    </button>
                    <button onclick="app.openEngineeringModal('SQL')" class="px-4 py-2 rounded-xl text-xs font-bold ${tab === 'SQL' ? 'luxury-gradient text-white' : 'bg-rosebg text-plum'}">
                        2. Script Base de Datos SQL Server
                    </button>
                </div>

                ${tab === 'TRAZABILIDAD' ? `
                    <div class="overflow-x-auto border border-rosequartz rounded-2xl">
                        <table class="w-full text-left text-xs">
                            <thead class="bg-rosebg border-b border-rosequartz text-plum uppercase text-[10px]">
                                <tr>
                                    <th class="p-3">Req.</th>
                                    <th class="p-3">Funcionalidad</th>
                                    <th class="p-3">Caso de Uso</th>
                                    <th class="p-3">Actor Asignado</th>
                                    <th class="p-3 text-right">Estado en Sistema</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-rosequartz/50">
                                ${matriz.map(row => `
                                    <tr>
                                        <td class="p-2.5 font-bold text-berry">${row[0]}</td>
                                        <td class="p-2.5 font-bold text-plum">${row[1]}</td>
                                        <td class="p-2.5 font-mono text-berry">${row[2]}</td>
                                        <td class="p-2.5 text-plum/80">${row[3]}</td>
                                        <td class="p-2.5 text-right"><span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">Implementado 100%</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : `
                    <div class="space-y-3">
                        <div class="flex justify-between items-center">
                            <p class="text-xs text-plum/80">Código DDL para Microsoft SQL Server derivado del Diagrama de Clases (Sección 3.1.11):</p>
                            <button onclick="app.copySqlScript()" class="px-3.5 py-1.5 rounded-xl bg-berry text-white text-xs font-bold">
                                <i class="fa-regular fa-copy mr-1"></i> Copiar Script SQL
                            </button>
                        </div>
                        <textarea id="sql-code-area" readonly class="w-full h-80 p-4 rounded-2xl bg-slate-900 text-emerald-300 font-mono text-[11px] leading-relaxed">${sqlScript}</textarea>
                    </div>
                `}
            </div>
        `, 'max-w-4xl');
    },

    copySqlScript() {
        const area = document.getElementById('sql-code-area');
        if (!area) return;
        area.select();
        document.execCommand('copy');
        this.showToast('Script SQL Server copiado al portapapeles.', 'success', 'SQL Server Copiado');
    },

    confirmResetDatabase() {
        this.openModal(`
            <div class="p-6 sm:p-8 text-center">
                <div class="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-3 text-xl">
                    <i class="fa-solid fa-rotate-left"></i>
                </div>
                <h3 class="text-xl font-bold text-plum mb-2">¿Restaurar Datos Originales de Fábrica?</h3>
                <p class="text-xs text-plum/75 mb-6">
                    Se restablecerán las cuentas, servicios, horarios, citas y atenciones de demostración iniciales del salón Dulce Mirada (Chepén 2026).
                </p>
                <div class="flex justify-center gap-3">
                    <button onclick="app.closeModal()" class="px-5 py-2.5 rounded-xl border border-rosequartz text-xs font-bold">Cancelar</button>
                    <button onclick="app.executeResetDatabase()" class="px-5 py-2.5 rounded-xl bg-berry text-white text-xs font-bold">Sí, Restaurar Todo</button>
                </div>
            </div>
        `, 'max-w-md');
    },

    executeResetDatabase() {
        this.db = DatabaseService.reset();
        this.initControllers();
        this.closeModal();
        this.switchDemoRole('PUBLIC');
        this.showToast('Base de datos restaurada con los valores iniciales del informe.', 'success', 'RNF10: Respaldo Restaurado');
    },
});
