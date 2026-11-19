/**
 * Componentes de visualización (gráficos SVG/HTML sin dependencias externas)
 * Cada función devuelve un fragmento de HTML listo para insertar. Los elementos con `data-tip`
 * muestran un cuadro informativo al pasar el cursor (ver iniciarTooltips).
 */
const Graficos = {
    // Paleta del salón para series categóricas
    paleta: ['#9E3356', '#D4AF37', '#4A1528', '#2F8F83', '#E8B4C2', '#7C5CBF', '#C9798F', '#8A6D1D'],
    coloresEstado: {
        'Atendida': '#2F9E6E',
        'Confirmada': '#9E3356',
        'Pendiente': '#D4AF37',
        'Cancelada': '#B7A9AE'
    },

    /** Escapa texto para insertarlo de forma segura en HTML o atributos. */
    esc(t) {
        return String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    },

    soles(n, decimales = 0) {
        return 'S/ ' + Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
    },

    /** Mini gráfico de tendencia para las tarjetas de indicadores. */
    sparkline(valores, color = '#9E3356') {
        if (!valores || valores.length < 2) return '';
        const w = 100, h = 28, max = Math.max(...valores, 1), min = Math.min(...valores, 0);
        const rango = max - min || 1;
        const pts = valores.map((v, i) => [(i / (valores.length - 1)) * w, h - 3 - ((v - min) / rango) * (h - 6)]);
        const linea = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
        return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" class="w-full h-7" aria-hidden="true">
            <path d="${linea} L${w},${h} L0,${h} Z" fill="${color}" fill-opacity="0.12"></path>
            <path d="${linea}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"></path>
        </svg>`;
    },

    /**
     * Gráfico de área/línea con ejes y puntos interactivos.
     * puntos: [{ etiqueta, valor, tip }]
     */
    area(puntos, { color = '#9E3356', formato = (v) => v, id = 'area' } = {}) {
        if (!puntos.length) return Graficos.vacio('Sin datos en el período seleccionado.');
        const W = 720, H = 260, m = { t: 14, r: 16, b: 34, l: 52 };
        const iw = W - m.l - m.r, ih = H - m.t - m.b;
        const maxReal = Math.max(...puntos.map(p => p.valor), 0);
        const paso = Graficos._pasoNice(maxReal, 4);
        const max = Math.max(paso * Math.ceil(maxReal / paso), paso);
        const x = (i) => m.l + (puntos.length === 1 ? iw / 2 : (i / (puntos.length - 1)) * iw);
        const y = (v) => m.t + ih - (v / max) * ih;

        let rejilla = '';
        for (let v = 0; v <= max + 0.001; v += paso) {
            rejilla += `<line x1="${m.l}" x2="${W - m.r}" y1="${y(v)}" y2="${y(v)}" stroke="#F4D3DC" stroke-width="1" ${v === 0 ? '' : 'stroke-dasharray="3 4"'}></line>
                <text x="${m.l - 8}" y="${y(v) + 3.5}" text-anchor="end" font-size="10" fill="#4A1528" fill-opacity="0.6">${Graficos.esc(formato(v))}</text>`;
        }
        const cada = Math.ceil(puntos.length / 9);
        const mostrar = (i) => i % cada === 0 || (i === puntos.length - 1 && (puntos.length - 1) % cada >= cada / 2);
        const etiquetas = puntos.map((p, i) => mostrar(i)
            ? `<text x="${x(i)}" y="${H - 12}" text-anchor="middle" font-size="10" fill="#4A1528" fill-opacity="0.65">${Graficos.esc(p.etiqueta)}</text>` : '').join('');

        const linea = puntos.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.valor).toFixed(1)}`).join(' ');
        const areaRelleno = `${linea} L${x(puntos.length - 1).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)} Z`;
        const radio = puntos.length > 40 ? 0 : 3.5;
        const zonas = puntos.map((p, i) => {
            const ancho = puntos.length === 1 ? iw : iw / (puntos.length - 1);
            return `<g class="bi-punto" data-tip="${Graficos.esc(p.tip)}">
                <rect x="${x(i) - ancho / 2}" y="${m.t}" width="${ancho}" height="${ih}" fill="transparent"></rect>
                <line x1="${x(i)}" x2="${x(i)}" y1="${m.t}" y2="${y(0)}" stroke="${color}" stroke-opacity="0.35" class="bi-guia"></line>
                <circle cx="${x(i)}" cy="${y(p.valor)}" r="${radio || 4}" fill="#fff" stroke="${color}" stroke-width="2" class="${radio ? '' : 'bi-guia'}"></circle>
            </g>`;
        }).join('');

        return `<svg viewBox="0 0 ${W} ${H}" class="w-full h-auto" role="img" aria-label="Gráfico de evolución">
            <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity="0.32"></stop><stop offset="1" stop-color="${color}" stop-opacity="0.02"></stop></linearGradient></defs>
            ${rejilla}
            <path d="${areaRelleno}" fill="url(#${id})"></path>
            <path d="${linea}" fill="none" stroke="${color}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"></path>
            ${etiquetas}${zonas}
        </svg>`;
    },

    /** Paso "redondo" para los ejes (1, 2, 5 × 10^n). */
    _pasoNice(max, divisiones) {
        if (max <= 0) return 1;
        const bruto = max / divisiones;
        const mag = Math.pow(10, Math.floor(Math.log10(bruto)));
        const n = bruto / mag;
        return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag;
    },

    /**
     * Barras horizontales con selección (filtro cruzado).
     * items: [{ id, etiqueta, valor, valorTexto, detalle, color }]
     */
    barras(items, { dimension, seleccionado = 'todos', color = '#9E3356' } = {}) {
        if (!items.length) return Graficos.vacio('Sin datos para mostrar.');
        const max = Math.max(...items.map(i => i.valor), 1);
        return `<ul class="space-y-1.5">${items.map(i => {
            const activo = String(seleccionado) === String(i.id);
            const atenuado = seleccionado !== 'todos' && !activo;
            return `<li>
                <button type="button" onclick="app.tableroFiltrar('${dimension}', '${Graficos.esc(i.id)}')"
                    class="bi-fila w-full text-left rounded-xl px-2.5 py-1.5 transition ${activo ? 'bg-rosebg ring-1 ring-berry/40' : 'hover:bg-rosebg/70'} ${atenuado ? 'opacity-45' : ''}"
                    data-tip="${Graficos.esc(i.tip || `${i.etiqueta}: ${i.valorTexto}`)}" aria-pressed="${activo}">
                    <span class="flex items-baseline justify-between gap-3 text-[11px]">
                        <span class="font-bold text-plum truncate">${Graficos.esc(i.etiqueta)}</span>
                        <span class="font-bold text-plum tabular-nums shrink-0">${Graficos.esc(i.valorTexto)}</span>
                    </span>
                    <span class="block h-2 rounded-full bg-rosequartz/50 mt-1 overflow-hidden">
                        <span class="block h-full rounded-full" style="width:${Math.max(i.valor > 0 ? 3 : 0, (i.valor / max) * 100)}%;background:${i.color || color}"></span>
                    </span>
                    ${i.detalle ? `<span class="block text-[10px] text-plum/55 mt-0.5">${Graficos.esc(i.detalle)}</span>` : ''}
                </button>
            </li>`;
        }).join('')}</ul>`;
    },

    /**
     * Gráfico de dona con leyenda seleccionable.
     * segmentos: [{ id, etiqueta, valor, color, valorTexto }]
     */
    dona(segmentos, { dimension, seleccionado = 'todos', centroValor = '', centroTexto = '' } = {}) {
        const total = segmentos.reduce((a, s) => a + s.valor, 0);
        if (!total) return Graficos.vacio('Sin datos para mostrar.');
        const R = 52, C = 2 * Math.PI * R, grosor = 20;
        let acumulado = 0;
        const arcos = segmentos.filter(s => s.valor > 0).map(s => {
            const largo = (s.valor / total) * C;
            const activo = String(seleccionado) === String(s.id);
            const atenuado = seleccionado !== 'todos' && !activo;
            const arco = `<circle cx="70" cy="70" r="${R}" fill="none" stroke="${s.color}" stroke-width="${activo ? grosor + 5 : grosor}"
                stroke-dasharray="${Math.max(largo - 1.5, 0.5).toFixed(2)} ${(C - Math.max(largo - 1.5, 0.5)).toFixed(2)}" stroke-dashoffset="${(-acumulado).toFixed(2)}"
                transform="rotate(-90 70 70)" class="bi-arco cursor-pointer" opacity="${atenuado ? 0.3 : 1}"
                data-tip="${Graficos.esc(`${s.etiqueta}: ${s.valorTexto || s.valor} (${Math.round((s.valor / total) * 100)}%)`)}"
                onclick="app.tableroFiltrar('${dimension}', '${Graficos.esc(s.id)}')"></circle>`;
            acumulado += largo;
            return arco;
        }).join('');
        const leyenda = segmentos.map(s => {
            const activo = String(seleccionado) === String(s.id);
            const atenuado = seleccionado !== 'todos' && !activo;
            return `<li><button type="button" onclick="app.tableroFiltrar('${dimension}', '${Graficos.esc(s.id)}')" aria-pressed="${activo}"
                class="w-full flex items-center justify-between gap-2 px-2 py-1 rounded-lg text-[11px] transition ${activo ? 'bg-rosebg ring-1 ring-berry/40' : 'hover:bg-rosebg/70'} ${atenuado ? 'opacity-45' : ''}">
                <span class="flex items-center gap-2 min-w-0"><span class="w-2.5 h-2.5 rounded-sm shrink-0" style="background:${s.color}"></span><span class="font-semibold text-plum truncate">${Graficos.esc(s.etiqueta)}</span></span>
                <span class="text-plum/70 tabular-nums shrink-0">${Graficos.esc(s.valorTexto || s.valor)} · ${Math.round((s.valor / total) * 100)}%</span>
            </button></li>`;
        }).join('');
        return `<div class="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-4">
            <div class="relative w-40 h-40 shrink-0">
                <svg viewBox="0 0 140 140" class="w-full h-full" role="img" aria-label="Gráfico de distribución">
                    <circle cx="70" cy="70" r="${R}" fill="none" stroke="#F4D3DC" stroke-opacity="0.5" stroke-width="${grosor}"></circle>
                    ${arcos}
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span class="font-luxury text-2xl font-bold text-plum leading-none">${Graficos.esc(centroValor)}</span>
                    <span class="text-[10px] text-plum/60 mt-1">${Graficos.esc(centroTexto)}</span>
                </div>
            </div>
            <ul class="w-full space-y-0.5">${leyenda}</ul>
        </div>`;
    },

    /**
     * Mapa de calor (día de la semana × hora).
     * filas: ['Lunes', ...], columnas: ['09:00', ...], matriz[fila][columna] = número
     */
    mapaCalor(filas, columnas, matriz, { unidad = 'citas' } = {}) {
        const max = Math.max(1, ...matriz.flat());
        const cabecera = columnas.map(c => `<div class="text-[10px] text-plum/60 text-center pb-1">${Graficos.esc(c.slice(0, 2))}h</div>`).join('');
        const celdas = filas.map((fila, i) => `
            <div class="text-[11px] font-semibold text-plum/80 pr-2 flex items-center">${Graficos.esc(fila.slice(0, 3))}</div>
            ${columnas.map((col, j) => {
                const v = matriz[i][j];
                const intensidad = v / max;
                const fondo = v === 0 ? 'rgba(244,211,220,0.28)' : `rgba(158,51,86,${(0.14 + intensidad * 0.86).toFixed(2)})`;
                const texto = intensidad > 0.5 ? '#fff' : '#4A1528';
                return `<div class="bi-celda rounded-md h-8 flex items-center justify-center text-[11px] font-bold tabular-nums" style="background:${fondo};color:${texto}"
                    data-tip="${Graficos.esc(`${fila} ${col} — ${v} ${unidad}`)}">${v || ''}</div>`;
            }).join('')}`).join('');
        return `<div class="overflow-x-auto"><div class="grid gap-1 min-w-[460px]" style="grid-template-columns: 34px repeat(${columnas.length}, minmax(0, 1fr))">
            <div></div>${cabecera}${celdas}
        </div></div>
        <div class="flex items-center justify-end gap-2 mt-3 text-[10px] text-plum/60">Menos
            <span class="flex gap-0.5">${[0.14, 0.38, 0.62, 0.86, 1].map(a => `<span class="w-4 h-2.5 rounded-sm" style="background:rgba(158,51,86,${a})"></span>`).join('')}</span>Más
        </div>`;
    },

    vacio(texto) {
        return `<div class="py-10 text-center text-xs text-plum/55"><i class="fa-regular fa-chart-bar text-2xl text-roseblush block mb-2"></i>${Graficos.esc(texto)}</div>`;
    },

    /** Cuadro flotante informativo para cualquier elemento con data-tip. */
    iniciarTooltips() {
        if (Graficos._tooltipListo) return;
        Graficos._tooltipListo = true;
        const caja = document.createElement('div');
        caja.id = 'bi-tooltip';
        caja.setAttribute('role', 'tooltip');
        document.body.appendChild(caja);
        const ocultar = () => { caja.style.opacity = '0'; };
        document.addEventListener('mouseover', (e) => {
            const el = e.target.closest && e.target.closest('[data-tip]');
            if (!el) return ocultar();
            caja.textContent = el.getAttribute('data-tip');
            caja.style.opacity = '1';
        });
        document.addEventListener('mousemove', (e) => {
            if (caja.style.opacity !== '1') return;
            const x = Math.min(e.clientX + 14, window.innerWidth - caja.offsetWidth - 10);
            const y = e.clientY + 16 + caja.offsetHeight > window.innerHeight ? e.clientY - caja.offsetHeight - 12 : e.clientY + 16;
            caja.style.transform = `translate(${Math.max(8, x)}px, ${Math.max(8, y)}px)`;
        });
        document.addEventListener('mouseleave', ocultar);
        document.addEventListener('scroll', ocultar, true);
        document.addEventListener('click', ocultar);
    }
};

document.addEventListener('DOMContentLoaded', () => Graficos.iniciarTooltips());
