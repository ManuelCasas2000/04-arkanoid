---
state: Implemented
date: 2026-07-08
dependencies: 02-block-destruction-animation.md
---

# Sistema de Niveles Progresivos

**Objetivo:** Implementar 5 niveles jugables con patrones de bloques distintos, velocidad progresiva de pelota (+10% por nivel), menú de selección inicial, y pantallas de felicitaciones al completar cada nivel.

## Scope

**Incluido en esta feature:**
- Crear 5 niveles predefinidos con patrones de bloques distintos (grilla, pirámide, diamante, líneas alternadas, patrón caótico)
- Incrementar velocidad de pelota 10% por cada nivel (nivel 1 = 1.0x, nivel 2 = 1.1x, nivel 3 = 1.21x, etc.)
- Crear menú de selección de nivel inicial (botones o interfaz para elegir nivel 1-5)
- Mostrar pantalla de felicitaciones al completar cualquier nivel 1-4 (con opción de continuar)
- Mostrar pantalla de victoria final al completar nivel 5 (con opción de volver al menú)
- Permitir cambiar de nivel desde pausa (ESC) en cualquier momento
- Al cambiar de nivel manualmente: resetear puntuación y vidas a valores iniciales (score = 0, lives = 3)
- Transición automática a siguiente nivel al destruir todos los bloques del nivel actual
- Mantener UI actualizada con número de nivel actual

**NO incluido en esta feature:**
- Sistema de guardado/persistencia de progreso
- Leaderboards o historial de puntuaciones
- Desbloqueo gradual de niveles (todos disponibles desde inicio)
- Niveles adicionales más allá de 5
- Editor de niveles o herramienta de personalización
- Diferentes configuraciones de vidas por nivel
- Power-ups o bonificadores especiales
- Modo infinito o generación procedural de bloques

## Data Model

**Estructura de niveles:**

Cada nivel se define con un patrón de bloques y multiplicador de velocidad:

```javascript
const LEVELS = [
  {
    number: 1,
    name: "Grilla",
    blockPattern: [
      // Array de filas; cada fila es array de colores
      // null = sin bloque en esa posición
      ['red', 'yellow', 'cyan', 'magenta', 'hotpink', 'green', 'red', 'yellow', 'cyan', 'magenta'],
      ['yellow', 'cyan', 'magenta', 'hotpink', 'green', 'red', 'yellow', 'cyan', 'magenta', 'hotpink'],
      ['cyan', 'magenta', 'hotpink', 'green', 'red', 'yellow', 'cyan', 'magenta', 'hotpink', 'green']
    ],
    ballSpeedMultiplier: 1.0
  },
  {
    number: 2,
    name: "Pirámide",
    blockPattern: [
      [null, null, null, null, 'red', 'red', null, null, null, null],
      [null, null, null, 'yellow', 'yellow', 'yellow', 'yellow', null, null, null],
      [null, null, 'cyan', 'cyan', 'cyan', 'cyan', 'cyan', 'cyan', null, null],
      [null, 'magenta', 'magenta', 'magenta', 'magenta', 'magenta', 'magenta', 'magenta', 'magenta', null],
      ['hotpink', 'hotpink', 'hotpink', 'hotpink', 'hotpink', 'hotpink', 'hotpink', 'hotpink', 'hotpink', 'hotpink']
    ],
    ballSpeedMultiplier: 1.1
  },
  {
    number: 3,
    name: "Diamante",
    blockPattern: [
      [null, null, null, null, 'red', 'red', null, null, null, null],
      [null, null, null, 'yellow', 'yellow', 'yellow', 'yellow', null, null, null],
      [null, null, 'cyan', 'cyan', 'cyan', 'cyan', 'cyan', 'cyan', null, null],
      [null, null, null, 'magenta', 'magenta', 'magenta', 'magenta', null, null, null],
      [null, null, null, null, 'green', 'green', null, null, null, null]
    ],
    ballSpeedMultiplier: 1.21
  },
  {
    number: 4,
    name: "Líneas Alternadas",
    blockPattern: [
      ['red', 'red', null, null, 'red', 'red', null, null, 'red', 'red'],
      [null, null, 'yellow', 'yellow', null, null, 'yellow', 'yellow', null, null],
      ['cyan', 'cyan', null, null, 'cyan', 'cyan', null, null, 'cyan', 'cyan'],
      [null, null, 'magenta', 'magenta', null, null, 'magenta', 'magenta', null, null],
      ['green', 'green', null, null, 'green', 'green', null, null, 'green', 'green']
    ],
    ballSpeedMultiplier: 1.331
  },
  {
    number: 5,
    name: "Caótico",
    blockPattern: [
      ['red', 'yellow', 'red', 'yellow', 'red', 'yellow', 'red', 'yellow', 'red', 'yellow'],
      ['cyan', null, 'cyan', null, 'cyan', null, 'cyan', null, 'cyan', null],
      ['magenta', 'hotpink', 'magenta', 'hotpink', 'magenta', 'hotpink', 'magenta', 'hotpink', 'magenta', 'hotpink'],
      ['green', null, 'green', null, 'green', null, 'green', null, 'green', null],
      ['red', 'cyan', 'red', 'cyan', 'red', 'cyan', 'red', 'cyan', 'red', 'cyan']
    ],
    ballSpeedMultiplier: 1.4641
  }
];
```

