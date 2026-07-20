import { useState } from 'react';
import { mensajeDeError } from '../../compartido/clienteHttp';
import { EstadoConsulta } from '../../compartido/componentes/EstadoConsulta';
import {
  formatearCantidad,
  formatearFechaYHora,
  formatearMoneda,
} from '../../compartido/formato';
import { FormularioProducir } from './FormularioProducir';
import { FormularioReceta } from './FormularioReceta';
import { Receta } from './produccionApi';
import {
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
  const { eliminar } = useMutacionesReceta();
  const [modalRecetaAbierto, setModalRecetaAbierto] = useState(false);
  const [recetaEnEdicion, setRecetaEnEdicion] = useState<Receta | null>(null);
  const [recetaAProducir, setRecetaAProducir] = useState<Receta | null>(null);

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
        {recetas?.map((receta) => (
          <div key={receta.id} className="tarjeta">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{receta.productoTerminadoNombre}</p>
                <p className="text-sm text-gray-500">
                  Rinde {formatearCantidad(receta.rindeCantidad, 'KG')} ·{' '}
                  {receta.ingredientes.length} ingredientes
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  className="boton-primario"
                  onClick={() => setRecetaAProducir(receta)}
                >
                  Producir
                </button>
              </div>
            </div>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 border-t border-gray-100 pt-2 text-sm text-gray-600">
              {receta.ingredientes.map((ingrediente) => (
                <li key={ingrediente.productoId}>
                  {ingrediente.productoNombre}:{' '}
                  {formatearCantidad(ingrediente.cantidad, ingrediente.unidadMedida)}
                </li>
              ))}
            </ul>
            <div className="mt-2 flex gap-3 text-sm">
              <button
                className="font-medium text-blue-700 hover:underline"
                onClick={() => {
                  setRecetaEnEdicion(receta);
                  setModalRecetaAbierto(true);
                }}
              >
                Editar
              </button>
              <button
                className="font-medium text-red-600 hover:underline"
                onClick={() => manejarEliminar(receta)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
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
    </div>
  );
}

function SeccionOrdenes() {
  const { data: ordenes, isLoading, error } = useOrdenesProduccion();
  const [abierta, setAbierta] = useState<string | null>(null);

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
            <button
              className="mt-2 text-sm font-medium text-blue-700 hover:underline"
              onClick={() => setAbierta(abierta === orden.id ? null : orden.id)}
            >
              {abierta === orden.id ? 'Ocultar' : 'Ver ingredientes usados'}
            </button>
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
