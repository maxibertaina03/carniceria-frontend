import { useState } from 'react';
import { mensajeDeError } from '../../compartido/clienteHttp';
import { EstadoConsulta } from '../../compartido/componentes/EstadoConsulta';
import {
  formatearCantidad,
  formatearFechaYHora,
  formatearMargen,
  formatearMoneda,
} from '../../compartido/formato';
import { useProductos } from '../productos/useProductos';
import { calcularCostoReceta } from './costoReceta';
import { FormularioProducir } from './FormularioProducir';
import { FormularioReceta } from './FormularioReceta';
import { ModalPreciosReceta } from './ModalPreciosReceta';
import { Receta } from './produccionApi';
import {
  useEliminarOrden,
  useMutacionesReceta,
  useOrdenesProduccion,
  useRecetas,
} from './useProduccion';

type Pestana = 'recetas' | 'ordenes';

export function PaginaProduccion() {
  const [pestana, setPestana] = useState<Pestana>('recetas');

  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="mb-1 text-2xl font-bold">Producción propia</h2>
      <p className="mb-4 text-sm text-gray-500">
        Definí las fórmulas de tus embutidos y registrá las producciones. Al
        producir se descuentan los ingredientes y se calcula el costo solo.
      </p>

      <div className="mb-4 flex gap-2">
        <button
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            pestana === 'recetas'
              ? 'bg-red-700 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => setPestana('recetas')}
        >
          Recetas
        </button>
        <button
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            pestana === 'ordenes'
              ? 'bg-red-700 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => setPestana('ordenes')}
        >
          Producciones
        </button>
      </div>

      {pestana === 'recetas' ? <SeccionRecetas /> : <SeccionOrdenes />}
    </div>
  );
}

