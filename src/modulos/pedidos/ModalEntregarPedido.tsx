import { FormEvent, useState } from 'react';
import { mensajeDeError } from '../../compartido/clienteHttp';
import { AvisoError } from '../../compartido/componentes/AvisoError';
import { Modal } from '../../compartido/componentes/Modal';
import { formatearMoneda } from '../../compartido/formato';
import { useClientes } from '../clientes/useClientes';
import { Pedido } from './pedidosApi';
import { useMutacionesPedido } from './usePedidos';

interface Props {
  abierto: boolean;
  alCerrar: () => void;
  pedido: Pedido | null;
}

type ModoPago = 'CONTADO' | 'FIADO' | 'MIXTO';

interface LineaEntrega {
  productoId: string;
  nombre: string;
  cantidad: string;
  precio: string;
}

export function ModalEntregarPedido({ abierto, alCerrar, pedido }: Props) {
  const { data: clientes } = useClientes();
  const { entregar } = useMutacionesPedido();
  const [lineas, setLineas] = useState<LineaEntrega[]>(
    pedido
      ? pedido.items.map((item) => ({
          productoId: item.productoId,
          nombre: item.productoNombre,
          cantidad: String(item.cantidad),
          precio: String(item.precioUnitario),
        }))
      : [],
  );
  const [modoPago, setModoPago] = useState<ModoPago>('CONTADO');
  const [clienteId, setClienteId] = useState(pedido?.clienteId ?? '');
  const [pagaAhora, setPagaAhora] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!pedido) {
    return null;
  }

  function cambiarLinea(indice: number, cambios: Partial<LineaEntrega>) {
    setLineas((previas) =>
      previas.map((linea, i) => (i === indice ? { ...linea, ...cambios } : linea)),
    );
  }

  const total = lineas.reduce((suma, linea) => {
    const cantidad = Number(linea.cantidad);
    const precio = Number(linea.precio);
    return suma + (cantidad > 0 && precio >= 0 ? cantidad * precio : 0);
  }, 0);

  const montoFiado =
    modoPago === 'CONTADO'
      ? 0
      : modoPago === 'FIADO'
        ? total
        : Math.max(total - Number(pagaAhora || 0), 0);

  async function manejarEnvio(evento: FormEvent) {
    evento.preventDefault();
    setError(null);

    if (modoPago !== 'CONTADO' && !clienteId) {
      setError('Para entregar fiado hay que elegir el cliente.');
      return;
    }
    if (modoPago === 'MIXTO' && montoFiado === 0) {
      setError('En pago mixto, lo que paga ahora debe ser menor al total.');
      return;
    }

    try {
      await entregar.mutateAsync({
        id: pedido!.id,
        datos: {
          clienteId: clienteId || undefined,
          montoFiado: montoFiado > 0 ? Number(montoFiado.toFixed(2)) : undefined,
          items: lineas.map((linea) => ({
            productoId: linea.productoId,
            cantidad: Number(linea.cantidad),
            precioUnitarioVenta: Number(linea.precio),
          })),
        },
      });
      alCerrar();
    } catch (excepcion) {
      setError(mensajeDeError(excepcion));
    }
  }

  const paraQuien = pedido.clienteNombre ?? pedido.nombreContacto ?? 'Consumidor final';

  return (
    <Modal titulo={`Entregar pedido de ${paraQuien}`} abierto={abierto} alCerrar={alCerrar}>
      <form onSubmit={manejarEnvio} className="flex flex-col gap-4">
        <div>
          <span className="etiqueta">Confirmá lo que entregás (pesá la carne)</span>
          <div className="flex flex-col gap-2">
            {lineas.map((linea, indice) => (
              <div key={linea.productoId} className="flex flex-wrap items-center gap-2">
                <span className="min-w-0 flex-1 text-sm text-gray-700">
                  {linea.nombre}
                </span>
                <input
                  className="campo w-24"
                  type="number"
                  min="0.001"
                  step="0.001"
                  placeholder="Cant."
                  value={linea.cantidad}
                  onChange={(evento) =>
                    cambiarLinea(indice, { cantidad: evento.target.value })
                  }
                  required
                />
                <input
                  className="campo w-28"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Precio"
                  value={linea.precio}
                  onChange={(evento) =>
                    cambiarLinea(indice, { precio: evento.target.value })
                  }
                  required
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <span className="etiqueta">¿Cómo paga?</span>
          <div className="grid grid-cols-3 gap-2 sm:flex">
            {(
              [
                ['CONTADO', 'Paga todo'],
                ['FIADO', 'Fiado'],
                ['MIXTO', 'Una parte'],
              ] as [ModoPago, string][]
            ).map(([modo, etiqueta]) => (
              <button
                key={modo}
                type="button"
                onClick={() => setModoPago(modo)}
                className={`rounded-lg border px-2 py-2 text-center text-sm font-medium transition sm:px-4 ${
                  modoPago === modo
                    ? 'border-red-700 bg-red-50 text-red-700'
                    : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {etiqueta}
              </button>
            ))}
          </div>
        </div>

        {modoPago !== 'CONTADO' && (
          <div className="grid grid-cols-1 gap-4 rounded-lg bg-amber-50 p-4 sm:grid-cols-2">
            <div>
              <label className="etiqueta" htmlFor="clienteEntrega">¿Quién es el cliente?</label>
              <select
                id="clienteEntrega"
                className="campo"
                value={clienteId}
                onChange={(evento) => setClienteId(evento.target.value)}
                required
              >
                <option value="">Elegir cliente…</option>
                {clientes?.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre}
                  </option>
                ))}
              </select>
            </div>
            {modoPago === 'MIXTO' && (
              <div>
                <label className="etiqueta" htmlFor="pagaAhora">¿Cuánto paga ahora?</label>
                <input
                  id="pagaAhora"
                  className="campo"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={pagaAhora}
                  onChange={(evento) => setPagaAhora(evento.target.value)}
                  required
                />
              </div>
            )}
          </div>
        )}

        <div className="rounded-lg bg-gray-50 p-3 text-right">
          <p className="text-lg">
            Total: <strong>{formatearMoneda(total)}</strong>
          </p>
          {montoFiado > 0 && (
            <p className="text-sm text-amber-700">
              Queda fiado: <strong>{formatearMoneda(montoFiado)}</strong>
            </p>
          )}
        </div>

        <AvisoError mensaje={error} />

        <div className="flex justify-end gap-2">
          <button type="button" className="boton-secundario" onClick={alCerrar}>
            Cancelar
          </button>
          <button type="submit" className="boton-primario" disabled={entregar.isPending}>
            Confirmar entrega
          </button>
        </div>
      </form>
    </Modal>
  );
}
