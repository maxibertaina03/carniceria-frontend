import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { EstadoConsulta } from '../../compartido/componentes/EstadoConsulta';
import { formatearFecha, formatearMoneda } from '../../compartido/formato';
import { reportesApi } from '../reportes/reportesApi';

export function PaginaInicio() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['reportes', 'inicio'],
    queryFn: reportesApi.resumenInicio,
  });

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      <div>
        <h2 className="text-2xl font-bold">Hola 👋</h2>
        {data && (
          <p className="text-gray-500">Resumen del {formatearFecha(data.fecha)}</p>
        )}
      </div>

      <EstadoConsulta cargando={isLoading} error={error} />

      {data && (
        <>
          {/* Avisos de boletas (solo si hay algo para mostrar) */}
          {data.boletas.vencidas > 0 && (
            <Link
              to="/gastos"
              className="flex items-center gap-3 rounded-xl border-l-4 border-red-500 bg-red-50 p-4 text-red-800"
            >
              <span className="text-2xl">⚠️</span>
              <span>
                Tenés{' '}
                <strong>
                  {data.boletas.vencidas} boleta{data.boletas.vencidas > 1 ? 's' : ''}{' '}
                  vencida{data.boletas.vencidas > 1 ? 's' : ''}
                </strong>{' '}
                sin pagar. Tocá para verlas.
              </span>
            </Link>
          )}
          {data.boletas.porVencer > 0 && (
            <Link
              to="/gastos"
              className="flex items-center gap-3 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-4 text-amber-800"
            >
              <span className="text-2xl">🔔</span>
              <span>
                <strong>
                  {data.boletas.porVencer} boleta{data.boletas.porVencer > 1 ? 's' : ''}
                </strong>{' '}
                vence{data.boletas.porVencer > 1 ? 'n' : ''} esta semana.
              </span>
            </Link>
          )}

          {/* Ventas de hoy: la tarjeta principal */}
          <div className="tarjeta">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Ventas de hoy</p>
                <p className="mt-1 text-4xl font-black">
                  {formatearMoneda(data.ventasHoy.total)}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {data.ventasHoy.cantidad === 0
                    ? 'Todavía no hubo ventas hoy'
                    : `${data.ventasHoy.cantidad} venta${
                        data.ventasHoy.cantidad > 1 ? 's' : ''
                      }`}
                </p>
              </div>
              <Link to="/ventas/nueva" className="boton-primario shrink-0">
                + Vender
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-green-50 p-3">
                <p className="text-xs font-medium text-green-700">Entró (contado)</p>
                <p className="text-xl font-bold text-green-700">
                  {formatearMoneda(data.ventasHoy.contado)}
                </p>
              </div>
              <div className="rounded-lg bg-orange-50 p-3">
                <p className="text-xs font-medium text-orange-700">Quedó a deber (fiado)</p>
                <p className="text-xl font-bold text-orange-700">
                  {formatearMoneda(data.ventasHoy.fiado)}
                </p>
              </div>
            </div>
          </div>

          {/* Tarjetas de estado del negocio */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Link to="/clientes" className="tarjeta transition hover:shadow-md">
              <p className="text-sm font-medium text-gray-500">Te deben</p>
              <p
                className={`mt-1 text-2xl font-black ${
                  data.totalPorCobrar > 0 ? 'text-orange-600' : 'text-gray-400'
                }`}
              >
                {formatearMoneda(data.totalPorCobrar)}
              </p>
              <p className="mt-1 text-xs text-gray-400">Clientes (fiado)</p>
            </Link>

            <Link to="/proveedores" className="tarjeta transition hover:shadow-md">
              <p className="text-sm font-medium text-gray-500">Debés</p>
              <p
                className={`mt-1 text-2xl font-black ${
                  data.totalPorPagar > 0 ? 'text-red-600' : 'text-gray-400'
                }`}
              >
                {formatearMoneda(data.totalPorPagar)}
              </p>
              <p className="mt-1 text-xs text-gray-400">Proveedores</p>
            </Link>

            <Link
              to="/pedidos"
              className="tarjeta col-span-2 transition hover:shadow-md sm:col-span-1"
            >
              <p className="text-sm font-medium text-gray-500">Pedidos por entregar</p>
              <p
                className={`mt-1 text-2xl font-black ${
                  data.pedidosPendientes > 0 ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                {data.pedidosPendientes}
              </p>
              <p className="mt-1 text-xs text-gray-400">Pendientes</p>
            </Link>
          </div>

          {/* Accesos rápidos */}
          <div>
            <p className="mb-2 text-sm font-semibold text-gray-500">Accesos rápidos</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <AccesoRapido a="/ventas/nueva" icono="🧾" texto="Nueva venta" />
              <AccesoRapido a="/pedidos/nuevo" icono="📋" texto="Nuevo pedido" />
              <AccesoRapido a="/compras/nueva" icono="🚚" texto="Cargar compra" />
              <AccesoRapido a="/gastos" icono="💸" texto="Cargar gasto" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function AccesoRapido({ a, icono, texto }: { a: string; icono: string; texto: string }) {
  return (
    <Link
      to={a}
      className="tarjeta flex flex-col items-center gap-1 py-4 text-center transition hover:shadow-md"
    >
      <span className="text-2xl">{icono}</span>
      <span className="text-sm font-medium">{texto}</span>
    </Link>
  );
}
