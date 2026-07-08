# 🎮 Arkanoid Game

Un juego tipo Breakout/Arkanoid totalmente funcional, construido con **HTML, CSS y JavaScript puro**. Sin dependencias externas, sin build system. Juega directamente en el navegador.

![Status](https://img.shields.io/badge/status-Playable-brightgreen) ![Levels](https://img.shields.io/badge/levels-5-blue) ![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)

## 🎯 Características

✅ **5 Niveles Jugables**
- Nivel 1: Grilla (velocidad base)
- Nivel 2: Pirámide (10% más rápido)
- Nivel 3: Diamante (21% más rápido)
- Nivel 4: Líneas Alternadas (33% más rápido)
- Nivel 5: Caótico (46% más rápido)

✅ **Mecánicas**
- Bucle de juego a 60 FPS
- Física de colisiones (pelota vs paredes/paleta/bloques)
- Animación de explosión de 4 frames al destruir bloques
- Controles: Flechas/A/D para mover paleta
- Pausa con ESC (incluye cambio de nivel)

✅ **Interfaz**
- Menú de selección de nivel
- Pantalla de felicitaciones (niveles 1-4)
- Pantalla de victoria final (nivel 5)
- HUD con puntuación, vidas y nivel actual
- Transiciones fluidas entre menús

✅ **Audio**
- Efectos de sonido en colisiones
- Efectos al romper bloques

## 🚀 Cómo Jugar

### Opción 1: Abrir en navegador directamente
```bash
# Simplemente abre index.html en tu navegador
# O usa Live Server de VS Code
```

### Opción 2: Servidor HTTP local
```bash
# Con Python 3
python -m http.server 8000
# Luego abre http://localhost:8000

# Con Node.js
npx http-server
```

### Controles
- **Flechas izquierda/derecha** — Mover paleta
- **A/D** — Mover paleta (alternativa)
- **ESC** — Pausar/Reanudar (con opción de cambiar nivel)
- **Mouse** — Mover paleta automáticamente (si no usas teclado)

### Objetivo
1. Selecciona un nivel (1-5)
2. Destruye todos los bloques sin dejar caer la pelota
3. Completa todos los niveles para ganar

## 📁 Estructura del Proyecto

```
04-arkanoid/
├── index.html              # Punto de entrada único (HTML + CSS)
├── game.js                 # Lógica completa del juego (~650 líneas)
├── test.html               # Suite de pruebas end-to-end
├── CLAUDE.md               # Documentación técnica y metodología
├── README.md               # Este archivo
├── specs/                  # Especificaciones
│   ├── 01-mvp-arkanoid.md              # MVP (completado)
│   ├── 02-block-destruction-animation.md # Animaciones (completado)
│   └── 03-niveles-progresivos.md       # Niveles (completado)
└── assets/
    ├── spritesheet.js                  # Cargador de sprites
    ├── spritesheet-breakout.png        # Atlas de sprites
    └── sounds/
        ├── ball-bounce.mp3
        └── break-sound.mp3
```

## 🔧 Stack Técnico

- **Lenguaje:** JavaScript puro (ES6+)
- **Rendering:** Canvas 2D API
- **Audio:** Web Audio API
- **Build:** Ninguno (archivos estáticos)
- **Dependencias:** Cero
- **Navegadores:** Todos los modernos (Chrome, Firefox, Safari, Edge)

## 📊 Estado del Proyecto

| Feature | Estado | Archivo |
|---------|--------|---------|
| MVP (bucle, paleta, pelota, colisiones) | ✅ Implementado | specs/01-mvp-arkanoid.md |
| Animación de explosión de bloques | ✅ Implementado | specs/02-block-destruction-animation.md |
| Sistema de 5 niveles progresivos | ✅ Implementado | specs/03-niveles-progresivos.md |
| Power-ups | ⏳ Planeado | - |
| Guardado de progreso | ⏳ Planeado | - |
| Leaderboard | ⏳ Planeado | - |

## 🧪 Testing

### Pruebas Manuales (Recomendado)
1. Abre `index.html` en el navegador
2. Juega cada nivel y verifica:
   - Selección de nivel funciona
   - Patrones de bloques son diferentes
   - Velocidad aumenta progresivamente
   - Animaciones se renderizan correctamente
   - Pantallas de transición funcionan

### Pruebas Automáticas
```bash
# Abre test.html en el navegador
# Se ejecutarán 15+ pruebas de estructura y funcionalidad
```

### Debug en Navegador
```javascript
// Abre DevTools (F12) → Console

// Ver estado actual del juego
console.log(gameState);

// Cargar un nivel específico manualmente
initializeLevel(3);

// Ver LEVELS disponibles
console.log(LEVELS);
```

## 📝 Metodología: Spec Driven Design

El proyecto usa un flujo de desarrollo basado en especificaciones:

1. **Crear Especificación** (`/spec nombre-feature`)
   - Define objetivo, scope, plan de implementación

2. **Revisar y Aprobar**
   - Usuario revisa, comenta, aprueba

3. **Implementar Paso a Paso** (`/spec-impl @specs/NN-nombre.md`)
   - Crea rama automáticamente
   - Implementa cada paso del plan
   - Pausa después de cada paso para review

4. **Probar y Mergear**
   - Verifica criterios de aceptación
   - Actualiza spec a "Implementado"
   - Fusiona con main

Ver `CLAUDE.md` para más detalles sobre el flujo.

## 🎮 Estructura del Juego

### Game Loop (60 FPS)
```
Cada frame:
  1. Actualizar posición de pelota
  2. Actualizar posición de paleta (input)
  3. Actualizar animaciones de bloques
  4. Detectar colisiones
  5. Renderizar pelota, paleta, bloques
  6. Actualizar HUD
```

### Estados del Juego
- `menu` — Menú de inicio
- `level-select` — Selección de nivel
- `playing` — Juego activo
- `paused` — Pausado
- `level-complete` — Nivel completado
- `game-complete` — Juego ganado
- `waiting_retry` — Game over

### Sistema de Niveles
Cada nivel tiene:
- Patrón de bloques único (10 bloques por fila)
- Multiplicador de velocidad (1.0x → 1.4641x)
- Puntuación y vidas reseteadas

```javascript
{
  number: 1,
  name: "Grilla",
  blockPattern: [[colors...], ...],
  ballSpeedMultiplier: 1.0
}
```

## 🔧 Desarrollo Local

### Crear Nueva Feature
```bash
# 1. Crear especificación
/spec nombre-feature

# 2. Usuario aprueba en CLAUDE.md

# 3. Implementar
/spec-impl @specs/NN-nombre.md

# 4. Seguir los pasos del plan
# ... editor le guía paso a paso

# 5. Verificar criterios
# ... completar y mergear
```

### Editar Código Directamente
- `game.js` — Lógica principal (game loop, colisiones, niveles)
- `index.html` — Interfaz (menus, HUD, estilos)
- `assets/spritesheet.js` — Sistema de sprites

No necesitas compilar ni instalar nada. Guarda y recarga el navegador.

## 📚 Documentación

- **CLAUDE.md** — Guía técnica completa, arquitectura, decisiones de diseño
- **specs/** — Especificaciones de cada feature (objetivo, plan, criterios)
- **Inline comments** — El código tiene comentarios donde la lógica es no-obvia

## 🐛 Conocidos Issues

Ninguno reportado. Si encuentras un bug, abre un issue en GitHub.

## 📈 Performance

- **FPS:** 60 (limitado por requestAnimationFrame)
- **Tamaño HTML:** ~400 líneas
- **Tamaño JS:** ~650 líneas
- **Sprites:** PNG optimizado (~50KB)
- **Memory:** <10MB típicamente

## 🤝 Contribuir

Las contribuciones siguen el flujo Spec Driven Design:

1. Propón una feature usando `/spec`
2. Espera aprobación
3. Implementa usando `/spec-impl`
4. Abre PR cuando esté lista

Consulta `CLAUDE.md` para detalles del workflow.

## 📄 Licencia

Libre para uso personal y educativo.

---

**Creado con:** HTML, CSS, JavaScript puro, y ❤️

**Método de desarrollo:** Spec Driven Design con asistencia de IA

**Última actualización:** 2026-07-08 
