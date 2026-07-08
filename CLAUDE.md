# CLAUDE.md

Orientación para Claude Code cuando trabaja en este repositorio. El proyecto usa **Spec Driven Design**: cada feature comienza como especificación, se aprueba, y luego se implementa paso a paso.

## Descripción del Proyecto

**Juego de Arkanoid** — Juego tipo Breakout sin dependencias externas, construido con HTML, CSS y JavaScript puro. Arquitectura completamente funcional con sistema de 5 niveles progresivos.

**Estado:** MVP + 2 specs implementadas (block destruction animation, progressive levels)

## Metodología: Spec Driven Design

El desarrollo sigue este flujo:

1. **Crear especificación** (`/spec nombre-feature`)
   - Define objetivo, scope, data model, plan de implementación
   - Usuario revisa y aprueba
   
2. **Implementar paso a paso** (`/spec-impl @specs/NN-nombre.md`)
   - Crea rama `spec-NN-nombre` automáticamente
   - Implementa cada paso del plan, pausa para review
   - Usuario confirma cada paso antes de continuar
   - Al final: verifica criterios de aceptación, actualiza spec a "Implementado"
   
3. **Merge a main**
   - Rama se fusiona con main tras completar todos los pasos

**Archivos de specs:** `specs/` directorio
- `01-mvp-arkanoid.md` — Implementado (bucle juego, paleta, pelota, bloques, colisiones)
- `02-block-destruction-animation.md` — Implementado (animación de explosión 4-frame)
- `03-niveles-progresivos.md` — Implementado (5 niveles, velocidad progresiva 10%/nivel)

## Stack Tecnológico y Arquitectura

**Sin compilación, sin npm.** Archivos estáticos + navegador:
- `index.html` — punto de entrada único con estilos incrustados
- `game.js` — lógica completa (~600 líneas): game loop, colisiones, niveles, UI
- `assets/spritesheet.js` — carga y renderiza sprites desde PNG
- `assets/spritesheet-breakout.png` — atlas de sprites (paleta, pelota, bloques 7 colores, explosiones)
- `assets/sounds/` — efectos de audio
- `test.html` — suite de pruebas end-to-end (opcional)

**Componentes principales:**

| Componente | Responsabilidad | Archivo |
|------------|-----------------|---------|
| **Game Loop** | 60fps, actualización/renderizado | game.js (gameLoop) |
| **Game State** | Posiciones, velocidades, bloques, puntuación | game.js (gameState object) |
| **Colisiones** | Pelota vs paredes/paleta/bloques | game.js (checkCollisions) |
| **Niveles** | 5 patrones de bloques, multiplicador velocidad | game.js (LEVELS constant) |
| **Sprites** | Carga PNG, renderiza sprites nombrados | assets/spritesheet.js |
| **UI Menus** | Menús nivel select, felicitaciones, victoria | index.html + game.js |

**Sistema de Niveles:**

```javascript
LEVELS = [
  { number: 1, name: "Grilla", blockPattern: [...], ballSpeedMultiplier: 1.0 },
  { number: 2, name: "Pirámide", blockPattern: [...], ballSpeedMultiplier: 1.1 },
  { number: 3, name: "Diamante", blockPattern: [...], ballSpeedMultiplier: 1.21 },
  { number: 4, name: "Líneas Alternadas", blockPattern: [...], ballSpeedMultiplier: 1.331 },
  { number: 5, name: "Caótico", blockPattern: [...], ballSpeedMultiplier: 1.4641 }
]
```

## Flujo de Desarrollo

**Jugar el juego:**
```
1. Abrir index.html en navegador (o Live Server)
2. Click "Jugar" → menú selección nivel
3. Seleccionar nivel 1-5
4. Jugar: flechas/A/D move paleta, ESC pausa
5. Al ganar nivel → siguiente automáticamente
6. Nivel 5 → pantalla victoria final
```

**Workflow CI/CD:**
- Editar especificación en `specs/` → guardar como "Borrador"
- `/spec @specs/NN-nombre` → revisar, editar, cambiar a "Aprobado"
- `/spec-impl @specs/NN-nombre` → implementación guiada paso a paso
- Probar en navegador durante implementación
- Actualizar spec a "Implementado" al finalizar
- Push a main

**Pruebas:**
- Manual en navegador (método principal)
- `test.html` para validación de estructura LEVELS y funciones
- F12 DevTools para depurar renderizado y estado

## Arquitectura de Código

**game.js estructura:**

