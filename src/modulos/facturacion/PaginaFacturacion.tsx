import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EstadoConsulta } from '../../compartido/componentes/EstadoConsulta';
import { formatearFecha, formatearMoneda } from '../../compartido/formato';
import { cerrarSesionAdmin } from '../admin/adminAuth';
import { ETIQUETA_TIPO, TipoComprobante } from './facturacionApi';
import { useComprobantes } from './useFacturacion';

const TIPOS: (TipoComprobante | 'TODOS')[] = [
  'TODOS',
  'FACTURA',
  'RECIBO',
  'NOTA_CREDITO',
  'NOTA_DEBITO',
];

export function PaginaFacturacion() {
  const navegar = useNavigate();
  const [filtro, setFiltro] = useState<TipoComprobante | 'TODOS'>('TODOS');
  const { data, isLoading, error } = useComprobantes(
    filtro === 'TODOS' ? undefined : filtro,
  );

  function salir() {
    cerrarSesionAdmin();
    navegar('/inicio');
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-1 flex items-center justify-between">
        <span className="rounded-full bg-gray-800 px-3 py-0.5 text-xs font-semibold text-white">
          🔒 Admin
        </span>
        <button
          className="text-sm font-medium text-gray-500 hover:underline"
          onClick={salir}
        >
          Cerrar sesión
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Facturación</h2>
          <p className="text-sm text-gray-500">
            Comprobantes internos (sin AFIP todavía). Facturas, recibos y notas.
          </p>
        </div>
        <Link to="/admin/nuevo" className="boton-primario">
          + Nuevo comprobante
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {TIPOS.map((tipo) => (
          <button
            key={tipo}
            onClick={() => setFiltro(tipo)}
            className={`rounded-full border px-3 py-1 text-sm font-medium transition ${
              filtro === tipo
                ? 'border-red-700 bg-red-50 text-red-700'
                : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tipo === 'TODOS' ? 'Todos' : ETIQUETA_TIPO[tipo]}
          </button>
        ))}
      </div>

      <EstadoConsulta cargando={isLoading} error={error} />

      {data && data.length === 0 && (
        <p className="tarjeta py-8 text-center text-gray-500">
          Todavía no hay comprobantes. Creá el primero con “Nuevo comprobante”.
        </p>
      )}

      {data && data.length > 0 && (
        <div className="tarjeta overflow-x-auto p-0">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="encabezado-tabla">Comprobante</th>
                <th className="encabezado-tabla hidden sm:table-cell">Fecha</th>
                <th className="encabezado-tabla">Cliente</th>
                <th className="encabezado-tabla text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((comprobante) => (
                <tr
                  key={comprobante.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => navegar(`/admin/comprobante/${comprobante.id}`)}
                >
                  <td className="celda">
                    <div className="font-semibold">
                      {ETIQUETA_TIPO[comprobante.tipo]}
                      {comprobante.estado === 'ANULADO' && (
                        <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-xs font-semibold text-red-700">
                          Anulado
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {comprobante.numeroFormateado}
                    </div>
                  </td>
                  <td className="celda hidden text-gray-600 sm:table-cell">
                    {formatearFecha(comprobante.fecha)}
                  </td>
                  <td className="celda">{comprobante.receptorNombre}</td>
                  <td className="celda text-right font-semibold">
                    {formatearMoneda(comprobante.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
