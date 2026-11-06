/**
 * Servicio de persistencia
 * Simula la base de datos con localStorage y carga los datos semilla de Chepén 2026.
 */

class DatabaseService {
    static STORAGE_KEY = 'DULCE_MIRADA_DB_2026_V1';

    static getInitialSeed() {
        return {
            usuarios: [
                new Usuario(1, 'rnunez', 'admin123', 'ADMINISTRADOR', 'Activo'),
                new Usuario(2, 'vmendoza', 'personal123', 'PERSONAL', 'Activo'),
                new Usuario(3, 'cvargas', 'personal123', 'PERSONAL', 'Activo'),
                new Usuario(4, 'lparedes', 'personal123', 'PERSONAL', 'Activo'),
                new Usuario(5, 'mtorres', 'cliente123', 'CLIENTE', 'Activo'),
                new Usuario(6, 'adiaz', 'cliente123', 'CLIENTE', 'Activo'),
                new Usuario(7, 'fsanchez', 'cliente123', 'CLIENTE', 'Activo'),
                new Usuario(8, 'kcabanillas', 'cliente123', 'CLIENTE', 'Activo')
            ],
            clientes: [
                new Cliente(1, 5, 'María Fernanda', 'Torres Huamán', '948512369', 'mtorres@gmail.com', 'Activo'),
                new Cliente(2, 6, 'Andrea Carolina', 'Díaz Becerra', '976410258', 'adiaz@gmail.com', 'Activo'),
                new Cliente(3, 7, 'Fiorella Milagros', 'Sánchez Salazar', '951753852', 'fsanchez@gmail.com', 'Activo'),
                new Cliente(4, 8, 'Kiara Valentina', 'Cabanillas Rojas', '944125896', 'kcabanillas@hotmail.com', 'Activo')
            ],
            personal: [
                new Personal(1, 2, 'Valeria', 'Mendoza Ríos', '949852147', 'Especialista en Mirada y Pestañas', 'Activo'),
                new Personal(2, 3, 'Camila', 'Vargas Soto', '941258963', 'Estilista & Diseño de Cejas', 'Activo'),
                new Personal(3, 4, 'Lucía', 'Paredes Gómez', '963852741', 'Especialista en Manicure & Maquillaje Social', 'Activo')
            ],
            servicios: [
                new Servicio(1, 'Lifting y Laminado de Pestañas + Tinte', 'Elevación natural de pestañas desde la raíz con keratina nutritiva y tinte negro intenso.', 65.00, 60, 'Pestañas', 'Activo'),
                new Servicio(2, 'Extensiones de Pestañas Efecto Rímel', 'Aplicación pelo a pelo técnica clásica para una mirada expresiva, elegante y natural.', 95.00, 90, 'Pestañas', 'Activo'),
                new Servicio(3, 'Extensiones de Pestañas Volumen Ruso', 'Abanicos ultraligeros 3D-5D para máxima densidad y definición hipoalergénica.', 130.00, 120, 'Pestañas', 'Activo'),
                new Servicio(4, 'Diseño y Depilación de Cejas con Hilo + Henna', 'Visagismo facial personalizado, depilación hindú con hilo orgánico y sombreado temporal en henna.', 35.00, 40, 'Cejas', 'Activo'),
                new Servicio(5, 'Laminado de Cejas (Brow Lamination)', 'Alineación y fijación direccional del vello de la ceja con botox hidratante.', 55.00, 45, 'Cejas', 'Activo'),
                new Servicio(6, 'Manicure Rusa + Esmaltado en Gel', 'Limpieza profunda de cutícula con torno de precisión y nivelación con base ruber.', 50.00, 60, 'Uñas', 'Activo'),
                new Servicio(7, 'Maquillaje Profesional Social + Ondas', 'Maquillaje de larga duración con productos de alta gama, pestañas postizas en tira y peinado en ondas.', 140.00, 90, 'Maquillaje', 'Activo'),
                new Servicio(8, 'Limpieza Facial Profunda Hidrofacial', 'Extracción ultrasónica de impurezas, punta de diamante, máscara hidroplástica y fototerapia LED.', 85.00, 60, 'Facial', 'Activo')
            ],
            horarios: [
                new Horario(1, 'Lunes a Sábado', '09:00', '10:00', 'Disponible'),
                new Horario(2, 'Lunes a Sábado', '10:00', '11:00', 'Disponible'),
                new Horario(3, 'Lunes a Sábado', '11:00', '12:00', 'Disponible'),
                new Horario(4, 'Lunes a Sábado', '12:00', '13:00', 'Disponible'),
                new Horario(5, 'Lunes a Sábado', '15:00', '16:00', 'Disponible'),
                new Horario(6, 'Lunes a Sábado', '16:00', '17:00', 'Disponible'),
                new Horario(7, 'Lunes a Sábado', '17:00', '18:00', 'Disponible'),
                new Horario(8, 'Lunes a Sábado', '18:00', '19:00', 'Disponible'),
                new Horario(9, 'Lunes a Sábado', '19:00', '20:00', 'Disponible')
            ],
            citas: [
                new Cita(101, 1, 1, 1, 2, '2026-11-05', '10:00', 'Confirmada', 'Clienta solicita curvatura media y tinte hipoalergénico.'),
                new Cita(102, 2, 1, 3, 5, '2026-11-05', '15:00', 'En Atención', 'Primera puesta de Volumen Ruso 4D.'),
                new Cita(103, 3, 2, 4, 3, '2026-11-05', '11:00', 'Confirmada', 'Diseño con henna tono castaño oscuro.'),
                new Cita(104, 1, 2, 5, 6, '2026-10-28', '16:00', 'Atendida', 'Brow lamination completo.'),
                new Cita(105, 4, 3, 7, 7, '2026-10-30', '17:00', 'Atendida', 'Maquillaje para evento de graduación en Chepén.'),
                new Cita(106, 2, 3, 6, 1, '2026-11-06', '09:00', 'Pendiente', 'Desea diseño francés clásico en tonos nude.')
            ],
            atenciones: [
                new Atencion(1, 104, '2026-10-28', 'Se realizó laminado de cejas con neutralizante suave y suero de keratina. Excelente fijación del vello.', 'Kit Brow Lamination Thuya, Botox Keratina, Aceite de Ricino', 'Completada'),
                new Atencion(2, 105, '2026-10-30', 'Maquillaje social acabado piel blindada resistente al clima cálido de Chepén + ondas al agua.', 'Primer hidratante, Base Estée Lauder, Fijador Kryolan', 'Completada')
            ],
            reportes: [
                new Reporte(1, 'Resumen General de Citas e Ingresos', '2026-11-01 09:30', 'Total citas evaluadas: 6 | Citas atendidas: 2 | Ingresos proyectados: S/ 520.00')
            ]
        };
    }

    static load() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (!raw) {
                const seed = this.getInitialSeed();
                this.save(seed);
                return seed;
            }
            return JSON.parse(raw);
        } catch (e) {
            console.error('Error cargando almacenamiento local:', e);
            return this.getInitialSeed();
        }
    }

    static save(data) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('Error guardando almacenamiento local:', e);
        }
    }

    static reset() {
        const seed = this.getInitialSeed();
        this.save(seed);
        return seed;
    }
}
