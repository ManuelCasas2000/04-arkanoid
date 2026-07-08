---
state: Draft
date: 2026-07-08
dependencies: 01-mvp-arkanoid.md
---

# Animación de Destrucción de Bloques

**Objetivo:** Reproducir una animación de explosión de 0.4-0.5 segundos cuando la pelota golpea un bloque, usando frames del spritesheet, sin afectar la detección de colisiones futuras.

## Scope

**Incluido en esta feature:**
- Detectar colisión de pelota con bloque y marcar el bloque para animación de explosión
- Reproducir animación de explosión usando los 4 frames de `EXPLOSION_FRAMES[color]` del spritesheet.js
- La animación dura 0.4-0.5 segundos total (4 frames distribuidos en ese tiempo)
- El bloque deja de ser sólido inmediatamente (pelota pasa a través durante y después de la animación)
- Actualizar puntuación cuando se inicia la animación (no esperar a que termine)
- Renderizar los frames de explosión en secuencia en la posición del bloque destruido
- Al terminar la animación, remover el bloque del juego completamente

**NO incluido en esta feature:**
- Nuevos efectos de sonido para la animación (usar audio existente del MVP)
- Partículas adicionales o efectos visuales más allá de los 4 frames de explosión disponibles
- Diferentes duraciones de animación según el color del bloque
- Animación para colisiones de paleta o pelota con paredes

## Data Model

**Cambios al estado del bloque:**

Cada bloque en `gameState.blocks` ahora incluye campos de animación:

```javascript
{
  x: Number,
  y: Number,
  color: String,
  width: 32,
  height: 16,
  broken: Boolean,
  // Nuevos campos para animación:
  animating: Boolean,           // true si está en animación de explosión
  animationStartTime: Number,   // timestamp (ms) cuando comenzó la animación
}
```

**Constantes de animación:**

- `ANIMATION_DURATION = 400` (milisegundos, equivalente a 0.4 segundos, puede ser hasta 500ms)
- `EXPLOSION_FRAMES[color]` ya disponible en spritesheet.js (4 frames por color)
- Cada frame durará `ANIMATION_DURATION / 4` ms

**Estructura renderizada:**

- Los bloques con `animating: true` se renderizan usando frames de `EXPLOSION_FRAMES[color]` en lugar del sprite normal del bloque
- Los bloques con `broken: true` y `animating: false` no se renderizan

## Implementation Plan

1. **Definir constante de duración de animación**
   - Agregar `ANIMATION_DURATION = 400` (o 500) en el código del juego
   - Verificar que se puede calcular correctamente el tiempo por frame

2. **Extender estructura de bloques**
   - Agregar campos `animating: false` y `animationStartTime: null` a cada bloque al inicializar
   - Asegurar que bloques existentes usan estos campos por defecto

3. **Modificar detección de colisión pelota-bloques**
   - En lugar de solo marcar `broken: true`, marcar `animating: true` y guardar `animationStartTime = Date.now()`
   - Sumar puntos al score cuando se inicia la animación (no esperar a que termine)
   - Cambiar `broken: true` inmediatamente para que la pelota no colisione nuevamente

4. **Agregar lógica de animación en el bucle principal**
   - En cada frame, iterar bloques con `animating: true`
   - Calcular tiempo transcurrido desde `animationStartTime`
   - Calcular índice de frame actual: `frameIndex = Math.floor((elapsed / ANIMATION_DURATION) * 4)`
   - Si `frameIndex >= 4`, la animación terminó: marcar para eliminar

5. **Implementar renderizado de animación**
   - Antes de renderizar bloques normales, renderizar bloques con `animating: true`
   - Usar `drawFrame()` con el frame correspondiente de `EXPLOSION_FRAMES[color][frameIndex]`
   - Dibujar en la posición (x, y) del bloque original

6. **Remover bloques después de animación**
   - Eliminar del array `gameState.blocks` los bloques donde `animating: true` y tiempo transcurrido >= `ANIMATION_DURATION`
   - O filtrar al renderizar (no renderizar + no considerar en colisiones)

7. **Pruebas end-to-end**
   - Golpear un bloque y verificar que se reproduce la animación
   - Verificar que la pelota no colisiona durante la animación
   - Verificar que los puntos se suman inmediatamente
   - Verificar que el bloque desaparece después de 0.4-0.5 segundos

## Acceptance Criteria

