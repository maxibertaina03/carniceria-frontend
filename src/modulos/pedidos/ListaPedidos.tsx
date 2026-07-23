import { useState } from 'react';
import { Link } from 'react-router-dom';
import { mensajeDeError } from '../../compartido/clienteHttp';
import { EstadoConsulta } from '../../compartido/componentes/EstadoConsulta';
import {
  formatearCantidad,
  formatearFecha,
  formatearMoneda,
} from '../../compartido/formato';
import { ModalEntregarPedido } from './ModalEntregarPedido';
import { Pedido } from './pedidosApi';
import { usePedidos, useMutacionesPedido } from './usePedidos';

const colorEstado: Record<string, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-700',
  ENTREGADO: 'bg-green-100 text-green-700',
  CANCELADO: 'bg-gray-200 text-gray-600',
};

const nombreEstado: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};

export function ListaPedidos() {
  const { data: pedidos, isLoading, error } = usePedidos();
  const { cancelar, eliminar } = useMutacionesPedido();
  const [pedidoAEntregar, setPedidoAEntregar] = useState<Pedido | null>(null);

  async function manejarCancelar(pedido: Pedido) {
    if (!window.confirm(`¿Cancelar el pedido de ${paraQuien(pedido)}?`)) {
      return;
    }
    try {
      await cancelar.mutateAsync(pedido.id);
    } catch (excepcion) {
      window.alert(mensajeDeError(excepcion));
    }
  }

  async function manejarEliminar(pedido: Pedido) {
    if (!window.confirm('¿Borrar este pedido de la lista?')) {
      return;
    }
    try {
      await eliminar.mutateAsync(pedido.id);
    } catch (excepcion) {
      window.alert(mensajeDeError(excepcion));
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-bold">Pedidos</h2>
        <Link to="/pedidos/nuevo" className="boton-primario">
          + Anotar pedido
        </Link>
      </div>
      <p className="mb-4 text-sm text-gray-500">
        Encargos de la gente. Un pedido no es plata ni descuenta stock hasta que
        lo entregás.
      </p>

      <EstadoConsulta cargando={isLoading} error={error} />

      {pedidos && pedidos.length === 0 && (
        <p className="tarjeta py-8 text-center text-gray-500">
          No hay pedidos anotados.
        </p>
      )}

      <div className="space-y-2">
        {pedidos?.map((pedido) => (
          <div
            key={pedido.id}
            className={`tarjeta ${pedido.estado !== 'PENDIENTE' ? 'opacity-70' : ''}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{paraQuien(pedido)}</p>
                <p className="text-sm text-gray-500">
                  {pedido.fechaEntrega
                    ? `Para el ${formatearFecha(pedido.fechaEntrega)}`
                    : `Anotado el ${formatearFecha(pedido.fecha)}`}
                  {pedido.telefono ? ` · ${pedido.telefono}` : ''}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`rounded px-2 py-0.5 text-xs font-semibold ${
                    colorEstado[pedido.estado] ?? ''
                  }`}
                >
                  {nombreEstado[pedido.estado] ?? pedido.estado}
                </span>
                <p className="mt-1 font-semibold">{formatearMoneda(pedido.total)}</p>
              </div>
            </div>

            <ul className="mt-2 space-y-1 border-t border-gray-100 pt-2 text-sm text-gray-600">
              {pedido.items.map((item) => (
                <li key={item.productoId} className="flex justify-between">
                  <span>
                    {item.productoNombre} —{' '}
                    {formatearCantidad(item.cantidad, item.unidadMedida)}
                  </span>
                  <span>{formatearMoneda(item.subtotal)}</span>
                </li>
              ))}
              {pedido.observaciones && (
                <li className="italic text-gray-500">Nota: {pedido.observaciones}</li>
              )}
            </ul>

            {pedido.estado === 'PENDIENTE' && (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  className="boton-primario"
                  onClick={() => setPedidoAEntregar(pedido)}
                >
                  Entregar
                </button>
                <button
                  className="text-sm font-medium text-gray-600 hover:underline"
                  onClick={() => manejarCancelar(pedido)}
                >
                  Cancelar
                </button>
                <button
                  className="text-sm font-medium text-red-600 hover:underline"
                  onClick={() => manejarEliminar(pedido)}
                >
                  Borrar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Se monta al abrirse para arrancar con los datos del pedido elegido */}
      {pedidoAEntregar && (
        <ModalEntregarPedido
          abierto
          alCerrar={() => setPedidoAEntregar(null)}
          pedido={pedidoAEntregar}
        />
      )}
    </div>
  );
}

function paraQuien(pedido: Pedido): string {
  return pedido.clienteNombre ?? pedido.nombreContacto ?? 'Sin nombre';
}
