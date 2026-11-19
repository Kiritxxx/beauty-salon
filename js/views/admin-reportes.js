/**
 * Administración: reportes en formato de tablero de inteligencia de negocio (CU22)
 * Indicadores, gráficos interactivos y filtros cruzados sobre las citas, servicios y clientas.
 * Se agregan como métodos de DulceMiradaApp.
 */
(function () {
    const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const ESTADOS = ['Atendida', 'Confirmada', 'Pendiente', 'Cancelada'];
    const esc = (t) => Graficos.esc(t);

    // ── Utilidades de fechas (cadenas AAAA-MM-DD, sin problemas de zona horaria) ──
    const aUTC = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
    const aISO = (d) => d.toISOString().slice(0, 10);
    const sumarDias = (iso, n) => { const d = aUTC(iso); d.setUTCDate(d.getUTCDate() + n); return aISO(d); };
    const diasEntre = (a, b) => Math.round((aUTC(b) - aUTC(a)) / 86400000);
    const hoyISO = () => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`; };
    const lunesDe = (iso) => { const d = aUTC(iso); const k = (d.getUTCDay() + 6) % 7; d.setUTCDate(d.getUTCDate() - k); return aISO(d); };
    const corta = (iso) => { const [, m, d] = iso.split('-').map(Number); return `${d} ${MESES[m - 1]}`; };
    const larga = (iso) => `${corta(iso)} ${iso.slice(0, 4)}`;
    const nombreDia = (iso) => ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][aUTC(iso).getUTCDay()];
    const finDeMes = (iso) => { const d = aUTC(iso.slice(0, 7) + '-01'); d.setUTCMonth(d.getUTCMonth() + 1); d.setUTCDate(0); return aISO(d); };

    Object.assign(DulceMiradaApp.prototype, {
        // ════════════════════════════════════════════════════════════════
        // ESTADO Y DATOS DEL TABLERO
        // ════════════════════════════════════════════════════════════════
        tableroFiltros() {
            if (!this.tablero) {
                this.tablero = { periodo: 'todo', desde: '', hasta: '', personal: 'todos', categoria: 'todos', estado: 'todos', servicio: 'todos', metrica: 'ingresos' };
            }
            return this.tablero;
        },

        /** Rango de fechas según el período elegido. */
        tableroRango(citas) {
            const f = this.tableroFiltros();
            const hoy = hoyISO();
            const fechas = citas.map(c => c.fecha).sort();
            const todo = { desde: fechas[0] || hoy, hasta: fechas[fechas.length - 1] || hoy, etiqueta: 'Todo el historial', comparable: false };
            switch (f.periodo) {
                case '30d': return { desde: sumarDias(hoy, -29), hasta: hoy, etiqueta: 'Últimos 30 días', comparable: true };
                case '90d': return { desde: sumarDias(hoy, -89), hasta: hoy, etiqueta: 'Últimos 90 días', comparable: true };
                case 'mes': { const d = hoy.slice(0, 7) + '-01'; return { desde: d, hasta: finDeMes(d), etiqueta: 'Este mes', comparable: true }; }
                case 'mesant': { const d = sumarDias(hoy.slice(0, 7) + '-01', -1).slice(0, 7) + '-01'; return { desde: d, hasta: finDeMes(d), etiqueta: 'Mes anterior', comparable: true }; }
                case 'rango':
                    if (f.desde && f.hasta && f.desde <= f.hasta) return { desde: f.desde, hasta: f.hasta, etiqueta: `${larga(f.desde)} – ${larga(f.hasta)}`, comparable: true };
                    return todo;
                default: return todo;
            }
        },

        /** Citas con sus datos relacionados, filtradas. `omitir` = dimensiones que un gráfico no debe filtrar a sí mismo. */
        tableroCitas(rango, omitir = []) {
            const f = this.tableroFiltros();
            return this.db.citas
                .map(c => this.enrichCita(c))
                .filter(c => c.fecha >= rango.desde && c.fecha <= rango.hasta)
                .filter(c => omitir.includes('personal') || f.personal === 'todos' || String(c.idPersonal) === String(f.personal))
                .filter(c => omitir.includes('categoria') || f.categoria === 'todos' || c.servicio.categoria === f.categoria)
                .filter(c => omitir.includes('estado') || f.estado === 'todos' || c.estado === f.estado)
                .filter(c => omitir.includes('servicio') || f.servicio === 'todos' || String(c.idServicio) === String(f.servicio));
        },

        tableroMetricas(lista) {
            const atendidas = lista.filter(c => c.estado === 'Atendida');
            const canceladas = lista.filter(c => c.estado === 'Cancelada');
            const porAtender = lista.filter(c => ['Pendiente', 'Confirmada'].includes(c.estado));
            const suma = (arr) => arr.reduce((a, c) => a + c.servicio.precio, 0);
            return {
                total: lista.length,
                atendidas: atendidas.length,
                canceladas: canceladas.length,
                porAtender: porAtender.length,
                ingresos: suma(atendidas),
                proyectado: suma(porAtender),
                ticket: atendidas.length ? suma(atendidas) / atendidas.length : 0,
                clientas: new Set(atendidas.map(c => c.idCliente)).size,
                tasaCancelacion: lista.length ? (canceladas.length / lista.length) * 100 : 0
            };
        },

        /** Serie temporal agrupada por día, semana o mes según la amplitud del período. */
        tableroSerie(lista, rango) {
            const f = this.tableroFiltros();
            const dias = diasEntre(rango.desde, rango.hasta) + 1;
            const modo = dias <= 45 ? 'dia' : dias <= 270 ? 'semana' : 'mes';
            const clave = (iso) => modo === 'dia' ? iso : modo === 'semana' ? lunesDe(iso) : iso.slice(0, 7);
            const grupos = new Map();
            let cursor = modo === 'dia' ? rango.desde : modo === 'semana' ? lunesDe(rango.desde) : rango.desde.slice(0, 7) + '-01';
            while (cursor <= rango.hasta) {
                grupos.set(clave(cursor), { ingresos: 0, citas: 0, atendidas: 0 });
                cursor = modo === 'dia' ? sumarDias(cursor, 1) : modo === 'semana' ? sumarDias(cursor, 7) : aISO(new Date(Date.UTC(+cursor.slice(0, 4), +cursor.slice(5, 7), 1)));
            }
            lista.forEach(c => {
                const g = grupos.get(clave(c.fecha));
                if (!g) return;
                if (c.estado !== 'Cancelada') g.citas++;
                if (c.estado === 'Atendida') { g.ingresos += c.servicio.precio; g.atendidas++; }
            });
            const esIngresos = f.metrica === 'ingresos';
            const puntos = [...grupos.entries()].map(([k, g]) => {
                const etiqueta = modo === 'mes' ? `${MESES[+k.slice(5, 7) - 1]} ${k.slice(2, 4)}` : corta(k);
                const cuando = modo === 'dia' ? `${nombreDia(k)} ${larga(k)}` : modo === 'semana' ? `Semana del ${corta(k)}` : `${MESES[+k.slice(5, 7) - 1]} ${k.slice(0, 4)}`;
                const valor = esIngresos ? g.ingresos : g.citas;
                return { etiqueta, valor, ingresos: g.ingresos, citas: g.citas, tip: `${cuando} — ${esIngresos ? Graficos.soles(g.ingresos) + ` (${g.atendidas} atendidas)` : g.citas + ' citas (sin canceladas)'}` };
            });
            return { puntos, modo };
        },

        // ════════════════════════════════════════════════════════════════
        // VISTA
        // ════════════════════════════════════════════════════════════════
        renderAdminReportesView() {
            return `<div id="bi-root">${this.renderTableroBI()}</div>`;
        },

        renderTableroBI() {
            const f = this.tableroFiltros();
            const rango = this.tableroRango(this.db.citas);
            const lista = this.tableroCitas(rango);
            const m = this.tableroMetricas(lista);

            // Período anterior de igual duración para comparar
            let prev = null;
            if (rango.comparable) {
                const largo = diasEntre(rango.desde, rango.hasta) + 1;
                const hasta = sumarDias(rango.desde, -1);
                prev = this.tableroMetricas(this.tableroCitas({ desde: sumarDias(hasta, -(largo - 1)), hasta }));
            }
            const serie = this.tableroSerie(lista, rango);
            const hayFiltrosCruzados = ['personal', 'categoria', 'estado', 'servicio'].some(k => f[k] !== 'todos');

            const categorias = [...new Set(this.db.servicios.map(s => s.categoria))];
            const chips = this.tableroChips();

            return `
            <div class="space-y-5 animate-fade-in">
                <!-- Encabezado y filtros -->
                <div class="bi-card p-5 sm:p-6">
                    <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div>
                            <span class="text-[11px] font-bold uppercase tracking-wider text-berry">RF22 · CU22 Gestionar Reportes</span>
                            <h2 class="text-2xl font-bold text-plum">Tablero de Reportes</h2>
                            <p class="text-xs text-plum/65 mt-0.5">${esc(rango.etiqueta)} · ${esc(larga(rango.desde))} al ${esc(larga(rango.hasta))} · ${m.total} citas analizadas</p>
                        </div>
                        <div class="flex flex-wrap gap-2 no-print">
                            <button onclick="app.generarNuevoReporte('Tablero de Citas e Ingresos')" class="px-4 py-2.5 rounded-xl luxury-gradient text-white text-xs font-bold shadow-sm hover:opacity-95 transition">
                                <i class="fa-solid fa-file-circle-plus mr-1.5"></i> Generar Reporte (CU22)
                            </button>
                            <button onclick="app.exportarTableroCSV()" class="px-4 py-2.5 rounded-xl border border-rosequartz bg-white text-plum text-xs font-bold hover:bg-rosebg transition">
                                <i class="fa-solid fa-file-csv mr-1.5"></i> Exportar CSV
                            </button>
                            <button onclick="window.print()" class="px-4 py-2.5 rounded-xl border border-rosequartz bg-white text-plum text-xs font-bold hover:bg-rosebg transition">
                                <i class="fa-solid fa-print mr-1.5"></i> Imprimir
                            </button>
                        </div>
                    </div>

                    <div class="flex flex-wrap items-end gap-3 mt-5 pt-4 border-t border-rosequartz/70 no-print">
                        <label class="text-[11px] font-bold text-plum/70">Período
                            <select class="bi-select block mt-1" onchange="app.tableroPeriodo(this.value)">
                                ${[['todo', 'Todo el historial'], ['30d', 'Últimos 30 días'], ['90d', 'Últimos 90 días'], ['mes', 'Este mes'], ['mesant', 'Mes anterior'], ['rango', 'Rango personalizado']]
                                    .map(([v, t]) => `<option value="${v}" ${f.periodo === v ? 'selected' : ''}>${t}</option>`).join('')}
                            </select>
                        </label>
                        ${f.periodo === 'rango' ? `
                            <label class="text-[11px] font-bold text-plum/70">Desde
                                <input type="date" class="bi-select block mt-1" value="${esc(f.desde)}" onchange="app.tableroFecha('desde', this.value)">
                            </label>
                            <label class="text-[11px] font-bold text-plum/70">Hasta
                                <input type="date" class="bi-select block mt-1" value="${esc(f.hasta)}" onchange="app.tableroFecha('hasta', this.value)">
                            </label>
                        ` : ''}
                        <label class="text-[11px] font-bold text-plum/70">Especialista
                            <select class="bi-select block mt-1" onchange="app.tableroFiltrar('personal', this.value, true)">
                                <option value="todos">Todas</option>
                                ${this.db.personal.map(p => `<option value="${p.idPersonal}" ${String(f.personal) === String(p.idPersonal) ? 'selected' : ''}>${esc(p.nombres)} ${esc(p.apellidos.split(' ')[0])}</option>`).join('')}
                            </select>
                        </label>
                        <label class="text-[11px] font-bold text-plum/70">Categoría
                            <select class="bi-select block mt-1" onchange="app.tableroFiltrar('categoria', this.value, true)">
                                <option value="todos">Todas</option>
                                ${categorias.map(c => `<option value="${esc(c)}" ${f.categoria === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}
                            </select>
                        </label>
                        ${hayFiltrosCruzados ? `
                            <button onclick="app.tableroLimpiar()" class="text-[11px] font-bold text-berry hover:underline pb-2"><i class="fa-solid fa-filter-circle-xmark mr-1"></i>Limpiar filtros</button>
                        ` : '<span class="text-[11px] text-plum/50 pb-2"><i class="fa-regular fa-hand-pointer mr-1"></i>Haz clic en un gráfico para filtrar el resto del tablero.</span>'}
                    </div>
                    ${chips ? `<div class="flex flex-wrap gap-2 mt-3 no-print">${chips}</div>` : ''}
                </div>

                <!-- Indicadores clave -->
                <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                    ${this.tableroKpi('Ingresos realizados', Graficos.soles(m.ingresos), this.tableroDelta(m.ingresos, prev && prev.ingresos), `${m.atendidas} citas atendidas`, Graficos.sparkline(serie.puntos.map(p => p.ingresos), '#2F9E6E'))}
                    ${this.tableroKpi('Ingresos por cobrar', Graficos.soles(m.proyectado), '', `${m.porAtender} citas agendadas`, '')}
                    ${this.tableroKpi('Citas', String(m.total), this.tableroDelta(m.total, prev && prev.total), `${m.canceladas} canceladas`, Graficos.sparkline(serie.puntos.map(p => p.citas), '#9E3356'))}
                    ${this.tableroKpi('Ticket promedio', Graficos.soles(m.ticket, 2), this.tableroDelta(m.ticket, prev && prev.ticket), 'por cita atendida', '')}
                    ${this.tableroKpi('Cancelación', m.tasaCancelacion.toFixed(1) + '%', this.tableroDelta(m.tasaCancelacion, prev && prev.tasaCancelacion, true, true), `${m.canceladas} de ${m.total} citas`, '')}
                    ${this.tableroKpi('Clientas atendidas', String(m.clientas), this.tableroDelta(m.clientas, prev && prev.clientas), `de ${this.db.clientes.length} registradas`, '')}
                </div>

                <!-- Evolución + estados -->
                <div class="grid grid-cols-1 xl:grid-cols-3 gap-5">
                    <div class="bi-card p-5 xl:col-span-2">
                        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <div>
                                <h3 class="text-base font-bold text-plum">${f.metrica === 'ingresos' ? 'Evolución de ingresos' : 'Evolución de citas'}</h3>
                                <p class="text-[11px] text-plum/60">${{ dia: 'Por día', semana: 'Por semana', mes: 'Por mes' }[serie.modo]} · ${f.metrica === 'ingresos' ? 'solo citas atendidas' : 'sin contar canceladas'}</p>
                            </div>
                            <div class="inline-flex rounded-xl bg-rosebg p-0.5 text-[11px] font-bold no-print" role="group" aria-label="Métrica">
                                ${[['ingresos', 'Ingresos'], ['citas', 'Citas']].map(([v, t]) => `
                                    <button onclick="app.tableroMetrica('${v}')" aria-pressed="${f.metrica === v}" class="px-3 py-1.5 rounded-[10px] transition ${f.metrica === v ? 'bg-white text-berry shadow-sm' : 'text-plum/60 hover:text-plum'}">${t}</button>`).join('')}
                            </div>
                        </div>
                        ${Graficos.area(serie.puntos, { color: f.metrica === 'ingresos' ? '#2F9E6E' : '#9E3356', formato: f.metrica === 'ingresos' ? (v) => Graficos.soles(v) : (v) => v, id: 'bi-area' })}
                    </div>

                    <div class="bi-card p-5">
                        <h3 class="text-base font-bold text-plum">Citas por estado</h3>
                        <p class="text-[11px] text-plum/60 mb-3">Selecciona un estado para filtrar</p>
                        ${this.tableroDonaEstados(rango)}
                    </div>
                </div>

                <!-- Servicios, categorías, especialistas -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div class="bi-card p-5">
                        <h3 class="text-base font-bold text-plum">Ingresos por servicio</h3>
                        <p class="text-[11px] text-plum/60 mb-3">Citas atendidas · clic para filtrar</p>
                        ${this.tableroBarrasServicios(rango)}
                    </div>
                    <div class="bi-card p-5">
                        <h3 class="text-base font-bold text-plum">Ingresos por categoría</h3>
                        <p class="text-[11px] text-plum/60 mb-3">Participación en el total</p>
                        ${this.tableroDonaCategorias(rango)}
                    </div>
                    <div class="bi-card p-5">
                        <h3 class="text-base font-bold text-plum">Rendimiento por especialista</h3>
                        <p class="text-[11px] text-plum/60 mb-3">Ingresos de citas atendidas</p>
                        ${this.tableroBarrasPersonal(rango)}
                    </div>
                </div>

                <!-- Ocupación + mejores clientas -->
                <div class="grid grid-cols-1 xl:grid-cols-3 gap-5">
                    <div class="bi-card p-5 xl:col-span-2">
                        <h3 class="text-base font-bold text-plum">Demanda por día y hora</h3>
                        <p class="text-[11px] text-plum/60 mb-3">Citas agendadas (sin canceladas): identifica los horarios más y menos ocupados</p>
                        ${this.tableroCalor(lista)}
                    </div>
                    <div class="bi-card p-5">
                        <h3 class="text-base font-bold text-plum">Clientas con mayor consumo</h3>
                        <p class="text-[11px] text-plum/60 mb-3">Según citas atendidas</p>
                        ${this.tableroTopClientas(lista)}
                    </div>
                </div>

                <!-- Detalle -->
                <div class="bi-card p-5">
                    <div class="flex items-center justify-between mb-3">
                        <div>
                            <h3 class="text-base font-bold text-plum">Detalle de citas</h3>
                            <p class="text-[11px] text-plum/60">Las 10 más recientes del período filtrado · el CSV incluye todas</p>
                        </div>
                    </div>
                    ${this.tableroDetalle(lista)}
                </div>

                <!-- Historial de reportes emitidos (entidad Reporte) -->
                <div class="bi-card p-5">
                    <h3 class="text-base font-bold text-plum mb-3">Reportes emitidos</h3>
                    ${this.db.reportes.length === 0 ? Graficos.vacio('Aún no se generó ningún reporte. Usa «Generar Reporte» para guardar una fotografía del tablero.') : `
                    <div class="space-y-2">
                        ${this.db.reportes.map(r => `
                            <div class="p-3.5 rounded-2xl bg-rosebg/60 border border-rosequartz flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                                <div class="min-w-0">
                                    <span class="text-[10px] font-bold text-berry">REPORTE #${r.idReporte} · ${esc(r.fechaGeneracion)}</span>
                                    <p class="font-bold text-plum text-sm">${esc(r.tipo)}</p>
                                    <p class="text-plum/75">${esc(r.resumen)}</p>
                                </div>
                                <span class="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] shrink-0 self-start sm:self-center">Almacenado</span>
                            </div>
                        `).join('')}
                    </div>`}
                </div>
            </div>`;
        },

        // ── Piezas del tablero ───────────────────────────────────────────
        tableroKpi(titulo, valor, delta, nota, spark) {
            return `
            <div class="bi-card bi-kpi p-4 flex flex-col justify-between min-h-[128px]">
                <div>
                    <p class="text-[11px] font-bold text-plum/60">${esc(titulo)}</p>
                    <p class="font-luxury text-[1.65rem] leading-tight font-bold text-plum mt-1 tabular-nums">${esc(valor)}</p>
                    <div class="flex items-center gap-1.5 mt-1 flex-wrap">${delta}<span class="text-[10px] text-plum/55">${esc(nota)}</span></div>
                </div>
                ${spark ? `<div class="mt-2">${spark}</div>` : ''}
            </div>`;
        },

        /** Variación respecto al período anterior. `inverso`: si bajar es bueno. `puntos`: diferencia en puntos porcentuales. */
        tableroDelta(actual, anterior, inverso = false, puntos = false) {
            if (anterior === null || anterior === undefined) return '';
            if (anterior === 0 && actual === 0) return '';
            let texto; let valor;
            if (puntos) { valor = actual - anterior; texto = `${valor > 0 ? '+' : ''}${valor.toFixed(1)} pp`; }
            else if (anterior === 0) return '<span class="px-1.5 py-0.5 rounded-md bg-rosebg text-plum/60 text-[10px] font-bold">nuevo</span>';
            else { valor = ((actual - anterior) / anterior) * 100; texto = `${valor > 0 ? '+' : ''}${valor.toFixed(0)}%`; }
            if (Math.abs(valor) < 0.05) return '<span class="px-1.5 py-0.5 rounded-md bg-rosebg text-plum/60 text-[10px] font-bold">= igual</span>';
            const bueno = inverso ? valor < 0 : valor > 0;
            return `<span class="px-1.5 py-0.5 rounded-md text-[10px] font-bold ${bueno ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}" title="Comparado con el período anterior de igual duración">${valor > 0 ? '▲' : '▼'} ${texto}</span>`;
        },

        tableroChips() {
            const f = this.tableroFiltros();
            const nombres = {
                personal: () => { const p = this.db.personal.find(x => String(x.idPersonal) === String(f.personal)); return p ? `Especialista: ${p.nombres}` : ''; },
                categoria: () => `Categoría: ${f.categoria}`,
                estado: () => `Estado: ${f.estado}`,
                servicio: () => { const s = this.db.servicios.find(x => String(x.idServicio) === String(f.servicio)); return s ? `Servicio: ${s.nombre}` : ''; }
            };
            return ['personal', 'categoria', 'estado', 'servicio'].filter(k => f[k] !== 'todos').map(k => `
                <button onclick="app.tableroFiltrar('${k}', 'todos', true)" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-berry text-white text-[11px] font-bold hover:bg-berrydark transition" title="Quitar este filtro">
                    ${esc(nombres[k]())} <i class="fa-solid fa-xmark text-[10px]"></i>
                </button>`).join('');
        },

        tableroDonaEstados(rango) {
            const f = this.tableroFiltros();
            const lista = this.tableroCitas(rango, ['estado']);
            const segmentos = ESTADOS.map(e => ({ id: e, etiqueta: e, valor: lista.filter(c => c.estado === e).length, color: Graficos.coloresEstado[e] }));
            return Graficos.dona(segmentos, { dimension: 'estado', seleccionado: f.estado, centroValor: String(lista.length), centroTexto: 'citas' });
        },

        tableroBarrasServicios(rango) {
            const f = this.tableroFiltros();
            const lista = this.tableroCitas(rango, ['servicio']);
            const items = this.db.servicios.map((s, i) => {
                const mias = lista.filter(c => c.idServicio === s.idServicio);
                const atendidas = mias.filter(c => c.estado === 'Atendida');
                const ingresos = atendidas.length * s.precio;
                return {
                    id: s.idServicio, etiqueta: s.nombre, valor: ingresos, valorTexto: Graficos.soles(ingresos),
                    detalle: `${atendidas.length} atendidas · ${mias.filter(c => c.estado === 'Cancelada').length} canceladas`,
                    tip: `${s.nombre} — ${Graficos.soles(ingresos)} (${atendidas.length} atendidas a ${Graficos.soles(s.precio, 2)})`
                };
            }).sort((a, b) => b.valor - a.valor);
            return Graficos.barras(items, { dimension: 'servicio', seleccionado: f.servicio, color: '#9E3356' });
        },

        tableroDonaCategorias(rango) {
            const f = this.tableroFiltros();
            const lista = this.tableroCitas(rango, ['categoria']).filter(c => c.estado === 'Atendida');
            const categorias = [...new Set(this.db.servicios.map(s => s.categoria))];
            const segmentos = categorias.map((cat, i) => {
                const valor = lista.filter(c => c.servicio.categoria === cat).reduce((a, c) => a + c.servicio.precio, 0);
                return { id: cat, etiqueta: cat, valor, valorTexto: Graficos.soles(valor), color: Graficos.paleta[i % Graficos.paleta.length] };
            }).sort((a, b) => b.valor - a.valor);
            const total = segmentos.reduce((a, s) => a + s.valor, 0);
            return Graficos.dona(segmentos, { dimension: 'categoria', seleccionado: f.categoria, centroValor: Graficos.soles(total), centroTexto: 'ingresos' });
        },

        tableroBarrasPersonal(rango) {
            const f = this.tableroFiltros();
            const lista = this.tableroCitas(rango, ['personal']);
            const items = this.db.personal.map((p, i) => {
                const mias = lista.filter(c => c.idPersonal === p.idPersonal);
                const atendidas = mias.filter(c => c.estado === 'Atendida');
                const ingresos = atendidas.reduce((a, c) => a + c.servicio.precio, 0);
                const tasa = mias.length ? (mias.filter(c => c.estado === 'Cancelada').length / mias.length) * 100 : 0;
                return {
                    id: p.idPersonal, etiqueta: `${p.nombres} ${p.apellidos.split(' ')[0]}`, valor: ingresos, valorTexto: Graficos.soles(ingresos),
                    detalle: `${atendidas.length} atendidas · ${tasa.toFixed(0)}% cancelación · ${p.cargo}`,
                    color: Graficos.paleta[i % Graficos.paleta.length],
                    tip: `${p.nombres} ${p.apellidos} — ${Graficos.soles(ingresos)} en ${atendidas.length} citas atendidas`
                };
            }).sort((a, b) => b.valor - a.valor);
            return Graficos.barras(items, { dimension: 'personal', seleccionado: f.personal });
        },

        tableroCalor(lista) {
            const horas = [...new Set(this.db.horarios.map(h => h.horaInicio))].sort();
            const matriz = DIAS.map(() => horas.map(() => 0));
            lista.filter(c => c.estado !== 'Cancelada').forEach(c => {
                const i = DIAS.indexOf(nombreDia(c.fecha));
                const j = horas.indexOf(c.hora);
                if (i >= 0 && j >= 0) matriz[i][j]++;
            });
            return Graficos.mapaCalor(DIAS, horas, matriz);
        },

        tableroTopClientas(lista) {
            const grupos = new Map();
            lista.filter(c => c.estado === 'Atendida').forEach(c => {
                const g = grupos.get(c.idCliente) || { cliente: c.cliente, gasto: 0, citas: 0, ultima: '' };
                g.gasto += c.servicio.precio; g.citas++; if (c.fecha > g.ultima) g.ultima = c.fecha;
                grupos.set(c.idCliente, g);
            });
            const top = [...grupos.values()].sort((a, b) => b.gasto - a.gasto).slice(0, 5);
            if (!top.length) return Graficos.vacio('Sin citas atendidas en el período.');
            const max = top[0].gasto || 1;
            return `<ol class="space-y-3">${top.map((g, i) => `
                <li class="flex items-center gap-3" data-tip="${esc(`${g.cliente.nombres} ${g.cliente.apellidos} — ${g.citas} citas atendidas, última visita ${larga(g.ultima)}`)}">
                    <span class="w-7 h-7 rounded-full bg-rosebg text-berry font-bold text-xs flex items-center justify-center shrink-0">${i + 1}</span>
                    <div class="min-w-0 flex-1">
                        <div class="flex items-baseline justify-between gap-2 text-[11px]">
                            <span class="font-bold text-plum truncate">${esc(g.cliente.nombres)} ${esc(g.cliente.apellidos.split(' ')[0])}</span>
                            <span class="font-bold text-plum tabular-nums shrink-0">${Graficos.soles(g.gasto)}</span>
                        </div>
                        <div class="h-1.5 rounded-full bg-rosequartz/50 mt-1 overflow-hidden"><div class="h-full rounded-full bg-gold" style="width:${(g.gasto / max) * 100}%"></div></div>
                        <p class="text-[10px] text-plum/55 mt-0.5">${g.citas} citas · última: ${esc(corta(g.ultima))}</p>
                    </div>
                </li>`).join('')}</ol>`;
        },

        tableroDetalle(lista) {
            const filas = [...lista].sort((a, b) => (b.fecha + b.hora).localeCompare(a.fecha + a.hora)).slice(0, 10);
            if (!filas.length) return Graficos.vacio('No hay citas que coincidan con los filtros.');
            return `<div class="overflow-x-auto"><table class="w-full text-xs text-left">
                <thead><tr class="text-[11px] text-plum/60 border-b border-rosequartz">
                    <th class="py-2 pr-3 font-bold">Fecha</th><th class="py-2 pr-3 font-bold">Clienta</th><th class="py-2 pr-3 font-bold">Servicio</th>
                    <th class="py-2 pr-3 font-bold">Especialista</th><th class="py-2 pr-3 font-bold text-right">Monto</th><th class="py-2 font-bold">Estado</th>
                </tr></thead>
                <tbody>${filas.map(c => `
                    <tr class="border-b border-rosequartz/50 last:border-0">
                        <td class="py-2 pr-3 whitespace-nowrap tabular-nums">${esc(c.fecha)} · ${esc(c.hora)}</td>
                        <td class="py-2 pr-3">${esc(c.cliente.nombres)} ${esc(c.cliente.apellidos.split(' ')[0])}</td>
                        <td class="py-2 pr-3 max-w-[260px] truncate" title="${esc(c.servicio.nombre)}">${esc(c.servicio.nombre)}</td>
                        <td class="py-2 pr-3 whitespace-nowrap">${esc(c.personal.nombres)}</td>
                        <td class="py-2 pr-3 text-right font-bold tabular-nums">${Graficos.soles(c.servicio.precio, 2)}</td>
                        <td class="py-2">${this.renderEstadoBadge(c.estado)}</td>
                    </tr>`).join('')}
                </tbody></table></div>`;
        },

        // ════════════════════════════════════════════════════════════════
        // INTERACCIÓN
        // ════════════════════════════════════════════════════════════════
        actualizarTablero() {
            const raiz = document.getElementById('bi-root');
            if (raiz) raiz.innerHTML = this.renderTableroBI();
        },

        /** Filtro cruzado: un segundo clic en el mismo elemento lo quita (a menos que `fijar` sea true). */
        tableroFiltrar(dimension, valor, fijar = false) {
            const f = this.tableroFiltros();
            f[dimension] = (!fijar && String(f[dimension]) === String(valor)) ? 'todos' : valor;
            this.actualizarTablero();
        },
        tableroPeriodo(valor) {
            const f = this.tableroFiltros();
            f.periodo = valor;
            if (valor === 'rango' && !(f.desde && f.hasta)) {
                const r = this.tableroRango(this.db.citas.map(c => c));
                const hoy = hoyISO();
                f.hasta = hoy; f.desde = sumarDias(hoy, -29);
            }
            this.actualizarTablero();
        },
        tableroFecha(campo, valor) {
            this.tableroFiltros()[campo] = valor;
            const f = this.tableroFiltros();
            if (f.desde && f.hasta && f.desde > f.hasta) this.showToast('La fecha inicial no puede ser posterior a la final.', 'error', 'Rango no válido');
            this.actualizarTablero();
        },
        tableroMetrica(valor) { this.tableroFiltros().metrica = valor; this.actualizarTablero(); },
        tableroLimpiar() {
            const f = this.tableroFiltros();
            f.personal = f.categoria = f.estado = f.servicio = 'todos';
            this.actualizarTablero();
        },

        // CU22: guarda en el historial una fotografía del tablero tal como se está viendo
        generarNuevoReporte(tipo) {
            const f = this.tableroFiltros();
            const rango = this.tableroRango(this.db.citas);
            const m = this.tableroMetricas(this.tableroCitas(rango));
            const nuevoId = Math.max(0, ...this.db.reportes.map(r => r.idReporte)) + 1;
            const ahora = new Date();
            const marca = `${hoyISO()} ${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
            const aplicados = [];
            const p = this.db.personal.find(x => String(x.idPersonal) === String(f.personal));
            const s = this.db.servicios.find(x => String(x.idServicio) === String(f.servicio));
            if (p) aplicados.push(`Especialista: ${p.nombres}`);
            if (f.categoria !== 'todos') aplicados.push(`Categoría: ${f.categoria}`);
            if (f.estado !== 'todos') aplicados.push(`Estado: ${f.estado}`);
            if (s) aplicados.push(`Servicio: ${s.nombre}`);
            const resumen = `${rango.etiqueta} (${rango.desde} a ${rango.hasta})${aplicados.length ? ' | ' + aplicados.join(', ') : ''} | Citas: ${m.total} | Atendidas: ${m.atendidas} | Ingresos realizados: S/ ${m.ingresos.toFixed(2)} | Ticket promedio: S/ ${m.ticket.toFixed(2)} | Cancelación: ${m.tasaCancelacion.toFixed(1)}%`;
            this.db.reportes.unshift(new Reporte(nuevoId, tipo, marca, resumen));
            DatabaseService.save(this.db);
            this.showToast(`Reporte #${nuevoId} generado y registrado correctamente.`, 'success', 'CU22: Generar Reporte');
            this.actualizarTablero();
        },

        exportarTableroCSV() {
            const rango = this.tableroRango(this.db.citas);
            const lista = this.tableroCitas(rango).sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
            if (!lista.length) { this.showToast('No hay citas para exportar con los filtros actuales.', 'error', 'Exportar CSV'); return; }
            // Se neutralizan celdas que empiecen con = + - @ (inyección de fórmulas en Excel)
            const celda = (v) => { let t = String(v ?? ''); if (/^[=+\-@]/.test(t)) t = "'" + t; return `"${t.replace(/"/g, '""')}"`; };
            const filas = [['ID', 'Fecha', 'Hora', 'Clienta', 'Servicio', 'Categoría', 'Especialista', 'Precio (S/)', 'Estado', 'Observación']]
                .concat(lista.map(c => [c.idCita, c.fecha, c.hora, `${c.cliente.nombres} ${c.cliente.apellidos}`, c.servicio.nombre, c.servicio.categoria,
                    `${c.personal.nombres} ${c.personal.apellidos}`, c.servicio.precio.toFixed(2), c.estado, c.observacion]));
            const csv = '﻿' + filas.map(r => r.map(celda).join(';')).join('\r\n');
            const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
            const a = document.createElement('a');
            a.href = url; a.download = `reporte-citas-${hoyISO()}.csv`;
            document.body.appendChild(a); a.click(); a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            this.showToast(`Se exportaron ${lista.length} citas a CSV (abre con Excel).`, 'success', 'Exportar CSV');
        }
    });
})();
