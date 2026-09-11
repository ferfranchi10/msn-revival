# Guía base para trabajar con Claude Code

> Pega este archivo como `CLAUDE.md` en la raíz de cada proyecto nuevo. Claude Code lo lee automáticamente al empezar cada sesión.

## 1. Reglas de oro (resumen)

1. **Un CLAUDE.md por proyecto** – contiene el contexto fijo (qué es el proyecto, comandos, reglas). Se carga siempre, así que debe ser corto (menos de 200 líneas).
2. **Modo Plan antes de tocar código** – para tareas grandes, pide primero un plan y apruébalo. Evita que Claude edite cosas que no querías.
3. **Una sesión = una tarea/fase con sentido** – tu práctica de abrir sesión nueva por fase es correcta, pero hazlo con un "checkpoint" (ver punto 4), no a ciegas.
4. **Checkpoint = commit de git + resumen** – antes de cerrar una sesión, guarda el progreso.
5. **No dejes que "investigue" sin límites** – pide tareas concretas y acotadas, no "revisa todo el proyecto".

## 2. Tu práctica actual (sesión nueva por fase) — evaluación

Está bien pensada porque ahorra tokens y evita que Claude "arrastre" contexto irrelevante. Le falta un paso: **dejar constancia por escrito de dónde quedó todo**, porque Claude no recuerda nada entre sesiones salvo lo que esté en archivos.

Por eso cada fase debe terminar así:

```
1. Claude termina la tarea de la fase.
2. Le pides: "Actualiza CONTEXT.md y TASKS.md con lo que hicimos y lo que falta."
3. Haces un commit en git (aunque sea solo para ti).
4. Cierras la sesión (nueva sesión o /clear).
```

## 3. Los 3 archivos que debe tener cada proyecto

Créalos en la raíz del proyecto. Son tu "memoria" entre sesiones.

- **`CLAUDE.md`** – contexto fijo: qué hace el proyecto, stack tecnológico, comandos para instalar/ejecutar/testear, reglas de estilo. Casi no cambia.
- **`CONTEXT.md`** – decisiones tomadas, archivos clave, cosas que NO hay que tocar. Se actualiza al final de cada fase.
- **`TASKS.md`** – checklist de lo hecho y lo pendiente. Es lo primero que le pides a Claude que lea al abrir una sesión nueva.

## 4. Flujo recomendado por fase (paso a paso)

1. **Abrir sesión nueva.**
2. Decirle: *"Lee CLAUDE.md, CONTEXT.md y TASKS.md antes de empezar."*
3. Pedirle el **plan** de la fase (no que empiece a programar aún).
4. Revisar el plan, aprobarlo o corregirlo.
5. Dejarle implementar.
6. Pedir que **pruebe/ejecute** lo hecho (que te enseñe que funciona, no que diga "debería funcionar").
7. **Checkpoint**: actualizar `CONTEXT.md` y `TASKS.md`, y hacer commit en git.
8. Cerrar sesión.

## 5. Cómo hacer un checkpoint (comandos exactos)

Desde la terminal integrada de VS Code:

```bash
git add .
git commit -m "Fase X: descripción breve de lo hecho"
```

Si no sabes usar git todavía, puedes pedirle directamente a Claude Code: *"Haz commit de los cambios con un mensaje que resuma esta fase."* Claude Code puede ejecutar el comando por ti.

## 6. Cuándo abrir sesión nueva vs. seguir en la misma

- **Sigue en la misma sesión** si estás en medio de la misma fase y el contexto sigue siendo útil.
- **Abre sesión nueva (o usa `/clear`)** cuando:
  - Terminas una fase.
  - Cambias de tema (ej. pasas de backend a diseño).
  - Claude lleva 2 intentos fallidos con el mismo problema — mejor sesión nueva con un prompt más claro que corregir sin parar.
- **Usa `/compact`** en vez de sesión nueva si quieres seguir en el mismo hilo pero liberar espacio, indicando qué conservar: *"/compact conserva las decisiones de la API y los archivos modificados."*

## 7. Estructura recomendada de fases para un proyecto nuevo

1. **Fase 0 – Definición**: qué problema resuelve, para quién, qué debe poder hacer (sin código).
2. **Fase 1 – Esqueleto**: estructura del proyecto, tecnologías, `CLAUDE.md` inicial (usa `/init` para que Claude lo genere solo).
3. **Fase 2 – Funcionalidad principal (MVP)**.
4. **Fase 3 – Funcionalidades secundarias**.
5. **Fase 4 – Pulido**: pruebas, errores, aspecto visual.
6. **Fase 5 – Entrega/despliegue**: cómo lo va a usar la empresa cliente.

Cada fase = 1 o pocas sesiones + su checkpoint.

## 8. Para ahorrar tokens

- No pegues documentos enteros en el prompt si puedes decirle a Claude que lea el archivo él mismo.
- Mantén `CLAUDE.md` corto y solo con lo que aplica siempre (no metas ahí detalles de una sola fase).
- Pide tareas concretas ("añade validación al formulario de contacto") en vez de abiertas ("mejora el proyecto").
- Usa `/clear` entre tareas sin relación, no dejes crecer una sesión indefinidamente.

## 9. Cuando quieras ofrecer esto a empresas

Antes de entregar algo a un cliente, en la Fase 4/5 pide explícitamente:
- Que ejecute pruebas reales, no que asuma que funciona.
- Un resumen de qué se instaló y cómo arrancar el proyecto (para dejarlo documentado en un README).
- Revisión de que no haya contraseñas o claves sueltas en el código (`.env` fuera del repo).

---

### Cómo usar este archivo a partir de ahora
Al empezar un proyecto nuevo, copia este archivo en la carpeta del proyecto como `CLAUDE.md` (o pégalo al principio de tu primer prompt). A partir de ahí, en cada sesión, dime en qué fase estás y qué necesitas — te diré cuál es el siguiente paso, cuándo hacer checkpoint y cómo hacerlo, según lo de arriba.
