/**
 * Historial de demostración
 * Genera citas ficticias (de forma determinista) para que el tablero de reportes tenga datos con los que trabajar.
 * Se respeta la regla del sistema: una especialista no puede tener dos citas a la misma hora.
 */
function generarHistorialCitas(citasExistentes) {
    // Generador pseudoaleatorio con semilla fija: siempre produce el mismo historial
    let semilla = 20261105;
    const azar = () => {
        semilla |= 0; semilla = (semilla + 0x6D2B79F5) | 0;
        let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const elegir = (lista) => lista[Math.floor(azar() * lista.length)];
    const ponderado = (pares) => {
        const total = pares.reduce((a, [, p]) => a + p, 0);
        let r = azar() * total;
        for (const [valor, peso] of pares) { if ((r -= peso) <= 0) return valor; }
        return pares[pares.length - 1][0];
    };

    // Servicio → especialista que lo realiza (Valeria: pestañas · Camila: cejas y facial · Lucía: uñas y maquillaje)
    const especialistaDe = { 1: 1, 2: 1, 3: 1, 4: 2, 5: 2, 6: 3, 7: 3, 8: 2 };
    const demanda = [[6, 22], [1, 18], [4, 16], [2, 13], [5, 11], [7, 8], [3, 7], [8, 5]];
    const clientas = [[1, 30], [2, 26], [3, 22], [4, 22]];
    const horarios = { 1: '09:00', 2: '10:00', 3: '11:00', 4: '12:00', 5: '15:00', 6: '16:00', 7: '17:00', 8: '18:00', 9: '19:00' };
    // Más afluencia a media tarde y en fines de semana
    const pesoHorario = [[1, 6], [2, 9], [3, 9], [4, 6], [5, 10], [6, 13], [7, 14], [8, 11], [9, 6]];
    const pesoDia = { 1: 1, 2: 1, 3: 1.2, 4: 1.3, 5: 1.7, 6: 2.1 }; // 1 = lunes … 6 = sábado
    const notas = ['', '', '', 'Primera vez en el salón.', 'Viene recomendada por una amiga.', 'Prefiere tonos naturales.', 'Alergia leve al látex.', 'Solicita atención puntual, tiene poco tiempo.', 'Cliente frecuente, mantener el estilo anterior.'];

    const ocupadas = new Set(citasExistentes.map(c => `${c.idPersonal}|${c.fecha}|${c.hora}`));
    const citas = [];
    let id = Math.max(...citasExistentes.map(c => c.idCita)) + 1;

    const fechaDe = (d) => d.toISOString().slice(0, 10);
    const inicio = new Date(Date.UTC(2026, 7, 17));   // lunes 17-ago-2026
    const finHistorial = new Date(Date.UTC(2026, 10, 4));  // hasta el 4-nov (antes de las citas de ejemplo de hoy)
    const finProgramadas = new Date(Date.UTC(2026, 10, 14));

    for (let d = new Date(inicio); d <= finProgramadas; d.setUTCDate(d.getUTCDate() + 1)) {
        const diaSemana = d.getUTCDay();
        if (diaSemana === 0) continue; // domingo cerrado
        const fecha = fechaDe(d);
        if (fecha >= '2026-11-05' && fecha <= '2026-11-06') continue; // ya hay citas de ejemplo
        const esHistorial = d <= finHistorial;
        // Crece levemente la demanda con el tiempo
        const tendencia = 1 + (d - inicio) / (1000 * 3600 * 24 * 90) * 0.5;
        const cantidad = Math.max(1, Math.round((0.45 + azar() * 1.0) * pesoDia[diaSemana] * tendencia * (esHistorial ? 1 : 0.7)));

        for (let n = 0; n < cantidad; n++) {
            const idServicio = ponderado(demanda);
            const idPersonal = especialistaDe[idServicio];
            const idHorario = ponderado(pesoHorario);
            const hora = horarios[idHorario];
            const clave = `${idPersonal}|${fecha}|${hora}`;
            if (ocupadas.has(clave)) continue;
            ocupadas.add(clave);

            let estado;
            if (esHistorial) estado = azar() < 0.86 ? 'Atendida' : 'Cancelada';
            else estado = azar() < 0.55 ? 'Confirmada' : 'Pendiente';

            citas.push(new Cita(id++, ponderado(clientas), idPersonal, idServicio, idHorario, fecha, hora, estado, elegir(notas)));
        }
    }
    return citas;
}
