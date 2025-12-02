/**
 * ============================================================================
 * INFORME DE CÁLCULO DE JORNADA LABORAL - VERSIÓN 3.0
 * Sistema de Recuperación de Horas No Laboradas
 * ============================================================================
 * 
 * CARACTERÍSTICAS:
 * - Considera feriados nacionales de Perú 2025 (se descuentan HORAS en método diario)
 * - Permite elegir entre método de cálculo por DÍA o por SEMANA
 * - Input dinámico según método seleccionado
 * - Horas extra a favor del trabajador
 * - Calendario visual del mes
 * - Fecha de inicio de devolución parametrizable
 * 
 * IMPORTANTE: En el método por día, los feriados se descuentan porque
 * el trabajador NO debe recuperar días que por ley no estaba obligado a laborar.
 */

// ============================================================================
// CONSTANTES Y CONFIGURACIÓN
// ============================================================================

const DIAS_SEMANA = {
    0: 'Domingo',
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado'
};

const DIAS_SEMANA_CORTO = {
    0: 'Dom',
    1: 'Lun',
    2: 'Mar',
    3: 'Mié',
    4: 'Jue',
    5: 'Vie',
    6: 'Sáb'
};

const MESES = {
    0: 'Enero',
    1: 'Febrero',
    2: 'Marzo',
    3: 'Abril',
    4: 'Mayo',
    5: 'Junio',
    6: 'Julio',
    7: 'Agosto',
    8: 'Septiembre',
    9: 'Octubre',
    10: 'Noviembre',
    11: 'Diciembre'
};

const ANO = 2025;

/**
 * FERIADOS NACIONALES DE PERÚ 2025
 * Fuente: Legislación laboral peruana
 * Estos son días de descanso obligatorio y remunerado.
 * 
 * IMPORTANTE: En el método por día, estos feriados se DESCUENTAN
 * del cálculo de horas adeudadas porque el trabajador NO estaba
 * obligado a laborar estos días.
 */
const FERIADOS_PERU_2025 = [
    { fecha: '2025-01-01', nombre: 'Año Nuevo', tipo: 'nacional' },
    { fecha: '2025-04-17', nombre: 'Jueves Santo', tipo: 'nacional' },
    { fecha: '2025-04-18', nombre: 'Viernes Santo', tipo: 'nacional' },
    { fecha: '2025-05-01', nombre: 'Día del Trabajo', tipo: 'nacional' },
    { fecha: '2025-06-29', nombre: 'San Pedro y San Pablo', tipo: 'nacional' },
    { fecha: '2025-07-23', nombre: 'Día de la Fuerza Aérea del Perú', tipo: 'nacional' },
    { fecha: '2025-07-28', nombre: 'Fiestas Patrias (Día 1)', tipo: 'nacional' },
    { fecha: '2025-07-29', nombre: 'Fiestas Patrias (Día 2)', tipo: 'nacional' },
    { fecha: '2025-08-06', nombre: 'Batalla de Junín', tipo: 'nacional' },
    { fecha: '2025-08-30', nombre: 'Santa Rosa de Lima', tipo: 'nacional' },
    { fecha: '2025-10-08', nombre: 'Combate de Angamos', tipo: 'nacional' },
    { fecha: '2025-11-01', nombre: 'Día de Todos los Santos', tipo: 'nacional' },
    { fecha: '2025-12-08', nombre: 'Inmaculada Concepción', tipo: 'nacional' },
    { fecha: '2025-12-09', nombre: 'Batalla de Ayacucho', tipo: 'nacional' },
    { fecha: '2025-12-25', nombre: 'Navidad', tipo: 'nacional' }
];

// Crear Set para búsqueda rápida de feriados
const FERIADOS_SET = new Set(FERIADOS_PERU_2025.map(f => f.fecha));

// ============================================================================
// FUNCIONES DE UTILIDAD
// ============================================================================

function minutosAFormatoHHMM(totalMinutos) {
    const signo = totalMinutos < 0 ? '-' : '';
    const minutosAbs = Math.abs(totalMinutos);
    const horas = Math.floor(minutosAbs / 60);
    const minutos = Math.round(minutosAbs % 60);
    return `${signo}${horas}:${minutos.toString().padStart(2, '0')}`;
}

function minutosAHorasDecimales(totalMinutos) {
    return totalMinutos / 60;
}

function formatearDecimal(numero, decimales = 2) {
    return numero.toFixed(decimales);
}

function formatearFecha(fecha) {
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const ano = fecha.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

function formatearFechaISO(fecha) {
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const ano = fecha.getFullYear();
    return `${ano}-${mes}-${dia}`;
}

function formatearFechaCompleta(fecha) {
    const diaSemana = DIAS_SEMANA[fecha.getDay()];
    const dia = fecha.getDate();
    const mes = MESES[fecha.getMonth()];
    const ano = fecha.getFullYear();
    return `${diaSemana}, ${dia} de ${mes} de ${ano}`;
}

function esFinDeSemana(fecha) {
    const diaSemana = fecha.getDay();
    return diaSemana === 0 || diaSemana === 6;
}

function esFeriado(fecha) {
    return FERIADOS_SET.has(formatearFechaISO(fecha));
}

function obtenerInfoFeriado(fecha) {
    const fechaISO = formatearFechaISO(fecha);
    return FERIADOS_PERU_2025.find(f => f.fecha === fechaISO);
}

function esDiaLaboral(fecha) {
    return !esFinDeSemana(fecha) && !esFeriado(fecha);
}

/**
 * Calcula semanas calendario del mes
 */
function calcularSemanasDelMes(mes, ano) {
    const ultimoDia = new Date(ano, mes, 0);
    return Math.ceil(ultimoDia.getDate() / 7);
}

// ============================================================================
// FUNCIONES DE CÁLCULO
// ============================================================================

function obtenerDiasMes(mes, ano) {
    const dias = [];
    const mesIndex = mes - 1;
    const ultimoDia = new Date(ano, mesIndex + 1, 0);
    
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
        const fecha = new Date(ano, mesIndex, dia);
        const fechaISO = formatearFechaISO(fecha);
        const infoFeriado = obtenerInfoFeriado(fecha);
        
        dias.push({
            fecha: fecha,
            fechaFormateada: formatearFecha(fecha),
            fechaISO: fechaISO,
            diaSemana: DIAS_SEMANA[fecha.getDay()],
            diaSemanaCorto: DIAS_SEMANA_CORTO[fecha.getDay()],
            numeroDia: dia,
            esFinDeSemana: esFinDeSemana(fecha),
            esFeriado: !!infoFeriado,
            nombreFeriado: infoFeriado ? infoFeriado.nombre : null,
            esLaboral: esDiaLaboral(fecha),
            // Un feriado que cae en día de semana (L-V) es un feriado laboral que se descuenta
            esFeriadoLaboral: !!infoFeriado && !esFinDeSemana(fecha)
        });
    }
    
    return dias;
}

function obtenerDiasLaboralesMes(mes, ano) {
    return obtenerDiasMes(mes, ano).filter(d => d.esLaboral);
}

function obtenerFeriadosMes(mes, ano) {
    const mesStr = mes.toString().padStart(2, '0');
    return FERIADOS_PERU_2025.filter(f => {
        const [fAno, fMes] = f.fecha.split('-');
        return fAno === ano.toString() && fMes === mesStr;
    });
}

/**
 * Obtener feriados que caen en días laborales (L-V) del mes
 * Estos son los que realmente se descuentan
 */
function obtenerFeriadosLaboralesMes(mes, ano) {
    const diasMes = obtenerDiasMes(mes, ano);
    return diasMes.filter(d => d.esFeriadoLaboral);
}

