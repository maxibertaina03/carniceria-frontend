import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { FichaCliente } from './modulos/clientes/FichaCliente';
import { ListaClientes } from './modulos/clientes/ListaClientes';
import { FormularioNuevaCompra } from './modulos/compras/FormularioNuevaCompra';
import { ListaCompras } from './modulos/compras/ListaCompras';
import { ListaProductos } from './modulos/productos/ListaProductos';
import { PaginaReportes } from './modulos/reportes/PaginaReportes';
import { FormularioNuevaVenta } from './modulos/ventas/FormularioNuevaVenta';
import { ListaVentas } from './modulos/ventas/ListaVentas';

const secciones = [
  { ruta: '/ventas', nombre: 'Ventas', icono: '🧾' },
  { ruta: '/productos', nombre: 'Productos', icono: '🥩' },
  { ruta: '/compras', nombre: 'Compras', icono: '🚚' },
  { ruta: '/clientes', nombre: 'Clientes', icono: '👥' },
  { ruta: '/reportes', nombre: 'Reportes', icono: '📊' },
];

export function App() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 md:flex">
      {/* Barra lateral: solo en pantallas medianas y grandes */}
      <aside className="hidden w-52 shrink-0 flex-col border-r border-gray-200 bg-white md:flex">
        <div className="border-b border-gray-200 px-4 py-5">
          <h1 className="text-xl font-black text-red-700">La Carnicería</h1>
          <p className="text-xs text-gray-500">Sistema de gestión</p>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {secciones.map((seccion) => (
            <NavLink
              key={seccion.ruta}
              to={seccion.ruta}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 font-medium transition ${
                  isActive
                    ? 'bg-red-700 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <span className="mr-2">{seccion.icono}</span>
              {seccion.nombre}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Barra superior: solo en el celular */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white px-4 py-3 md:hidden">
        <h1 className="text-lg font-black text-red-700">La Carnicería</h1>
      </header>

      {/* pb-24 en celular para que la barra inferior no tape el contenido */}
      <main className="flex-1 p-4 pb-24 md:p-6 md:pb-6">
        <Routes>
          <Route path="/" element={<Navigate to="/ventas" replace />} />
          <Route path="/ventas" element={<ListaVentas />} />
          <Route path="/ventas/nueva" element={<FormularioNuevaVenta />} />
          <Route path="/productos" element={<ListaProductos />} />
          <Route path="/compras" element={<ListaCompras />} />
          <Route path="/compras/nueva" element={<FormularioNuevaCompra />} />
          <Route path="/clientes" element={<ListaClientes />} />
          <Route path="/clientes/:id" element={<FichaCliente />} />
          <Route path="/reportes" element={<PaginaReportes />} />
        </Routes>
      </main>

      {/* Navegación inferior tipo app: solo en el celular */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        {secciones.map((seccion) => (
          <NavLink
            key={seccion.ruta}
            to={seccion.ruta}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2 text-xs font-medium ${
                isActive ? 'text-red-700' : 'text-gray-500'
              }`
            }
          >
            <span className="text-xl leading-none">{seccion.icono}</span>
            {seccion.nombre}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
