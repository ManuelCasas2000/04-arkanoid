# CLAUDE.md

Este archivo proporciona orientación a Claude Code (claude.ai/code) cuando trabaja con código en este repositorio.

## Descripción del Proyecto

**Juego de Arkanoid** — Un juego tipo Breakout/Arkanoid sin dependencias externas, construido con HTML, CSS y JavaScript puro. El juego está en desarrollo temprano; actualmente solo existe la infraestructura de sprites.

## Stack Tecnológico y Arquitectura

**Sin sistema de compilación, sin dependencias.** El juego se ejecuta como archivos estáticos en un navegador:
- Un único archivo HTML (a crear como punto de entrada)
- CSS para estilos (puede ser incrustado o en archivo separado)
- Módulos JavaScript puro (sin bundler, sin npm)
- Activos: hoja de sprites + archivos de sonido en `assets/`

**Sistema de Sprites** (`assets/spritesheet.js`):
- Mantiene la imagen de la hoja de sprites (`spritesheet-breakout.png`) en un canvas fuera de pantalla para renderizado confiable
- Exporta coordenadas de sprites para: paleta, pelota, bloques (7 colores), animaciones de explosión
- Dos funciones principales:
  - `drawSprite(ctx, name, x, y, w, h)` — dibuja sprites nombrados (ej: "ball", "block_red")
  - `drawFrame(ctx, frame, x, y, w, h)` — dibuja un frame específico para animaciones
- Llamar a `loadSpritesheet(callback)` antes de usar cualquier función de dibujo; encola callbacks hasta que carga la hoja de sprites

**Arquitectura del Juego** (a implementar):
- **Bucle principal del juego**: se ejecuta a ~60fps usando `requestAnimationFrame`
- **Estado del juego**: posición de la paleta, posición/velocidad de la pelota, bloques, puntuación, vidas
- **Manejo de entrada**: teclado (flechas o A/D) para movimiento de la paleta
- **Detección de colisiones**: pelota vs paredes, pelota vs paleta, pelota vs bloques
- **Renderizado**: iterar sobre el estado del juego, dibujar sprites usando el sistema de sprites, actualizar canvas cada frame
- **Audio**: reproducir `assets/sounds/ball-bounce.mp3` en colisión de pelota, `break-sound.mp3` al romper bloque

## Flujo de Desarrollo

**Ejecutar el juego localmente:**
- Abrir el archivo HTML principal en un navegador (o usar la extensión Live Server de VS Code)
- El juego se ejecuta completamente en el navegador; no se requiere servidor local

**Enfoque de desarrollo:**
- Construir incrementalmente: bucle del juego → paleta → física de la pelota → colisiones → bloques → estados ganar/perder
- Probar cada característica en el navegador mientras la añades
- Usar herramientas de desarrollador del navegador (F12) para depurar renderizado de canvas y estado del juego

**Pruebas:**
- Las pruebas manuales en el navegador son el método de validación principal
- Verificar física (la pelota rebota correctamente en paredes, paleta, bloques)
- Verificar que el audio se reproduce en colisiones
- Confirmar estados del juego (inicio, jugando, game over, ganado)

## Conceptos y Reglas del Juego

**Arkanoid** es un clásico juego arcade donde:
- El jugador controla una paleta en la parte inferior, solo movimiento izquierda/derecha
- Una pelota rebota por la pantalla, comenzando desde la paleta
- Bloques llenan la parte superior de la pantalla (típicamente en filas de diferentes colores)
- **Objetivo**: Romper todos los bloques sin dejar que la pelota caiga por la parte inferior
- **Consecuencias**: Perder una vida si la pelota cae; game over después de perder todas las vidas; ganar cuando se destruyen todos los bloques

**Entidades del juego:**
- **Paleta**: barra horizontal en la parte inferior, controlada por el jugador; típicamente 162×14 píxeles (de la hoja de sprites)
- **Pelota**: cuadrado pequeño, 16×16 píxeles; rebota en paredes, paleta y bloques
- **Bloques**: 32×16 píxeles cada uno; 7 colores disponibles en la hoja de sprites (rojo, amarillo, cian, magenta, hotpink, verde, gris)
- **Paredes**: bordes del canvas (superior, izquierdo, derecho rebotan la pelota; inferior = condición de pérdida)

## Archivos Clave

- `index.html` — archivo principal del juego (crear como punto de entrada)
- `assets/spritesheet.js` — utilidad de carga y renderizado de sprites
- `assets/spritesheet-breakout.png` — imagen de la hoja de sprites
- `assets/sounds/` — efectos de audio

## Skills Personalizadas

- `/spec` — definir una especificación para nuevas características (del repositorio externo `Klerith/fernando-skills`)
- `/spec-impl` — implementar una especificación aprobada paso a paso con diffs
- `/neko` — responde como un gato (skill de sabor personalizado)

Ver `.claude/skills/` y `.agents/skills/` para definiciones de skills.

## Notas

- Las coordenadas de la hoja de sprites y animaciones están predefinidas; no necesitan ser calculadas
- El juego debe pausarse/reiniciarse limpiamente (ej: presionar R para reiniciar)
- Usar `requestAnimationFrame` para animación suave, no `setInterval`
- Asegurar que la hoja de sprites carga antes de iniciar el juego (ya manejado por `loadSpritesheet`)
