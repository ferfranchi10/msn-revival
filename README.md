# MSN Revival

MVP de mensajería instantánea privada para un grupo cerrado de amigos, con la
estética y funcionalidad de MSN Messenger clásico: lista de contactos, presencia en
tiempo real, estados, mensaje personal, zumbidos, emoticonos propios y sonidos retro.

Spec completa del producto: [PROJECT_MSN_Revival_MVP.md](PROJECT_MSN_Revival_MVP.md).
Estado y decisiones del proyecto: [CONTEXT.md](CONTEXT.md). Checklist de fases: [TASKS.md](TASKS.md).

## Stack

- [Next.js](https://nextjs.org) (App Router) + React + TypeScript
- Tailwind CSS
- Firebase (Authentication, Firestore, Realtime Database, Cloud Messaging, Storage)
- Vercel (hosting)

## Requisitos

- Node.js 20+
- Una cuenta de Firebase (proyecto propio, ver `.env.example`)

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # completar con las claves reales de Firebase
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev      # servidor de desarrollo
npm run build    # build de producción
npm run start    # servir el build de producción
npm run lint     # eslint
```

## Variables de entorno

Ver [.env.example](.env.example). Los valores reales van solo en `.env.local`
(ignorado por git) o en las variables de entorno del proyecto en Vercel — nunca en el repo.
