import { useState } from 'react';
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { RequiereAdmin } from './modulos/admin/RequiereAdmin';
import { ComprobanteImprimible } from './modulos/facturacion/ComprobanteImprimible';
import { FormularioComprobante } from './modulos/facturacion/FormularioComprobante';
import { PaginaFacturacion } from './modulos/facturacion/PaginaFacturacion';
import { FichaCliente } from './modulos/clientes/FichaCliente';
import { ListaClientes } from './modulos/clientes/ListaClientes';
import { FormularioNuevaCompra } from './modulos/compras/FormularioNuevaCompra';
import { ListaCompras } from './modulos/compras/ListaCompras';
import { FormularioNuevoDesposte } from './modulos/desposte/FormularioNuevoDesposte';
import { ListaDespostes } from './modulos/desposte/ListaDespostes';
import { PaginaGastos } from './modulos/gastos/PaginaGastos';
import { PaginaInicio } from './modulos/inicio/PaginaInicio';
import { FormularioNuevoPedido } from './modulos/pedidos/FormularioNuevoPedido';
import { ListaPedidos } from './modulos/pedidos/ListaPedidos';
import { ListaProductos } from './modulos/productos/ListaProductos';
import { PaginaProduccion } from './modulos/produccion/PaginaProduccion';
import { FichaProveedor } from './modulos/proveedores/FichaProveedor';
import { ListaProveedores } from './modulos/proveedores/ListaProveedores';
import { PaginaReportes } from './modulos/reportes/PaginaReportes';
import { FormularioNuevaVenta } from './modulos/ventas/FormularioNuevaVenta';
import { ListaVentas } from './modulos/ventas/ListaVentas';

interface Seccion {
  ruta: string;
  nombre: string;
  icono: string;
}

// Las 4 secciones más usadas van en la barra inferior del celular.
const seccionesPrincipales: Seccion[] = [
  { ruta: '/inicio', nombre: 'Inicio', icono: '🏠' },
  { ruta: '/ventas', nombre: 'Ventas', icono: '🧾' },
  { ruta: '/pedidos', nombre: 'Pedidos', icono: '📋' },
  { ruta: '/clientes', nombre: 'Clientes', icono: '👥' },
];

// El resto se agrupa bajo el botón "Más" en el celular.
const seccionesSecundarias: Seccion[] = [
  { ruta: '/productos', nombre: 'Productos', icono: '🥩' },
  { ruta: '/reportes', nombre: 'Reportes', icono: '📊' },
  { ruta: '/compras', nombre: 'Compras', icono: '🚚' },
  { ruta: '/proveedores', nombre: 'Proveedores', icono: '🏪' },
  { ruta: '/gastos', nombre: 'Gastos', icono: '💸' },
  { ruta: '/desposte', nombre: 'Desposte', icono: '🔪' },
  { ruta: '/produccion', nombre: 'Producción', icono: '🏭' },
  { ruta: '/admin', nombre: 'Admin', icono: '🔒' },
];

const todasLasSecciones = [...seccionesPrincipales, ...seccionesSecundarias];

export function App() {
  const [menuMasAbierto, setMenuMasAbierto] = useState(false);
  const ubicacion = useLocation();
  const enSeccionSecundaria = seccionesSecundarias.some((s) =>
    ubicacion.pathname.startsWith(s.ruta),
  );

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 md:flex">
      {/* Barra lateral: solo en pantallas medianas y grandes (todas las secciones) */}
      <aside className="hidden w-52 shrink-0 flex-col border-r border-gray-200 bg-white md:flex print:hidden">
        <div className="border-b border-gray-200 px-4 py-5">
          <h1 className="text-xl font-black text-red-700">La Carnicería</h1>
          <p className="text-xs text-gray-500">Sistema de gestión</p>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {todasLasSecciones.map((seccion) => (
            <NavLink
              key={seccion.ruta}
              to={seccion.ruta}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 font-medium transition ${
                  isActive ? 'bg-red-700 text-white' : 'text-gray-700 hover:bg-gray-100'
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
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white px-4 py-3 md:hidden print:hidden">
        <h1 className="text-lg font-black text-red-700">La Carnicería</h1>
      </header>

      {/* pb-24 en celular para que la barra inferior no tape el contenido */}
      <main className="flex-1 p-4 pb-24 md:p-6 md:pb-6 print:p-0">
        <Routes>
          <Route path="/" element={<Navigate to="/inicio" replace />} />
          <Route path="/inicio" element={<PaginaInicio />} />
          <Route path="/ventas" element={<ListaVentas />} />
          <Route path="/ventas/nueva" element={<FormularioNuevaVenta />} />
          <Route path="/pedidos" element={<ListaPedidos />} />
          <Route path="/pedidos/nuevo" element={<FormularioNuevoPedido />} />
          <Route path="/productos" element={<ListaProductos />} />
          <Route path="/compras" element={<ListaCompras />} />
          <Route path="/compras/nueva" element={<FormularioNuevaCompra />} />
          <Route path="/proveedores" element={<ListaProveedores />} />
          <Route path="/proveedores/:id" element={<FichaProveedor />} />
          <Route path="/gastos" element={<PaginaGastos />} />
          <Route path="/desposte" element={<ListaDespostes />} />
          <Route path="/desposte/nuevo" element={<FormularioNuevoDesposte />} />
          <Route path="/produccion" element={<PaginaProduccion />} />
          <Route path="/clientes" element={<ListaClientes />} />
          <Route path="/clientes/:id" element={<FichaCliente />} />
          <Route path="/reportes" element={<PaginaReportes />} />
          <Route
            path="/admin"
            element={
              <RequiereAdmin>
                <PaginaFacturacion />
              </RequiereAdmin>
            }
          />
          <Route
            path="/admin/nuevo"
            element={
              <RequiereAdmin>
                <FormularioComprobante />
              </RequiereAdmin>
            }
          />
          <Route
            path="/admin/comprobante/:id"
            element={
              <RequiereAdmin>
                <ComprobanteImprimible />
              </RequiereAdmin>
            }
          />
        </Routes>
      </main>

      {/* Menú "Más" desplegable (celular) */}
      {menuMasAbierto && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMenuMasAbierto(false)}
        >
          <div
            className="absolute inset-x-0 bottom-16 rounded-t-2xl bg-white p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-xl"
            onClick={(evento) => evento.stopPropagation()}
          >
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Más secciones
            </p>
            {seccionesSecundarias.map((seccion) => (
              <NavLink
                key={seccion.ruta}
                to={seccion.ruta}
                onClick={() => setMenuMasAbierto(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-3 font-medium ${
                    isActive ? 'bg-red-50 text-red-700' : 'text-gray-700'
                  }`
                }
              >
                <span className="text-xl">{seccion.icono}</span>
                {seccion.nombre}
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {/* Navegación inferior tipo app: solo en el celular */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden print:hidden">
        {seccionesPrincipales.map((seccion) => (
          <NavLink
            key={seccion.ruta}
            to={seccion.ruta}
            onClick={() => setMenuMasAbierto(false)}
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
        <button
          type="button"
          onClick={() => setMenuMasAbierto((abierto) => !abierto)}
          className={`flex flex-col items-center gap-0.5 py-2 text-xs font-medium ${
            enSeccionSecundaria || menuMasAbierto ? 'text-red-700' : 'text-gray-500'
          }`}
        >
          <span className="text-xl leading-none">⋯</span>
          Más
        </button>
      </nav>
    </div>
  );
}
