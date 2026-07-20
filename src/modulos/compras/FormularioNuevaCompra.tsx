import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mensajeDeError } from '../../compartido/clienteHttp';
import { AvisoError } from '../../compartido/componentes/AvisoError';
import { formatearMoneda } from '../../compartido/formato';
import { FormularioProducto } from '../productos/FormularioProducto';
import { useProductos } from '../productos/useProductos';
import { useRegistrarCompra } from './useCompras';

interface LineaCompra {
  productoId: string;
  cantidad: string;
  costoUnitario: string;
}

const lineaVacia: LineaCompra = { productoId: '', cantidad: '', costoUnitario: '' };

export function FormularioNuevaCompra() {
  const navegar = useNavigate();
  const { data: productos } = useProductos();
  const registrarCompra = useRegistrarCompra();

  const [proveedor, setProveedor] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [lineas, setLineas] = useState<LineaCompra[]>([{ ...lineaVacia }]);
  const [error, setError] = useState<string | null>(null);
  const [modalProductoAbierto, setModalProductoAbierto] = useState(false);

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
    try {
      await registrarCompra.mutateAsync({
        proveedor: proveedor || undefined,
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
            <label className="etiqueta" htmlFor="proveedor">Proveedor (opcional)</label>
            <input
              id="proveedor"
              className="campo"
              value={proveedor}
              onChange={(evento) => setProveedor(evento.target.value)}
              placeholder="Ej: Frigorífico San José"
            />
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

        <p className="text-right text-lg">
          Total: <strong>{formatearMoneda(total)}</strong>
        </p>

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
    </div>
  );
}
