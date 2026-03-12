# Magic Sky – Frontend

Storefront React + Vite para el ecommerce Magic Sky.

## Stack

- **React 18** + TypeScript
- **Vite**
- **Tailwind CSS**
- **Apollo Client** (GraphQL)
- **React Router**
- **i18next** (español/inglés)

## Instalación

```bash
pnpm install
```

## Ejecución

```bash
pnpm dev
```

Storefront en http://localhost:5173

**Requisito:** El backend debe estar corriendo en http://localhost:4000 (Vite hace proxy de `/graphql` al backend).

## Build

```bash
pnpm build
```

## Estructura

- `src/pages/` – Páginas (Home, Catálogo, Producto, Carrito, etc.)
- `src/components/` – Componentes reutilizables
- `src/context/` – CartContext
- `src/admin/` – Panel admin
- `src/graphql/` – Cliente Apollo
