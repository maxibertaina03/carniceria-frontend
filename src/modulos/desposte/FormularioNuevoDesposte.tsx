import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mensajeDeError } from '../../compartido/clienteHttp';
import { AvisoError } from '../../compartido/componentes/AvisoError';
import { formatearMoneda } from '../../compartido/formato';
import { FormularioProducto } from '../productos/FormularioProducto';
import { useProductos } from '../productos/useProductos';
import { useRegistrarDesposte } from './useDesposte';

interface LineaCorte {
  productoId: string;
  cantidad: string;
  valorReferencia: string;
}

const lineaVacia: LineaCorte = { productoId: '', cantidad: '', valorReferencia: '' };

export function FormularioNuevoDesposte() {
  const navegar = useNavigate();
  const { data: productos } = useProductos();
  const registrarDesposte = useRegistrarDesposte();

  const [proveedor, setProveedor] = useState('');
  const [pesoRes, setPesoRes] = useState('');
  const [costoTotal, setCostoTotal] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [cortes, setCortes] = useState<LineaCorte[]>([{ ...lineaVacia }]);
  const [error, setError] = useState<string | null>(null);
  const [modalProductoAbierto, setModalProductoAbierto] = useState(false);

  function cambiarCorte(indice: number, cambios: Partial<LineaCorte>) {
    setCortes((previas) =>
      previas.map((linea, i) => (i === indice ? { ...linea, ...cambios } : linea)),
    );
  }

  function elegirProducto(indice: number, productoId: string) {
    const producto = productos?.find((p) => p.id === productoId);
    cambiarCorte(indice, {
      productoId,
      // Sugerimos el precio de venta como valor de referencia; se puede cambiar.
      valorReferencia:
        producto && producto.precioVentaReferencia > 0
          ? String(producto.precioVentaReferencia)
          : '',
    });
  }

  // Reparto en vivo: el costo de la res se distribuye según valor × kg.
  const costoTotalNum = Number(costoTotal) || 0;
  const baseReparto = cortes.reduce((suma, corte) => {
    const cantidad = Number(corte.cantidad) || 0;
    const valor = Number(corte.valorReferencia) || 0;
    return suma + valor * cantidad;
  }, 0);

  function costoUnitarioEstimado(corte: LineaCorte): number | null {
    const cantidad = Number(corte.cantidad) || 0;
    const valor = Number(corte.valorReferencia) || 0;
    if (cantidad <= 0 || valor <= 0 || baseReparto <= 0 || costoTotalNum <= 0) {
      return null;
    }
    const subtotal = (costoTotalNum * (valor * cantidad)) / baseReparto;
    return subtotal / cantidad;
  }

  const kilosCargados = cortes.reduce(
    (suma, corte) => suma + (Number(corte.cantidad) || 0),
    0,
  );

  async function manejarEnvio(evento: FormEvent) {
    evento.preventDefault();
    setError(null);

    const cortesValidos = cortes
      .filter((corte) => corte.productoId)
      .map((corte) => ({
        productoId: corte.productoId,
        cantidad: Number(corte.cantidad),
        valorReferencia: Number(corte.valorReferencia),
      }));
    if (cortesValidos.length === 0) {
      setError('Agregá al menos un corte al desposte.');
      return;
    }
    if (!(Number(pesoRes) > 0) || !(Number(costoTotal) > 0)) {
      setError('Cargá el peso y el costo total de la media res.');
      return;
    }

    try {
      await registrarDesposte.mutateAsync({
        proveedor: proveedor || undefined,
        pesoRes: Number(pesoRes),
        costoTotal: Number(costoTotal),
        observaciones: observaciones || undefined,
        cortes: cortesValidos,
      });
      navegar('/desposte');
    } catch (excepcion) {
      setError(mensajeDeError(excepcion));
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mb-1 text-2xl font-bold">Registrar desposte</h2>
      <p className="mb-4 text-sm text-gray-500">
        Cargá la media res y los cortes que salieron. El costo se reparte entre
        los cortes según el valor que le pongas a cada uno.
      </p>

      <form onSubmit={manejarEnvio} className="tarjeta flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="etiqueta" htmlFor="proveedor">Proveedor (opcional)</label>
            <input
              id="proveedor"
              className="campo"
              value={proveedor}
              onChange={(evento) => setProveedor(evento.target.value)}
              placeholder="Ej: Frigorífico"
            />
          </div>
          <div>
            <label className="etiqueta" htmlFor="pesoRes">Peso de la res (kg)</label>
            <input
              id="pesoRes"
              className="campo"
              type="number"
              min="0.001"
              step="0.001"
              value={pesoRes}
              onChange={(evento) => setPesoRes(evento.target.value)}
              placeholder="Ej: 100"
            />
          </div>
          <div>
            <label className="etiqueta" htmlFor="costoTotal">Costo total ($)</label>
            <input
              id="costoTotal"
              className="campo"
              type="number"
              min="0.01"
              step="0.01"
              value={costoTotal}
              onChange={(evento) => setCostoTotal(evento.target.value)}
              placeholder="Ej: 500000"
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="etiqueta mb-0">Cortes obtenidos</span>
            <button
              type="button"
              className="text-sm font-medium text-blue-700 hover:underline"
              onClick={() => setModalProductoAbierto(true)}
            >
              ¿Falta un corte? Crear producto
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {cortes.map((corte, indice) => {
              const costoUnit = costoUnitarioEstimado(corte);
              return (
                <div
                  key={indice}
                  className="rounded-lg border border-gray-100 p-2 sm:border-0 sm:p-0"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      className="campo sm:w-auto sm:flex-1"
                      value={corte.productoId}
                      onChange={(evento) => elegirProducto(indice, evento.target.value)}
                    >
                      <option value="">Elegir corte…</option>
                      {productos?.map((producto) => (
                        <option key={producto.id} value={producto.id}>
                          {producto.nombre}
                        </option>
                      ))}
                    </select>
                    <input
                      className="campo min-w-0 flex-1 sm:w-24 sm:flex-none"
                      type="number"
                      min="0.001"
                      step="0.001"
                      placeholder="Kg"
                      value={corte.cantidad}
                      onChange={(evento) =>
                        cambiarCorte(indice, { cantidad: evento.target.value })
                      }
                      required={Boolean(corte.productoId)}
                    />
                    <input
                      className="campo min-w-0 flex-1 sm:w-32 sm:flex-none"
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="Valor x kg"
                      value={corte.valorReferencia}
                      onChange={(evento) =>
                        cambiarCorte(indice, { valorReferencia: evento.target.value })
                      }
                      required={Boolean(corte.productoId)}
                    />
                    <button
                      type="button"
                      className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                      onClick={() =>
                        setCortes((previas) =>
                          previas.length > 1
                            ? previas.filter((_, i) => i !== indice)
                            : [{ ...lineaVacia }],
                        )
                      }
                      aria-label="Quitar corte"
                    >
                      ✕
                    </button>
                  </div>
                  {costoUnit !== null && (
                    <p className="mt-1 text-xs text-gray-500">
                      Le queda un costo de{' '}
                      <strong>{formatearMoneda(costoUnit)}/kg</strong>
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className="mt-2 text-sm font-medium text-blue-700 hover:underline"
            onClick={() => setCortes((previas) => [...previas, { ...lineaVacia }])}
          >
            + Agregar otro corte
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

        {kilosCargados > 0 && Number(pesoRes) > 0 && (
          <p className="text-right text-sm text-gray-500">
            Cortes cargados: {kilosCargados.toLocaleString('es-AR')} kg de{' '}
            {Number(pesoRes).toLocaleString('es-AR')} kg de la res
            {kilosCargados < Number(pesoRes) &&
              ` (${(Number(pesoRes) - kilosCargados).toLocaleString('es-AR')} kg de merma/hueso)`}
          </p>
        )}

        <AvisoError mensaje={error} />

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Link to="/desposte" className="boton-secundario text-center">Cancelar</Link>
          <button
            type="submit"
            className="boton-primario"
            disabled={registrarDesposte.isPending}
          >
            Confirmar desposte
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
