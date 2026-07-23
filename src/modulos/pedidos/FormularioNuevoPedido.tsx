import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mensajeDeError } from '../../compartido/clienteHttp';
import { AvisoError } from '../../compartido/componentes/AvisoError';
import { formatearMoneda } from '../../compartido/formato';
import { useClientes } from '../clientes/useClientes';
import { useProductos } from '../productos/useProductos';
import { useMutacionesPedido } from './usePedidos';

interface Linea {
  productoId: string;
  cantidad: string;
  precioUnitario: string;
}

const lineaVacia: Linea = { productoId: '', cantidad: '', precioUnitario: '' };

export function FormularioNuevoPedido() {
  const navegar = useNavigate();
  const { data: todosLosProductos } = useProductos();
  const { data: clientes } = useClientes();
  const { crear } = useMutacionesPedido();

  // Se encargan productos que se venden al mostrador.
  const productos = todosLosProductos?.filter((p) => p.seVende);

  const [clienteId, setClienteId] = useState('');
  const [nombreContacto, setNombreContacto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [lineas, setLineas] = useState<Linea[]>([{ ...lineaVacia }]);
  const [error, setError] = useState<string | null>(null);

  function cambiarLinea(indice: number, cambios: Partial<Linea>) {
    setLineas((previas) =>
      previas.map((linea, i) => (i === indice ? { ...linea, ...cambios } : linea)),
    );
  }

  function elegirProducto(indice: number, productoId: string) {
    const producto = productos?.find((p) => p.id === productoId);
    cambiarLinea(indice, {
      productoId,
      precioUnitario:
        producto && producto.precioVentaReferencia > 0
          ? String(producto.precioVentaReferencia)
          : '',
    });
  }

  const total = lineas.reduce((suma, linea) => {
    const cantidad = Number(linea.cantidad);
    const precio = Number(linea.precioUnitario);
    return suma + (cantidad > 0 && precio >= 0 ? cantidad * precio : 0);
  }, 0);

  async function manejarEnvio(evento: FormEvent) {
    evento.preventDefault();
    setError(null);

    const items = lineas
      .filter((linea) => linea.productoId)
      .map((linea) => ({
        productoId: linea.productoId,
        cantidad: Number(linea.cantidad),
        precioUnitario: linea.precioUnitario
          ? Number(linea.precioUnitario)
          : undefined,
      }));
    if (items.length === 0) {
      setError('Agregá al menos un producto al pedido.');
      return;
    }
    if (!clienteId && !nombreContacto.trim()) {
      setError('Indicá para quién es el pedido (un cliente o un nombre).');
      return;
    }

    try {
      await crear.mutateAsync({
        clienteId: clienteId || undefined,
        nombreContacto: clienteId ? undefined : nombreContacto || undefined,
        telefono: clienteId ? undefined : telefono || undefined,
        fechaEntrega: fechaEntrega || undefined,
        observaciones: observaciones || undefined,
        items,
      });
      navegar('/pedidos');
    } catch (excepcion) {
      setError(mensajeDeError(excepcion));
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mb-1 text-2xl font-bold">Anotar pedido</h2>
      <p className="mb-4 text-sm text-gray-500">
        Un pedido queda anotado como pendiente. No toca el stock ni la plata: eso
        se mueve cuando lo entregás.
      </p>

      <form onSubmit={manejarEnvio} className="tarjeta flex flex-col gap-4">
        <div>
          <label className="etiqueta" htmlFor="cliente">¿Para quién es?</label>
          <select
            id="cliente"
            className="campo"
            value={clienteId}
            onChange={(evento) => setClienteId(evento.target.value)}
          >
            <option value="">Cliente sin registrar (escribo el nombre)</option>
            {clientes?.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre}
              </option>
            ))}
          </select>
        </div>

        {!clienteId && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="etiqueta" htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                className="campo"
                value={nombreContacto}
                onChange={(evento) => setNombreContacto(evento.target.value)}
                placeholder="Ej: Juan"
              />
            </div>
            <div>
              <label className="etiqueta" htmlFor="telefono">Teléfono (opcional)</label>
              <input
                id="telefono"
                className="campo"
                value={telefono}
                onChange={(evento) => setTelefono(evento.target.value)}
              />
            </div>
          </div>
        )}

        <div>
          <label className="etiqueta" htmlFor="fechaEntrega">¿Para cuándo? (opcional)</label>
          <input
            id="fechaEntrega"
            className="campo"
            type="date"
            value={fechaEntrega}
            onChange={(evento) => setFechaEntrega(evento.target.value)}
          />
        </div>

        <div>
          <span className="etiqueta">Productos encargados</span>
          <div className="flex flex-col gap-2">
            {lineas.map((linea, indice) => (
              <div
                key={indice}
                className="rounded-lg border border-gray-100 p-2 sm:border-0 sm:p-0"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    className="campo sm:w-auto sm:flex-1"
                    value={linea.productoId}
                    onChange={(evento) => elegirProducto(indice, evento.target.value)}
                  >
                    <option value="">Elegir producto…</option>
                    {productos?.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                  <input
                    className="campo min-w-0 flex-1 sm:w-24 sm:flex-none"
                    type="number"
                    min="0.001"
                    step="0.001"
                    placeholder="Cantidad"
                    value={linea.cantidad}
                    onChange={(evento) =>
                      cambiarLinea(indice, { cantidad: evento.target.value })
                    }
                    required={Boolean(linea.productoId)}
                  />
                  <input
                    className="campo min-w-0 flex-1 sm:w-32 sm:flex-none"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Precio x kg/u."
                    value={linea.precioUnitario}
                    onChange={(evento) =>
                      cambiarLinea(indice, { precioUnitario: evento.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                    onClick={() =>
                      setLineas((previas) =>
                        previas.length > 1
                          ? previas.filter((_, i) => i !== indice)
                          : [{ ...lineaVacia }],
                      )
                    }
                    aria-label="Quitar producto"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-2 text-sm font-medium text-blue-700 hover:underline"
            onClick={() => setLineas((previas) => [...previas, { ...lineaVacia }])}
          >
            + Agregar otro producto
          </button>
        </div>

        <div>
          <label className="etiqueta" htmlFor="observaciones">Observaciones (opcional)</label>
          <input
            id="observaciones"
            className="campo"
            value={observaciones}
            onChange={(evento) => setObservaciones(evento.target.value)}
          />
        </div>

        <p className="text-right text-lg">
          Total estimado: <strong>{formatearMoneda(total)}</strong>
        </p>

        <AvisoError mensaje={error} />

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Link to="/pedidos" className="boton-secundario text-center">Cancelar</Link>
          <button type="submit" className="boton-primario" disabled={crear.isPending}>
            Anotar pedido
          </button>
        </div>
      </form>
    </div>
  );
}
