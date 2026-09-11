# Guía de habilidades del proyecto

Este archivo le indica a Claude qué herramientas tiene disponibles y cuándo usar cada una. Al abrir este proyecto, revisá esta lista antes de improvisar: si el pedido del usuario encaja con alguna habilidad de abajo, usala (o sugerila) en vez de resolver todo desde cero.

## Habilidades de ingeniería (`/engineering:...`)

| Habilidad | Cuándo usarla |
|---|---|
| `architecture` | El usuario tiene que elegir entre dos tecnologías, o quiere documentar por qué se tomó una decisión de diseño. |
| `code-review` | Hay una URL de PR, un diff, o el usuario pregunta "¿está bien este código?", "revisá esto antes de mergear". |
| `debug` | Hay un error, un stack trace, o algo que "funcionaba antes y ahora no". |
| `deploy-checklist` | El usuario está por publicar/desplegar algo a producción. |
| `documentation` | Pide un README, una guía, documentación de una API, o cualquier texto técnico. |
| `incident-response` | Algo se cayó en producción o hay una alerta que atender. |
| `standup` | Quiere armar un resumen de lo que hizo (para una reunión diaria o reporte de avance). |
| `system-design` | Quiere diseñar un sistema o herramienta nueva desde cero, o definir cómo se conectan sus componentes. |
| `tech-debt` | Pregunta qué refactorizar, o pide una auditoría de calidad de código. |
| `testing-strategy` | Necesita definir qué y cómo testear algo. |

## Conectores disponibles

- **Exa** — búsqueda web y de documentación de código. Usalo cuando haga falta investigar librerías, APIs o ejemplos actualizados.
- **Railway** — desplegar, ver logs y administrar la infraestructura de la app. Usalo para todo lo relacionado a subir/publicar el proyecto.
- **Neon** — base de datos (Postgres). Usalo cuando el proyecto necesite guardar o consultar datos.

## Otras habilidades generales (no específicas de este proyecto)

- `dataviz` — para cualquier gráfico o dashboard.
- `docx` / `pdf` / `pptx` / `xlsx` — para generar documentos, PDFs, presentaciones o planillas.
- `skill-creator` — para crear una habilidad nueva si hace falta.

## Regla general

Antes de responder un pedido nuevo, preguntate: "¿esto encaja con alguna fila de la tabla de arriba?" Si sí, usá esa habilidad. Si no encaja con nada, resolvé el pedido directamente sin forzar ninguna habilidad.
