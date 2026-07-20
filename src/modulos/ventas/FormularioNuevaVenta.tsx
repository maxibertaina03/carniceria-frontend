import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mensajeDeError } from '../../compartido/clienteHttp';
import { AvisoError } from '../../compartido/componentes/AvisoError';
import { formatearCantidad, formatearMoneda } from '../../compartido/formato';
import { FormularioCliente } from '../clientes/FormularioCliente';
import { useClientes } from '../clientes/useClientes';
import { useProductos } from '../productos/useProductos';
import { useRegistrarVenta } from './useVentas';

interface LineaVenta {
  productoId: string;
  cantidad: string;
  precioUnitarioVenta: string;
}

type ModoPago = 'CONTADO' | 'FIADO' | 'MIXTO';

const lineaVacia: LineaVenta = { productoId: '', cantidad: '', precioUnitarioVenta: '' };

export function FormularioNuevaVenta() {
  const navegar = useNavigate();
  const { data: todosLosProductos } = useProductos();
  const { data: clientes } = useClientes();
  const registrarVenta = useRegistrarVenta();

  // En Ventas solo se ofrecen los productos que se venden al mostrador
  // (se ocultan insumos y cortes intermedios de producción).
  const productos = todosLosProductos?.filter((producto) => producto.seVende);

  const [lineas, setLineas] = useState<LineaVenta[]>([{ ...lineaVacia }]);
  const [modoPago, setModoPago] = useState<ModoPago>('CONTADO');
  const [clienteId, setClienteId] = useState('');
  const [pagaAhora, setPagaAhora] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [modalClienteAbierto, setModalClienteAbierto] = useState(false);

  function cambiarLinea(indice: number, cambios: Partial<LineaVenta>) {
    setLineas((previas) =>
      previas.map((linea, i) => (i === indice ? { ...linea, ...cambios } : linea)),
    );
  }

  function elegirProducto(indice: number, productoId: string) {
    const producto = productos?.find((p) => p.id === productoId);
    cambiarLinea(indice, {
      productoId,
      // Sugerimos el precio de referencia; se puede cambiar en el momento.
      precioUnitarioVenta:
        producto && producto.precioVentaReferencia > 0
          ? String(producto.precioVentaReferencia)
          : '',
    });
  }

  const total = lineas.reduce((suma, linea) => {
    const cantidad = Number(linea.cantidad);
    const precio = Number(linea.precioUnitarioVenta);
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

    const items = lineas
      .filter((linea) => linea.productoId)
      .map((linea) => ({
        productoId: linea.productoId,
        cantidad: Number(linea.cantidad),
        precioUnitarioVenta: Number(linea.precioUnitarioVenta),
      }));
    if (items.length === 0) {
      setError('Agregá al menos un producto a la venta.');
      return;
    }
    if (modoPago !== 'CONTADO' && !clienteId) {
      setError('Para fiar hay que elegir el cliente.');
      return;
    }
    if (modoPago === 'MIXTO' && montoFiado === 0) {
      setError('En pago mixto, lo que paga ahora debe ser menor al total.');
      return;
    }

    try {
      await registrarVenta.mutateAsync({
        clienteId: clienteId || undefined,
        montoFiado: montoFiado > 0 ? Number(montoFiado.toFixed(2)) : undefined,
        observaciones: observaciones || undefined,
        items,
      });
      navegar('/ventas');
    } catch (excepcion) {
      setError(mensajeDeError(excepcion));
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mb-4 text-2xl font-bold">Registrar venta</h2>

      <form onSubmit={manejarEnvio} className="tarjeta flex flex-col gap-4">
        <div>
          <span className="etiqueta">Productos vendidos</span>
          <div className="flex flex-col gap-2">
            {lineas.map((linea, indice) => {
              const producto = productos?.find((p) => p.id === linea.productoId);
              return (
                <div
                  key={indice}
                  className="rounded-lg border border-gray-100 p-2 sm:border-0 sm:p-0"
                >
                  {/* En el celular el producto ocupa una fila y cantidad/precio la siguiente */}
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
                      className="campo min-w-0 flex-1 sm:w-28 sm:flex-none"
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
                      value={linea.precioUnitarioVenta}
                      onChange={(evento) =>
                        cambiarLinea(indice, {
                          precioUnitarioVenta: evento.target.value,
                        })
                      }
                      required={Boolean(linea.productoId)}
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
                      aria-label="Quitar línea"
                    >
                      ✕
                    </button>
                  </div>
                  {producto && (
                    <p
                      className={`mt-1 text-xs ${
                        Number(linea.cantidad) > producto.stockActual
                          ? 'font-semibold text-red-600'
                          : 'text-gray-500'
                      }`}
                    >
                      Stock disponible:{' '}
                      {formatearCantidad(producto.stockActual, producto.unidadMedida)}
                      {Number(linea.cantidad) > producto.stockActual &&
                        ' — no alcanza para esta venta'}
                    </p>
                  )}
                </div>
              );
            })}
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
          <span className="etiqueta">¿Cómo paga?</span>
          <div className="grid grid-cols-3 gap-2 sm:flex">
            {(
              [
                ['CONTADO', 'Paga todo ahora'],
                ['FIADO', 'Todo fiado'],
                ['MIXTO', 'Paga una parte'],
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
              <label className="etiqueta" htmlFor="cliente">¿Quién es el cliente?</label>
              <select
                id="cliente"
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
              <button
                type="button"
                className="mt-1 text-xs font-medium text-blue-700 hover:underline"
                onClick={() => setModalClienteAbierto(true)}
              >
                ¿Cliente nuevo? Crearlo
              </button>
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

        <div>
          <label className="etiqueta" htmlFor="observaciones">Observaciones (opcional)</label>
          <input
            id="observaciones"
            className="campo"
            value={observaciones}
            onChange={(evento) => setObservaciones(evento.target.value)}
          />
        </div>

        <div className="rounded-lg bg-gray-50 p-4 text-right">
          <p className="text-lg">
            Total: <strong>{formatearMoneda(total)}</strong>
          </p>
          {montoFiado > 0 && (
            <p className="text-sm text-amber-700">
              Queda fiado: <strong>{formatearMoneda(montoFiado)}</strong>
              {modoPago === 'MIXTO' &&
                ` (paga ahora ${formatearMoneda(Number(pagaAhora || 0))})`}
            </p>
          )}
        </div>

        <AvisoError mensaje={error} />

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Link to="/ventas" className="boton-secundario text-center">
            Cancelar
          </Link>
          <button
            type="submit"
            className="boton-primario"
            disabled={registrarVenta.isPending}
          >
            Confirmar venta
          </button>
        </div>
      </form>

      <FormularioCliente
        abierto={modalClienteAbierto}
        alCerrar={() => setModalClienteAbierto(false)}
      />
    </div>
  );
}