function obtenerDiasLaboralesRango(fechaInicio, fechaFin) {
    const diasLaborales = [];
    const fechaActual = new Date(fechaInicio);
    fechaActual.setHours(0, 0, 0, 0);
    
    const fechaFinNormalizada = new Date(fechaFin);
    fechaFinNormalizada.setHours(23, 59, 59, 999);
    
    while (fechaActual <= fechaFinNormalizada) {
        if (esDiaLaboral(fechaActual)) {
            const infoFeriado = obtenerInfoFeriado(fechaActual);
            diasLaborales.push({
                fecha: new Date(fechaActual),
                fechaFormateada: formatearFecha(fechaActual),
                diaSemana: DIAS_SEMANA[fechaActual.getDay()],
                mes: MESES[fechaActual.getMonth()],
                numeroDia: fechaActual.getDate(),
                esFeriado: !!infoFeriado,
                nombreFeriado: infoFeriado ? infoFeriado.nombre : null
            });
        }
        fechaActual.setDate(fechaActual.getDate() + 1);
    }
    
    return diasLaborales;
}

/**
 * Calcula las horas adeudadas según el método elegido
 * 
 * MÉTODO POR DÍA: Descuenta los feriados (no se deben recuperar)
 * MÉTODO POR SEMANA: NO descuenta los feriados
 */
function calcularHorasAdeudadas(mesNoAsistido, horasOSemanasJornada, ano, metodoCalculo) {
    const diasMes = obtenerDiasMes(mesNoAsistido, ano);
    const diasLaborales = diasMes.filter(d => d.esLaboral);
    const diasFinSemana = diasMes.filter(d => d.esFinDeSemana);
    const feriadosLaborales = diasMes.filter(d => d.esFeriadoLaboral);
    const diasLunesAViernes = diasMes.filter(d => !d.esFinDeSemana);
    
    const cantidadDiasLaborales = diasLaborales.length;
    const cantidadFeriadosLaborales = feriadosLaborales.length;
    const cantidadDiasLunesAViernes = diasLunesAViernes.length;
    const semanasDelMes = calcularSemanasDelMes(mesNoAsistido, ano);
    
    let horasJornadaDiaria, horasSemanales;
    let totalMinutosAdeudados;
    let explicacionMetodo;
    let minutosPorDia;
    
    if (metodoCalculo === 'diario') {
        // El input es horas diarias
        horasJornadaDiaria = horasOSemanasJornada;
        horasSemanales = horasJornadaDiaria * 5;
        minutosPorDia = horasJornadaDiaria * 60;
        
        // Método por día: horas diarias × días laborales reales (ya excluye feriados)
        totalMinutosAdeudados = cantidadDiasLaborales * minutosPorDia;
        
        // Calcular cuántas horas se descuentan por feriados
        const horasDescontadasPorFeriados = cantidadFeriadosLaborales * horasJornadaDiaria;
        const minutosDescontadosPorFeriados = cantidadFeriadosLaborales * minutosPorDia;
        
        // Horas que serían si no hubiera feriados
        const horasSinDescontarFeriados = cantidadDiasLunesAViernes * horasJornadaDiaria;
        
        explicacionMetodo = {
            nombre: 'Por DÍA (Recomendado)',
            formula: 'Horas Adeudadas = Horas por Día × Días Laborales Reales',
            calculo: `${horasJornadaDiaria} horas/día × ${cantidadDiasLaborales} días = ${formatearDecimal(totalMinutosAdeudados/60)} horas`,
            justificacion: 'Este método es el estándar según la legislación laboral peruana. Los feriados se DESCUENTAN porque son días de descanso obligatorio — el trabajador NO debe recuperar días que por ley no estaba obligado a laborar.',
            descuentaFeriados: true,
            feriadosDescontados: cantidadFeriadosLaborales,
            horasDescontadasPorFeriados: horasDescontadasPorFeriados,
            minutosDescontadosPorFeriados: minutosDescontadosPorFeriados,
            horasSinDescontarFeriados: horasSinDescontarFeriados
        };
    } else {
        // El input es horas semanales
        horasSemanales = horasOSemanasJornada;
        horasJornadaDiaria = horasSemanales / 5;
        minutosPorDia = horasJornadaDiaria * 60;
        
        // Método por semana: horas semanales × semanas del mes (NO descuenta feriados)
        totalMinutosAdeudados = semanasDelMes * horasSemanales * 60;
        
        explicacionMetodo = {
            nombre: 'Por SEMANA',
            formula: 'Horas Adeudadas = Horas por Semana × Semanas del Mes',
            calculo: `${horasSemanales} horas/semana × ${semanasDelMes} semanas = ${formatearDecimal(totalMinutosAdeudados/60)} horas`,
            justificacion: 'Este método calcula basándose en las semanas calendario del mes. NO descuenta feriados, lo cual puede resultar en más horas adeudadas.',
            descuentaFeriados: false,
            feriadosDescontados: 0,
            horasDescontadasPorFeriados: 0,
            minutosDescontadosPorFeriados: 0,
            horasSinDescontarFeriados: totalMinutosAdeudados / 60
        };
    }
    
    return {
        mesNoAsistido: MESES[mesNoAsistido - 1],
        mesNumero: mesNoAsistido,
        diasMes: diasMes,
        diasLaborales: diasLaborales,
        diasFinSemana: diasFinSemana,
        feriadosLaborales: feriadosLaborales,
        diasLunesAViernes: diasLunesAViernes,
        cantidadDiasLaborales: cantidadDiasLaborales,
        cantidadDiasFinSemana: diasFinSemana.length,
        cantidadFeriadosLaborales: cantidadFeriadosLaborales,
        cantidadDiasLunesAViernes: cantidadDiasLunesAViernes,
        totalDiasMes: diasMes.length,
        semanasDelMes: semanasDelMes,
        horasJornadaDiaria: horasJornadaDiaria,
        horasSemanales: horasSemanales,
        minutosPorDia: minutosPorDia,
        metodoCalculo: metodoCalculo,
        explicacionMetodo: explicacionMetodo,
        totalMinutosAdeudados: totalMinutosAdeudados,
        totalHorasAdeudadas: minutosAHorasDecimales(totalMinutosAdeudados),
        totalHorasFormato: minutosAFormatoHHMM(totalMinutosAdeudados)
    };
}

function calcularHorasDevueltas(fechaInicioDevolucion, fechaCorte, minutosRecuperacionDiaria) {
    if (fechaInicioDevolucion > fechaCorte) {
        return {
            fechaInicioDevolucion: fechaInicioDevolucion,
            fechaInicioFormateada: formatearFecha(fechaInicioDevolucion),
            fechaCorte: fechaCorte,
            fechaCorteFormateada: formatearFecha(fechaCorte),
            diasLaborales: [],
            cantidadDiasLaborales: 0,
            minutosRecuperacionDiaria: minutosRecuperacionDiaria,
            totalMinutosDevueltos: 0,
            totalHorasDevueltas: 0,
            totalHorasFormato: '0:00',
            error: 'La fecha de inicio de devolución es posterior a la fecha de corte'
        };
    }
    
    const diasLaborales = obtenerDiasLaboralesRango(fechaInicioDevolucion, fechaCorte);
    const cantidadDias = diasLaborales.length;
    const totalMinutosDevueltos = cantidadDias * minutosRecuperacionDiaria;
    
    return {
        fechaInicioDevolucion: fechaInicioDevolucion,
        fechaInicioFormateada: formatearFecha(fechaInicioDevolucion),
        fechaCorte: fechaCorte,
        fechaCorteFormateada: formatearFecha(fechaCorte),
        diasLaborales: diasLaborales,
        cantidadDiasLaborales: cantidadDias,
        minutosRecuperacionDiaria: minutosRecuperacionDiaria,
        totalMinutosDevueltos: totalMinutosDevueltos,
        totalHorasDevueltas: minutosAHorasDecimales(totalMinutosDevueltos),
        totalHorasFormato: minutosAFormatoHHMM(totalMinutosDevueltos)
    };
}

