import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mensajeDeError } from '../../compartido/clienteHttp';
import { AvisoError } from '../../compartido/componentes/AvisoError';
import { formatearMoneda } from '../../compartido/formato';
import { FormularioProducto } from '../productos/FormularioProducto';
import { useProductos } from '../productos/useProductos';
import { FormularioProveedor } from '../proveedores/FormularioProveedor';
import { useProveedores } from '../proveedores/useProveedores';
import { useRegistrarCompra } from './useCompras';

interface LineaCompra {
  productoId: string;
  cantidad: string;
  costoUnitario: string;
}

type ModoPago = 'CONTADO' | 'ADEUDADO' | 'MIXTO';

const lineaVacia: LineaCompra = { productoId: '', cantidad: '', costoUnitario: '' };

export function FormularioNuevaCompra() {
  const navegar = useNavigate();
  const { data: productos } = useProductos();
  const { data: proveedores } = useProveedores();
  const registrarCompra = useRegistrarCompra();

  const [proveedorId, setProveedorId] = useState('');
  const [modoPago, setModoPago] = useState<ModoPago>('CONTADO');
  const [pagaAhora, setPagaAhora] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [lineas, setLineas] = useState<LineaCompra[]>([{ ...lineaVacia }]);
  const [error, setError] = useState<string | null>(null);
  const [modalProductoAbierto, setModalProductoAbierto] = useState(false);
  const [modalProveedorAbierto, setModalProveedorAbierto] = useState(false);

  function cambiarLinea(indice: number, cambios: Partial<LineaCompra>) {
    setLineas((previas) =>
      previas.map((linea, i) => (i === indice ? { ...linea, ...cambios } : linea)),
    );
  }

  function elegirProducto(indice: number, productoId: string) {
    const producto = productos?.find((p) => p.id === productoId);
    cambiarLinea(indice, {
      productoId,
      // Sugerimos el último costo conocido; se puede cambiar.
      costoUnitario:
        producto && producto.costoUnitarioReferencia > 0
          ? String(producto.costoUnitarioReferencia)
          : '',
    });
  }

  const total = lineas.reduce((suma, linea) => {
    const cantidad = Number(linea.cantidad);
    const costo = Number(linea.costoUnitario);
    return suma + (cantidad > 0 && costo >= 0 ? cantidad * costo : 0);
  }, 0);

  const montoAdeudado =
    modoPago === 'CONTADO'
      ? 0
      : modoPago === 'ADEUDADO'
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
        costoUnitario: Number(linea.costoUnitario),
      }));
    if (items.length === 0) {
      setError('Agregá al menos un producto a la compra.');
      return;
    }
    if (modoPago !== 'CONTADO' && !proveedorId) {
      setError('Para dejar algo a deber, elegí el proveedor.');
      return;
    }
    if (modoPago === 'MIXTO' && montoAdeudado === 0) {
      setError('En pago mixto, lo que pagás ahora debe ser menor al total.');
      return;
    }
    try {
      const nombreProveedor = proveedores?.find((p) => p.id === proveedorId)?.nombre;
      await registrarCompra.mutateAsync({
        proveedor: nombreProveedor,
        proveedorId: proveedorId || undefined,
        montoAdeudado: montoAdeudado > 0 ? Number(montoAdeudado.toFixed(2)) : undefined,
        observaciones: observaciones || undefined,
        items,
      });
      navegar('/compras');
    } catch (excepcion) {
      setError(mensajeDeError(excepcion));
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mb-4 text-2xl font-bold">Registrar compra</h2>

      <form onSubmit={manejarEnvio} className="tarjeta flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="etiqueta mb-0" htmlFor="proveedorSel">Proveedor</label>
              <button
                type="button"
                className="text-sm font-medium text-blue-700 hover:underline"
                onClick={() => setModalProveedorAbierto(true)}
              >
                ¿Proveedor nuevo? Crearlo
              </button>
            </div>
            <select
              id="proveedorSel"
              className="campo"
              value={proveedorId}
              onChange={(evento) => setProveedorId(evento.target.value)}
            >
              <option value="">Sin proveedor</option>
              {proveedores?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
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
        </div>

        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="etiqueta mb-0">Productos comprados</span>
            <button
              type="button"
              className="text-sm font-medium text-blue-700 hover:underline"
              onClick={() => setModalProductoAbierto(true)}
            >
              ¿No está en la lista? Crear producto
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {lineas.map((linea, indice) => (
              <div
                key={indice}
                className="rounded-lg border border-gray-100 p-2 sm:border-0 sm:p-0"
              >
                {/* En el celular el producto ocupa una fila y cantidad/costo la siguiente */}
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    className="campo sm:w-auto sm:flex-1"
                    value={linea.productoId}
                    onChange={(evento) => elegirProducto(indice, evento.target.value)}
                  >
                    <option value="">Elegir producto…</option>
                    {productos?.map((producto) => (
                      <option key={producto.id} value={producto.id}>
                        {producto.nombre}
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
                    placeholder="Costo x kg/u."
                    value={linea.costoUnitario}
                    onChange={(evento) =>
                      cambiarLinea(indice, { costoUnitario: evento.target.value })
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
          <span className="etiqueta">¿Cómo la pagás?</span>
          <div className="grid grid-cols-3 gap-2 sm:flex">
            {(
              [
                ['CONTADO', 'Pagué todo'],
                ['ADEUDADO', 'Queda a deber'],
                ['MIXTO', 'Pagué una parte'],
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
          {modoPago === 'MIXTO' && (
            <div className="mt-2">
              <label className="etiqueta" htmlFor="pagaAhora">¿Cuánto pagaste ahora?</label>
              <input
                id="pagaAhora"
                className="campo sm:w-48"
                type="number"
                min="0.01"
                step="0.01"
                value={pagaAhora}
                onChange={(evento) => setPagaAhora(evento.target.value)}
              />
            </div>
          )}
        </div>

        <div className="rounded-lg bg-gray-50 p-3 text-right">
          <p className="text-lg">
            Total: <strong>{formatearMoneda(total)}</strong>
          </p>
          {montoAdeudado > 0 && (
            <p className="text-sm text-red-600">
              Queda a deber: <strong>{formatearMoneda(montoAdeudado)}</strong>
            </p>
          )}
        </div>

        <AvisoError mensaje={error} />

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Link to="/compras" className="boton-secundario text-center">
            Cancelar
          </Link>
          <button
            type="submit"
            className="boton-primario"
            disabled={registrarCompra.isPending}
          >
            Confirmar compra
          </button>
        </div>
      </form>

      <FormularioProducto
        abierto={modalProductoAbierto}
        alCerrar={() => setModalProductoAbierto(false)}
      />
      <FormularioProveedor
        abierto={modalProveedorAbierto}
        alCerrar={() => setModalProveedorAbierto(false)}
        alCrear={(proveedor) => setProveedorId(proveedor.id)}
      />
    </div>
  );
}