```
1. DOM references (playButton, levelSelectMenu, etc.)
2. LEVELS constant (5 niveles con patrones)
3. gameState object (score, lives, currentLevel, blocks, ball, paddle, mode)
4. Core functions:
   - initializeLevel(levelNumber) — carga patrón, aplica velocidad
   - initializeBlocksFromPattern(pattern) — convierte pattern a bloques
   - gameLoop() — 60fps update/render
   - updateBall/Paddle/Blocks() — lógica física
   - checkCollisions() — colisiones + animaciones
   - renderBall/Paddle/Blocks() — dibujo sprites
5. UI functions:
   - showLevelSelectMenu/showPlayingUI/showLevelCompleteMenu/etc.
6. Event listeners (click buttons, keyboard, mouse)
7. Initialization (setupEventListeners, loadSpritesheet, resetGame)
```

**gameState modes:**
- `menu` — menú inicio
- `level-select` — selección nivel
- `playing` — juego activo
- `paused` — pausado (ESC)
- `level-complete` — felicitaciones (niveles 1-4)
- `game-complete` — victoria final (nivel 5)
- `waiting_retry` — game over

**Ciclo de vida de un bloque:**
1. Creado en initializeBlocksFromPattern() con { x, y, color, broken: false, animating: false }
2. En checkCollisions(): si colisión → broken=true, animating=true, animationStartTime=now
3. En updateBlocks(): renderiza frame de explosión basado en elapsed time
4. Al terminar animación (400ms): filtrado del array gameState.blocks
5. Si gameState.blocks.length === 0 → nivel completado

## Conceptos Clave

**Arkanoid (juego clásico):**
- Jugador controla paleta (solo X, parte inferior)
- Pelota rebota en paredes, paleta, bloques
- Objetivo: destruir todos bloques sin que pelota caiga
- 1 vida = 1 oportunidad; 3 vidas por nivel

**Velocidad progresiva:**
- Cada nivel multiplica velocidad base (±4 px/frame) por 1.1^(level-1)
- Mantiene juego progresivamente más desafiante
- Multiplicador aplicado en initializeLevel() automáticamente

**Animación de explosión:**
- Al destruir bloque: marca como "animating"
- Renderiza 4 frames diferentes en 400ms (drawFrame)
- Bloque removido del array tras animación → automáticamente nivel "completo"

## Archivos Importantes

| Archivo | Propósito | Tamaño approx |
|---------|-----------|---------------|
| `index.html` | HTML + CSS incrustado | 400 líneas |
| `game.js` | Lógica completa del juego | 650 líneas |
| `assets/spritesheet.js` | Cargador de sprites | 100 líneas |
| `specs/03-niveles-progresivos.md` | Especificación niveles | 250 líneas |
| `test.html` | Suite pruebas (opcional) | 300 líneas |

## Skills y Flujos Recomendados

**Para nueva feature:**
```
/spec nombre-feature
  → usuario edita, aprueba
/spec-impl @specs/NN-nombre.md
  → implementación paso a paso con pauses
  → usuario confirma cada paso
  → spec → "Implementado"
git commit + merge main
```

**Para debug:**
- Abrir DevTools (F12) → Console
- Ejecutar: `console.log(gameState)` para ver estado actual
- Ejecutar: `initializeLevel(N)` para cargar nivel N manualmente

**Para testing:**
- Abrir `test.html` en navegador → ejecuta suite de pruebas automáticas
- O jugar manualmente: seleccionar cada nivel, verificar velocidad/patrones

## Decisiones de Diseño

1. **Sin dependencias externas** — facilita deploy, sin build step
2. **Spec Driven** — cada feature es explícita y aprobada antes de código
3. **Paso a paso** — implementación en pasos pequeños, pausas para review
4. **State machine** — gameState.mode controla qué se renderiza/actualiza
5. **Sprites desde PNG** — spritesheet.js abstrae carga, evita hardcode coordenadas
6. **Animaciones en canvas** — requestAnimationFrame para smooth 60fps
7. **Niveles como data** — LEVELS constant = fácil agregar niveles sin cambiar código

## Notas para Próximas Specs

- **Power-ups** — agregar elementos bonus que caen de bloques destruidos
- **Guardado de progreso** — localStorage para persistir puntuaciones
- **Sonido** — más efectos (powerup, nivel completado, victoria)
- **Dificultades** — modos easy/hard con diferentes multiplicadores
- **Leaderboard** — ranking local de puntuaciones

Próximas specs deben seguir formato NN-slug.md en `specs/` con estructura: objetivo, scope, data model, plan, criterios aceptación.