/**
 * Calcula el balance considerando horas extra a favor
 */
function calcularBalance(datosAdeudadas, datosDevueltas, minutosExtraFavor, minutosRecuperacionDiaria, ano) {
    // Total devuelto = horas devueltas por trabajo adicional + horas extra a favor
    const totalMinutosAFavor = datosDevueltas.totalMinutosDevueltos + minutosExtraFavor;
    const minutosPendientes = datosAdeudadas.totalMinutosAdeudados - totalMinutosAFavor;
    
    // Calcular días restantes del año
    const fechaFinAno = new Date(ano, 11, 31);
    let diasRestantes = 0;
    
    if (datosDevueltas.fechaCorte < fechaFinAno) {
        const siguienteDia = new Date(datosDevueltas.fechaCorte);
        siguienteDia.setDate(siguienteDia.getDate() + 1);
        diasRestantes = obtenerDiasLaboralesRango(siguienteDia, fechaFinAno).length;
    }
    
    const minutosPotencialesRestantes = diasRestantes * minutosRecuperacionDiaria;
    
    let diasNecesariosParaCompletar = 0;
    if (minutosPendientes > 0) {
        diasNecesariosParaCompletar = Math.ceil(minutosPendientes / minutosRecuperacionDiaria);
    }
    
    let fechaEstimadaFinalizacion = null;
    if (minutosPendientes > 0 && diasRestantes > 0) {
        let diasContados = 0;
        const fechaActual = new Date(datosDevueltas.fechaCorte);
        fechaActual.setDate(fechaActual.getDate() + 1);
        
        while (diasContados < diasNecesariosParaCompletar && fechaActual <= fechaFinAno) {
            if (esDiaLaboral(fechaActual)) {
                diasContados++;
            }
            if (diasContados < diasNecesariosParaCompletar) {
                fechaActual.setDate(fechaActual.getDate() + 1);
            }
        }
        
        if (diasContados >= diasNecesariosParaCompletar) {
            fechaEstimadaFinalizacion = new Date(fechaActual);
        }
    }
    
    let estado;
    if (minutosPendientes <= 0) {
        estado = 'completado';
    } else if (minutosPotencialesRestantes >= minutosPendientes) {
        estado = 'en_progreso_alcanzable';
    } else {
        estado = 'en_progreso_insuficiente';
    }
    
    return {
        minutosAdeudados: datosAdeudadas.totalMinutosAdeudados,
        minutosDevueltosPorTrabajo: datosDevueltas.totalMinutosDevueltos,
        minutosExtraFavor: minutosExtraFavor,
        totalMinutosAFavor: totalMinutosAFavor,
        minutosPendientes: minutosPendientes,
        horasPendientes: minutosAHorasDecimales(minutosPendientes),
        horasPendientesFormato: minutosAFormatoHHMM(Math.abs(minutosPendientes)),
        diasLaboralesRestantesAno: diasRestantes,
        minutosPotencialesRestantes: minutosPotencialesRestantes,
        horasPotencialesRestantes: minutosAHorasDecimales(minutosPotencialesRestantes),
        diasNecesariosParaCompletar: diasNecesariosParaCompletar,
        fechaEstimadaFinalizacion: fechaEstimadaFinalizacion,
        fechaEstimadaFormateada: fechaEstimadaFinalizacion ? formatearFecha(fechaEstimadaFinalizacion) : 'N/A',
        estado: estado,
        porcentajeCompletado: Math.min(100, (totalMinutosAFavor / datosAdeudadas.totalMinutosAdeudados) * 100)
    };
}

// ============================================================================
// FUNCIONES DE RENDERIZADO
// ============================================================================

/**
 * Actualiza el input de jornada según el método seleccionado
 */
function actualizarInputJornada() {
    const metodo = document.getElementById('metodo-calculo').value;
    const labelJornada = document.getElementById('label-jornada');
    const helpJornada = document.getElementById('help-jornada');
    const horasEquiv = document.getElementById('horas-equiv');
    const inputJornada = document.getElementById('horas-jornada');
    
    if (metodo === 'diario') {
        labelJornada.textContent = 'Horas de Jornada Laboral Diaria';
        const horasDiarias = parseFloat(inputJornada.value) || 6;
        horasEquiv.textContent = horasDiarias * 5;
        helpJornada.innerHTML = `Horas efectivas de trabajo por día (sin almuerzo). Equivale a <span id="horas-equiv">${horasDiarias * 5}</span> horas semanales.`;
        inputJornada.value = 6;
        inputJornada.max = 12;
    } else {
        labelJornada.textContent = 'Horas de Jornada Laboral Semanal';
        const horasSemanales = parseFloat(inputJornada.value) || 30;
        helpJornada.innerHTML = `Horas totales de trabajo por semana (lunes a viernes). Equivale a <span id="horas-equiv">${(horasSemanales / 5).toFixed(1)}</span> horas diarias.`;
        inputJornada.value = 30;
        inputJornada.max = 48;
    }
    
    // Actualizar las tarjetas de método
    const cardDaily = document.getElementById('method-card-daily');
    const cardWeekly = document.getElementById('method-card-weekly');
    
    if (metodo === 'diario') {
        cardDaily.classList.add('active');
        cardDaily.classList.remove('inactive');
        cardWeekly.classList.remove('active');
        cardWeekly.classList.add('inactive');
    } else {
        cardWeekly.classList.add('active');
        cardWeekly.classList.remove('inactive');
        cardDaily.classList.remove('active');
        cardDaily.classList.add('inactive');
    }
}

