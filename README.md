# Magic Sky – Frontend

Storefront React + Vite para el ecommerce Magic Sky.

## Stack

- **React 18** + TypeScript
- **Vite**
- **Tailwind CSS**
- **Apollo Client** (GraphQL)
- **React Router**
- **i18next** (español/inglés)

---

## Ejecución local

### Requisitos

- Node.js 20+
- pnpm
- **Backend corriendo** en `http://localhost:4000`

### 1. Instalación

```bash
pnpm install
```

### 2. Ejecutar

```bash
pnpm dev
```

Storefront en **http://localhost:5173**

Vite hace proxy de `/graphql` al backend en `localhost:4000`. Si el backend no está activo, las peticiones GraphQL fallarán.

### 3. Build de producción

```bash
pnpm build
```

Salida en `dist/`. Para previsualizar:

```bash
pnpm preview
```

---

## Ejecución con Docker Compose

Desde la carpeta **frontend**:

```bash
cd frontend
docker compose up -d
```

Storefront en **http://localhost:5173**. **Requisito:** el backend debe estar corriendo en `localhost:4000`. El proxy de Vite usa `VITE_PROXY_TARGET` (por defecto `http://host.docker.internal:4000`) para alcanzar el backend en el host.

---

## Estructura

```
src/
├── pages/        # Páginas (Home, Catálogo, Producto, Carrito, etc.)
├── components/   # Componentes reutilizables
├── context/      # CartContext
├── admin/        # Panel admin
└── graphql/      # Cliente Apollo
```
