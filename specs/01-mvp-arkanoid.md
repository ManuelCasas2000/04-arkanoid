---
state: Approved
# state: Draft
date: 2026-07-06
dependencies: None
---

# MVP Arkanoid Jugable

**Objetivo:** Crear un MVP jugable de Arkanoid con un nivel fijo, controles de teclado y ratón, sistema de vidas, puntuación, pausa y sonido.

## Scope

**Incluido en este MVP:**
- Un solo nivel con patrón fijo de bloques
- Pantalla de inicio con botón "Jugar"
- Canvas de juego 800×600 píxeles
- Paleta controlable por teclado (flechas o A/D) y ratón (sigue posición X del cursor en tiempo real)
- Pelota con física de rebote en paredes, paleta y bloques
- Sistema de 3 vidas
- Puntuación visible durante el juego
- Menú de pausa (pausa física y sonido simultáneamente)
- Sonido en colisiones de pelota y roturas de bloques
- Botón "Reintentar" cuando el jugador pierde todas las vidas (reinicia el juego completo)
- Compatible con navegadores modernos (Chrome, Firefox, Safari, Edge)

**NO incluido en este MVP:**
- Múltiples niveles
- Persistencia de puntuación entre sesiones
- Pantalla separada de "Game Over" o "Victoria"
- Power-ups o items especiales
- Efectos visuales avanzados más allá del spritesheet
- Animación de explosión al romper bloques
- Leaderboard o estadísticas
- Modo multijugador

## Data Model

**Estado del Juego (gameState)**
```javascript
{
  mode: "menu" | "playing" | "paused" | "waiting_retry",
  score: Number,
  lives: Number,
  ball: { x: Number, y: Number, vx: Number, vy: Number, width: 16, height: 16 },
  paddle: { x: Number, y: Number, width: 162, height: 14 },
  blocks: [
    { x: Number, y: Number, color: String, width: 32, height: 16, broken: Boolean },
    ...
  ]
}
```

**Notas sobre las dimensiones:**
- Pelota: 16×16 píxeles (del spritesheet)
- Paleta: 162×14 píxeles (del spritesheet)
- Bloques: 32×16 píxeles cada uno
- Canvas: 800×600 píxeles

**Patrón fijo de bloques:** Se definen manualmente en el código al iniciar el nivel (posiciones x, y y color de cada bloque). No se genera dinámicamente.

## Implementation Plan

1. **Crear estructura HTML y cargar spritesheet**
   - Archivo `index.html` con canvas 800×600, UI para botón "Jugar", menú de pausa
   - Archivo `game.js` con estado inicial del juego
   - Verificar que la spritesheet carga correctamente

2. **Implementar bucle principal y renderizado básico**
   - Bucle con `requestAnimationFrame` a ~60fps
   - Renderizar paleta y pelota en posiciones iniciales
   - Renderizar los bloques del nivel (patrón fijo)

3. **Implementar controles de la paleta**
   - Teclado: flechas izquierda/derecha o A/D
   - Ratón: paleta sigue la posición X del cursor en tiempo real
   - Limitar movimiento dentro del canvas

4. **Implementar física de la pelota**
   - Movimiento continuo con velocidad (vx, vy)
   - Rebote en paredes superior, izquierda y derecha
   - Detección de pelota que cae por la parte inferior (pierde vida)

5. **Implementar colisión pelota-paleta**
   - Detectar contacto y cambiar dirección de vy
   - Reproducir sonido de colisión

6. **Implementar colisión pelota-bloques**
   - Detectar contacto con bloques
   - Marcar bloque como roto (broken: true)
   - Reproducir sonido de rotura
   - Sumar puntos al score

7. **Remover bloques rotos del renderizado**
   - No renderizar bloques donde broken = true
   - Los bloques simplemente desaparecen del canvas

8. **Implementar HUD (puntuación y vidas)**
   - Mostrar score y vidas en pantalla durante el juego
   - Actualizar en tiempo real

9. **Implementar menú de pausa**
   - Tecla ESC (o botón) pausa el juego
   - Pausa física (movimiento) y sonido
   - Mostrar estado "pausado" en pantalla
   - Presionar nuevamente para reanudar

10. **Implementar pantalla de inicio**
    - Mostrar botón "Jugar" al abrir el juego
    - Al presionar, transicionar a modo "playing"

11. **Implementar lógica de reintentar**
    - Cuando vidas = 0, mostrar botón "Reintentar"
    - Al presionar, reiniciar el juego completo (volver a pantalla de inicio)

12. **Pruebas finales end-to-end**
    - Jugar un nivel completo sin errores
    - Verificar controles, física, colisiones, sonido, pausa
    - Verificar pérdida de vidas y reintentar

## Acceptance Criteria