function SeccionRecetas() {
  const { data: recetas, isLoading, error } = useRecetas();
  const { data: productos } = useProductos();
  const { eliminar } = useMutacionesReceta();
  const [modalRecetaAbierto, setModalRecetaAbierto] = useState(false);
  const [recetaEnEdicion, setRecetaEnEdicion] = useState<Receta | null>(null);
  const [recetaAProducir, setRecetaAProducir] = useState<Receta | null>(null);
  const [recetaPrecios, setRecetaPrecios] = useState<Receta | null>(null);

  async function manejarEliminar(receta: Receta) {
    if (!window.confirm(`¿Eliminar la receta de ${receta.productoTerminadoNombre}?`)) {
      return;
    }
    try {
      await eliminar.mutateAsync(receta.productoTerminadoId);
    } catch (excepcion) {
      window.alert(mensajeDeError(excepcion));
    }
  }

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button
          className="boton-primario"
          onClick={() => {
            setRecetaEnEdicion(null);
            setModalRecetaAbierto(true);
          }}
        >
          + Nueva receta
        </button>
      </div>

      <EstadoConsulta cargando={isLoading} error={error} />

      {recetas && recetas.length === 0 && (
        <p className="tarjeta py-8 text-center text-gray-500">
          Todavía no hay recetas. Creá la primera fórmula con el botón de arriba.
        </p>
      )}

      <div className="space-y-2">
        {recetas?.map((receta) => {
          const terminado = productos?.find(
            (p) => p.id === receta.productoTerminadoId,
          );
          const { costoUnitario, desglose } = calcularCostoReceta(receta, productos);
          const precioVenta = terminado?.precioVentaReferencia ?? 0;
          const ganancia = precioVenta - costoUnitario;
          const unidad = terminado?.unidadMedida ?? 'KG';
          const abrev = unidad === 'KG' ? 'kg' : unidad === 'UNIDAD' ? 'u.' : unidad.toLowerCase();

          return (
            <div key={receta.id} className="tarjeta">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{receta.productoTerminadoNombre}</p>
                  <p className="text-sm text-gray-500">
                    Rinde {formatearCantidad(receta.rindeCantidad, unidad)}
                  </p>
                </div>
                <button
                  className="boton-primario"
                  onClick={() => setRecetaAProducir(receta)}
                >
                  Producir
                </button>
              </div>

              {/* Resumen de costo / precio / ganancia */}
              <div className="mt-2 grid grid-cols-3 gap-2 rounded-lg bg-gray-50 p-3 text-center">
                <div>
                  <p className="text-xs text-gray-500">Costo x {abrev}</p>
                  <p className="font-semibold">{formatearMoneda(costoUnitario)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Precio venta</p>
                  <p className="font-semibold">{formatearMoneda(precioVenta)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Ganancia</p>
                  <p
                    className={`font-semibold ${
                      ganancia >= 0 ? 'text-green-700' : 'text-red-600'
                    }`}
                  >
                    {formatearMoneda(ganancia)}
                    {precioVenta > 0 && (
                      <span className="block text-xs font-normal text-gray-500">
                        margen {formatearMargen(costoUnitario, precioVenta)}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Desglose de insumos con su costo */}
              <ul className="mt-2 space-y-1 border-t border-gray-100 pt-2 text-sm text-gray-600">
                {desglose.map((item) => (
                  <li key={item.productoId} className="flex justify-between">
                    <span>
                      {item.nombre}:{' '}
                      {formatearCantidad(item.cantidad, item.unidad)} ×{' '}
                      {formatearMoneda(item.costoUnitario)}
                    </span>
                    <span className="tabular-nums">{formatearMoneda(item.subtotal)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                <button
                  className="font-medium text-blue-700 hover:underline"
                  onClick={() => setRecetaPrecios(receta)}
                >
                  Editar precios
                </button>
                <button
                  className="font-medium text-blue-700 hover:underline"
                  onClick={() => {
                    setRecetaEnEdicion(receta);
                    setModalRecetaAbierto(true);
                  }}
                >
                  Editar receta
                </button>
                <button
                  className="font-medium text-red-600 hover:underline"
                  onClick={() => manejarEliminar(receta)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <FormularioReceta
        abierto={modalRecetaAbierto}
        alCerrar={() => setModalRecetaAbierto(false)}
        receta={recetaEnEdicion}
      />
      <FormularioProducir
        abierto={recetaAProducir !== null}
        alCerrar={() => setRecetaAProducir(null)}
        receta={recetaAProducir}
      />
      <ModalPreciosReceta
        abierto={recetaPrecios !== null}
        alCerrar={() => setRecetaPrecios(null)}
        receta={recetaPrecios}
      />
    </div>
  );
}

function SeccionOrdenes() {
  const { data: ordenes, isLoading, error } = useOrdenesProduccion();
  const eliminar = useEliminarOrden();
  const [abierta, setAbierta] = useState<string | null>(null);

  async function manejarEliminar(id: string) {
    if (
      !window.confirm(
        '¿Eliminar esta producción? Se devuelven los ingredientes al stock y se quita el producto terminado.',
      )
    ) {
      return;
    }
    try {
      await eliminar.mutateAsync(id);
    } catch (excepcion) {
      window.alert(mensajeDeError(excepcion));
    }
  }

  return (
    <div>
      <EstadoConsulta cargando={isLoading} error={error} />

      {ordenes && ordenes.length === 0 && (
        <p className="tarjeta py-8 text-center text-gray-500">
          Todavía no registraste producciones. Producí desde la pestaña Recetas.
        </p>
      )}

      <div className="space-y-2">
        {ordenes?.map((orden) => (
          <div key={orden.id} className="tarjeta">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold">
                  {formatearCantidad(orden.cantidadProducida, 'KG')} de{' '}
                  {orden.productoTerminadoNombre}
                </p>
                <p className="text-sm text-gray-500">
                  {formatearFechaYHora(orden.fecha)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatearMoneda(orden.costoTotal)}</p>
                <p className="text-sm text-gray-500">
                  {formatearMoneda(orden.costoUnitario)}/u.
                </p>
              </div>
            </div>
            <div className="mt-2 flex gap-3">
              <button
                className="text-sm font-medium text-blue-700 hover:underline"
                onClick={() => setAbierta(abierta === orden.id ? null : orden.id)}
              >
                {abierta === orden.id ? 'Ocultar' : 'Ver ingredientes usados'}
              </button>
              <button
                className="text-sm font-medium text-red-600 hover:underline"
                onClick={() => manejarEliminar(orden.id)}
              >
                Eliminar
              </button>
            </div>
            {abierta === orden.id && (
              <ul className="mt-2 space-y-1 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                {orden.items.map((item) => (
                  <li key={item.productoId} className="flex justify-between">
                    <span>
                      {item.productoNombre}: {formatearCantidad(item.cantidad, 'KG')}
                    </span>
                    <span>{formatearMoneda(item.subtotal)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