function renderizarFeriados(mesNoAsistido, datosAdeudadas) {
    const container = document.getElementById('lista-feriados');
    const impactoContainer = document.getElementById('feriados-impacto');
    
    const items = FERIADOS_PERU_2025.map(feriado => {
        const [ano, mes, dia] = feriado.fecha.split('-');
        const aplica = parseInt(mes) === mesNoAsistido;
        const fecha = new Date(feriado.fecha + 'T00:00:00');
        const diaSemana = DIAS_SEMANA_CORTO[fecha.getDay()];
        const esFinDeSemanaFeriado = fecha.getDay() === 0 || fecha.getDay() === 6;
        
        return `
            <div class="holiday-item ${aplica ? 'applies' : ''}">
                <span class="holiday-date">${dia}/${mes}/${ano} (${diaSemana})</span>
                <span class="holiday-name">${feriado.nombre}${esFinDeSemanaFeriado ? ' *' : ''}</span>
                ${aplica ? '<span class="holiday-badge">Aplica</span>' : ''}
            </div>
        `;
    }).join('');
    
    container.innerHTML = items + `
        <div style="grid-column: 1 / -1; font-size: 0.85rem; color: var(--color-text-muted); margin-top: var(--space-sm);">
            * Feriados que caen en fin de semana no afectan el cálculo ya que esos días no son laborables de todos modos.
        </div>
    `;
    
    // Impacto de los feriados en el cálculo
    const esMetodoDiario = datosAdeudadas.metodoCalculo === 'diario';
    const feriadosLaborales = datosAdeudadas.feriadosLaborales;
    
    if (feriadosLaborales.length > 0 && esMetodoDiario) {
        const listaFeriados = feriadosLaborales.map(f => 
            `<strong>${f.numeroDia} de ${datosAdeudadas.mesNoAsistido}</strong> (${f.nombreFeriado})`
        ).join(', ');
        
        impactoContainer.innerHTML = `
            <div class="feriados-impacto-title">⚠️ IMPACTO DE FERIADOS EN EL CÁLCULO (Método por Día)</div>
            <div class="feriados-impacto-content">
                <p>En ${datosAdeudadas.mesNoAsistido} ${ANO} hay <strong>${feriadosLaborales.length} feriado(s) que caen en días de semana</strong>:</p>
                <p>${listaFeriados}</p>
                
                <div class="feriados-impacto-formula">
                    <strong>Cálculo del descuento:</strong><br>
                    • Días de lunes a viernes en ${datosAdeudadas.mesNoAsistido}: ${datosAdeudadas.cantidadDiasLunesAViernes} días<br>
                    • Feriados en días laborales (L-V): ${feriadosLaborales.length} día(s)<br>
                    • Días laborales efectivos: ${datosAdeudadas.cantidadDiasLunesAViernes} − ${feriadosLaborales.length} = <strong>${datosAdeudadas.cantidadDiasLaborales} días</strong><br><br>
                    
                    <strong>Horas descontadas por feriados:</strong><br>
                    • ${feriadosLaborales.length} día(s) × ${datosAdeudadas.horasJornadaDiaria} horas/día = <strong>${datosAdeudadas.explicacionMetodo.horasDescontadasPorFeriados} horas descontadas</strong><br><br>
                    
                    <strong>Comparación:</strong><br>
                    • Sin descontar feriados: ${datosAdeudadas.cantidadDiasLunesAViernes} días × ${datosAdeudadas.horasJornadaDiaria} h = ${datosAdeudadas.explicacionMetodo.horasSinDescontarFeriados} horas<br>
                    • Con feriados descontados: ${datosAdeudadas.cantidadDiasLaborales} días × ${datosAdeudadas.horasJornadaDiaria} h = <strong>${formatearDecimal(datosAdeudadas.totalHorasAdeudadas)} horas</strong><br>
                    • <strong style="color: var(--color-success);">Ahorro para el trabajador: ${datosAdeudadas.explicacionMetodo.horasDescontadasPorFeriados} horas</strong>
                </div>
                
                <p><strong>Conclusión:</strong> El trabajador NO debe recuperar las ${datosAdeudadas.explicacionMetodo.horasDescontadasPorFeriados} horas correspondientes a los feriados porque por ley no estaba obligado a trabajar esos días.</p>
            </div>
        `;
    } else if (!esMetodoDiario) {
        impactoContainer.innerHTML = `
            <div class="feriados-impacto-title" style="color: var(--color-warning);">⚠️ MÉTODO POR SEMANA SELECCIONADO - FERIADOS NO SE DESCUENTAN</div>
            <div class="feriados-impacto-content">
                <p>Con el método por SEMANA, los feriados <strong>NO se descuentan</strong> del cálculo. Esto significa que:</p>
                <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    <li>Se calculan ${datosAdeudadas.horasSemanales} horas × ${datosAdeudadas.semanasDelMes} semanas = ${formatearDecimal(datosAdeudadas.totalHorasAdeudadas)} horas</li>
                    ${feriadosLaborales.length > 0 ? `<li>Los ${feriadosLaborales.length} feriado(s) de ${datosAdeudadas.mesNoAsistido} que caen en días laborales NO reducen las horas</li>` : ''}
                </ul>
                <p style="margin-top: var(--space-md);"><strong>Si desea que los feriados se descuenten, use el método por DÍA.</strong></p>
            </div>
        `;
    } else {
        impactoContainer.innerHTML = `
            <div style="padding: var(--space-md); background: var(--color-success-light); border-radius: 4px; border: 1px solid var(--color-success);">
                <strong>✓ Sin feriados en días laborales:</strong> En ${datosAdeudadas.mesNoAsistido} ${ANO} no hay feriados que caigan en días de semana (lunes a viernes), por lo que no hay descuento por este concepto.
            </div>
        `;
    }
}

function renderizarCalendario(datosAdeudadas) {
    const container = document.getElementById('calendario-mes');
    const leyendaContainer = document.getElementById('calendario-leyenda');
    
    const diasMes = datosAdeudadas.diasMes;
    const primerDia = diasMes[0].fecha.getDay();
    
    const headers = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    let calendarHTML = '<div class="calendar-grid">';
    
    headers.forEach(h => {
        calendarHTML += `<div class="calendar-header">${h}</div>`;
    });
    
    const celdasVacias = primerDia === 0 ? 6 : primerDia - 1;
    for (let i = 0; i < celdasVacias; i++) {
        calendarHTML += '<div class="calendar-day empty"></div>';
    }
    
    diasMes.forEach(dia => {
        let clase = 'calendar-day';
        let etiqueta = '';
        
        if (dia.esFinDeSemana) {
            clase += ' weekend';
            etiqueta = 'F/S';
        } else if (dia.esFeriado) {
            clase += ' holiday';
            etiqueta = 'Feriado';
        } else {
            clase += ' workday';
            etiqueta = '';
        }
        
        calendarHTML += `
            <div class="${clase}" title="${dia.diaSemana}, ${dia.numeroDia} de ${datosAdeudadas.mesNoAsistido}${dia.esFeriado ? ' - ' + dia.nombreFeriado : ''}">
                <span class="day-number">${dia.numeroDia}</span>
                <span class="day-label">${etiqueta}</span>
            </div>
        `;
    });
    
    calendarHTML += '</div>';
    container.innerHTML = calendarHTML;
    
    leyendaContainer.innerHTML = `
        <div class="legend-item">
            <span class="legend-color workday"></span>
            <span>Día Laboral (${datosAdeudadas.cantidadDiasLaborales} días)</span>
        </div>
        <div class="legend-item">
            <span class="legend-color weekend"></span>
            <span>Fin de Semana (${datosAdeudadas.cantidadDiasFinSemana} días)</span>
        </div>
        <div class="legend-item">
            <span class="legend-color holiday"></span>
            <span>Feriado en día L-V (${datosAdeudadas.cantidadFeriadosLaborales} día${datosAdeudadas.cantidadFeriadosLaborales !== 1 ? 's' : ''})</span>
        </div>
    `;
}

function renderizarMetodoActual(datosAdeudadas) {
    const container = document.getElementById('metodo-actual-detalle');
    const metodo = datosAdeudadas.explicacionMetodo;
    const esMetodoDiario = datosAdeudadas.metodoCalculo === 'diario';
    
    container.innerHTML = `
        <div class="current-method-title">
            ✓ Método Seleccionado: ${metodo.nombre}
        </div>
        <div class="method-formula" style="margin-bottom: var(--space-md);">
            <strong>Fórmula aplicada:</strong><br>
            ${metodo.formula}
        </div>
        <div class="method-example">
            <strong>Cálculo para ${datosAdeudadas.mesNoAsistido} ${ANO}:</strong><br>
            ${metodo.calculo}
            ${esMetodoDiario && metodo.feriadosDescontados > 0 ? `<br><br><strong style="color: var(--color-accent);">⚠️ Incluye descuento de ${metodo.feriadosDescontados} feriado(s) = ${metodo.horasDescontadasPorFeriados} horas menos</strong>` : ''}
        </div>
        <p style="font-size: 0.9rem; color: var(--color-text-light); margin-top: var(--space-md);">
            <strong>Justificación:</strong> ${metodo.justificacion}
        </p>
    `;
}

