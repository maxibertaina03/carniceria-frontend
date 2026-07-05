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
    <div className="flex min-h-screen bg-gray-100 text-gray-900">
      <aside className="flex w-52 shrink-0 flex-col border-r border-gray-200 bg-white">
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

      <main className="flex-1 overflow-x-auto p-6">
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
    </div>
  );
}