- [ ] Los bloques tienen campos `animating` y `animationStartTime` inicializados correctamente
- [ ] Cuando la pelota colisiona con un bloque, se inicia la animación de explosión (animating: true)
- [ ] La puntuación aumenta inmediatamente cuando comienza la animación
- [ ] El bloque no es sólido durante la animación (la pelota pasa a través)
- [ ] Se renderizan 4 frames de explosión en secuencia desde `EXPLOSION_FRAMES[color]`
- [ ] Cada frame dura aproximadamente 0.1-0.125 segundos (100-125ms) para un total de 0.4-0.5 segundos
- [ ] La animación se reproduce en la posición (x, y) correcta del bloque
- [ ] La animación es específica al color del bloque (usa los frames correctos)
- [ ] Después de 0.4-0.5 segundos, el bloque desaparece completamente
- [ ] El bloque no aparece en cálculos de colisión después de la animación
- [ ] Múltiples bloques pueden animarse simultáneamente sin interferir
- [ ] El juego continúa funcionando sin errores mientras se reproduce la animación
- [ ] Presionar ESC durante la animación pausa el juego correctamente

## Decisions Taken and Discarded

### Decisiones tomadas

1. **Usar 4 frames de explosión predefinidos en EXPLOSION_FRAMES**
   - Justificación: Ya existen en spritesheet.js para cada color. Reutilizar código existente en lugar de crear nuevas animaciones.

2. **Bloque no-sólido inmediatamente (opción B)**
   - Justificación: Más predecible para el jugador. Si la pelota colisiona, no hay sorpresas durante la animación.

3. **Sumar puntos cuando comienza la animación, no al terminar**
   - Justificación: Feedback más rápido al jugador. La puntuación se actualiza al instante sin esperar a que termine el efecto visual.

4. **Duración total de 0.4-0.5 segundos para los 4 frames**
   - Justificación: Balance entre visual impactante y rapidez de juego. Mantiene el ritmo del MVP sin hacerlo muy lento.

5. **Mantener animación incluso si el bloque sale del canvas (caso extremo)**
   - Justificación: No es escenario relevante para este juego. Los bloques se crean dentro del canvas y no se mueven.

### Alternativas descartadas

- **Animación más larga (1+ segundos):** Descartado. Haría el juego más lento sin beneficio visual.
- **Diferentes duraciones por color:** Descartado. Complejidad innecesaria. Todos los bloques usan la misma duración.
- **Sonido diferenciado para cada explosión:** Descartado. Está fuera de scope de esta feature (audio pospuesto).
- **Partículas adicionales o efectos especiales:** Descartado. Se limita a los 4 frames del spritesheet disponibles.
- **Sumar puntos solo al terminar la animación:** Descartado. Feedback más lento al jugador.

## Identified Risks

1. **Rendimiento con muchas animaciones simultáneas**
   - Riesgo: Si muchos bloques se rompen a la vez, dibujar 4 frames por bloque en cada frame podría causar lag
   - Mitigación: Monitorear performance durante testing. Si es necesario, optimizar usando requestAnimationFrame pooling o limitar animaciones concurrentes.

2. **Timing impreciso de frames de animación**
   - Riesgo: Si el cálculo de `frameIndex` es incorrecto, los frames pueden cambiar en tiempos inconsistentes
   - Mitigación: Usar `Date.now()` consistentemente. Testear que la duración total es 0.4-0.5 segundos con cronómetro.

3. **Coordenadas de frames en spritesheet incorrectas**
   - Riesgo: Si las coordenadas en `EXPLOSION_FRAMES` no son precisas, la animación renderiza basura visual
   - Mitigación: Verificar visualmente en navegador. Usar herramientas de desarrollador para inspeccionar qué se dibuja.

4. **Pausa del juego no pausa la animación**
   - Riesgo: Si el juego se pausa, la animación continúa (porque se basa en `Date.now()`)
   - Mitigación: Pausar también `animationStartTime` cuando el juego entra en modo paused. Reanudar cuando se despausa.

5. **Orden de renderizado (z-order) incorrecto**
   - Riesgo: Si se renderiza la animación después de otros elementos, puede quedar ocultada
   - Mitigación: Renderizar animaciones de bloques ANTES de otros elementos. Testear visualmente.

6. **Bloque con animación se considera roto antes de estar listo**
   - Riesgo: Si no se sincroniza bien `animating` y `broken`, la lógica de colisión falla
   - Mitigación: Marcar ambos campos simultáneamente al iniciar animación. Documentar el invariante en código.