function renderizarResumenEjecutivo(datosAdeudadas, datosDevueltas, balance, minutosExtraFavor) {
    const container = document.getElementById('resumen-ejecutivo');
    
    const pendienteClass = balance.minutosPendientes <= 0 ? 'completado' : 'pendientes';
    const pendienteTexto = balance.minutosPendientes <= 0 
        ? `+${minutosAFormatoHHMM(Math.abs(balance.minutosPendientes))}` 
        : minutosAFormatoHHMM(balance.minutosPendientes);
    
    const extraFavorHTML = minutosExtraFavor > 0 ? `
        <div class="summary-card extra-favor fade-in">
            <div class="summary-label">Horas Extra a Favor</div>
            <div class="summary-value">${minutosAFormatoHHMM(minutosExtraFavor)}</div>
            <div class="summary-subvalue">${formatearDecimal(minutosExtraFavor/60)} horas</div>
        </div>
    ` : '';
    
    container.innerHTML = `
        <div class="summary-card metodo fade-in">
            <div class="summary-label">Método de Cálculo</div>
            <div class="summary-value" style="font-size: 1.1rem;">${datosAdeudadas.metodoCalculo === 'diario' ? 'Por DÍA' : 'Por SEMANA'}</div>
            <div class="summary-subvalue">${datosAdeudadas.metodoCalculo === 'diario' ? datosAdeudadas.cantidadDiasLaborales + ' días lab.' : datosAdeudadas.semanasDelMes + ' semanas'}</div>
        </div>
        <div class="summary-card adeudadas fade-in">
            <div class="summary-label">Horas Adeudadas</div>
            <div class="summary-value">${datosAdeudadas.totalHorasFormato}</div>
            <div class="summary-subvalue">${formatearDecimal(datosAdeudadas.totalHorasAdeudadas)} horas</div>
        </div>
        <div class="summary-card devueltas fade-in">
            <div class="summary-label">Horas Ya Devueltas</div>
            <div class="summary-value">${datosDevueltas.totalHorasFormato}</div>
            <div class="summary-subvalue">${formatearDecimal(datosDevueltas.totalHorasDevueltas)} horas</div>
        </div>
        ${extraFavorHTML}
        <div class="summary-card ${pendienteClass} fade-in">
            <div class="summary-label">${balance.minutosPendientes <= 0 ? 'Horas a Favor' : 'Pendientes'}</div>
            <div class="summary-value">${pendienteTexto}</div>
            <div class="summary-subvalue">${formatearDecimal(Math.abs(balance.horasPendientes))} horas</div>
        </div>
    `;
}

function renderizarCalculoMesNoAsistido(datosAdeudadas) {
    const container = document.getElementById('calculo-mes-no-asistido');
    const esMetodoDiario = datosAdeudadas.metodoCalculo === 'diario';
    
    // Construir lista de feriados del mes si hay
    let feriadosHTML = '';
    if (datosAdeudadas.cantidadFeriadosLaborales > 0) {
        const listaFeriados = datosAdeudadas.feriadosLaborales.map(d => 
            `${d.numeroDia}/${datosAdeudadas.mesNumero} (${d.nombreFeriado})`
        ).join(', ');
        
        feriadosHTML = `
            <div class="calc-step highlight">
                <div class="step-label">🚨 Feriados en días laborales (L-V) - ${esMetodoDiario ? 'SE DESCUENTAN' : 'NO SE DESCUENTAN en este método'}</div>
                <div class="step-formula ${esMetodoDiario ? 'accent' : ''}">${datosAdeudadas.cantidadFeriadosLaborales} feriado(s): ${listaFeriados}</div>
                <div class="step-explanation">${esMetodoDiario 
                    ? 'Los feriados son días de descanso obligatorio. El trabajador NO debe recuperar estos días porque por ley no estaba obligado a laborar.'
                    : 'Con el método por semana, los feriados NO se descuentan del cálculo.'}</div>
            </div>
        `;
    }
    
    container.innerHTML = `
        <div class="calculation-block fade-in">
            <h3 class="calculation-title">Paso 1: Identificar el mes y método de cálculo</h3>
            <p class="calculation-explanation">
                El empleado no asistió durante <strong>${datosAdeudadas.mesNoAsistido} ${ANO}</strong>. 
                Método: <strong>${esMetodoDiario ? 'POR DÍA' : 'POR SEMANA'}</strong>.
            </p>
            <div class="calculation-steps">
                <div class="calc-step">
                    <div class="step-label">Mes no asistido</div>
                    <div class="step-formula">${datosAdeudadas.mesNoAsistido} ${ANO}</div>
                </div>
                <div class="calc-step">
                    <div class="step-label">Método de cálculo</div>
                    <div class="step-formula">${esMetodoDiario ? 'Por DÍA - Los feriados SÍ se descuentan' : 'Por SEMANA - Los feriados NO se descuentan'}</div>
                </div>
            </div>
        </div>

        <div class="calculation-block fade-in">
            <h3 class="calculation-title">Paso 2: Analizar los días del mes</h3>
            <div class="calculation-steps">
                <div class="calc-step">
                    <div class="step-label">Total días calendario en ${datosAdeudadas.mesNoAsistido}</div>
                    <div class="step-formula">${datosAdeudadas.totalDiasMes} días</div>
                </div>
                <div class="calc-step">
                    <div class="step-label">Días de fin de semana (sábados y domingos)</div>
                    <div class="step-formula">${datosAdeudadas.cantidadDiasFinSemana} días</div>
                </div>
                <div class="calc-step">
                    <div class="step-label">Días de lunes a viernes</div>
                    <div class="step-formula">${datosAdeudadas.totalDiasMes} − ${datosAdeudadas.cantidadDiasFinSemana} = ${datosAdeudadas.cantidadDiasLunesAViernes} días</div>
                </div>
                ${feriadosHTML}
                ${esMetodoDiario ? `
                <div class="calc-step">
                    <div class="step-label">Días laborales efectivos (descontando feriados)</div>
                    <div class="step-formula">${datosAdeudadas.cantidadDiasLunesAViernes} días L-V − ${datosAdeudadas.cantidadFeriadosLaborales} feriado(s) = ${datosAdeudadas.cantidadDiasLaborales} días laborales</div>
                    <div class="step-explanation">Estos son los días que el trabajador realmente debía laborar.</div>
                </div>
                ` : `
                <div class="calc-step">
                    <div class="step-label">Semanas calendario del mes</div>
                    <div class="step-formula">${datosAdeudadas.semanasDelMes} semanas</div>
                </div>
                `}
            </div>
            <div class="calc-result">
                <span class="result-label">${esMetodoDiario ? 'Días laborales efectivos:' : 'Semanas del mes:'}</span>
                <span class="result-value">${esMetodoDiario ? datosAdeudadas.cantidadDiasLaborales + ' días' : datosAdeudadas.semanasDelMes + ' semanas'}</span>
            </div>
        </div>

        <div class="calculation-block fade-in">
            <h3 class="calculation-title">Paso 3: Jornada laboral</h3>
            <div class="calculation-steps">
                ${esMetodoDiario ? `
                <div class="calc-step">
                    <div class="step-label">Jornada laboral diaria</div>
                    <div class="step-formula">${datosAdeudadas.horasJornadaDiaria} horas por día</div>
                </div>
                <div class="calc-step">
                    <div class="step-label">Equivalente semanal</div>
                    <div class="step-formula">${datosAdeudadas.horasJornadaDiaria} horas/día × 5 días = ${datosAdeudadas.horasSemanales} horas/semana</div>
                </div>
                ` : `
                <div class="calc-step">
                    <div class="step-label">Jornada laboral semanal</div>
                    <div class="step-formula">${datosAdeudadas.horasSemanales} horas por semana</div>
                </div>
                <div class="calc-step">
                    <div class="step-label">Equivalente diario</div>
                    <div class="step-formula">${datosAdeudadas.horasSemanales} horas/semana ÷ 5 días = ${formatearDecimal(datosAdeudadas.horasJornadaDiaria)} horas/día</div>
                </div>
                `}
                <div class="calc-step">
                    <div class="step-label">En minutos por día</div>
                    <div class="step-formula">${datosAdeudadas.horasJornadaDiaria} × 60 = ${datosAdeudadas.minutosPorDia} minutos/día</div>
                </div>
            </div>
        </div>

        <div class="calculation-block fade-in">
            <h3 class="calculation-title">Paso 4: Calcular horas adeudadas (${esMetodoDiario ? 'Método por DÍA' : 'Método por SEMANA'})</h3>
            <div class="calculation-steps">
                <div class="calc-step">
                    <div class="step-label">Fórmula</div>
                    <div class="step-formula">${datosAdeudadas.explicacionMetodo.formula}</div>
                </div>
                ${esMetodoDiario ? `
                <div class="calc-step">
                    <div class="step-label">Sustitución</div>
                    <div class="step-formula">${datosAdeudadas.horasJornadaDiaria} horas/día × ${datosAdeudadas.cantidadDiasLaborales} días laborales</div>
                </div>
                <div class="calc-step">
                    <div class="step-label">Cálculo en minutos</div>
                    <div class="step-formula">${datosAdeudadas.minutosPorDia} min/día × ${datosAdeudadas.cantidadDiasLaborales} días = ${datosAdeudadas.totalMinutosAdeudados} minutos</div>
                </div>
                ${datosAdeudadas.cantidadFeriadosLaborales > 0 ? `
                <div class="calc-step highlight">
                    <div class="step-label">✓ Horas NO adeudadas por feriados (ya descontadas)</div>
                    <div class="step-formula accent">${datosAdeudadas.cantidadFeriadosLaborales} día(s) feriado × ${datosAdeudadas.horasJornadaDiaria} horas/día = ${datosAdeudadas.explicacionMetodo.horasDescontadasPorFeriados} horas DESCONTADAS</div>
                    <div class="step-explanation">El trabajador se ahorra devolver ${datosAdeudadas.explicacionMetodo.horasDescontadasPorFeriados} horas porque corresponden a días feriados.</div>
                </div>
                ` : ''}
                ` : `
                <div class="calc-step">
                    <div class="step-label">Sustitución</div>
                    <div class="step-formula">${datosAdeudadas.horasSemanales} horas/semana × ${datosAdeudadas.semanasDelMes} semanas</div>
                </div>
                <div class="calc-step">
                    <div class="step-label">Cálculo</div>
                    <div class="step-formula">${datosAdeudadas.horasSemanales} × ${datosAdeudadas.semanasDelMes} = ${formatearDecimal(datosAdeudadas.totalHorasAdeudadas)} horas = ${datosAdeudadas.totalMinutosAdeudados} minutos</div>
                </div>
                `}
                <div class="calc-step">
                    <div class="step-label">Conversión final</div>
                    <div class="step-formula">${datosAdeudadas.totalMinutosAdeudados} minutos ÷ 60 = ${formatearDecimal(datosAdeudadas.totalHorasAdeudadas)} horas = ${datosAdeudadas.totalHorasFormato}</div>
                </div>
            </div>
            <div class="calc-result">
                <span class="result-label">TOTAL HORAS ADEUDADAS:</span>
                <span class="result-value">${datosAdeudadas.totalHorasFormato} (${formatearDecimal(datosAdeudadas.totalHorasAdeudadas)} h)</span>
            </div>
        </div>
    `;
}

