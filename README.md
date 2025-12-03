# Sistema de Cálculo de Jornada Laboral

## Recuperación de Horas No Laboradas — Perú 2025

Sistema web para calcular y documentar la recuperación de horas laborales adeudadas, diseñado específicamente para cumplir con la legislación laboral peruana y generar informes detallados para presentación ante revisores gubernamentales.

---

## 📋 Descripción

Esta aplicación permite calcular de manera transparente y verificable las horas que un trabajador debe recuperar tras un período de inasistencia, considerando:

- Días laborales reales (lunes a viernes)
- Feriados nacionales de Perú 2025
- Dos métodos de cálculo (por día o por semana)
- Horas extra a favor del trabajador
- Proyecciones de finalización

---

## ✨ Características Principales

### Cálculos
- **Método por Día (Recomendado):** Descuenta feriados nacionales automáticamente
- **Método por Semana:** Calcula por semanas calendario sin descontar feriados
- **Balance en tiempo real:** Muestra horas adeudadas, devueltas y pendientes
- **Proyecciones:** Fecha estimada de finalización y viabilidad

### Visualización
- Calendario visual del mes con código de colores
- Tablas detalladas de días laborales
- Desglose paso a paso de cada operación matemática
- Indicadores de estado (completado, en progreso, insuficiente)

### Exportación
- **PDF:** Informe completo con interpretaciones y análisis
- **Texto Plano:** Para copiar al portapapeles
- **Vista Previa:** Modal con el informe completo

---

## 📁 Estructura de Archivos

```
├── index.html      # Estructura HTML de la aplicación
├── styles.css      # Estilos visuales y diseño responsive
├── script.js       # Lógica de cálculos y renderizado web
├── reporte.js      # Módulo de generación de reportes (PDF/texto)
└── README.md       # Este archivo
```

---

## 🚀 Instalación y Uso

### Requisitos
- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Conexión a internet (para cargar fuentes y jsPDF)

### Instalación
1. Descargar todos los archivos en una carpeta
2. Abrir `index.html` en un navegador web

### Uso Básico
1. Configurar los parámetros de cálculo:
   - Método de cálculo (por día o por semana)
   - Mes no asistido
   - Jornada laboral
   - Fechas de inicio y corte
   - Minutos adicionales diarios
   - Horas extra a favor (opcional)
2. Presionar **"Calcular Informe"**
3. Revisar los resultados detallados
4. Exportar mediante los botones disponibles

---

## 📊 Parámetros Configurables

| Parámetro | Descripción | Valor por Defecto |
|-----------|-------------|-------------------|
| Método de Cálculo | Por día (recomendado) o por semana | Por día |
| Mes No Asistido | Mes durante el cual no se laboró | Enero |
| Jornada Laboral | Horas diarias o semanales según método | 6 horas/día |
| Fecha Inicio Devolución | Cuándo comenzó la recuperación | 1 de febrero 2025 |
| Fecha de Corte | Hasta cuándo calcular | Fecha actual |
| Minutos Adicionales | Tiempo extra diario para devolver | 30 minutos |
| Horas Extra a Favor | Crédito previo del trabajador | 0 |

---

## 🗓️ Feriados Nacionales Perú 2025

El sistema incluye los 15 feriados oficiales:

| Fecha | Feriado |
|-------|---------|
| 01/01 | Año Nuevo |
| 17/04 | Jueves Santo |
| 18/04 | Viernes Santo |
| 01/05 | Día del Trabajo |
| 29/06 | San Pedro y San Pablo |
| 23/07 | Día de la Fuerza Aérea |
| 28/07 | Fiestas Patrias (Día 1) |
| 29/07 | Fiestas Patrias (Día 2) |
| 06/08 | Batalla de Junín |
| 30/08 | Santa Rosa de Lima |
| 08/10 | Combate de Angamos |
| 01/11 | Día de Todos los Santos |
| 08/12 | Inmaculada Concepción |
| 09/12 | Batalla de Ayacucho |
| 25/12 | Navidad |

---

## 📐 Métodos de Cálculo

### Método por Día (Recomendado)
```
Horas Adeudadas = Jornada Diaria × Días Laborales Efectivos
```
- ✅ Estándar según legislación laboral peruana
- ✅ Descuenta feriados automáticamente
- ✅ Más preciso y justo para el trabajador

### Método por Semana
```
Horas Adeudadas = Jornada Semanal × Semanas del Mes
```
- ⚠️ No descuenta feriados
- ⚠️ Puede resultar en más horas de las correspondientes

### Ejemplo Comparativo (Enero 2025)
| Método | Cálculo | Resultado |
|--------|---------|-----------|
| Por Día | 6 h/día × 22 días | 132 horas |
| Por Semana | 30 h/semana × 5 semanas | 150 horas |
| **Diferencia** | | **18 horas** |

---

## 📄 Contenido del Informe PDF

El informe generado incluye:

1. **Parámetros de Cálculo** - Configuración utilizada
2. **Resumen Ejecutivo** - Tabla con valores clave
3. **Interpretación General** - Análisis del caso
4. **Impacto de Feriados** - Detalle y fundamento legal
5. **Cálculos Detallados** - Paso a paso verificable
6. **Proyección y Escenarios** - Viabilidad y alternativas
7. **Recomendaciones** - Acciones sugeridas
8. **Anexo: Días Laborales** - Tabla completa día por día
9. **Validación y Conformidad** - Espacio para firmas

---

## 🏗️ Arquitectura del Código

### Principio de Responsabilidad Única

| Archivo | Responsabilidad |
|---------|-----------------|
| `index.html` | Estructura y carga de dependencias |
| `styles.css` | Presentación visual |
| `script.js` | Cálculos y renderizado en pantalla |
| `reporte.js` | Generación de reportes (PDF/texto) |

### Comunicación entre Módulos
```
script.js → window.datosInforme → reporte.js
```

---

## 🔧 Dependencias Externas

- **Google Fonts:** Crimson Pro, Source Sans 3, JetBrains Mono
- **jsPDF v2.5.1:** Generación de documentos PDF

---

## ⚖️ Base Legal

Este sistema se fundamenta en:

- **Decreto Legislativo N° 713:** Descansos remunerados
- **Legislación laboral peruana:** Jornada de trabajo y feriados
- **Principio de irrenunciabilidad:** Derechos mínimos del trabajador

**Nota:** Los feriados son días de descanso obligatorio y remunerado. El trabajador NO debe recuperar horas correspondientes a feriados.

---

## 📝 Licencia

Este proyecto es de uso libre para fines laborales y educativos.

---

## 🤝 Contribuciones

Para sugerencias o mejoras, considerar:

- Validación con legislación laboral actualizada
- Pruebas con diferentes escenarios de cálculo
- Mejoras de accesibilidad y usabilidad

---

## 📞 Soporte

Este sistema genera cálculos verificables y transparentes. En caso de controversias laborales, se recomienda consultar con un abogado especializado en derecho laboral peruano.

---

*Versión 3.1 — Diciembre 2025*