**Cambios en gameState:**

```javascript
gameState = {
  // ... campos existentes ...
  currentLevel: Number,        // Nivel actual (1-5)
  levelScore: Number,          // Puntuación en nivel actual
  levelLives: Number,          // Vidas en nivel actual
  mode: String                 // Ahora incluye: 'level-select', 'level-complete', 'game-complete'
}
```

**Constantes de velocidad:**

- Nivel 1: multiplicador 1.0 (velocidad base: vx = ±4, vy = ±4)
- Nivel 2: multiplicador 1.1 (velocidad: ±4.4)
- Nivel 3: multiplicador 1.21 (velocidad: ±4.84)
- Nivel 4: multiplicador 1.331 (velocidad: ±5.324)
- Nivel 5: multiplicador 1.4641 (velocidad: ±5.8564)

## Implementation Plan

1. **Definir estructura de niveles (LEVELS constant)**
   - Crear array LEVELS con 5 objetos (número, nombre, blockPattern, ballSpeedMultiplier)
   - Incluir patrones de bloques para todos los niveles (grilla, pirámide, diamante, líneas alternadas, patrón caótico)
   - Verificar que LEVELS está accesible globalmente en game.js

2. **Crear función initializeLevel(levelNumber)**
   - Cargar blockPattern del nivel especificado
   - Convertir blockPattern a gameState.blocks (con posiciones x, y correctas)
   - Resetear gameState.levelScore = 0, gameState.levelLives = 3
   - Aplicar ballSpeedMultiplier (multiplicar vx, vy iniciales por el multiplicador)
   - Resetear posición de pelota y paleta
   - Marcar gameState.currentLevel = levelNumber

3. **Crear menú de selección de nivel inicial**
   - Agregar elemento HTML #levelSelectMenu con 5 botones (Nivel 1-5)
   - Agregar estilos para el menú de selección
   - Implementar evento click en botones para iniciar nivel seleccionado
   - Mostrar menú de selección cuando gameState.mode = 'level-select'

4. **Implementar detección de nivel completado**
   - En checkCollisions(), después de cada colisión: verificar si quedan bloques
   - Si gameState.blocks.length === 0 (todos bloques destruidos), nivel completado
   - Cambiar gameState.mode a 'level-complete'

5. **Crear pantalla de felicitaciones (niveles 1-4)**
   - Agregar elemento HTML #levelCompleteMenu
   - Mostrar: "¡Nivel N completado!", puntuación del nivel, botón "Continuar"
   - Al hacer click en "Continuar": llamar initializeLevel(currentLevel + 1) y cambiar a modo 'playing'

6. **Crear pantalla de victoria final (nivel 5)**
   - Agregar elemento HTML #gameCompleteMenu
   - Mostrar: "¡Juego completado!", puntuación total acumulada, botón "Volver al menú"
   - Al hacer click: volver a gameState.mode = 'level-select'

7. **Implementar cambio de nivel desde pausa**
   - En pauseMenu, agregar botón "Cambiar Nivel"
   - Al hacer click: volver a menú de selección (gameState.mode = 'level-select')
   - Resetear puntuación y vidas (ya que es un cambio manual)

8. **Aplicar multiplicador de velocidad de pelota**
   - En initializeLevel(), después de resetear pelota: multiplicar vx y vy por ballSpeedMultiplier
   - Fórmula: `gameState.ball.vx *= LEVELS[levelNumber - 1].ballSpeedMultiplier`

9. **Pruebas end-to-end**
   - Verificar selección de cada nivel desde menú
   - Completar nivel 1, ver pantalla de felicitaciones, continuar a nivel 2
   - Verificar que velocidad aumenta progresivamente
   - Completar nivel 5 y ver pantalla de victoria
   - Cambiar de nivel desde pausa, verificar reset de puntuación/vidas
   - Verificar que patrones de bloques son correctos en cada nivel

## Acceptance Criteria

