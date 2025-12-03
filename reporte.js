/**
 * ============================================================================
 * MÓDULO DE GENERACIÓN DE REPORTES
 * Responsabilidad única: Generar informes en PDF y texto plano
 * ============================================================================
 * 
 * Este módulo se encarga exclusivamente de:
 * 1. Recopilar datos calculados desde window.datosInforme
 * 2. Generar interpretaciones y análisis exhaustivos
 * 3. Formatear el contenido para texto plano
 * 4. Generar documento PDF con jsPDF
 * 5. Copiar al portapapeles
 * 
 * DEPENDENCIAS:
 * - jsPDF (cargado desde CDN)
 * - Datos calculados disponibles en window.datosInforme
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
        version: '1.0',
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
    // FUNCIONES DE INTERPRETACIÓN Y ANÁLISIS EXHAUSTIVO
    // ========================================================================

    function generarInterpretacionMetodo(datos) {
        const esMetodoDiario = datos.metodoCalculo === 'diario';
        const horasSemanal = datos.horasSemanales * datos.semanasDelMes;
        const horasDiario = datos.horasJornadaDiaria * datos.cantidadDiasLaborales;
        const diferencia = Math.abs(horasSemanal - horasDiario);
        
        let interpretacion = [];
        
        interpretacion.push(`ANÁLISIS EXHAUSTIVO DEL MÉTODO DE CÁLCULO SELECCIONADO`);
        interpretacion.push(SEPARADOR_SUBSECCION);
        interpretacion.push(``);
        
        if (esMetodoDiario) {
            interpretacion.push(`▶ MÉTODO SELECCIONADO: POR DÍA (Recomendado y estándar legal)`);
            interpretacion.push(``);
            interpretacion.push(`FUNDAMENTO TÉCNICO:`);
            interpretacion.push(`Este método calcula las horas multiplicando la jornada diaria por los días`);
            interpretacion.push(`laborales REALES del mes, descontando fines de semana Y feriados nacionales.`);
            interpretacion.push(``);
            interpretacion.push(`FÓRMULA APLICADA:`);
            interpretacion.push(`   Horas Adeudadas = Jornada Diaria × Días Laborales Efectivos`);
            interpretacion.push(`   Horas Adeudadas = ${datos.horasJornadaDiaria} h/día × ${datos.cantidadDiasLaborales} días`);
            interpretacion.push(`   Horas Adeudadas = ${formatearNumero(horasDiario)} horas`);
            interpretacion.push(``);
            interpretacion.push(`VENTAJAS DE ESTE MÉTODO:`);
            interpretacion.push(`  ✓ Es el estándar según la legislación laboral peruana`);
            interpretacion.push(`  ✓ Descuenta automáticamente los feriados nacionales`);
            interpretacion.push(`  ✓ Protege al trabajador de pagar horas de días no laborables`);
            interpretacion.push(`  ✓ Es más preciso al considerar las particularidades de cada mes`);
            interpretacion.push(`  ✓ Genera cálculos verificables y transparentes`);
            interpretacion.push(``);
            
            if (datos.cantidadFeriadosLaborales > 0) {
                interpretacion.push(`BENEFICIO CUANTIFICADO PARA EL TRABAJADOR:`);
                interpretacion.push(`Al usar el método por día en lugar del método por semana:`);
                interpretacion.push(`  • Método por semana generaría: ${formatearNumero(horasSemanal)} horas`);
                interpretacion.push(`  • Método por día genera: ${formatearNumero(horasDiario)} horas`);
                interpretacion.push(`  • AHORRO PARA EL TRABAJADOR: ${formatearNumero(diferencia)} horas`);
                interpretacion.push(``);
                interpretacion.push(`Este ahorro equivale a ${formatearNumero(diferencia * 60)} minutos, o aproximadamente`);
                interpretacion.push(`${formatearNumero(diferencia / datos.horasJornadaDiaria)} día(s) completo(s) de trabajo.`);
            }
        } else {
            interpretacion.push(`▶ MÉTODO SELECCIONADO: POR SEMANA (Alternativo)`);
            interpretacion.push(``);
            interpretacion.push(`FUNDAMENTO TÉCNICO:`);
            interpretacion.push(`Este método calcula las horas multiplicando la jornada semanal por el número`);
            interpretacion.push(`de semanas calendario del mes. NO descuenta feriados nacionales.`);
            interpretacion.push(``);
            interpretacion.push(`FÓRMULA APLICADA:`);
            interpretacion.push(`   Horas Adeudadas = Jornada Semanal × Semanas del Mes`);
            interpretacion.push(`   Horas Adeudadas = ${datos.horasSemanales} h/semana × ${datos.semanasDelMes} semanas`);
            interpretacion.push(`   Horas Adeudadas = ${formatearNumero(horasSemanal)} horas`);
            interpretacion.push(``);
            interpretacion.push(`⚠️  ADVERTENCIA IMPORTANTE:`);
            interpretacion.push(`Este método puede NO ser el más favorable para el trabajador porque:`);
            interpretacion.push(`  ✗ NO descuenta los feriados nacionales`);
            interpretacion.push(`  ✗ Puede exigir más horas de las que corresponden legalmente`);
            interpretacion.push(`  ✗ No considera las particularidades de cada mes`);
            interpretacion.push(``);
            interpretacion.push(`COMPARATIVA DE IMPACTO:`);
            interpretacion.push(`  • Método por día generaría: ${formatearNumero(horasDiario)} horas`);
            interpretacion.push(`  • Método por semana genera: ${formatearNumero(horasSemanal)} horas`);
            interpretacion.push(`  • DIFERENCIA: ${formatearNumero(diferencia)} horas ADICIONALES que se exigen`);
            interpretacion.push(``);
            interpretacion.push(`RECOMENDACIÓN:`);
            interpretacion.push(`Se sugiere considerar el cambio al método por día para futuros cálculos,`);
            interpretacion.push(`especialmente si el acuerdo laboral se basa en horas diarias.`);
        }
        
        return interpretacion.join('\n');
    }

    function generarInterpretacionFeriados(datos) {
        let interpretacion = [];
        
        interpretacion.push(`ANÁLISIS DETALLADO DE FERIADOS Y SU IMPACTO EN EL CÁLCULO`);
        interpretacion.push(SEPARADOR_SUBSECCION);
        interpretacion.push(``);
        
        interpretacion.push(`MARCO LEGAL:`);
        interpretacion.push(`Los feriados nacionales en Perú están establecidos por el Decreto Legislativo`);
        interpretacion.push(`N° 713 y sus modificatorias. Estos días son de DESCANSO OBLIGATORIO Y`);
        interpretacion.push(`REMUNERADO, lo que significa que:`);
        interpretacion.push(``);
        interpretacion.push(`  1. El empleador DEBE pagar el salario completo aunque no se trabaje`);
        interpretacion.push(`  2. El trabajador NO tiene obligación legal de laborar`);
        interpretacion.push(`  3. Si se trabaja en feriado, corresponde pago adicional (triple)`);
        interpretacion.push(`  4. NO corresponde "devolver" o "recuperar" horas de feriados`);
        interpretacion.push(``);
        
        if (datos.cantidadFeriadosLaborales > 0) {
            interpretacion.push(`FERIADOS IDENTIFICADOS EN ${datos.mesNoAsistido.toUpperCase()} ${datos.ano || 2025}:`);
            interpretacion.push(``);
            
            datos.feriadosLaborales.forEach((f, index) => {
                interpretacion.push(`  ${index + 1}. ${f.numeroDia} de ${datos.mesNoAsistido} (${f.diaSemana})`);
                interpretacion.push(`     Motivo: ${f.nombreFeriado}`);
                interpretacion.push(`     Horas que NO se deben devolver: ${datos.horasJornadaDiaria} horas`);
                interpretacion.push(``);
            });
            
            interpretacion.push(`CÁLCULO DEL DESCUENTO POR FERIADOS:`);
            interpretacion.push(``);
            interpretacion.push(`  Fórmula: Horas Descontadas = N° Feriados × Jornada Diaria`);
            interpretacion.push(`  Cálculo: ${datos.cantidadFeriadosLaborales} feriado(s) × ${datos.horasJornadaDiaria} h/día`);
            interpretacion.push(`  Resultado: ${datos.explicacionMetodo.horasDescontadasPorFeriados} horas DESCONTADAS`);
            interpretacion.push(``);
            interpretacion.push(`IMPACTO ECONÓMICO ESTIMADO:`);
            const valorHoraEstimado = 10; // Valor referencial
            interpretacion.push(`  Si se asume un valor referencial de S/ ${valorHoraEstimado}.00 por hora:`);
            interpretacion.push(`  Ahorro = ${datos.explicacionMetodo.horasDescontadasPorFeriados} h × S/ ${valorHoraEstimado}.00 = S/ ${datos.explicacionMetodo.horasDescontadasPorFeriados * valorHoraEstimado}.00`);
            interpretacion.push(``);
            interpretacion.push(`CONCLUSIÓN:`);
            interpretacion.push(`El trabajador legítimamente NO debe devolver ${datos.explicacionMetodo.horasDescontadasPorFeriados} horas`);
            interpretacion.push(`correspondientes a los feriados, ya que por ley no estaba obligado a laborar`);
            interpretacion.push(`esos días. Exigir la devolución de estas horas constituiría una vulneración`);
            interpretacion.push(`de los derechos laborales establecidos en la legislación peruana.`);
        } else {
            interpretacion.push(`SITUACIÓN EN ${datos.mesNoAsistido.toUpperCase()} ${datos.ano || 2025}:`);
            interpretacion.push(``);
            interpretacion.push(`No se identificaron feriados que caigan en días de semana (lunes a viernes)`);
            interpretacion.push(`durante este mes. Por lo tanto:`);
            interpretacion.push(``);
            interpretacion.push(`  • No hay descuento por concepto de feriados`);
            interpretacion.push(`  • Todos los días de lunes a viernes son laborables`);
            interpretacion.push(`  • El cálculo considera ${datos.cantidadDiasLaborales} días laborales completos`);
            interpretacion.push(``);
            interpretacion.push(`NOTA: Los feriados que caen en fin de semana (sábado o domingo) no afectan`);
            interpretacion.push(`el cálculo porque esos días ya están excluidos por ser no laborables.`);
        }
        
        return interpretacion.join('\n');
    }

    function generarAnalisisProgreso(balance, datosAdeudadas, datosDevueltas, minutosExtraFavor, minutosRecuperacion) {
        let analisis = [];
        
        analisis.push(`ANÁLISIS DETALLADO DEL PROGRESO DE RECUPERACIÓN`);
        analisis.push(SEPARADOR_SUBSECCION);
        analisis.push(``);
        
        const porcentaje = balance.porcentajeCompletado;
        const diasTranscurridos = datosDevueltas.cantidadDiasLaborales;
        const ritmoActual = diasTranscurridos > 0 ? datosDevueltas.totalMinutosDevueltos / diasTranscurridos : 0;
        
        analisis.push(`MÉTRICAS DE PROGRESO:`);
        analisis.push(``);
        analisis.push(`  ┌─────────────────────────────────────────────────────────────┐`);
        analisis.push(`  │  Porcentaje completado:     ${formatearNumero(porcentaje).padStart(6)}%                        │`);
        analisis.push(`  │  Días laborales trabajados: ${diasTranscurridos.toString().padStart(6)} días                       │`);
        analisis.push(`  │  Ritmo promedio diario:     ${formatearNumero(ritmoActual).padStart(6)} min/día                    │`);
        analisis.push(`  │  Minutos devueltos totales: ${datosDevueltas.totalMinutosDevueltos.toString().padStart(6)} minutos                    │`);
        analisis.push(`  └─────────────────────────────────────────────────────────────┘`);
        analisis.push(``);
        
        // Análisis por etapas
        analisis.push(`EVALUACIÓN POR ETAPAS:`);
        analisis.push(``);
        
        if (porcentaje < 25) {
            analisis.push(`  ▶ ETAPA INICIAL (0-25%): ${formatearNumero(porcentaje)}%`);
            analisis.push(`    Estado: En fase temprana de recuperación`);
            analisis.push(`    Observación: El proceso recién comienza. Es importante mantener`);
            analisis.push(`    la constancia en el tiempo adicional diario.`);
        } else if (porcentaje < 50) {
            analisis.push(`  ▶ ETAPA DE DESARROLLO (25-50%): ${formatearNumero(porcentaje)}%`);
            analisis.push(`    Estado: Avance significativo en progreso`);
            analisis.push(`    Observación: Se ha superado el primer cuarto. El ritmo actual`);
            analisis.push(`    ${balance.estado === 'en_progreso_alcanzable' ? 'es adecuado' : 'necesita ajuste'} para completar a tiempo.`);
        } else if (porcentaje < 75) {
            analisis.push(`  ▶ ETAPA AVANZADA (50-75%): ${formatearNumero(porcentaje)}%`);
            analisis.push(`    Estado: Más de la mitad completada`);
            analisis.push(`    Observación: Buen progreso. Se recomienda mantener el ritmo`);
            analisis.push(`    actual para asegurar la finalización.`);
        } else if (porcentaje < 100) {
            analisis.push(`  ▶ ETAPA FINAL (75-99%): ${formatearNumero(porcentaje)}%`);
            analisis.push(`    Estado: Próximo a completar`);
            analisis.push(`    Observación: La meta está cerca. Continuar con el tiempo`);
            analisis.push(`    adicional establecido.`);
        } else {
            analisis.push(`  ▶ COMPLETADO (100%+): ${formatearNumero(porcentaje)}%`);
            analisis.push(`    Estado: Recuperación finalizada exitosamente`);
            if (balance.minutosPendientes < 0) {
                analisis.push(`    Observación: Se han devuelto todas las horas más un excedente`);
                analisis.push(`    de ${minutosAHHMM(Math.abs(balance.minutosPendientes))} a favor del trabajador.`);
            }
        }
        
        analisis.push(``);
        
        // Proyecciones
        if (balance.minutosPendientes > 0) {
            analisis.push(`PROYECCIONES Y ESCENARIOS:`);
            analisis.push(``);
            
            // Escenario actual
            analisis.push(`  Escenario 1 - Ritmo Actual (${minutosRecuperacion} min/día):`);
            analisis.push(`    • Días necesarios: ${balance.diasNecesariosParaCompletar} días laborales`);
            analisis.push(`    • Fecha estimada: ${balance.fechaEstimadaFormateada}`);
            analisis.push(`    • Viabilidad: ${balance.estado === 'en_progreso_alcanzable' ? 'ALCANZABLE ✓' : 'INSUFICIENTE ✗'}`);
            analisis.push(``);
            
            // Escenario optimizado
            if (balance.diasLaboralesRestantesAno > 0) {
                const minutosNecesariosPorDia = Math.ceil(balance.minutosPendientes / balance.diasLaboralesRestantesAno);
                analisis.push(`  Escenario 2 - Ritmo Optimizado para fin de año:`);
                analisis.push(`    • Días disponibles: ${balance.diasLaboralesRestantesAno} días laborales`);
                analisis.push(`    • Tiempo requerido: ${minutosNecesariosPorDia} min/día`);
                analisis.push(`    • Incremento necesario: ${minutosNecesariosPorDia > minutosRecuperacion ? '+' + (minutosNecesariosPorDia - minutosRecuperacion) + ' min/día' : 'No requerido'}`);
                analisis.push(``);
            }
            
            // Escenario acelerado
            const minutosAcelerado = minutosRecuperacion * 1.5;
            const diasAcelerado = Math.ceil(balance.minutosPendientes / minutosAcelerado);
            analisis.push(`  Escenario 3 - Ritmo Acelerado (${minutosAcelerado} min/día):`);
            analisis.push(`    • Días necesarios: ${diasAcelerado} días laborales`);
            analisis.push(`    • Reducción de tiempo: ${balance.diasNecesariosParaCompletar - diasAcelerado} días menos`);
        }
        
        return analisis.join('\n');
    }

    function generarInterpretacionBalance(balance, datosAdeudadas, datosDevueltas, minutosExtraFavor) {
        let interpretacion = [];
        
        interpretacion.push(`INTERPRETACIÓN INTEGRAL DEL BALANCE FINAL`);
        interpretacion.push(SEPARADOR_SUBSECCION);
        interpretacion.push(``);
        
        const porcentaje = balance.porcentajeCompletado;
        
        if (balance.estado === 'completado') {
            interpretacion.push(`═══════════════════════════════════════════════════════════════`);
            interpretacion.push(`   ✓ ✓ ✓   DEVOLUCIÓN DE HORAS COMPLETADA EXITOSAMENTE   ✓ ✓ ✓`);
            interpretacion.push(`═══════════════════════════════════════════════════════════════`);
            interpretacion.push(``);
            
            if (balance.minutosPendientes === 0) {
                interpretacion.push(`SITUACIÓN: BALANCE EXACTO`);
                interpretacion.push(``);
                interpretacion.push(`El trabajador ha devuelto EXACTAMENTE todas las horas adeudadas.`);
                interpretacion.push(`No existe deuda pendiente ni horas a favor.`);
                interpretacion.push(``);
                interpretacion.push(`DETALLE DEL CUMPLIMIENTO:`);
                interpretacion.push(`  • Horas que se debían: ${datosAdeudadas.totalHorasFormato}`);
                interpretacion.push(`  • Horas devueltas: ${datosDevueltas.totalHorasFormato}`);
                interpretacion.push(`  • Balance: 0:00 (exacto)`);
            } else {
                const horasAFavor = Math.abs(balance.minutosPendientes) / 60;
                interpretacion.push(`SITUACIÓN: EXCEDENTE A FAVOR DEL TRABAJADOR`);
                interpretacion.push(``);
                interpretacion.push(`El trabajador ha devuelto TODAS las horas adeudadas y además`);
                interpretacion.push(`ha generado un excedente de tiempo a su favor.`);
                interpretacion.push(``);
                interpretacion.push(`DETALLE DEL EXCEDENTE:`);
                interpretacion.push(`  • Horas que se debían: ${datosAdeudadas.totalHorasFormato}`);
                interpretacion.push(`  • Horas devueltas: ${minutosAHHMM(balance.totalMinutosAFavor)}`);
                interpretacion.push(`  • Excedente a favor: ${minutosAHHMM(Math.abs(balance.minutosPendientes))} (${formatearNumero(horasAFavor)} horas)`);
                interpretacion.push(``);
                interpretacion.push(`OPCIONES PARA EL EXCEDENTE:`);
                interpretacion.push(`  1. Acumular como banco de horas para futuras compensaciones`);
                interpretacion.push(`  2. Convertir en tiempo libre compensatorio (permiso)`);
                interpretacion.push(`  3. Solicitar pago como horas extraordinarias`);
                interpretacion.push(`  4. Aplicar a reducción de jornada en días específicos`);
            }
            
            interpretacion.push(``);
            interpretacion.push(`RECOMENDACIONES POST-COMPLETACIÓN:`);
            interpretacion.push(`  • Emitir constancia o documento de cierre firmado por ambas partes`);
            interpretacion.push(`  • Archivar toda la documentación de respaldo`);
            interpretacion.push(`  • Actualizar registros de recursos humanos`);
            
        } else if (balance.estado === 'en_progreso_alcanzable') {
            interpretacion.push(`═══════════════════════════════════════════════════════════════`);
            interpretacion.push(`        ⏳  DEVOLUCIÓN EN PROGRESO - META ALCANZABLE  ⏳`);
            interpretacion.push(`═══════════════════════════════════════════════════════════════`);
            interpretacion.push(``);
            interpretacion.push(`SITUACIÓN ACTUAL:`);
            interpretacion.push(`El trabajador está cumpliendo con el proceso de recuperación de horas`);
            interpretacion.push(`y el ritmo actual ES SUFICIENTE para completar antes de fin de año.`);
            interpretacion.push(``);
            interpretacion.push(`MÉTRICAS CLAVE:`);
            interpretacion.push(`  • Progreso actual: ${formatearNumero(porcentaje)}%`);
            interpretacion.push(`  • Horas pendientes: ${balance.horasPendientesFormato}`);
            interpretacion.push(`  • Días para completar: ${balance.diasNecesariosParaCompletar} días laborales`);
            interpretacion.push(`  • Fecha proyectada: ${balance.fechaEstimadaFormateada}`);
            interpretacion.push(`  • Margen disponible: ${balance.diasLaboralesRestantesAno - balance.diasNecesariosParaCompletar} días de holgura`);
            interpretacion.push(``);
            interpretacion.push(`EVALUACIÓN: FAVORABLE`);
            interpretacion.push(`El proceso de recuperación avanza según lo esperado. Se recomienda`);
            interpretacion.push(`mantener el ritmo actual de devolución.`);
            
        } else {
            interpretacion.push(`═══════════════════════════════════════════════════════════════`);
            interpretacion.push(`    ⚠️  ALERTA: TIEMPO INSUFICIENTE - ACCIÓN REQUERIDA  ⚠️`);
            interpretacion.push(`═══════════════════════════════════════════════════════════════`);
            interpretacion.push(``);
            interpretacion.push(`SITUACIÓN CRÍTICA:`);
            interpretacion.push(`El ritmo actual de devolución NO ES SUFICIENTE para completar la`);
            interpretacion.push(`recuperación de horas dentro del año ${datosAdeudadas.ano || 2025}.`);
            interpretacion.push(``);
            interpretacion.push(`ANÁLISIS DEL DÉFICIT:`);
            interpretacion.push(`  • Horas pendientes: ${balance.horasPendientesFormato}`);
            interpretacion.push(`  • Días necesarios al ritmo actual: ${balance.diasNecesariosParaCompletar} días`);
            interpretacion.push(`  • Días laborales disponibles: ${balance.diasLaboralesRestantesAno} días`);
            interpretacion.push(`  • DÉFICIT: ${balance.diasNecesariosParaCompletar - balance.diasLaboralesRestantesAno} días`);
            interpretacion.push(``);
            
            const minutosNecesarios = Math.ceil(balance.minutosPendientes / Math.max(1, balance.diasLaboralesRestantesAno));
            interpretacion.push(`ACCIONES CORRECTIVAS RECOMENDADAS:`);
            interpretacion.push(``);
            interpretacion.push(`  Opción 1: AUMENTAR TIEMPO DIARIO`);
            interpretacion.push(`    Incrementar de ${datosDevueltas.minutosRecuperacionDiaria || 30} a ${minutosNecesarios} minutos/día`);
            interpretacion.push(`    para poder completar en los ${balance.diasLaboralesRestantesAno} días restantes.`);
            interpretacion.push(``);
            interpretacion.push(`  Opción 2: NEGOCIAR EXTENSIÓN DE PLAZO`);
            interpretacion.push(`    Solicitar extender el período de recuperación más allá de fin de año.`);
            interpretacion.push(``);
            interpretacion.push(`  Opción 3: COMPENSACIÓN PARCIAL`);
            interpretacion.push(`    Negociar el pago monetario de las horas que no se alcancen a devolver.`);
            interpretacion.push(``);
            interpretacion.push(`  Opción 4: JORNADAS ESPECIALES`);
            interpretacion.push(`    Acordar días específicos con jornada extendida para recuperar más rápido.`);
        }
        
        return interpretacion.join('\n');
    }

    function generarInterpretacionGeneral(datosAdeudadas, datosDevueltas, balance, minutosExtraFavor) {
        let interpretacion = [];
        
        interpretacion.push(`RESUMEN EJECUTIVO E INTERPRETACIÓN GENERAL DEL CASO`);
        interpretacion.push(SEPARADOR_SUBSECCION);
        interpretacion.push(``);
        interpretacion.push(`CONTEXTO DE LA SITUACIÓN:`);
        interpretacion.push(`Este informe documenta y analiza la situación de recuperación de horas`);
        interpretacion.push(`laborales correspondientes al mes de ${datosAdeudadas.mesNoAsistido} del año ${datosAdeudadas.ano || 2025},`);
        interpretacion.push(`período durante el cual el trabajador no asistió a laborar y que ahora`);
        interpretacion.push(`debe compensar mediante tiempo adicional de trabajo.`);
        interpretacion.push(``);
        interpretacion.push(`DATOS FUNDAMENTALES DEL ANÁLISIS:`);
        interpretacion.push(``);
        interpretacion.push(`  1. DEUDA ORIGINAL CALCULADA`);
        interpretacion.push(`     ─────────────────────────────────────────────────────────────`);
        interpretacion.push(`     El mes de ${datosAdeudadas.mesNoAsistido} tuvo las siguientes características:`);
        interpretacion.push(`     • Total días calendario: ${datosAdeudadas.totalDiasMes} días`);
        interpretacion.push(`     • Fines de semana: ${datosAdeudadas.cantidadDiasFinSemana} días (excluidos)`);
        interpretacion.push(`     • Feriados en días L-V: ${datosAdeudadas.cantidadFeriadosLaborales} día(s) (${datosAdeudadas.metodoCalculo === 'diario' ? 'descontados' : 'no descontados'})`);
        interpretacion.push(`     • Días laborales efectivos: ${datosAdeudadas.cantidadDiasLaborales} días`);
        interpretacion.push(`     • Jornada diaria: ${datosAdeudadas.horasJornadaDiaria} horas`);
        interpretacion.push(`     • TOTAL ADEUDADO: ${datosAdeudadas.totalHorasFormato} (${datosAdeudadas.totalMinutosAdeudados} minutos)`);
        interpretacion.push(``);
        interpretacion.push(`  2. ESFUERZO DE RECUPERACIÓN REALIZADO`);
        interpretacion.push(`     ─────────────────────────────────────────────────────────────`);
        interpretacion.push(`     Período de devolución: ${datosDevueltas.fechaInicioFormateada} al ${datosDevueltas.fechaCorteFormateada}`);
        interpretacion.push(`     • Días laborales con tiempo adicional: ${datosDevueltas.cantidadDiasLaborales} días`);
        interpretacion.push(`     • Tiempo adicional por día: ${datosDevueltas.minutosRecuperacionDiaria || 30} minutos`);
        interpretacion.push(`     • TOTAL DEVUELTO: ${datosDevueltas.totalHorasFormato} (${datosDevueltas.totalMinutosDevueltos} minutos)`);
        
        if (minutosExtraFavor > 0) {
            interpretacion.push(``);
            interpretacion.push(`  3. CRÉDITO PREVIO (HORAS EXTRA A FAVOR)`);
            interpretacion.push(`     ─────────────────────────────────────────────────────────────`);
            interpretacion.push(`     El trabajador contaba con horas extra acumuladas previamente:`);
            interpretacion.push(`     • HORAS EXTRA A FAVOR: ${minutosAHHMM(minutosExtraFavor)} (${minutosExtraFavor} minutos)`);
            interpretacion.push(`     Estas horas se descuentan de la deuda pendiente.`);
        }
        
        interpretacion.push(``);
        interpretacion.push(`  ${minutosExtraFavor > 0 ? '4' : '3'}. ESTADO ACTUAL DEL BALANCE`);
        interpretacion.push(`     ─────────────────────────────────────────────────────────────`);
        
        if (balance.estado === 'completado') {
            interpretacion.push(`     ✓ La recuperación de horas está COMPLETADA.`);
            if (balance.minutosPendientes < 0) {
                interpretacion.push(`     El trabajador tiene ${minutosAHHMM(Math.abs(balance.minutosPendientes))} a su favor.`);
            }
        } else {
            interpretacion.push(`     ⏳ La recuperación está EN PROGRESO.`);
            interpretacion.push(`     • Pendiente: ${balance.horasPendientesFormato}`);
            interpretacion.push(`     • Avance: ${formatearNumero(balance.porcentajeCompletado)}%`);
        }
        
        return interpretacion.join('\n');
    }

    function generarRecomendaciones(balance, datosAdeudadas, datosDevueltas) {
        let recomendaciones = [];
        
        recomendaciones.push(`RECOMENDACIONES DETALLADAS Y CONSIDERACIONES FINALES`);
        recomendaciones.push(SEPARADOR_SUBSECCION);
        recomendaciones.push(``);
        
        recomendaciones.push(`1. SOBRE EL MÉTODO DE CÁLCULO UTILIZADO`);
        recomendaciones.push(`   ─────────────────────────────────────────────────────────────`);
        if (datosAdeudadas.metodoCalculo === 'diario') {
            recomendaciones.push(`   ✓ Se está utilizando el método por día (CORRECTO)`);
            recomendaciones.push(`   Este método es el estándar legal y protege adecuadamente los`);
            recomendaciones.push(`   derechos del trabajador al descontar los feriados nacionales.`);
            recomendaciones.push(`   RECOMENDACIÓN: Mantener este criterio en situaciones futuras.`);
        } else {
            recomendaciones.push(`   ⚠ Se está utilizando el método por semana`);
            recomendaciones.push(`   Este método puede resultar en más horas de las que corresponden.`);
            recomendaciones.push(`   RECOMENDACIÓN: Evaluar el cambio al método por día, que es el`);
            recomendaciones.push(`   estándar legal y más favorable para el trabajador.`);
        }
        recomendaciones.push(``);
        
        recomendaciones.push(`2. SOBRE LA DOCUMENTACIÓN Y RESPALDO`);
        recomendaciones.push(`   ─────────────────────────────────────────────────────────────`);
        recomendaciones.push(`   • Conservar este informe como documento oficial de los cálculos`);
        recomendaciones.push(`   • Mantener registro diario de asistencia firmado por ambas partes`);
        recomendaciones.push(`   • Guardar copias de cualquier comunicación relacionada`);
        recomendaciones.push(`   • Documentar formalmente cualquier modificación al acuerdo`);
        recomendaciones.push(`   • Solicitar constancias periódicas del avance de recuperación`);
        recomendaciones.push(``);
        
        recomendaciones.push(`3. SOBRE LOS FERIADOS NACIONALES`);
        recomendaciones.push(`   ─────────────────────────────────────────────────────────────`);
        recomendaciones.push(`   • Los feriados son días de descanso obligatorio y remunerado`);
        recomendaciones.push(`   • NO corresponde exigir la devolución de horas de feriados`);
        recomendaciones.push(`   • Verificar el calendario oficial al inicio de cada año`);
        recomendaciones.push(`   • Considerar feriados decretados durante el año (extraordinarios)`);
        recomendaciones.push(``);
        
        recomendaciones.push(`4. SOBRE EL PROCESO DE RECUPERACIÓN`);
        recomendaciones.push(`   ─────────────────────────────────────────────────────────────`);
        if (balance.estado !== 'completado') {
            recomendaciones.push(`   • Mantener constancia en el tiempo adicional diario acordado`);
            recomendaciones.push(`   • Realizar seguimiento mensual del avance`);
            recomendaciones.push(`   • Comunicar inmediatamente cualquier imprevisto`);
            recomendaciones.push(`   • Solicitar actualización del informe periódicamente`);
            
            if (balance.estado === 'en_progreso_insuficiente') {
                recomendaciones.push(`   • URGENTE: Negociar ajuste al tiempo diario o extensión de plazo`);
            }
        } else {
            recomendaciones.push(`   • Emitir documento formal de cierre/finiquito`);
            recomendaciones.push(`   • Archivar toda la documentación del proceso`);
            recomendaciones.push(`   • Actualizar registros de recursos humanos`);
            if (balance.minutosPendientes < 0) {
                recomendaciones.push(`   • Definir tratamiento de las horas excedentes a favor`);
            }
        }
        recomendaciones.push(``);
        
        recomendaciones.push(`5. CONSIDERACIONES LEGALES`);
        recomendaciones.push(`   ─────────────────────────────────────────────────────────────`);
        recomendaciones.push(`   • Este informe tiene carácter informativo y de respaldo`);
        recomendaciones.push(`   • Los cálculos se basan en la legislación laboral peruana`);
        recomendaciones.push(`   • En caso de controversia, consultar con un abogado laboralista`);
        recomendaciones.push(`   • Conservar evidencia de todas las horas trabajadas adicionales`);
        
        return recomendaciones.join('\n');
    }

    function generarConclusiones(balance, datosAdeudadas, datosDevueltas) {
        let conclusiones = [];
        
        conclusiones.push(`CONCLUSIONES DEL ANÁLISIS`);
        conclusiones.push(SEPARADOR_SUBSECCION);
        conclusiones.push(``);
        
        conclusiones.push(`Tras el análisis exhaustivo de la documentación y los cálculos realizados,`);
        conclusiones.push(`se establecen las siguientes conclusiones:`);
        conclusiones.push(``);
        
        conclusiones.push(`PRIMERA: SOBRE LA DEUDA CALCULADA`);
        conclusiones.push(`La deuda de horas por el mes de ${datosAdeudadas.mesNoAsistido} asciende a ${datosAdeudadas.totalHorasFormato},`);
        conclusiones.push(`calculada mediante el método ${datosAdeudadas.metodoCalculo === 'diario' ? 'por día (estándar legal)' : 'por semana'}.`);
        if (datosAdeudadas.metodoCalculo === 'diario' && datosAdeudadas.cantidadFeriadosLaborales > 0) {
            conclusiones.push(`Se han descontado ${datosAdeudadas.cantidadFeriadosLaborales} feriado(s) conforme a ley.`);
        }
        conclusiones.push(``);
        
        conclusiones.push(`SEGUNDA: SOBRE EL PROGRESO DE RECUPERACIÓN`);
        if (balance.estado === 'completado') {
            conclusiones.push(`El proceso de recuperación ha sido COMPLETADO satisfactoriamente.`);
            if (balance.minutosPendientes < 0) {
                conclusiones.push(`Existe un excedente de ${minutosAHHMM(Math.abs(balance.minutosPendientes))} a favor del trabajador.`);
            }
        } else {
            conclusiones.push(`El proceso de recuperación se encuentra al ${formatearNumero(balance.porcentajeCompletado)}% de avance.`);
            conclusiones.push(`Restan ${balance.horasPendientesFormato} por devolver.`);
        }
        conclusiones.push(``);
        
        conclusiones.push(`TERCERA: SOBRE LA VIABILIDAD`);
        if (balance.estado === 'completado') {
            conclusiones.push(`No aplica - la recuperación ya fue completada.`);
        } else if (balance.estado === 'en_progreso_alcanzable') {
            conclusiones.push(`El ritmo actual de recuperación ES SUFICIENTE para completar el proceso`);
            conclusiones.push(`antes de la fecha límite (fin de año ${datosAdeudadas.ano || 2025}).`);
        } else {
            conclusiones.push(`El ritmo actual NO ES SUFICIENTE. Se requiere acción correctiva:`);
            conclusiones.push(`aumentar el tiempo diario, extender el plazo, o negociar alternativas.`);
        }
        conclusiones.push(``);
        
        conclusiones.push(`CUARTA: VALIDEZ DEL INFORME`);
        conclusiones.push(`Este informe refleja fielmente los cálculos realizados con base en los`);
        conclusiones.push(`parámetros proporcionados y la legislación laboral peruana vigente.`);
        conclusiones.push(`Los datos son verificables y reproducibles.`);
        
        return conclusiones.join('\n');
    }

    // ========================================================================
    // GENERACIÓN DE TEXTO PLANO
    // ========================================================================

    function generarTextoPlano() {
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
        texto.push(generarInterpretacionGeneral(datosAdeudadas, datosDevueltas, balance, minutosExtraFavor));
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
        
        // Análisis de progreso
        texto.push(``);
        texto.push(generarAnalisisProgreso(balance, datosAdeudadas, datosDevueltas, minutosExtraFavor, minutosRecuperacion));
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
        texto.push(generarRecomendaciones(balance, datosAdeudadas, datosDevueltas));
        texto.push(``);
        
        // ====== CONCLUSIONES ======
        texto.push(SEPARADOR_SECCION);
        texto.push(`SECCIÓN 8: CONCLUSIONES`);
        texto.push(SEPARADOR_SECCION);
        texto.push(``);
        texto.push(generarConclusiones(balance, datosAdeudadas, datosDevueltas));
        texto.push(``);
        
        // ====== ANEXOS: TABLAS DETALLADAS ======
        texto.push(SEPARADOR_SECCION);
        texto.push(`SECCIÓN 9: ANEXO - DETALLE DE DÍAS LABORALES DEL MES NO ASISTIDO`);
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
        texto.push(`SECCIÓN 10: VALIDACIÓN Y CONFORMIDAD`);
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
    // GENERACIÓN DE PDF - VERSIÓN MEJORADA
    // ========================================================================

    async function generarPDF() {
        if (!window.datosInforme) {
            alert('Error: No hay datos de informe disponibles. Por favor, genere primero el informe.');
            return;
        }

        if (typeof window.jspdf === 'undefined') {
            alert('Error: La biblioteca jsPDF no está cargada. Por favor, recargue la página.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const { datosAdeudadas, datosDevueltas, balance, minutosExtraFavor, minutosRecuperacion } = window.datosInforme;
        
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
        
        // Altura reservada para pie de página
        const footerHeight = 15;
        const maxY = pageHeight - margin - footerHeight;

        // ================================================================
        // FUNCIONES AUXILIARES PARA EL PDF
        // ================================================================
        
        function addPage() {
            doc.addPage();
            y = margin;
        }

        function checkPageBreak(neededHeight = 10) {
            if (y + neededHeight > maxY) {
                addPage();
                return true;
            }
            return false;
        }

        function addTitle(text, size = 16) {
            checkPageBreak(15);
            doc.setFontSize(size);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(26, 54, 93);
            doc.text(text, pageWidth / 2, y, { align: 'center' });
            y += size * 0.5;
        }

        function addSubtitle(text, size = 11) {
            checkPageBreak(12);
            doc.setFontSize(size);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(44, 82, 130);
            doc.text(text, margin, y);
            y += 6;
        }

        function addParagraph(text, size = 9, indent = 0) {
            doc.setFontSize(size);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(45, 55, 72);
            const lines = doc.splitTextToSize(text, contentWidth - indent);
            lines.forEach(line => {
                checkPageBreak(5);
                doc.text(line, margin + indent, y);
                y += 4;
            });
            y += 1;
        }

        function addKeyValue(key, value, keyWidth = 55) {
            checkPageBreak(6);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(45, 55, 72);
            doc.text(key + ':', margin, y);
            doc.setFont('helvetica', 'normal');
            doc.text(String(value), margin + keyWidth, y);
            y += 5;
        }

        function addSeparator() {
            checkPageBreak(3);
            doc.setDrawColor(200, 200, 200);
            doc.line(margin, y, pageWidth - margin, y);
            y += 3;
        }

        function addSectionHeader(number, title) {
            checkPageBreak(12);
            y += 3;
            doc.setFillColor(26, 54, 93);
            doc.rect(margin, y - 4, contentWidth, 7, 'F');
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text(`${number}. ${title}`, margin + 3, y);
            y += 6;
        }

        function addHighlightBox(text, type = 'info') {
            const colors = {
                info: { bg: [235, 248, 255], border: [43, 108, 176] },
                success: { bg: [240, 255, 244], border: [39, 103, 73] },
                warning: { bg: [255, 250, 240], border: [183, 121, 31] },
                error: { bg: [255, 245, 245], border: [197, 48, 48] }
            };
            
            const color = colors[type] || colors.info;
            
            doc.setFontSize(8);
            const lines = doc.splitTextToSize(text, contentWidth - 8);
            const boxHeight = Math.max(lines.length * 4 + 6, 12);
            
            checkPageBreak(boxHeight + 4);
            
            doc.setFillColor(...color.bg);
            doc.setDrawColor(...color.border);
            doc.setLineWidth(0.5);
            doc.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, 'FD');
            
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...color.border);
            
            let textY = y + 4;
            lines.forEach(line => {
                doc.text(line, margin + 4, textY);
                textY += 4;
            });
            
            y += boxHeight + 3;
        }

        function addSimpleTable(headers, rows, colWidths) {
            const rowHeight = 5;
            const headerHeight = 6;
            const totalWidth = colWidths.reduce((a, b) => a + b, 0);
            const startX = margin + (contentWidth - totalWidth) / 2;
            
            // Verificar espacio para header + al menos 3 filas
            checkPageBreak(headerHeight + rowHeight * 3);
            
            // Header
            doc.setFillColor(44, 82, 130);
            doc.rect(startX, y, totalWidth, headerHeight, 'F');
            doc.setFontSize(7);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            
            let xPos = startX + 2;
            headers.forEach((header, i) => {
                doc.text(header, xPos, y + 4);
                xPos += colWidths[i];
            });
            y += headerHeight + 1; // Añadir espacio entre header y primera fila
            
            // Filas
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(45, 55, 72);
            
            rows.forEach((row, rowIndex) => {
                checkPageBreak(rowHeight + 2);
                
                // Fondo alternado
                if (rowIndex % 2 === 0) {
                    doc.setFillColor(247, 250, 252);
                    doc.rect(startX, y - 1, totalWidth, rowHeight, 'F');
                }
                
                xPos = startX + 2;
                row.forEach((cell, i) => {
                    doc.text(String(cell), xPos, y + 2);
                    xPos += colWidths[i];
                });
                y += rowHeight;
            });
            
            y += 2;
        }

        // ================================================================
        // CONTENIDO DEL PDF
        // ================================================================

        // PORTADA / ENCABEZADO
        doc.setFillColor(26, 54, 93);
        doc.rect(0, 0, pageWidth, 40, 'F');
        
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('INFORME DE CÁLCULO DE JORNADA LABORAL', pageWidth / 2, 15, { align: 'center' });
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Recuperación de Horas No Laboradas — Año ${datosAdeudadas.ano || 2025}`, pageWidth / 2, 24, { align: 'center' });
        
        doc.setFontSize(8);
        doc.text(`Generado: ${obtenerFechaHoraActual()}`, pageWidth / 2, 32, { align: 'center' });
        doc.text(`Versión: ${METADATA.version}`, pageWidth / 2, 37, { align: 'center' });
        
        y = 50;

        // SECCIÓN 1: PARÁMETROS
        addSectionHeader('1', 'PARÁMETROS DE CÁLCULO');
        y += 2;
        addKeyValue('Método de cálculo', datosAdeudadas.metodoCalculo === 'diario' ? 'Por DÍA (recomendado)' : 'Por SEMANA');
        addKeyValue('Mes no asistido', `${datosAdeudadas.mesNoAsistido} ${datosAdeudadas.ano || 2025}`);
        addKeyValue('Jornada diaria', `${datosAdeudadas.horasJornadaDiaria} horas`);
        addKeyValue('Jornada semanal', `${datosAdeudadas.horasSemanales} horas`);
        addKeyValue('Período de devolución', `${datosDevueltas.fechaInicioFormateada} al ${datosDevueltas.fechaCorteFormateada}`);
        addKeyValue('Tiempo adicional/día', `${minutosRecuperacion} minutos`);
        if (minutosExtraFavor > 0) {
            addKeyValue('Horas extra a favor', `${minutosAHHMM(minutosExtraFavor)} (${formatearNumero(minutosExtraFavor/60)} h)`);
        }
        y += 3;
        
        // SECCIÓN 2: RESUMEN EJECUTIVO
        addSectionHeader('2', 'RESUMEN EJECUTIVO');
        y += 2;
        
        const resumenData = [
            ['Horas Adeudadas', datosAdeudadas.totalHorasFormato, `${formatearNumero(datosAdeudadas.totalHorasAdeudadas)} horas`],
            ['Horas Ya Devueltas', datosDevueltas.totalHorasFormato, `${formatearNumero(datosDevueltas.totalHorasDevueltas)} horas`]
        ];
        
        if (minutosExtraFavor > 0) {
            resumenData.push(['Horas Extra a Favor', minutosAHHMM(minutosExtraFavor), `${formatearNumero(minutosExtraFavor/60)} horas`]);
        }
        
        resumenData.push(
            ['Horas Pendientes', balance.horasPendientesFormato, `${formatearNumero(Math.abs(balance.horasPendientes))} horas`],
            ['Progreso', `${formatearNumero(balance.porcentajeCompletado)}%`, balance.estado === 'completado' ? 'COMPLETADO' : 'EN PROGRESO']
        );
        
        addSimpleTable(['Concepto', 'Valor', 'Equivalente'], resumenData, [55, 35, 45]);
        y += 2;

        // Estado actual
        const estadoText = balance.estado === 'completado' 
            ? '✓ DEVOLUCIÓN COMPLETADA - El trabajador ha cumplido con la recuperación de horas.' + 
              (balance.minutosPendientes < 0 ? ` Excedente a favor: ${minutosAHHMM(Math.abs(balance.minutosPendientes))}.` : '')
            : `⏳ EN PROGRESO - Faltan ${balance.horasPendientesFormato} por devolver. Avance: ${formatearNumero(balance.porcentajeCompletado)}%. Fecha estimada: ${balance.fechaEstimadaFormateada}.`;
        addHighlightBox(estadoText, balance.estado === 'completado' ? 'success' : 'warning');

        // SECCIÓN 3: INTERPRETACIÓN GENERAL
        addSectionHeader('3', 'INTERPRETACIÓN GENERAL DEL CASO');
        y += 2;
        addParagraph(`Este informe documenta la situación de recuperación de horas laborales del mes de ${datosAdeudadas.mesNoAsistido} ${datosAdeudadas.ano || 2025}, período durante el cual el trabajador no asistió a laborar.`);
        y += 2;
        
        addSubtitle('3.1 Deuda Original');
        addParagraph(`El mes tuvo ${datosAdeudadas.totalDiasMes} días calendario, de los cuales ${datosAdeudadas.cantidadDiasFinSemana} fueron fines de semana y ${datosAdeudadas.cantidadFeriadosLaborales} feriado(s) en días de semana. Esto resulta en ${datosAdeudadas.cantidadDiasLaborales} días laborales efectivos.`);
        addParagraph(`Con una jornada de ${datosAdeudadas.horasJornadaDiaria} horas diarias, la deuda total asciende a ${datosAdeudadas.totalHorasFormato} (${datosAdeudadas.totalMinutosAdeudados} minutos).`);
        y += 2;
        
        addSubtitle('3.2 Esfuerzo de Recuperación');
        addParagraph(`Desde el ${datosDevueltas.fechaInicioFormateada} hasta el ${datosDevueltas.fechaCorteFormateada}, se han trabajado ${datosDevueltas.cantidadDiasLaborales} días con tiempo adicional de ${minutosRecuperacion} minutos cada uno, acumulando ${datosDevueltas.totalHorasFormato} de horas devueltas.`);
        
        // SECCIÓN 4: ANÁLISIS DE FERIADOS (si aplica)
        if (datosAdeudadas.cantidadFeriadosLaborales > 0 && datosAdeudadas.metodoCalculo === 'diario') {
            addSectionHeader('4', 'IMPACTO DE FERIADOS EN EL CÁLCULO');
            y += 2;
            addParagraph(`En ${datosAdeudadas.mesNoAsistido} existe(n) ${datosAdeudadas.cantidadFeriadosLaborales} feriado(s) que caen en días de semana. Conforme a la legislación laboral peruana, estos días son de descanso obligatorio y remunerado, por lo que se han DESCONTADO del cálculo.`);
            y += 2;
            
            addSubtitle('Feriados Identificados:');
            datosAdeudadas.feriadosLaborales.forEach(f => {
                addParagraph(`• ${f.numeroDia} de ${datosAdeudadas.mesNoAsistido} (${f.diaSemana}): ${f.nombreFeriado}`, 9, 5);
            });
            y += 2;
            
            addHighlightBox(`BENEFICIO PARA EL TRABAJADOR: Se descuentan ${datosAdeudadas.explicacionMetodo.horasDescontadasPorFeriados} horas por feriados. El trabajador NO debe devolver estas horas porque por ley no estaba obligado a laborar esos días.`, 'success');
        }
        
        // SECCIÓN 5: CÁLCULOS DETALLADOS
        addSectionHeader('5', 'CÁLCULOS DETALLADOS');
        y += 2;
        
        addSubtitle('5.1 Cálculo de Horas Adeudadas');
        addParagraph(`Método utilizado: ${datosAdeudadas.metodoCalculo === 'diario' ? 'Por DÍA (estándar legal)' : 'Por SEMANA'}`);
        addParagraph(`Fórmula: ${datosAdeudadas.explicacionMetodo.formula}`);
        addParagraph(`Cálculo: ${datosAdeudadas.explicacionMetodo.calculo}`);
        addParagraph(`Resultado: ${datosAdeudadas.totalHorasFormato} (${datosAdeudadas.totalMinutosAdeudados} minutos)`);
        y += 2;
        
        addSubtitle('5.2 Cálculo de Horas Devueltas');
        addParagraph(`Período: ${datosDevueltas.fechaInicioFormateada} al ${datosDevueltas.fechaCorteFormateada}`);
        addParagraph(`Días laborales trabajados: ${datosDevueltas.cantidadDiasLaborales} días`);
        addParagraph(`Cálculo: ${datosDevueltas.cantidadDiasLaborales} días × ${minutosRecuperacion} min/día = ${datosDevueltas.totalMinutosDevueltos} minutos`);
        addParagraph(`Resultado: ${datosDevueltas.totalHorasFormato} (${formatearNumero(datosDevueltas.totalHorasDevueltas)} horas)`);
        y += 2;
        
        addSubtitle('5.3 Cálculo del Balance');
        let balanceFormula = `${balance.minutosAdeudados} - ${balance.minutosDevueltosPorTrabajo}`;
        if (minutosExtraFavor > 0) {
            balanceFormula += ` - ${minutosExtraFavor}`;
        }
        balanceFormula += ` = ${balance.minutosPendientes} minutos`;
        addParagraph(`Fórmula: Pendientes = Adeudadas - Devueltas${minutosExtraFavor > 0 ? ' - Extra a Favor' : ''}`);
        addParagraph(`Cálculo: ${balanceFormula}`);
        addParagraph(`Resultado: ${balance.horasPendientesFormato} ${balance.minutosPendientes <= 0 ? '(A FAVOR del trabajador)' : '(PENDIENTES)'}`);

        // SECCIÓN 6: PROYECCIÓN
        if (balance.minutosPendientes > 0) {
            addSectionHeader('6', 'PROYECCIÓN Y ESCENARIOS');
            y += 2;
            addKeyValue('Días necesarios', `${balance.diasNecesariosParaCompletar} días laborales`);
            addKeyValue('Días disponibles', `${balance.diasLaboralesRestantesAno} días en el año`);
            addKeyValue('Fecha estimada', balance.fechaEstimadaFormateada);
            addKeyValue('Viabilidad', balance.estado === 'en_progreso_alcanzable' ? 'ALCANZABLE ✓' : 'INSUFICIENTE ✗');
            y += 2;
            
            if (balance.estado === 'en_progreso_insuficiente') {
                const minutosNecesarios = Math.ceil(balance.minutosPendientes / Math.max(1, balance.diasLaboralesRestantesAno));
                addHighlightBox(`ATENCIÓN: El ritmo actual NO es suficiente. Se requiere aumentar a ${minutosNecesarios} min/día para completar antes de fin de año, o negociar extensión del plazo.`, 'warning');
            }
        }

        // SECCIÓN 7: RECOMENDACIONES
        addSectionHeader('7', 'RECOMENDACIONES');
        y += 2;
        addParagraph('1. Conservar este informe como documento oficial de respaldo de los cálculos realizados.');
        addParagraph('2. Mantener registro diario de asistencia firmado por ambas partes.');
        addParagraph('3. Los feriados nacionales NO deben incluirse en las horas a devolver.');
        if (balance.estado !== 'completado') {
            addParagraph('4. Realizar seguimiento mensual del avance de la recuperación.');
            addParagraph('5. Comunicar cualquier imprevisto que afecte el cronograma establecido.');
        } else {
            addParagraph('4. Emitir constancia de cierre firmada por ambas partes.');
            if (balance.minutosPendientes < 0) {
                addParagraph('5. Definir el tratamiento de las horas excedentes a favor del trabajador.');
            }
        }
        
        // SECCIÓN 8: ANEXO - TABLA DETALLADA
        addSectionHeader('8', 'ANEXO: DETALLE DE DÍAS LABORALES DEL MES NO ASISTIDO');
        y += 3;
        
        const diasLaborales = datosAdeudadas.diasLaborales;
        const diasRows = diasLaborales.map((dia, i) => [
            (i + 1).toString(),
            dia.fechaFormateada,
            dia.diaSemana,
            datosAdeudadas.horasJornadaDiaria.toString(),
            datosAdeudadas.minutosPorDia.toString()
        ]);
        
        addSimpleTable(
            ['#', 'Fecha', 'Día', 'Horas', 'Min'],
            diasRows,
            [12, 28, 35, 20, 20]
        );
        
        // Fila de total
        checkPageBreak(10);
        doc.setFillColor(26, 54, 93);
        const totalStartX = margin + (contentWidth - 115) / 2;
        doc.rect(totalStartX, y, 115, 6, 'F');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(`TOTAL: ${datosAdeudadas.cantidadDiasLaborales} días`, totalStartX + 2, y + 4);
        doc.text(datosAdeudadas.totalHorasFormato, totalStartX + 77, y + 4);
        doc.text(`${datosAdeudadas.totalMinutosAdeudados}`, totalStartX + 97, y + 4);
        y += 10;

        // SECCIÓN 9: FIRMAS
        addSectionHeader('9', 'VALIDACIÓN Y CONFORMIDAD');
        y += 5;
        
        addParagraph('Este informe ha sido generado automáticamente con base en los parámetros proporcionados. Los cálculos son verificables y reproducibles conforme a la legislación laboral peruana.');
        y += 8;
        
        checkPageBreak(35);
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(45, 55, 72);
        
        // Líneas de firma
        const firmaY = y;
        doc.line(margin, firmaY, margin + 65, firmaY);
        doc.line(pageWidth - margin - 65, firmaY, pageWidth - margin, firmaY);
        
        doc.text('Firma del Trabajador', margin + 15, firmaY + 5);
        doc.text('Firma del Empleador', pageWidth - margin - 50, firmaY + 5);
        
        doc.text('Nombre: _______________________', margin, firmaY + 12);
        doc.text('Nombre: _______________________', pageWidth - margin - 65, firmaY + 12);
        
        doc.text('DNI: __________________________', margin, firmaY + 19);
        doc.text('DNI: __________________________', pageWidth - margin - 65, firmaY + 19);
        
        doc.text('Fecha: ________________________', margin, firmaY + 26);
        doc.text('Fecha: ________________________', pageWidth - margin - 65, firmaY + 26);

        // PIE DE PÁGINA EN TODAS LAS PÁGINAS
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            
            // Línea separadora del pie de página
            doc.setDrawColor(200, 200, 200);
            doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
            
            // Texto del pie de página
            doc.setFontSize(7);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(128, 128, 128);
            doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 7, { align: 'center' });
            doc.text('Sistema de Cálculo de Jornada Laboral v' + METADATA.version, pageWidth / 2, pageHeight - 4, { align: 'center' });
        }

        // GUARDAR PDF
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
        
        const modal = document.createElement('div');
        modal.id = 'modal-preview';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Vista Previa del Informe Completo</h3>
                        <button class="modal-close" onclick="document.getElementById('modal-preview').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        <pre>${texto}</pre>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="document.getElementById('modal-preview').remove()">Cerrar</button>
                        <button class="btn-primary" onclick="ReporteModule.copiarAlPortapapeles().then(r => { alert(r.message); })">Copiar al Portapapeles</button>
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
