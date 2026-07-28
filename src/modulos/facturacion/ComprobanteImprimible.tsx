import { Link, useParams } from 'react-router-dom';
import { mensajeDeError } from '../../compartido/clienteHttp';
import { EstadoConsulta } from '../../compartido/componentes/EstadoConsulta';
import {
  formatearCantidad,
  formatearFecha,
  formatearMoneda,
} from '../../compartido/formato';
import { ETIQUETA_TIPO } from './facturacionApi';
import { useComprobante, useMutacionesComprobante } from './useFacturacion';

export function ComprobanteImprimible() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error, refetch } = useComprobante(id!);
  const { anular } = useMutacionesComprobante();

  async function manejarAnular() {
    if (!window.confirm('¿Anular este comprobante? Queda registrado como anulado.'))
      return;
    try {
      await anular.mutateAsync(id!);
      await refetch();
    } catch (excepcion) {
      window.alert(mensajeDeError(excepcion));
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Barra de acciones: no se imprime */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 print:hidden">
        <Link to="/admin" className="text-sm text-blue-700 hover:underline">
          ← Volver a facturación
        </Link>
        <div className="flex gap-2">
          {data?.estado === 'EMITIDO' && (
            <button
              className="boton-secundario text-red-600"
              onClick={manejarAnular}
              disabled={anular.isPending}
            >
              Anular
            </button>
          )}
          <button className="boton-primario" onClick={() => window.print()}>
            🖨️ Imprimir / PDF
          </button>
        </div>
      </div>

      <EstadoConsulta cargando={isLoading} error={error} />

      {data && (
        <div className="tarjeta print:border-0 print:shadow-none">
          {/* Encabezado */}
          <div className="flex items-start justify-between border-b border-gray-200 pb-4">
            <div>
              <h1 className="text-2xl font-black text-red-700">La Carnicería</h1>
              <p className="text-sm text-gray-500">Comprobante interno</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">{ETIQUETA_TIPO[data.tipo]}</p>
              <p className="text-sm text-gray-600">{data.numeroFormateado}</p>
              <p className="text-sm text-gray-600">{formatearFecha(data.fecha)}</p>
              {data.estado === 'ANULADO' && (
                <p className="mt-1 font-bold text-red-600">ANULADO</p>
              )}
            </div>
          </div>

          {/* Receptor */}
          <div className="border-b border-gray-200 py-4 text-sm">
            <p>
              <span className="text-gray-500">Cliente: </span>
              <strong>{data.receptorNombre}</strong>
            </p>
            {(data.receptorDocTipo || data.receptorDocNumero) && (
              <p>
                <span className="text-gray-500">Documento: </span>
                {data.receptorDocTipo} {data.receptorDocNumero}
              </p>
            )}
            {data.receptorDomicilio && (
              <p>
                <span className="text-gray-500">Domicilio: </span>
                {data.receptorDomicilio}
              </p>
            )}
            {data.comprobanteOrigenNumero && (
              <p>
                <span className="text-gray-500">Sobre la factura: </span>
                {data.comprobanteOrigenNumero}
              </p>
            )}
          </div>

          {/* Detalle */}
          <table className="w-full py-4 text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-2">Descripción</th>
                <th className="py-2 text-right">Cant.</th>
                <th className="py-2 text-right">Precio</th>
                <th className="py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-2">{item.descripcion}</td>
                  <td className="py-2 text-right">
                    {formatearCantidad(item.cantidad, 'UNIDAD')}
                  </td>
                  <td className="py-2 text-right">
                    {formatearMoneda(item.precioUnitario)}
                  </td>
                  <td className="py-2 text-right">{formatearMoneda(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totales */}
          <div className="flex justify-end">
            <div className="w-full max-w-xs text-sm">
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Neto</span>
                <span>{formatearMoneda(data.neto)}</span>
              </div>
              {data.alicuotaIva > 0 && (
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">IVA ({data.alicuotaIva}%)</span>
                  <span>{formatearMoneda(data.iva)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-300 py-2 text-lg font-bold">
                <span>Total</span>
                <span>{formatearMoneda(data.total)}</span>
              </div>
            </div>
          </div>

          {data.observaciones && (
            <p className="mt-2 text-sm text-gray-600">
              <span className="text-gray-500">Observaciones: </span>
              {data.observaciones}
            </p>
          )}

          <p className="mt-6 border-t border-gray-200 pt-3 text-center text-xs text-gray-400">
            Documento interno sin validez fiscal (no emitido ante AFIP).
          </p>
        </div>
      )}
    </div>
  );
}