- [ ] Constante LEVELS está definida con 5 niveles, cada uno con blockPattern y ballSpeedMultiplier
- [ ] Función initializeLevel(levelNumber) carga correctamente el patrón de bloques del nivel
- [ ] Menú de selección de nivel muestra 5 botones (Nivel 1-5) y es interactivo
- [ ] Al seleccionar un nivel desde el menú, el juego comienza en ese nivel
- [ ] La velocidad de pelota aumenta correctamente: nivel N tiene velocidad = velocidad_base * 1.1^(N-1)
- [ ] Los patrones de bloques se renderizan correctamente para cada nivel
- [ ] Al destruir todos los bloques de un nivel 1-4, aparece pantalla de felicitaciones
- [ ] Pantalla de felicitaciones muestra puntuación del nivel y botón "Continuar"
- [ ] Al hacer click "Continuar", avanza automáticamente al siguiente nivel
- [ ] Al destruir todos los bloques del nivel 5, aparece pantalla de victoria final
- [ ] Pantalla de victoria final tiene botón "Volver al menú"
- [ ] Al volver al menú, se regresa a la pantalla de selección de nivel
- [ ] Desde pausa (ESC), hay opción "Cambiar Nivel" que abre menú de selección
- [ ] Al cambiar de nivel desde pausa, se resetean puntuación y vidas (score = 0, lives = 3)
- [ ] Puntuación se reinicia en cada nivel (no se acumula entre niveles)
- [ ] Vidas se reinician en cada nivel
- [ ] Pelota y paleta comienzan en posición correcta en cada nivel
- [ ] El juego no contiene errores de consola durante la selección y cambio de niveles
- [ ] Múltiples cambios de nivel (ej: 1→3→2→5) funcionan correctamente
- [ ] HUD muestra el nivel actual

## Decisions Taken and Discarded

### Decisiones tomadas

1. **Velocidad aumenta 10% por nivel (multiplicador 1.1)**
   - Justificación: Proporciona un aumento gradual y predecible sin ser demasiado radical. Después de 5 niveles, la velocidad es ~46% más rápida, lo que incrementa dificultad sin hacer imposible el juego.

2. **Patrones de bloques predefinidos en lugar de generación procedural**
   - Justificación: Más rápido de implementar, predecible para testing, y permite diseño cuidado de cada nivel.

3. **Bloquear interacción manual del juego si están en menú de selección**
   - Justificación: Evita que la pelota continúe moviéndose mientras se selecciona nivel.

4. **Resetear puntuación y vidas al cambiar de nivel manualmente desde pausa**
   - Justificación: Proporciona claridad: un nuevo nivel siempre comienza desde cero. Sin esto, sería confuso si mantienes puntos de intentos previos.

5. **Transición automática entre niveles sin menú intermedio**
   - Justificación: Ritmo de juego más fluido. Al completar nivel, la pantalla de felicitaciones es suficiente feedback.

6. **HUD muestra número de nivel actual**
   - Justificación: Proporciona orientación clara al jugador sobre dónde está.

### Alternativas descartadas

- **Sistema de vidas global que atraviesa todos los niveles:** Descartado. Cada nivel comienza con 3 vidas proporciona desafío independiente.
- **Guardar progreso del jugador:** Descartado. Fuera de scope para esta versión.
- **Desbloqueo gradual de niveles:** Descartado. Todos los niveles accesibles desde inicio simplifica la UX.
- **Duración de pausa diferente por nivel:** Descartado. Complejidad innecesaria.
- **Bonus de puntos por velocidad/dificultad:** Descartado. Sistema simple: 10 puntos por bloque, sin importar nivel.

## Identified Risks

1. **Bloques que se solapan o no se renderiza el patrón correctamente**
   - Riesgo: Si la conversión de blockPattern a posiciones (x, y) tiene errores de cálculo, los bloques podrían no estar donde se espera
   - Mitigación: Verificar visualmente en navegador que cada nivel muestra patrón correcto. Usar herramientas de desarrollador para inspeccionar gameState.blocks

2. **Pelota muy rápida en nivel 5 hace el juego injugable**
   - Riesgo: Con multiplicador 1.4641, la pelota podría ser demasiado rápida y el juego imposible de ganar
   - Mitigación: Testing extensivo en nivel 5. Si es necesario, ajustar multiplicador (ej: usar 1.08 en lugar de 1.1)

3. **Cambiar de nivel desde pausa mientras hay animaciones de explosión activas**
   - Riesgo: Las animaciones podrían continuar renderizándose o causar estado inconsistente
   - Mitigación: Al cambiar de nivel, limpiar completamente gameState (incluyendo bloques con animaciones pendientes)

4. **Menú de selección de nivel no responde si ocurre error**
   - Riesgo: Si hay excepción en initializeLevel(), el jugador queda atrapado en menú
   - Mitigación: Envolver initializeLevel() en try-catch y mostrar mensaje de error en consola

5. **Rendimiento con patrones de muchos bloques**
   - Riesgo: Nivel 5 con patrón caótico tiene ~50-60 bloques; si animaciones se solapan, podría haber lag
   - Mitigación: Monitorear performance durante testing. Usar Chrome DevTools para verificar frame rate

6. **Confusión de puntuación: ¿se acumula o no?**
   - Riesgo: Si no está claro en UI, jugador podría pensar que puntuación se acumula entre niveles
   - Mitigación: Mostrar claramente en pantalla de felicitaciones la puntuación del nivel (no acumulada)