- [ ] El juego inicia mostrando una pantalla de inicio con un botón "Jugar"
- [ ] Al presionar "Jugar", el juego comienza con un nivel que tiene bloques en patrón fijo
- [ ] La paleta aparece en la parte inferior y responde a controles de teclado (flechas/A-D)
- [ ] La paleta responde al movimiento del ratón (sigue posición X del cursor en tiempo real)
- [ ] La pelota se mueve y rebota en las paredes superior, izquierda y derecha
- [ ] La pelota rebota al colisionar con la paleta
- [ ] La pelota rebota al colisionar con los bloques, y estos desaparecen
- [ ] Se reproduce sonido cuando la pelota colisiona (paredes, paleta, bloques)
- [ ] La puntuación aumenta cuando se rompe un bloque
- [ ] El HUD muestra la puntuación y el número de vidas actual
- [ ] Cuando la pelota cae por la parte inferior, el jugador pierde una vida
- [ ] Cuando el jugador pierde todas las 3 vidas, aparece un botón "Reintentar"
- [ ] Al presionar "Reintentar", el juego reinicia completamente (vuelve a pantalla de inicio)
- [ ] La tecla ESC (o un botón) pausa el juego
- [ ] Cuando el juego está pausado, la pelota no se mueve y no hay sonido
- [ ] Presionar ESC nuevamente (o el botón) reanuda el juego
- [ ] El juego funciona sin errores en navegadores modernos (Chrome, Firefox, Safari, Edge)
- [ ] Cuando todos los bloques están rotos, el juego continúa (no hay pantalla de victoria)

## Decisions Taken and Discarded

### Decisiones tomadas

1. **Un solo nivel fijo**
   - Justificación: Mantener scope pequeño para MVP. Múltiples niveles agregarían complejidad innecesaria en etapa inicial.

2. **Bloques desaparecen sin animación**
   - Justificación: Simplificar implementación. Agregar animaciones de explosión no es crítico para la jugabilidad del MVP.

3. **Sin pantalla de Game Over ni Victoria**
   - Justificación: MVP debe ser rápido de desarrollar. Un botón "Reintentar" es suficiente para la experiencia mínima viable.

4. **Menú de pausa pausa física y sonido simultáneamente**
   - Justificación: Mejor experiencia de usuario. Si se pausa el juego, el sonido también debe pausarse.

5. **Reintentar reinicia el juego completo**
   - Justificación: Más simple que mantener estado. Llevar al usuario de vuelta a la pantalla de inicio es una transición clara.

6. **Canvas fijo de 800×600 píxeles**
   - Justificación: Simplificar desarrollar para una resolución estándar. Responsive design se puede agregar después en versiones futuras.

7. **Sin persistencia de puntuación**
   - Justificación: MVP no requiere almacenamiento. El score solo se muestra durante la sesión actual.

8. **Controles con teclado Y ratón**
   - Justificación: Mejor accesibilidad. Usuarios pueden elegir la forma que prefieren controlar la paleta.

### Alternativas descartadas

- **Múltiples niveles:** Pospuesto para versión post-MVP. Aumentaría scope significativamente.
- **Animaciones de explosión:** Descartado. La desaparición simple es suficiente para MVP.
- **Power-ups/Items especiales:** Descartado. Complejidad innecesaria en etapa inicial.
- **Leaderboard/Estadísticas:** Descartado. Requeriría persistencia y backend.
- **Modo multijugador:** Descartado. Fuera de scope del MVP.

## Identified Risks

1. **Rendimiento en navegadores antiguos**
   - Riesgo: Canvas y RAF pueden ser lentos en navegadores viejos, causando lag
   - Mitigación: Enfoque inicial en navegadores modernos. Optimizar si es necesario post-MVP.

2. **Física imprecisa a velocidades altas**
   - Riesgo: Si la pelota se mueve muy rápido, puede atravesar bloques sin detectar colisión
   - Mitigación: Usar velocidades razonables y hacer pruebas de physics durante desarrollo.

3. **Audio no carga o falla en algunos navegadores**
   - Riesgo: Algunos navegadores pueden bloquear autoplay de audio, o los archivos no encontrarse
   - Mitigación: Verificar que archivos están en `assets/sounds/`. Manejar gracefully si audio falla.

4. **Spritesheet no carga**
   - Riesgo: Si la imagen no carga, nada renderiza
   - Mitigación: Usar callback de `loadSpritesheet()` y mostrar error si falla.

5. **Control del ratón inconsistente entre SO**
   - Riesgo: Posición del cursor puede interpretarse diferente en Windows, Mac, Linux
   - Mitigación: Testear en múltiples plataformas. Usar `mouseX` relativo al canvas.

6. **Pérdida de contexto del canvas**
   - Riesgo: El canvas puede perder contexto en algunos navegadores bajo presión de memoria
   - Mitigación: Monitoreado durante testing. No es crítico para MVP.
