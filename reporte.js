/**
 * ============================================================================
 * MÓDULO DE GENERACIÓN DE REPORTES
 * Responsabilidad única: Generar informes en PDF y texto plano
 * ============================================================================
 * 
 * Este módulo se encarga exclusivamente de:
 * 1. Recopilar datos calculados desde el DOM y variables globales
 * 2. Generar interpretaciones y análisis adicionales
 * 3. Formatear el contenido para texto plano
 * 4. Generar documento PDF con jsPDF
 * 5. Copiar al portapapeles
 * 
 * DEPENDENCIAS:
 * - jsPDF (cargado desde CDN)
 * - Datos calculados disponibles en window.datosInforme (expuestos por script.js)
 */

// ============================================================================
// NAMESPACE DEL MÓDULO
// ============================================================================
const ReporteModule = (function() {
    'use strict';

    // ========================================================================
    // CONSTANTES DEL MÓDULO
    // ========================================================================
    const SEPARADOR_SECCION = '═'.repeat(80);
    const SEPARADOR_SUBSECCION = '─'.repeat(60);
    const SEPARADOR_LINEA = '·'.repeat(40);
    
    const METADATA = {
        titulo: 'INFORME DE CÁLCULO DE JORNADA LABORAL',
        subtitulo: 'Recuperación de Horas No Laboradas',
        version: '3.0',
        generadoPor: 'Sistema de Cálculo de Jornada Laboral'
    };

    // ========================================================================
    // FUNCIONES DE UTILIDAD
    // ========================================================================
    
    function obtenerFechaHoraActual() {
        const ahora = new Date();
        const opciones = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        return ahora.toLocaleDateString('es-PE', opciones);
    }

    function formatearNumero(num, decimales = 2) {
        return Number(num).toFixed(decimales);
    }

    function minutosAHHMM(minutos) {
        const signo = minutos < 0 ? '-' : '';
        const abs = Math.abs(minutos);
        const h = Math.floor(abs / 60);
        const m = Math.round(abs % 60);
        return `${signo}${h}:${m.toString().padStart(2, '0')}`;
    }

    function centrarTexto(texto, ancho = 80) {
        const espacios = Math.max(0, Math.floor((ancho - texto.length) / 2));
        return ' '.repeat(espacios) + texto;
    }

    function alinearDerecha(texto, ancho = 80) {
        const espacios = Math.max(0, ancho - texto.length);
        return ' '.repeat(espacios) + texto;
    }

    function crearLinea(etiqueta, valor, anchoTotal = 70) {
        const puntos = '.'.repeat(Math.max(3, anchoTotal - etiqueta.length - valor.length - 2));
        return `${etiqueta} ${puntos} ${valor}`;
    }

    // ========================================================================
    // FUNCIONES DE INTERPRETACIÓN Y ANÁLISIS
    // ========================================================================

    function generarInterpretacionMetodo(datos) {
        const esMetodoDiario = datos.metodoCalculo === 'diario';
        const diferencia = Math.abs(
            (datos.horasSemanales * datos.semanasDelMes) - 
            (datos.horasJornadaDiaria * datos.cantidadDiasLaborales)
        );
        
        let interpretacion = [];
        
        interpretacion.push(`ANÁLISIS DEL MÉTODO DE CÁLCULO SELECCIONADO`);
        interpretacion.push(SEPARADOR_SUBSECCION);
        
        if (esMetodoDiario) {
            interpretacion.push(`Se ha seleccionado el MÉTODO POR DÍA, que es el recomendado y estándar según`);
            interpretacion.push(`la legislación laboral peruana. Este método:`);
            interpretacion.push(``);
            interpretacion.push(`  ✓ Calcula las horas basándose en los días laborales REALES del mes`);
            interpretacion.push(`  ✓ DESCUENTA los feriados nacionales (días de descanso obligatorio)`);
            interpretacion.push(`  ✓ Protege al trabajador de devolver horas de días no laborables`);
            interpretacion.push(``);
            
            if (datos.cantidadFeriadosLaborales > 0) {
                interpretacion.push(`IMPACTO FAVORABLE PARA EL TRABAJADOR:`);
                interpretacion.push(`Al usar este método, el trabajador se AHORRA devolver ${datos.explicacionMetodo.horasDescontadasPorFeriados} horas`);
                interpretacion.push(`correspondientes a ${datos.cantidadFeriadosLaborales} feriado(s) que caen en días de semana.`);
                interpretacion.push(``);
                interpretacion.push(`Si se hubiera usado el método por semana, se exigirían ${formatearNumero(datos.horasSemanales * datos.semanasDelMes)} horas,`);
                interpretacion.push(`es decir, ${formatearNumero(diferencia)} horas MÁS de lo justo.`);
            }
        } else {
            interpretacion.push(`Se ha seleccionado el MÉTODO POR SEMANA. Este método:`);
            interpretacion.push(``);
            interpretacion.push(`  ⚠ Calcula multiplicando horas semanales por semanas del mes`);
            interpretacion.push(`  ⚠ NO descuenta los feriados nacionales`);
            interpretacion.push(`  ⚠ Puede resultar en más horas adeudadas de lo justo`);
            interpretacion.push(``);
            interpretacion.push(`ADVERTENCIA:`);
            interpretacion.push(`Con el método por día (recomendado), las horas serían ${formatearNumero(datos.horasJornadaDiaria * datos.cantidadDiasLaborales)}.`);
            interpretacion.push(`Con el método actual (por semana), son ${formatearNumero(datos.horasSemanales * datos.semanasDelMes)}.`);
            interpretacion.push(`Diferencia: ${formatearNumero(diferencia)} horas adicionales que se exigen al trabajador.`);
        }
        
        return interpretacion.join('\n');
    }

    function generarInterpretacionFeriados(datos) {
        let interpretacion = [];
        
        interpretacion.push(`ANÁLISIS DE FERIADOS Y SU IMPACTO`);
        interpretacion.push(SEPARADOR_SUBSECCION);
        
        if (datos.cantidadFeriadosLaborales > 0) {
            interpretacion.push(`En ${datos.mesNoAsistido} ${datos.ano || 2025} existen ${datos.cantidadFeriadosLaborales} feriado(s) que caen en días de semana:`);
            interpretacion.push(``);
            
            datos.feriadosLaborales.forEach(f => {
                interpretacion.push(`  • ${f.numeroDia} de ${datos.mesNoAsistido}: ${f.nombreFeriado}`);
            });
            
            interpretacion.push(``);
            interpretacion.push(`FUNDAMENTO LEGAL:`);
            interpretacion.push(`Los feriados nacionales son días de DESCANSO OBLIGATORIO Y REMUNERADO según`);
            interpretacion.push(`la legislación laboral peruana. Esto significa que:`);
            interpretacion.push(``);
            interpretacion.push(`  1. El empleador DEBE pagar estos días aunque no se trabaje`);
            interpretacion.push(`  2. El trabajador NO tiene obligación de laborar`);
            interpretacion.push(`  3. Por lo tanto, NO corresponde que el trabajador "devuelva" estas horas`);
            interpretacion.push(``);
            interpretacion.push(`CÁLCULO DEL DESCUENTO:`);
            interpretacion.push(`  ${datos.cantidadFeriadosLaborales} feriado(s) × ${datos.horasJornadaDiaria} horas/día = ${datos.explicacionMetodo.horasDescontadasPorFeriados} horas descontadas`);
            interpretacion.push(``);
            interpretacion.push(`BENEFICIO PARA EL TRABAJADOR:`);
            interpretacion.push(`  Horas que NO debe devolver por concepto de feriados: ${datos.explicacionMetodo.horasDescontadasPorFeriados} horas`);
        } else {
            interpretacion.push(`En ${datos.mesNoAsistido} no hay feriados que caigan en días de semana (lunes a viernes),`);
            interpretacion.push(`por lo que no hay descuento por este concepto.`);
            interpretacion.push(``);
            interpretacion.push(`Nota: Los feriados que caen en fin de semana no afectan el cálculo porque`);
            interpretacion.push(`esos días ya están excluidos por ser sábado o domingo.`);
        }
        
        return interpretacion.join('\n');
    }

    function generarInterpretacionBalance(balance, datosAdeudadas, datosDevueltas, minutosExtraFavor) {
        let interpretacion = [];
        
        interpretacion.push(`ANÁLISIS E INTERPRETACIÓN DEL BALANCE`);
        interpretacion.push(SEPARADOR_SUBSECCION);
        
        const porcentaje = balance.porcentajeCompletado;
        
        if (balance.estado === 'completado') {
            interpretacion.push(`✓ ESTADO: DEVOLUCIÓN COMPLETADA`);
            interpretacion.push(``);
            
            if (balance.minutosPendientes === 0) {
                interpretacion.push(`El trabajador ha devuelto EXACTAMENTE todas las horas adeudadas.`);
                interpretacion.push(`No tiene deuda pendiente ni horas a favor.`);
            } else {
                const horasAFavor = Math.abs(balance.minutosPendientes) / 60;
                interpretacion.push(`El trabajador ha devuelto TODAS las horas adeudadas y además tiene`);
                interpretacion.push(`${minutosAHHMM(Math.abs(balance.minutosPendientes))} (${formatearNumero(horasAFavor)} horas) A SU FAVOR.`);
                interpretacion.push(``);
                interpretacion.push(`RECOMENDACIÓN:`);
                interpretacion.push(`Estas horas a favor podrían:`);
                interpretacion.push(`  • Acumularse para futuras compensaciones`);
                interpretacion.push(`  • Convertirse en tiempo libre compensatorio`);
                interpretacion.push(`  • Pagarse como horas extra según acuerdo`);
            }
        } else if (balance.estado === 'en_progreso_alcanzable') {
            interpretacion.push(`⏳ ESTADO: DEVOLUCIÓN EN PROGRESO - ALCANZABLE`);
            interpretacion.push(``);
            interpretacion.push(`El trabajador ha completado el ${formatearNumero(porcentaje)}% de la devolución.`);
            interpretacion.push(``);
            interpretacion.push(`ANÁLISIS DE PROGRESO:`);
            interpretacion.push(`  • Horas adeudadas: ${datosAdeudadas.totalHorasFormato}`);
            interpretacion.push(`  • Horas ya devueltas: ${datosDevueltas.totalHorasFormato}`);
            if (minutosExtraFavor > 0) {
                interpretacion.push(`  • Horas extra a favor: ${minutosAHHMM(minutosExtraFavor)}`);
            }
            interpretacion.push(`  • Horas pendientes: ${balance.horasPendientesFormato}`);
            interpretacion.push(``);
            interpretacion.push(`PROYECCIÓN:`);
            interpretacion.push(`  • Días laborales necesarios: ${balance.diasNecesariosParaCompletar} días`);
            interpretacion.push(`  • Fecha estimada de finalización: ${balance.fechaEstimadaFormateada}`);
            interpretacion.push(`  • Días laborales disponibles en el año: ${balance.diasLaboralesRestantesAno} días`);
            interpretacion.push(``);
            interpretacion.push(`CONCLUSIÓN: El ritmo actual de devolución es SUFICIENTE para completar`);
            interpretacion.push(`la recuperación de horas antes de fin de año.`);
        } else {
            interpretacion.push(`⚠ ESTADO: ATENCIÓN REQUERIDA - TIEMPO INSUFICIENTE`);
            interpretacion.push(``);
            interpretacion.push(`El ritmo actual de devolución NO es suficiente para completar la`);
            interpretacion.push(`recuperación de horas dentro del año ${datosAdeudadas.ano || 2025}.`);
            interpretacion.push(``);
            interpretacion.push(`SITUACIÓN ACTUAL:`);
            interpretacion.push(`  • Horas pendientes: ${balance.horasPendientesFormato}`);
            interpretacion.push(`  • Días laborales restantes: ${balance.diasLaboralesRestantesAno} días`);
            interpretacion.push(`  • Días necesarios al ritmo actual: ${balance.diasNecesariosParaCompletar} días`);
            interpretacion.push(`  • Déficit de días: ${balance.diasNecesariosParaCompletar - balance.diasLaboralesRestantesAno} días`);
            interpretacion.push(``);
            interpretacion.push(`RECOMENDACIONES:`);
            const minutosNecesarios = Math.ceil(balance.minutosPendientes / balance.diasLaboralesRestantesAno);
            interpretacion.push(`  1. Aumentar el tiempo diario de devolución a ${minutosNecesarios} minutos/día`);
            interpretacion.push(`  2. Negociar extensión del plazo de recuperación`);
            interpretacion.push(`  3. Considerar compensación monetaria por las horas restantes`);
        }
        
        return interpretacion.join('\n');
    }

    function generarInterpretacionGeneral(datosAdeudadas, datosDevueltas, balance) {
        let interpretacion = [];
        
        interpretacion.push(`RESUMEN EJECUTIVO E INTERPRETACIÓN GENERAL`);
        interpretacion.push(SEPARADOR_SUBSECCION);
        interpretacion.push(``);
        interpretacion.push(`Este informe analiza la situación de recuperación de horas correspondientes`);
        interpretacion.push(`al mes de ${datosAdeudadas.mesNoAsistido} del año ${datosAdeudadas.ano || 2025}, durante el cual el trabajador`);
        interpretacion.push(`no asistió a laborar.`);
        interpretacion.push(``);
        interpretacion.push(`HALLAZGOS PRINCIPALES:`);
        interpretacion.push(``);
        interpretacion.push(`1. DEUDA ORIGINAL:`);
        interpretacion.push(`   El mes de ${datosAdeudadas.mesNoAsistido} tuvo ${datosAdeudadas.cantidadDiasLaborales} días laborales efectivos,`);
        interpretacion.push(`   lo que representa una deuda de ${datosAdeudadas.totalHorasFormato} (${formatearNumero(datosAdeudadas.totalHorasAdeudadas)} horas).`);
        interpretacion.push(``);
        interpretacion.push(`2. ESFUERZO DE RECUPERACIÓN:`);
        interpretacion.push(`   Desde el ${datosDevueltas.fechaInicioFormateada} hasta el ${datosDevueltas.fechaCorteFormateada},`);
        interpretacion.push(`   se han trabajado ${datosDevueltas.cantidadDiasLaborales} días con tiempo adicional,`);
        interpretacion.push(`   acumulando ${datosDevueltas.totalHorasFormato} de horas devueltas.`);
        interpretacion.push(``);
        interpretacion.push(`3. ESTADO ACTUAL:`);
        
        if (balance.estado === 'completado') {
            interpretacion.push(`   ✓ La devolución está COMPLETADA.`);
            if (balance.minutosPendientes < 0) {
                interpretacion.push(`   El trabajador tiene ${minutosAHHMM(Math.abs(balance.minutosPendientes))} a su favor.`);
            }
        } else {
            interpretacion.push(`   ⏳ Quedan ${balance.horasPendientesFormato} pendientes por devolver.`);
            interpretacion.push(`   Progreso: ${formatearNumero(balance.porcentajeCompletado)}% completado.`);
        }
        
        return interpretacion.join('\n');
    }

    function generarRecomendaciones(balance, datosAdeudadas) {
        let recomendaciones = [];
        
        recomendaciones.push(`RECOMENDACIONES Y CONSIDERACIONES FINALES`);
        recomendaciones.push(SEPARADOR_SUBSECCION);
        recomendaciones.push(``);
        
        recomendaciones.push(`1. SOBRE EL MÉTODO DE CÁLCULO:`);
        if (datosAdeudadas.metodoCalculo === 'diario') {
            recomendaciones.push(`   Se está usando el método correcto (por día). Mantener este criterio`);
            recomendaciones.push(`   en futuras situaciones similares.`);
        } else {
            recomendaciones.push(`   IMPORTANTE: Se recomienda cambiar al método por día para futuros`);
            recomendaciones.push(`   cálculos, ya que es el estándar legal y más justo para el trabajador.`);
        }
        recomendaciones.push(``);
        
        recomendaciones.push(`2. SOBRE LA DOCUMENTACIÓN:`);
        recomendaciones.push(`   • Conservar este informe como respaldo de los cálculos realizados`);
        recomendaciones.push(`   • Mantener registro de asistencia diaria firmado por ambas partes`);
        recomendaciones.push(`   • Documentar cualquier modificación al acuerdo de recuperación`);
        recomendaciones.push(``);
        
        recomendaciones.push(`3. SOBRE LOS FERIADOS:`);
        recomendaciones.push(`   • Los feriados nacionales NO deben incluirse en las horas a devolver`);
        recomendaciones.push(`   • Verificar el calendario de feriados al inicio de cada año`);
        recomendaciones.push(`   • En caso de nuevos feriados decretados, ajustar los cálculos`);
        recomendaciones.push(``);
        
        recomendaciones.push(`4. SOBRE EL SEGUIMIENTO:`);
        if (balance.estado !== 'completado') {
            recomendaciones.push(`   • Realizar seguimiento mensual del avance de la recuperación`);
            recomendaciones.push(`   • Ajustar proyecciones si cambia el ritmo de devolución`);
            recomendaciones.push(`   • Comunicar cualquier imprevisto que afecte el cronograma`);
        } else {
            recomendaciones.push(`   • Emitir documento de cierre/finiquito de la recuperación`);
            recomendaciones.push(`   • Archivar toda la documentación relacionada`);
        }
        
        return recomendaciones.join('\n');
    }

    // ========================================================================
    // GENERACIÓN DE TEXTO PLANO
    // ========================================================================

    function generarTextoPlano() {
        // Verificar que existan datos
        if (!window.datosInforme) {
            return 'ERROR: No hay datos de informe disponibles. Por favor, genere primero el informe.';
        }
        
        const { datosAdeudadas, datosDevueltas, balance, minutosExtraFavor, minutosRecuperacion } = window.datosInforme;
        
        let texto = [];
        
        // ====== ENCABEZADO ======
        texto.push(SEPARADOR_SECCION);
        texto.push(centrarTexto(METADATA.titulo));
        texto.push(centrarTexto(METADATA.subtitulo + ' — Año ' + (datosAdeudadas.ano || 2025)));
        texto.push(SEPARADOR_SECCION);
        texto.push(``);
        texto.push(`Documento generado: ${obtenerFechaHoraActual()}`);
        texto.push(`Versión del sistema: ${METADATA.version}`);
        texto.push(``);
        
        // ====== PARÁMETROS UTILIZADOS ======
        texto.push(SEPARADOR_SECCION);
        texto.push(`SECCIÓN 1: PARÁMETROS DE CÁLCULO UTILIZADOS`);
        texto.push(SEPARADOR_SECCION);
        texto.push(``);
        texto.push(crearLinea('Método de cálculo', datosAdeudadas.metodoCalculo === 'diario' ? 'Por DÍA (recomendado)' : 'Por SEMANA'));
        texto.push(crearLinea('Mes no asistido', `${datosAdeudadas.mesNoAsistido} ${datosAdeudadas.ano || 2025}`));
        texto.push(crearLinea('Jornada laboral diaria', `${datosAdeudadas.horasJornadaDiaria} horas`));
        texto.push(crearLinea('Jornada laboral semanal', `${datosAdeudadas.horasSemanales} horas`));
        texto.push(crearLinea('Fecha inicio devolución', datosDevueltas.fechaInicioFormateada));
        texto.push(crearLinea('Fecha de corte', datosDevueltas.fechaCorteFormateada));
        texto.push(crearLinea('Tiempo adicional diario', `${minutosRecuperacion} minutos (${minutosAHHMM(minutosRecuperacion)})`));
        if (minutosExtraFavor > 0) {
            texto.push(crearLinea('Horas extra a favor', `${minutosAHHMM(minutosExtraFavor)} (${formatearNumero(minutosExtraFavor/60)} horas)`));
        }
        texto.push(``);
        
        // ====== RESUMEN EJECUTIVO ======
        texto.push(SEPARADOR_SECCION);
        texto.push(`SECCIÓN 2: RESUMEN EJECUTIVO`);
        texto.push(SEPARADOR_SECCION);
        texto.push(``);
        texto.push(`┌─────────────────────────────────────────────────────────────────────┐`);
        texto.push(`│  CONCEPTO                           │  VALOR                        │`);
        texto.push(`├─────────────────────────────────────────────────────────────────────┤`);
        texto.push(`│  Total horas adeudadas              │  ${datosAdeudadas.totalHorasFormato.padEnd(10)} (${formatearNumero(datosAdeudadas.totalHorasAdeudadas)} h)      │`);
        texto.push(`│  Total horas ya devueltas           │  ${datosDevueltas.totalHorasFormato.padEnd(10)} (${formatearNumero(datosDevueltas.totalHorasDevueltas)} h)      │`);
        if (minutosExtraFavor > 0) {
            texto.push(`│  Horas extra a favor                │  ${minutosAHHMM(minutosExtraFavor).padEnd(10)} (${formatearNumero(minutosExtraFavor/60)} h)      │`);
        }
        texto.push(`│  Horas pendientes/a favor           │  ${balance.horasPendientesFormato.padEnd(10)} (${formatearNumero(Math.abs(balance.horasPendientes))} h)      │`);
        texto.push(`│  Porcentaje completado              │  ${formatearNumero(balance.porcentajeCompletado)}%                        │`);
        texto.push(`└─────────────────────────────────────────────────────────────────────┘`);
        texto.push(``);
        
        // ====== INTERPRETACIÓN GENERAL ======
        texto.push(SEPARADOR_SECCION);
        texto.push(`SECCIÓN 3: INTERPRETACIÓN GENERAL`);
        texto.push(SEPARADOR_SECCION);
        texto.push(``);
        texto.push(generarInterpretacionGeneral(datosAdeudadas, datosDevueltas, balance));
        texto.push(``);
        
        // ====== CÁLCULO DE HORAS ADEUDADAS ======
        texto.push(SEPARADOR_SECCION);
        texto.push(`SECCIÓN 4: CÁLCULO DETALLADO DE HORAS ADEUDADAS`);
        texto.push(SEPARADOR_SECCION);
        texto.push(``);
        texto.push(`4.1 ANÁLISIS DEL MES NO ASISTIDO: ${datosAdeudadas.mesNoAsistido.toUpperCase()} ${datosAdeudadas.ano || 2025}`);
        texto.push(SEPARADOR_SUBSECCION);
        texto.push(``);
        texto.push(crearLinea('Total días calendario', `${datosAdeudadas.totalDiasMes} días`));
        texto.push(crearLinea('Días de fin de semana (Sáb-Dom)', `${datosAdeudadas.cantidadDiasFinSemana} días`));
        texto.push(crearLinea('Días de lunes a viernes', `${datosAdeudadas.cantidadDiasLunesAViernes} días`));
        texto.push(crearLinea('Feriados en días L-V', `${datosAdeudadas.cantidadFeriadosLaborales} día(s)`));
        texto.push(crearLinea('DÍAS LABORALES EFECTIVOS', `${datosAdeudadas.cantidadDiasLaborales} días`));
        texto.push(``);
        texto.push(`DETALLE DEL CÁLCULO:`);
        texto.push(``);
        texto.push(`  Paso 1: Identificar días de lunes a viernes`);
        texto.push(`          ${datosAdeudadas.totalDiasMes} días totales − ${datosAdeudadas.cantidadDiasFinSemana} fines de semana = ${datosAdeudadas.cantidadDiasLunesAViernes} días L-V`);
        texto.push(``);
        
        if (datosAdeudadas.metodoCalculo === 'diario' && datosAdeudadas.cantidadFeriadosLaborales > 0) {
            texto.push(`  Paso 2: Descontar feriados (MÉTODO POR DÍA)`);
            texto.push(`          ${datosAdeudadas.cantidadDiasLunesAViernes} días L-V − ${datosAdeudadas.cantidadFeriadosLaborales} feriado(s) = ${datosAdeudadas.cantidadDiasLaborales} días laborales`);
            texto.push(``);
            texto.push(`          Feriados descontados:`);
            datosAdeudadas.feriadosLaborales.forEach(f => {
                texto.push(`            • ${f.numeroDia}/${datosAdeudadas.mesNumero}: ${f.nombreFeriado}`);
            });
            texto.push(``);
        }
        
        texto.push(`  Paso 3: Calcular horas adeudadas`);
        if (datosAdeudadas.metodoCalculo === 'diario') {
            texto.push(`          ${datosAdeudadas.cantidadDiasLaborales} días × ${datosAdeudadas.horasJornadaDiaria} horas/día = ${formatearNumero(datosAdeudadas.totalHorasAdeudadas)} horas`);
        } else {
            texto.push(`          ${datosAdeudadas.horasSemanales} horas/semana × ${datosAdeudadas.semanasDelMes} semanas = ${formatearNumero(datosAdeudadas.totalHorasAdeudadas)} horas`);
        }
        texto.push(``);
        texto.push(`  Paso 4: Conversión a minutos (verificación)`);
        texto.push(`          ${formatearNumero(datosAdeudadas.totalHorasAdeudadas)} horas × 60 min/hora = ${datosAdeudadas.totalMinutosAdeudados} minutos`);
        texto.push(``);
        texto.push(`  RESULTADO: ${datosAdeudadas.totalHorasFormato} (${formatearNumero(datosAdeudadas.totalHorasAdeudadas)} horas = ${datosAdeudadas.totalMinutosAdeudados} minutos)`);
        texto.push(``);
        
        // Interpretación del método
        texto.push(``);
        texto.push(generarInterpretacionMetodo(datosAdeudadas));
        texto.push(``);
        
        // Interpretación de feriados
        texto.push(``);
        texto.push(generarInterpretacionFeriados(datosAdeudadas));
        texto.push(``);
        
        // ====== CÁLCULO DE HORAS DEVUELTAS ======
        texto.push(SEPARADOR_SECCION);
        texto.push(`SECCIÓN 5: CÁLCULO DETALLADO DE HORAS YA DEVUELTAS`);
        texto.push(SEPARADOR_SECCION);
        texto.push(``);
        texto.push(`5.1 PERÍODO DE RECUPERACIÓN`);
        texto.push(SEPARADOR_SUBSECCION);
        texto.push(``);
        texto.push(crearLinea('Fecha de inicio', datosDevueltas.fechaInicioFormateada));
        texto.push(crearLinea('Fecha de corte', datosDevueltas.fechaCorteFormateada));
        texto.push(crearLinea('Días laborales en período', `${datosDevueltas.cantidadDiasLaborales} días`));
        texto.push(crearLinea('Tiempo adicional por día', `${minutosRecuperacion} minutos`));
        texto.push(``);
        
        texto.push(`5.2 DESGLOSE DE DÍAS LABORALES POR MES`);
        texto.push(SEPARADOR_SUBSECCION);
        texto.push(``);
        
        // Calcular desglose por mes
        const desgloseMeses = new Map();
        datosDevueltas.diasLaborales.forEach(dia => {
            const key = dia.mes;
            if (!desgloseMeses.has(key)) {
                desgloseMeses.set(key, { cantidad: 0, primero: dia.fechaFormateada, ultimo: dia.fechaFormateada });
            }
            const datos = desgloseMeses.get(key);
            datos.cantidad++;
            datos.ultimo = dia.fechaFormateada;
        });
        
        let totalVerificacion = 0;
        desgloseMeses.forEach((datos, mes) => {
            totalVerificacion += datos.cantidad;
            texto.push(`  ${mes.padEnd(15)} : ${datos.cantidad.toString().padStart(3)} días (del ${datos.primero} al ${datos.ultimo})`);
        });
        texto.push(`  ${'─'.repeat(50)}`);
        texto.push(`  ${'TOTAL'.padEnd(15)} : ${totalVerificacion.toString().padStart(3)} días`);
        texto.push(``);
        
        texto.push(`5.3 CÁLCULO DE HORAS DEVUELTAS`);
        texto.push(SEPARADOR_SUBSECCION);
        texto.push(``);
        texto.push(`  Fórmula: Minutos Devueltos = Días Laborales × Minutos por Día`);
        texto.push(``);
        texto.push(`  Sustitución: ${datosDevueltas.cantidadDiasLaborales} días × ${minutosRecuperacion} min/día`);
        texto.push(``);
        texto.push(`  Cálculo: ${datosDevueltas.cantidadDiasLaborales} × ${minutosRecuperacion} = ${datosDevueltas.totalMinutosDevueltos} minutos`);
        texto.push(``);
        texto.push(`  Conversión: ${datosDevueltas.totalMinutosDevueltos} min ÷ 60 = ${formatearNumero(datosDevueltas.totalHorasDevueltas)} horas`);
        texto.push(``);
        texto.push(`  RESULTADO: ${datosDevueltas.totalHorasFormato} (${formatearNumero(datosDevueltas.totalHorasDevueltas)} horas)`);
        texto.push(``);
        
        // ====== BALANCE FINAL ======
        texto.push(SEPARADOR_SECCION);
        texto.push(`SECCIÓN 6: BALANCE FINAL Y PROYECCIÓN`);
        texto.push(SEPARADOR_SECCION);
        texto.push(``);
        texto.push(`6.1 CÁLCULO DEL BALANCE`);
        texto.push(SEPARADOR_SUBSECCION);
        texto.push(``);
        texto.push(`  Fórmula: Pendientes = Adeudadas − Devueltas${minutosExtraFavor > 0 ? ' − Extra a Favor' : ''}`);
        texto.push(``);
        texto.push(`  En minutos:`);
        texto.push(`    ${balance.minutosAdeudados} (adeudados)`);
        texto.push(`  − ${balance.minutosDevueltosPorTrabajo} (devueltos por trabajo adicional)`);
        if (minutosExtraFavor > 0) {
            texto.push(`  − ${minutosExtraFavor} (horas extra a favor)`);
        }
        texto.push(`  ${'─'.repeat(40)}`);
        texto.push(`  = ${balance.minutosPendientes} minutos ${balance.minutosPendientes <= 0 ? '(A FAVOR del trabajador)' : '(PENDIENTES)'}`);
        texto.push(``);
        texto.push(`  En horas: ${balance.minutosPendientes} ÷ 60 = ${formatearNumero(balance.horasPendientes)} horas = ${balance.horasPendientesFormato}`);
        texto.push(``);
        
        texto.push(`6.2 ESTADO Y PROYECCIÓN`);
        texto.push(SEPARADOR_SUBSECCION);
        texto.push(``);
        texto.push(crearLinea('Estado actual', balance.estado === 'completado' ? '✓ COMPLETADO' : '⏳ EN PROGRESO'));
        texto.push(crearLinea('Porcentaje completado', `${formatearNumero(balance.porcentajeCompletado)}%`));
        texto.push(crearLinea('Días laborales restantes en el año', `${balance.diasLaboralesRestantesAno} días`));
        
        if (balance.minutosPendientes > 0) {
            texto.push(crearLinea('Días necesarios para completar', `${balance.diasNecesariosParaCompletar} días`));
            texto.push(crearLinea('Fecha estimada de finalización', balance.fechaEstimadaFormateada));
        }
        texto.push(``);
        
        // Interpretación del balance
        texto.push(``);
        texto.push(generarInterpretacionBalance(balance, datosAdeudadas, datosDevueltas, minutosExtraFavor));
        texto.push(``);
        
        // ====== RECOMENDACIONES ======
        texto.push(SEPARADOR_SECCION);
        texto.push(`SECCIÓN 7: RECOMENDACIONES`);
        texto.push(SEPARADOR_SECCION);
        texto.push(``);
        texto.push(generarRecomendaciones(balance, datosAdeudadas));
        texto.push(``);
        
        // ====== ANEXOS: TABLAS DETALLADAS ======
        texto.push(SEPARADOR_SECCION);
        texto.push(`SECCIÓN 8: ANEXO - DETALLE DE DÍAS LABORALES DEL MES NO ASISTIDO`);
        texto.push(SEPARADOR_SECCION);
        texto.push(``);
        texto.push(`  #    Fecha        Día          Horas    Minutos`);
        texto.push(`  ${'─'.repeat(55)}`);
        
        datosAdeudadas.diasLaborales.forEach((dia, i) => {
            const num = (i + 1).toString().padStart(3);
            const fecha = dia.fechaFormateada.padEnd(12);
            const diaSem = dia.diaSemana.padEnd(12);
            const horas = datosAdeudadas.horasJornadaDiaria.toString().padStart(5);
            const mins = datosAdeudadas.minutosPorDia.toString().padStart(8);
            texto.push(`  ${num}  ${fecha} ${diaSem} ${horas}    ${mins}`);
        });
        
        texto.push(`  ${'─'.repeat(55)}`);
        texto.push(`  TOTAL: ${datosAdeudadas.cantidadDiasLaborales} días = ${datosAdeudadas.totalHorasFormato} (${datosAdeudadas.totalMinutosAdeudados} minutos)`);
        texto.push(``);
        
        // ====== FIRMAS Y VALIDACIÓN ======
        texto.push(SEPARADOR_SECCION);
        texto.push(`SECCIÓN 9: VALIDACIÓN Y CONFORMIDAD`);
        texto.push(SEPARADOR_SECCION);
        texto.push(``);
        texto.push(`Este informe ha sido generado automáticamente con base en los parámetros`);
        texto.push(`proporcionados. Los cálculos son verificables y reproducibles.`);
        texto.push(``);
        texto.push(``);
        texto.push(`_________________________________          _________________________________`);
        texto.push(`        Firma del Trabajador                      Firma del Empleador`);
        texto.push(``);
        texto.push(`Nombre: _________________________          Nombre: _________________________`);
        texto.push(``);
        texto.push(`DNI: ____________________________          DNI: ____________________________`);
        texto.push(``);
        texto.push(`Fecha: __________________________          Fecha: __________________________`);
        texto.push(``);
        texto.push(``);
        texto.push(SEPARADOR_SECCION);
        texto.push(centrarTexto('FIN DEL INFORME'));
        texto.push(SEPARADOR_SECCION);
        
        return texto.join('\n');
    }

    // ========================================================================
    // GENERACIÓN DE PDF
    // ========================================================================

    async function generarPDF() {
        // Verificar que existan datos
        if (!window.datosInforme) {
            alert('Error: No hay datos de informe disponibles. Por favor, genere primero el informe.');
            return;
        }

        // Verificar que jsPDF esté cargado
        if (typeof window.jspdf === 'undefined') {
            alert('Error: La biblioteca jsPDF no está cargada. Por favor, recargue la página.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const { datosAdeudadas, datosDevueltas, balance, minutosExtraFavor, minutosRecuperacion } = window.datosInforme;
        
        // Crear documento PDF
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        const contentWidth = pageWidth - (margin * 2);
        let y = margin;

        // Funciones auxiliares para el PDF
        function addPage() {
            doc.addPage();
            y = margin;
        }

        function checkPageBreak(neededHeight = 20) {
            if (y + neededHeight > pageHeight - margin) {
                addPage();
                return true;
            }
            return false;
        }

        function addTitle(text, size = 16) {
            checkPageBreak(15);
            doc.setFontSize(size);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(26, 54, 93); // Color primario
            doc.text(text, pageWidth / 2, y, { align: 'center' });
            y += size * 0.5;
        }

        function addSubtitle(text, size = 12) {
            checkPageBreak(12);
            doc.setFontSize(size);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(44, 82, 130);
            doc.text(text, margin, y);
            y += 7;
        }

        function addParagraph(text, size = 10) {
            doc.setFontSize(size);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(45, 55, 72);
            const lines = doc.splitTextToSize(text, contentWidth);
            lines.forEach(line => {
                checkPageBreak(6);
                doc.text(line, margin, y);
                y += 5;
            });
            y += 2;
        }

        function addKeyValue(key, value) {
            checkPageBreak(7);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(45, 55, 72);
            doc.text(key + ':', margin, y);
            doc.setFont('helvetica', 'normal');
            doc.text(value, margin + 60, y);
            y += 6;
        }

        function addSeparator() {
            checkPageBreak(5);
            doc.setDrawColor(200, 200, 200);
            doc.line(margin, y, pageWidth - margin, y);
            y += 5;
        }

        function addSectionHeader(number, title) {
            checkPageBreak(15);
            y += 5;
            doc.setFillColor(26, 54, 93);
            doc.rect(margin, y - 5, contentWidth, 8, 'F');
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text(`${number}. ${title}`, margin + 3, y);
            y += 8;
        }

        function addHighlightBox(text, type = 'info') {
            checkPageBreak(20);
            const colors = {
                info: [235, 248, 255],
                success: [240, 255, 244],
                warning: [255, 255, 240],
                error: [255, 245, 245]
            };
            const borderColors = {
                info: [43, 108, 176],
                success: [39, 103, 73],
                warning: [183, 121, 31],
                error: [197, 48, 48]
            };
            
            doc.setFillColor(...colors[type]);
            doc.setDrawColor(...borderColors[type]);
            
            const lines = doc.splitTextToSize(text, contentWidth - 10);
            const boxHeight = lines.length * 5 + 8;
            
            doc.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, 'FD');
            
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...borderColors[type]);
            
            y += 6;
            lines.forEach(line => {
                doc.text(line, margin + 5, y);
                y += 5;
            });
            y += 5;
        }

        // ====== GENERAR CONTENIDO DEL PDF ======

        // Encabezado
        doc.setFillColor(26, 54, 93);
        doc.rect(0, 0, pageWidth, 35, 'F');
        
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('INFORME DE CÁLCULO DE JORNADA LABORAL', pageWidth / 2, 15, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Recuperación de Horas No Laboradas — Año ${datosAdeudadas.ano || 2025}`, pageWidth / 2, 23, { align: 'center' });
        
        doc.setFontSize(9);
        doc.text(`Generado: ${obtenerFechaHoraActual()}`, pageWidth / 2, 30, { align: 'center' });
        
        y = 45;

        // Sección 1: Parámetros
        addSectionHeader('1', 'PARÁMETROS DE CÁLCULO');
        addKeyValue('Método de cálculo', datosAdeudadas.metodoCalculo === 'diario' ? 'Por DÍA (recomendado)' : 'Por SEMANA');
        addKeyValue('Mes no asistido', `${datosAdeudadas.mesNoAsistido} ${datosAdeudadas.ano || 2025}`);
        addKeyValue('Jornada diaria', `${datosAdeudadas.horasJornadaDiaria} horas`);
        addKeyValue('Jornada semanal', `${datosAdeudadas.horasSemanales} horas`);
        addKeyValue('Período de devolución', `${datosDevueltas.fechaInicioFormateada} al ${datosDevueltas.fechaCorteFormateada}`);
        addKeyValue('Tiempo adicional/día', `${minutosRecuperacion} minutos`);
        if (minutosExtraFavor > 0) {
            addKeyValue('Horas extra a favor', `${minutosAHHMM(minutosExtraFavor)} (${formatearNumero(minutosExtraFavor/60)} h)`);
        }
        
        // Sección 2: Resumen Ejecutivo
        addSectionHeader('2', 'RESUMEN EJECUTIVO');
        
        // Tabla resumen
        checkPageBreak(40);
        const tableData = [
            ['Concepto', 'Valor', 'Equivalente'],
            ['Horas Adeudadas', datosAdeudadas.totalHorasFormato, `${formatearNumero(datosAdeudadas.totalHorasAdeudadas)} horas`],
            ['Horas Ya Devueltas', datosDevueltas.totalHorasFormato, `${formatearNumero(datosDevueltas.totalHorasDevueltas)} horas`],
            ['Horas Pendientes', balance.horasPendientesFormato, `${formatearNumero(Math.abs(balance.horasPendientes))} horas`],
            ['Progreso', `${formatearNumero(balance.porcentajeCompletado)}%`, balance.estado === 'completado' ? 'COMPLETADO' : 'EN PROGRESO']
        ];
        
        if (minutosExtraFavor > 0) {
            tableData.splice(3, 0, ['Horas Extra a Favor', minutosAHHMM(minutosExtraFavor), `${formatearNumero(minutosExtraFavor/60)} horas`]);
        }

        doc.setFontSize(9);
        let tableY = y;
        const colWidths = [60, 40, 50];
        
        // Header de tabla
        doc.setFillColor(44, 82, 130);
        doc.rect(margin, tableY, contentWidth, 7, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text(tableData[0][0], margin + 2, tableY + 5);
        doc.text(tableData[0][1], margin + colWidths[0] + 2, tableY + 5);
        doc.text(tableData[0][2], margin + colWidths[0] + colWidths[1] + 2, tableY + 5);
        tableY += 7;
        
        // Filas de datos
        doc.setTextColor(45, 55, 72);
        for (let i = 1; i < tableData.length; i++) {
            doc.setFont('helvetica', i === tableData.length - 1 ? 'bold' : 'normal');
            if (i % 2 === 0) {
                doc.setFillColor(247, 245, 243);
                doc.rect(margin, tableY, contentWidth, 6, 'F');
            }
            doc.text(tableData[i][0], margin + 2, tableY + 4);
            doc.text(tableData[i][1], margin + colWidths[0] + 2, tableY + 4);
            doc.text(tableData[i][2], margin + colWidths[0] + colWidths[1] + 2, tableY + 4);
            tableY += 6;
        }
        y = tableY + 5;

        // Estado actual
        const estadoText = balance.estado === 'completado' 
            ? '✓ DEVOLUCIÓN COMPLETADA - El trabajador ha cumplido con la recuperación de horas.'
            : `⏳ EN PROGRESO - Faltan ${balance.horasPendientesFormato} por devolver. Fecha estimada: ${balance.fechaEstimadaFormateada}`;
        addHighlightBox(estadoText, balance.estado === 'completado' ? 'success' : 'warning');

        // Sección 3: Interpretación General
        addSectionHeader('3', 'INTERPRETACIÓN GENERAL');
        addParagraph(`Este informe analiza la situación de recuperación de horas correspondientes al mes de ${datosAdeudadas.mesNoAsistido} del año ${datosAdeudadas.ano || 2025}, durante el cual el trabajador no asistió a laborar.`);
        addParagraph(`El mes tuvo ${datosAdeudadas.cantidadDiasLaborales} días laborales efectivos, generando una deuda de ${datosAdeudadas.totalHorasFormato}. Desde el ${datosDevueltas.fechaInicioFormateada}, se han trabajado ${datosDevueltas.cantidadDiasLaborales} días adicionales, acumulando ${datosDevueltas.totalHorasFormato} de horas devueltas.`);

        // Sección 4: Análisis de Feriados
        if (datosAdeudadas.cantidadFeriadosLaborales > 0 && datosAdeudadas.metodoCalculo === 'diario') {
            addSectionHeader('4', 'IMPACTO DE FERIADOS');
            addParagraph(`En ${datosAdeudadas.mesNoAsistido} existe(n) ${datosAdeudadas.cantidadFeriadosLaborales} feriado(s) que caen en días de semana. Estos días se han DESCONTADO del cálculo porque el trabajador NO estaba obligado a laborar.`);
            
            datosAdeudadas.feriadosLaborales.forEach(f => {
                addParagraph(`• ${f.numeroDia} de ${datosAdeudadas.mesNoAsistido}: ${f.nombreFeriado}`);
            });
            
            addHighlightBox(`BENEFICIO: El trabajador se ahorra devolver ${datosAdeudadas.explicacionMetodo.horasDescontadasPorFeriados} horas por concepto de feriados.`, 'success');
        }

        // Sección 5: Cálculos Detallados
        addSectionHeader('5', 'CÁLCULOS DETALLADOS');
        
        addSubtitle('5.1 Horas Adeudadas');
        addParagraph(`Fórmula: ${datosAdeudadas.explicacionMetodo.formula}`);
        addParagraph(`Cálculo: ${datosAdeudadas.explicacionMetodo.calculo}`);
        addParagraph(`Resultado: ${datosAdeudadas.totalHorasFormato} (${datosAdeudadas.totalMinutosAdeudados} minutos)`);
        
        addSubtitle('5.2 Horas Devueltas');
        addParagraph(`Período: ${datosDevueltas.fechaInicioFormateada} al ${datosDevueltas.fechaCorteFormateada}`);
        addParagraph(`Días laborales: ${datosDevueltas.cantidadDiasLaborales} días`);
        addParagraph(`Cálculo: ${datosDevueltas.cantidadDiasLaborales} días × ${minutosRecuperacion} min/día = ${datosDevueltas.totalMinutosDevueltos} minutos`);
        addParagraph(`Resultado: ${datosDevueltas.totalHorasFormato} (${formatearNumero(datosDevueltas.totalHorasDevueltas)} horas)`);
        
        addSubtitle('5.3 Balance');
        let balanceFormula = `${balance.minutosAdeudados} - ${balance.minutosDevueltosPorTrabajo}`;
        if (minutosExtraFavor > 0) {
            balanceFormula += ` - ${minutosExtraFavor}`;
        }
        balanceFormula += ` = ${balance.minutosPendientes} minutos`;
        addParagraph(`Cálculo: ${balanceFormula}`);
        addParagraph(`Resultado: ${balance.horasPendientesFormato} ${balance.minutosPendientes <= 0 ? '(A FAVOR del trabajador)' : '(PENDIENTES)'}`);

        // Sección 6: Proyección
        if (balance.minutosPendientes > 0) {
            addSectionHeader('6', 'PROYECCIÓN');
            addKeyValue('Días necesarios', `${balance.diasNecesariosParaCompletar} días laborales`);
            addKeyValue('Días disponibles', `${balance.diasLaboralesRestantesAno} días en el año`);
            addKeyValue('Fecha estimada', balance.fechaEstimadaFormateada);
            
            if (balance.estado === 'en_progreso_insuficiente') {
                addHighlightBox('⚠️ ATENCIÓN: El ritmo actual de devolución NO es suficiente para completar la recuperación antes de fin de año. Se recomienda aumentar el tiempo diario de devolución.', 'warning');
            }
        }

        // Sección 7: Recomendaciones
        addSectionHeader('7', 'RECOMENDACIONES');
        addParagraph('1. Conservar este informe como respaldo de los cálculos realizados.');
        addParagraph('2. Mantener registro de asistencia diaria firmado por ambas partes.');
        addParagraph('3. Los feriados nacionales NO deben incluirse en las horas a devolver.');
        if (balance.estado !== 'completado') {
            addParagraph('4. Realizar seguimiento mensual del avance de la recuperación.');
        }

        // Sección 8: Anexo - Detalle de días laborales
        addSectionHeader('8', 'ANEXO - DETALLE DE DÍAS LABORALES DEL MES NO ASISTIDO');
        
        // Tabla de días laborales
        checkPageBreak(20);
        doc.setFontSize(8);
        
        const diasPorPagina = 35;
        const diasLaborales = datosAdeudadas.diasLaborales;
        
        for (let i = 0; i < diasLaborales.length; i++) {
            if (i % diasPorPagina === 0) {
                if (i > 0) addPage();
                // Header de tabla
                doc.setFillColor(44, 82, 130);
                doc.rect(margin, y, contentWidth, 6, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFont('helvetica', 'bold');
                doc.text('#', margin + 2, y + 4);
                doc.text('Fecha', margin + 15, y + 4);
                doc.text('Día', margin + 45, y + 4);
                doc.text('Horas', margin + 80, y + 4);
                doc.text('Minutos', margin + 100, y + 4);
                y += 7;
            }
            
            const dia = diasLaborales[i];
            doc.setTextColor(45, 55, 72);
            doc.setFont('helvetica', 'normal');
            
            if (i % 2 === 0) {
                doc.setFillColor(247, 245, 243);
                doc.rect(margin, y - 3, contentWidth, 5, 'F');
            }
            
            doc.text((i + 1).toString(), margin + 2, y);
            doc.text(dia.fechaFormateada, margin + 15, y);
            doc.text(dia.diaSemana, margin + 45, y);
            doc.text(datosAdeudadas.horasJornadaDiaria.toString(), margin + 80, y);
            doc.text(datosAdeudadas.minutosPorDia.toString(), margin + 100, y);
            y += 5;
        }
        
        // Total de la tabla
        y += 2;
        doc.setFillColor(26, 54, 93);
        doc.rect(margin, y, contentWidth, 7, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text(`TOTAL: ${datosAdeudadas.cantidadDiasLaborales} días`, margin + 2, y + 5);
        doc.text(datosAdeudadas.totalHorasFormato, margin + 80, y + 5);
        doc.text(`${datosAdeudadas.totalMinutosAdeudados} min`, margin + 100, y + 5);
        y += 15;

        
        // Pie de página con número de páginas
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
            doc.text('Documento generado automáticamente - Sistema de Cálculo de Jornada Laboral v3.0', pageWidth / 2, pageHeight - 5, { align: 'center' });
        }

        // Guardar PDF
        const nombreArchivo = `Informe_Jornada_${datosAdeudadas.mesNoAsistido}_${datosAdeudadas.ano || 2025}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(nombreArchivo);
        
        return nombreArchivo;
    }

    // ========================================================================
    // FUNCIÓN PARA COPIAR AL PORTAPAPELES
    // ========================================================================

    async function copiarAlPortapapeles() {
        const texto = generarTextoPlano();
        
        try {
            await navigator.clipboard.writeText(texto);
            return { success: true, message: 'Informe copiado al portapapeles exitosamente.' };
        } catch (err) {
            // Fallback para navegadores que no soportan clipboard API
            const textArea = document.createElement('textarea');
            textArea.value = texto;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return { success: true, message: 'Informe copiado al portapapeles exitosamente.' };
            } catch (e) {
                document.body.removeChild(textArea);
                return { success: false, message: 'Error al copiar. Por favor, copie manualmente.' };
            }
        }
    }

    // ========================================================================
    // FUNCIÓN PARA PREVISUALIZAR TEXTO
    // ========================================================================

    function previsualizarTexto() {
        const texto = generarTextoPlano();
        
        // Crear modal de previsualización
        const modal = document.createElement('div');
        modal.id = 'modal-preview';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Vista Previa del Informe</h3>
                        <button class="modal-close" onclick="document.getElementById('modal-preview').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        <pre>${texto}</pre>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="document.getElementById('modal-preview').remove()">Cerrar</button>
                        <button class="btn-primary" onclick="ReporteModule.copiarAlPortapapeles().then(r => alert(r.message))">Copiar</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // ========================================================================
    // API PÚBLICA DEL MÓDULO
    // ========================================================================

    return {
        generarTextoPlano: generarTextoPlano,
        generarPDF: generarPDF,
        copiarAlPortapapeles: copiarAlPortapapeles,
        previsualizarTexto: previsualizarTexto,
        version: METADATA.version
    };

})();

// Exponer el módulo globalmente
window.ReporteModule = ReporteModule;
