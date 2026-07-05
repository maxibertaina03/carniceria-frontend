# Carnicería — Frontend

Interfaz web del sistema de gestión de la carnicería familiar. Pensada para usarse sin conocimientos de sistemas: formularios simples, confirmaciones antes de acciones importantes y mensajes de error en lenguaje claro.

**Stack:** React 18 + TypeScript + Vite, Tailwind CSS, React Query y axios. El código está organizado por módulos de negocio (`productos`, `compras`, `ventas`, `clientes`, `reportes`), con nombres en español.

## Qué se puede hacer

- **Ventas:** registrar ventas eligiendo productos y cantidad, con el precio sugerido editable. Se puede cobrar todo, fiar todo o **cobrar una parte y fiar el resto**. Si no hay stock suficiente, el sistema avisa y no deja vender.
- **Productos:** ver el stock actual, crear/editar/desactivar productos.
- **Compras:** registrar compras a proveedores; suben el stock y actualizan el costo.
- **Clientes:** ver cuánto debe cada uno, el historial completo de fiados y pagos, y registrar pagos parciales o totales.
- **Reportes:** ganancia por período, productos más vendidos, deudas pendientes y stock.

## Cómo correrlo localmente

Requisitos: Node 18 o superior, y el backend (`carniceria-backend`) corriendo.

```bash
npm install
cp .env.example .env   # apunta a http://localhost:3000 por defecto
npm run dev
```

La aplicación queda en `http://localhost:5173`.

## Variables de entorno

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL del backend. Local: `http://localhost:3000`. Producción: la URL de Render. |

## Despliegue en Vercel (gratis)

Antes hay que tener el backend desplegado en Render (ver README de `carniceria-backend`).

1. Crear cuenta en [vercel.com](https://vercel.com) (se puede entrar con GitHub).
2. **Add New → Project** y elegir el repositorio `carniceria-frontend`.
3. Vercel detecta Vite solo. Verificar:
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
4. En **Environment Variables** agregar:
   - `VITE_API_URL` = la URL pública del backend en Render (ej. `https://carniceria-backend.onrender.com`, **sin barra final**).
5. **Deploy**. Al terminar, Vercel da la URL pública del sistema (ej. `https://carniceria.vercel.app`), lista para usar desde cualquier celular o computadora.

> Si más adelante cambia la URL del backend, hay que actualizar `VITE_API_URL` en Vercel y hacer **Redeploy** (la variable se incorpora al compilar).