function renderizarCalculoHorasDevueltas(datosDevueltas, minutosRecuperacionDiaria) {
    const container = document.getElementById('calculo-horas-devueltas');
    
    if (datosDevueltas.error) {
        container.innerHTML = `
            <div class="note note-warning">
                <span class="note-icon">⚠</span>
                <div class="note-text"><strong>Error:</strong> ${datosDevueltas.error}</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="calculation-block fade-in">
            <h3 class="calculation-title">Paso 1: Período de recuperación</h3>
            <div class="calculation-steps">
                <div class="calc-step">
                    <div class="step-label">Fecha de inicio de devolución</div>
                    <div class="step-formula">${formatearFechaCompleta(datosDevueltas.fechaInicioDevolucion)}</div>
                </div>
                <div class="calc-step">
                    <div class="step-label">Fecha de corte</div>
                    <div class="step-formula">${formatearFechaCompleta(datosDevueltas.fechaCorte)}</div>
                </div>
            </div>
        </div>

        <div class="calculation-block fade-in">
            <h3 class="calculation-title">Paso 2: Días laborales del período</h3>
            <div class="calculation-steps">
                <div class="calc-step">
                    <div class="step-label">Período</div>
                    <div class="step-formula">${datosDevueltas.fechaInicioFormateada} al ${datosDevueltas.fechaCorteFormateada}</div>
                </div>
                <div class="calc-step">
                    <div class="step-label">Días laborales (L-V, sin feriados)</div>
                    <div class="step-formula">${datosDevueltas.cantidadDiasLaborales} días laborales</div>
                </div>
            </div>
            <div class="calc-result">
                <span class="result-label">Días con devolución:</span>
                <span class="result-value">${datosDevueltas.cantidadDiasLaborales} días</span>
            </div>
        </div>

        <div class="calculation-block fade-in">
            <h3 class="calculation-title">Paso 3: Calcular horas ya devueltas</h3>
            <div class="calculation-steps">
                <div class="calc-step">
                    <div class="step-label">Tiempo adicional por día</div>
                    <div class="step-formula">${minutosRecuperacionDiaria} minutos = ${minutosAFormatoHHMM(minutosRecuperacionDiaria)}</div>
                </div>
                <div class="calc-step">
                    <div class="step-label">Fórmula</div>
                    <div class="step-formula">Minutos Devueltos = Días Laborales × Minutos por Día</div>
                </div>
                <div class="calc-step">
                    <div class="step-label">Cálculo</div>
                    <div class="step-formula">${datosDevueltas.cantidadDiasLaborales} días × ${minutosRecuperacionDiaria} min/día = ${datosDevueltas.totalMinutosDevueltos} minutos</div>
                </div>
                <div class="calc-step">
                    <div class="step-label">Conversión</div>
                    <div class="step-formula">${datosDevueltas.totalMinutosDevueltos} ÷ 60 = ${formatearDecimal(datosDevueltas.totalHorasDevueltas)} horas = ${datosDevueltas.totalHorasFormato}</div>
                </div>
            </div>
            <div class="calc-result">
                <span class="result-label">HORAS YA DEVUELTAS:</span>
                <span class="result-value">${datosDevueltas.totalHorasFormato} (${formatearDecimal(datosDevueltas.totalHorasDevueltas)} h)</span>
            </div>
        </div>
    `;
}

function renderizarBalanceFinal(datosAdeudadas, datosDevueltas, balance, minutosRecuperacionDiaria, minutosExtraFavor) {
    const container = document.getElementById('balance-final');
    
    let estadoClass, estadoMensaje, estadoDetalle;
    
    if (balance.estado === 'completado') {
        estadoClass = 'positive';
        estadoMensaje = '✓ ¡DEVOLUCIÓN COMPLETADA!';
        estadoDetalle = balance.minutosPendientes === 0 
            ? 'Se han devuelto exactamente todas las horas adeudadas.'
            : `Se han devuelto todas las horas adeudadas. Hay ${minutosAFormatoHHMM(Math.abs(balance.minutosPendientes))} (${formatearDecimal(Math.abs(balance.horasPendientes))} h) de tiempo a favor del trabajador.`;
    } else if (balance.estado === 'en_progreso_alcanzable') {
        estadoClass = 'negative';
        estadoMensaje = '⏳ DEVOLUCIÓN EN PROGRESO';
        estadoDetalle = `Faltan ${balance.horasPendientesFormato} por devolver. Con ${minutosRecuperacionDiaria} min/día, se completará aprox. el ${balance.fechaEstimadaFormateada}.`;
    } else {
        estadoClass = 'negative';
        estadoMensaje = '⚠ ATENCIÓN: TIEMPO INSUFICIENTE';
        estadoDetalle = `Faltan ${balance.horasPendientesFormato} por devolver, pero solo quedan ${balance.diasLaboralesRestantesAno} días laborales en ${ANO}.`;
    }
    
    const tieneExtraFavor = minutosExtraFavor > 0;
    
    container.innerHTML = `
        <div class="balance-container fade-in">
            <div class="calculation-block">
                <h3 class="calculation-title">Cálculo del Balance</h3>
                <div class="calculation-steps">
                    <div class="calc-step">
                        <div class="step-label">Fórmula</div>
                        <div class="step-formula">Pendientes = Adeudadas − Devueltas${tieneExtraFavor ? ' − Extra a Favor' : ''}</div>
                    </div>
                    <div class="calc-step">
                        <div class="step-label">En minutos</div>
                        <div class="step-formula">${balance.minutosAdeudados} − ${balance.minutosDevueltosPorTrabajo}${tieneExtraFavor ? ` − ${minutosExtraFavor}` : ''} = ${balance.minutosPendientes} min</div>
                    </div>
                    <div class="calc-step">
                        <div class="step-label">En horas</div>
                        <div class="step-formula">${balance.minutosPendientes} ÷ 60 = ${formatearDecimal(balance.horasPendientes)} h = ${balance.horasPendientesFormato}</div>
                    </div>
                </div>
            </div>

            <div class="balance-equation">
                <div class="equation-visual">
                    <div class="equation-item">
                        <div class="equation-number">${datosAdeudadas.totalHorasFormato}</div>
                        <div class="equation-label">Adeudadas</div>
                    </div>
                    <div class="equation-operator">−</div>
                    <div class="equation-item">
                        <div class="equation-number">${datosDevueltas.totalHorasFormato}</div>
                        <div class="equation-label">Devueltas</div>
                    </div>
                    ${tieneExtraFavor ? `
                    <div class="equation-operator">−</div>
                    <div class="equation-item">
                        <div class="equation-number">${minutosAFormatoHHMM(minutosExtraFavor)}</div>
                        <div class="equation-label">Extra Favor</div>
                    </div>
                    ` : ''}
                    <div class="equation-operator">=</div>
                    <div class="equation-item">
                        <div class="equation-number">${balance.minutosPendientes <= 0 ? '+' : ''}${balance.horasPendientesFormato}</div>
                        <div class="equation-label">${balance.minutosPendientes <= 0 ? 'A Favor' : 'Pendientes'}</div>
                    </div>
                </div>
            </div>

            <div class="balance-result ${estadoClass}">
                <div class="balance-message">${estadoMensaje}</div>
                <div class="balance-detail">${estadoDetalle}</div>
            </div>

            <div class="projection-block">
                <div class="projection-title">📊 Proyecciones</div>
                <div class="projection-item">
                    <span class="projection-label">Porcentaje completado</span>
                    <span class="projection-value">${formatearDecimal(balance.porcentajeCompletado)}%</span>
                </div>
                <div class="projection-item">
                    <span class="projection-label">Días laborales restantes en ${ANO}</span>
                    <span class="projection-value">${balance.diasLaboralesRestantesAno} días</span>
                </div>
                ${balance.minutosPendientes > 0 ? `
                <div class="projection-item">
                    <span class="projection-label">Días necesarios para completar</span>
                    <span class="projection-value">${balance.diasNecesariosParaCompletar} días</span>
                </div>
                <div class="projection-item">
                    <span class="projection-label">Fecha estimada de finalización</span>
                    <span class="projection-value">${balance.fechaEstimadaFormateada}</span>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

function renderizarTablaMesNoAsistido(datosAdeudadas) {
    const container = document.getElementById('tabla-mes-no-asistido');
    
    let filas = datosAdeudadas.diasLaborales.map((dia, index) => `
        <tr>
            <td class="mono">${index + 1}</td>
            <td>${dia.fechaFormateada}</td>
            <td>${dia.diaSemana}</td>
            <td class="mono">${formatearDecimal(datosAdeudadas.horasJornadaDiaria, 1)}:00</td>
            <td class="mono">${datosAdeudadas.minutosPorDia}</td>
        </tr>
    `).join('');
    
    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Fecha</th>
                    <th>Día</th>
                    <th>Horas</th>
                    <th>Minutos</th>
                </tr>
            </thead>
            <tbody>${filas}</tbody>
            <tfoot class="table-footer">
                <tr>
                    <td colspan="3"><strong>TOTAL (${datosAdeudadas.cantidadDiasLaborales} días)</strong></td>
                    <td class="mono"><strong>${datosAdeudadas.totalHorasFormato}</strong></td>
                    <td class="mono"><strong>${datosAdeudadas.totalMinutosAdeudados}</strong></td>
                </tr>
            </tfoot>
        </table>
        <div class="table-summary">
            <div class="table-summary-item">
                <span class="table-summary-label">Método:</span>
                <span class="table-summary-value">${datosAdeudadas.metodoCalculo === 'diario' ? 'Por DÍA (feriados descontados)' : 'Por SEMANA'}</span>
            </div>
            <div class="table-summary-item">
                <span class="table-summary-label">Feriados descontados:</span>
                <span class="table-summary-value">${datosAdeudadas.cantidadFeriadosLaborales} día(s) = ${datosAdeudadas.explicacionMetodo.horasDescontadasPorFeriados} horas</span>
            </div>
            <div class="table-summary-item">
                <span class="table-summary-label">Verificación:</span>
                <span class="table-summary-value">${datosAdeudadas.cantidadDiasLaborales} × ${datosAdeudadas.minutosPorDia} = ${datosAdeudadas.cantidadDiasLaborales * datosAdeudadas.minutosPorDia} min ✓</span>
            </div>
        </div>
    `;
}

function renderizarTablaDiasDevolucion(datosDevueltas, minutosRecuperacionDiaria) {
    const container = document.getElementById('tabla-dias-devolucion');
    
    if (datosDevueltas.cantidadDiasLaborales === 0) {
        container.innerHTML = `
            <div class="note note-info">
                <span class="note-icon">ℹ</span>
                <div class="note-text">No hay días laborales en el período de devolución.</div>
            </div>
        `;
        return;
    }
    
    const MAX_FILAS = 50;
    const mostrarTodas = datosDevueltas.diasLaborales.length <= MAX_FILAS;
    const diasAMostrar = mostrarTodas ? datosDevueltas.diasLaborales : datosDevueltas.diasLaborales.slice(0, MAX_FILAS);
    
    let acumulado = 0;
    let filas = diasAMostrar.map((dia, index) => {
        acumulado += minutosRecuperacionDiaria;
        return `
            <tr>
                <td class="mono">${index + 1}</td>
                <td>${dia.fechaFormateada}</td>
                <td>${dia.diaSemana}</td>
                <td>${dia.mes}</td>
                <td class="mono">${minutosAFormatoHHMM(minutosRecuperacionDiaria)}</td>
                <td class="mono">${minutosRecuperacionDiaria}</td>
                <td class="mono">${minutosAFormatoHHMM(acumulado)}</td>
            </tr>
        `;
    }).join('');
    
    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Fecha</th>
                    <th>Día</th>
                    <th>Mes</th>
                    <th>Devuelto</th>
                    <th>Min</th>
                    <th>Acumulado</th>
                </tr>
            </thead>
            <tbody>${filas}</tbody>
            <tfoot class="table-footer">
                <tr>
                    <td colspan="4"><strong>TOTAL (${datosDevueltas.cantidadDiasLaborales} días)</strong></td>
                    <td class="mono"><strong>${datosDevueltas.totalHorasFormato}</strong></td>
                    <td class="mono"><strong>${datosDevueltas.totalMinutosDevueltos}</strong></td>
                    <td class="mono"><strong>${datosDevueltas.totalHorasFormato}</strong></td>
                </tr>
            </tfoot>
        </table>
        ${!mostrarTodas ? `<div class="note note-info" style="margin-top: var(--space-md);"><span class="note-icon">ℹ</span><div class="note-text">Mostrando ${MAX_FILAS} de ${datosDevueltas.cantidadDiasLaborales} días.</div></div>` : ''}
        <div class="table-summary">
            <div class="table-summary-item">
                <span class="table-summary-label">Período:</span>
                <span class="table-summary-value">${datosDevueltas.fechaInicioFormateada} al ${datosDevueltas.fechaCorteFormateada}</span>
            </div>
            <div class="table-summary-item">
                <span class="table-summary-label">Verificación:</span>
                <span class="table-summary-value">${datosDevueltas.cantidadDiasLaborales} × ${minutosRecuperacionDiaria} = ${datosDevueltas.cantidadDiasLaborales * minutosRecuperacionDiaria} min ✓</span>
            </div>
        </div>
    `;
}

function renderizarMetodologia(datosAdeudadas, datosDevueltas, minutosRecuperacionDiaria) {
    const container = document.getElementById('metodologia');
    
    container.innerHTML = `
        <div class="methodology-content fade-in">
            <h3 class="methodology-section-title">11.1 Día Laboral</h3>
            <p>Lunes a viernes, excluyendo feriados nacionales.</p>
            
            <h3 class="methodology-section-title">11.2 Métodos de Cálculo</h3>
            <div class="formula-box">
                <div class="formula-title">Método por DÍA (Recomendado)</div>
                <div class="formula-content">
                    Horas = Horas_Diarias × Días_Laborales<br>
                    <strong>Los feriados SÍ se descuentan</strong>
                </div>
            </div>
            <div class="formula-box">
                <div class="formula-title">Método por SEMANA</div>
                <div class="formula-content">
                    Horas = Horas_Semanales × Semanas_Mes<br>
                    Los feriados NO se descuentan
                </div>
            </div>
            
            <h3 class="methodology-section-title">11.3 Tratamiento de Feriados</h3>
            <div class="formula-box accent">
                <div class="formula-title">⚠️ IMPORTANTE</div>
                <div class="formula-content">
                    Los feriados nacionales son días de descanso OBLIGATORIO y REMUNERADO.<br><br>
                    En el <strong>método por día</strong>, los feriados SE DESCUENTAN porque:<br>
                    • El trabajador NO estaba obligado a laborar esos días<br>
                    • Por lo tanto, NO debe recuperar esas horas<br><br>
                    En el método por semana, los feriados NO se descuentan, lo cual puede resultar en más horas adeudadas.
                </div>
            </div>
            
            <h3 class="methodology-section-title">11.4 Horas Extra a Favor</h3>
            <p>Las horas extra acumuladas a favor del trabajador se restan de las horas pendientes:</p>
            <div class="formula-box">
                <div class="formula-content">
                    Pendientes = Adeudadas − Devueltas − Extra_Favor
                </div>
            </div>
        </div>
    `;
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================

function generarInforme() {
    const metodoCalculo = document.getElementById('metodo-calculo').value;
    const mesNoAsistido = parseInt(document.getElementById('mes-no-asistido').value);
    const horasOSemanasJornada = parseFloat(document.getElementById('horas-jornada').value);
    const minutosRecuperacion = parseInt(document.getElementById('minutos-recuperacion').value);
    
    // Horas extra a favor
    const horasExtraFavor = parseFloat(document.getElementById('horas-extra-favor').value) || 0;
    const minutosExtraFavorInput = parseInt(document.getElementById('minutos-extra-favor').value) || 0;
    const minutosExtraFavor = (horasExtraFavor * 60) + minutosExtraFavorInput;
    
    // Actualizar equivalencia
    const horasEquivSpan = document.getElementById('horas-equiv');
    if (horasEquivSpan) {
        if (metodoCalculo === 'diario') {
            horasEquivSpan.textContent = horasOSemanasJornada * 5;
        } else {
            horasEquivSpan.textContent = (horasOSemanasJornada / 5).toFixed(1);
        }
    }
    
    // Fechas
    const fechaInicioInput = document.getElementById('fecha-inicio-devolucion').value;
    const fechaCorteInput = document.getElementById('fecha-corte').value;
    
    let fechaInicioDevolucion;
    if (fechaInicioInput) {
        fechaInicioDevolucion = new Date(fechaInicioInput + 'T00:00:00');
    } else {
        fechaInicioDevolucion = mesNoAsistido === 12 
            ? new Date(ANO + 1, 0, 1) 
            : new Date(ANO, mesNoAsistido, 1);
    }
    
    let fechaCorte = fechaCorteInput 
        ? new Date(fechaCorteInput + 'T23:59:59') 
        : new Date();
    
    // Cálculos
    const datosAdeudadas = calcularHorasAdeudadas(mesNoAsistido, horasOSemanasJornada, ANO, metodoCalculo);
    const datosDevueltas = calcularHorasDevueltas(fechaInicioDevolucion, fechaCorte, minutosRecuperacion);
    const balance = calcularBalance(datosAdeudadas, datosDevueltas, minutosExtraFavor, minutosRecuperacion, ANO);
    
    // Renderizar
    renderizarFeriados(mesNoAsistido, datosAdeudadas);
    renderizarMetodoActual(datosAdeudadas);
    renderizarCalendario(datosAdeudadas);
    renderizarResumenEjecutivo(datosAdeudadas, datosDevueltas, balance, minutosExtraFavor);
    renderizarCalculoMesNoAsistido(datosAdeudadas);
    renderizarCalculoHorasDevueltas(datosDevueltas, minutosRecuperacion);
    renderizarBalanceFinal(datosAdeudadas, datosDevueltas, balance, minutosRecuperacion, minutosExtraFavor);
    renderizarTablaMesNoAsistido(datosAdeudadas);
    renderizarTablaDiasDevolucion(datosDevueltas, minutosRecuperacion);
    renderizarMetodologia(datosAdeudadas, datosDevueltas, minutosRecuperacion);
}

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('fecha-generacion').textContent = formatearFechaCompleta(new Date());
    
    const hoy = new Date();
    document.getElementById('fecha-inicio-devolucion').value = '2025-02-01';
    document.getElementById('fecha-corte').value = hoy.toISOString().split('T')[0];
    
    document.getElementById('fecha-inicio-devolucion').min = `${ANO}-01-01`;
    document.getElementById('fecha-inicio-devolucion').max = `${ANO}-12-31`;
    document.getElementById('fecha-corte').min = `${ANO}-01-01`;
    document.getElementById('fecha-corte').max = `${ANO}-12-31`;
    
    // Configurar input dinámico según método
    actualizarInputJornada();
    
    generarInforme();
    
    // Eventos
    document.getElementById('btn-calcular').addEventListener('click', generarInforme);
    document.getElementById('metodo-calculo').addEventListener('change', function() {
        actualizarInputJornada();
        generarInforme();
    });
    document.getElementById('mes-no-asistido').addEventListener('change', generarInforme);
    document.getElementById('fecha-inicio-devolucion').addEventListener('change', generarInforme);
    document.getElementById('fecha-corte').addEventListener('change', generarInforme);
    document.getElementById('horas-jornada').addEventListener('change', generarInforme);
    document.getElementById('minutos-recuperacion').addEventListener('change', generarInforme);
    document.getElementById('horas-extra-favor').addEventListener('change', generarInforme);
    document.getElementById('minutos-extra-favor').addEventListener('change', generarInforme);
});
