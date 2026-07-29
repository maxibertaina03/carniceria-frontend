import { FormEvent, useState } from 'react';
import { mensajeDeError } from '../../compartido/clienteHttp';
import { AvisoError } from '../../compartido/componentes/AvisoError';
import { Modal } from '../../compartido/componentes/Modal';
import { formatearCantidad, formatearMoneda } from '../../compartido/formato';
import { Producto } from '../productos/productosApi';
import { usePresentaciones, useMutacionesPresentacion } from './usePresentaciones';

interface Props {
  producto: Producto;
  abierto: boolean;
  alCerrar: () => void;
}

export function GestionPresentaciones({ producto, abierto, alCerrar }: Props) {
  const { data: todas } = usePresentaciones(abierto);
  const { crear, eliminar } = useMutacionesPresentacion();
  const [nombre, setNombre] = useState('');
  const [equivalente, setEquivalente] = useState('');
  const [precio, setPrecio] = useState('');
  const [error, setError] = useState<string | null>(null);

  const presentaciones = (todas ?? []).filter((p) => p.productoId === producto.id);

  async function agregar(evento: FormEvent) {
    evento.preventDefault();
    setError(null);
    try {
      await crear.mutateAsync({
        productoId: producto.id,
        nombre,
        cantidadEquivalente: Number(equivalente),
        precio: Number(precio),
      });
      setNombre('');
      setEquivalente('');
      setPrecio('');
    } catch (excepcion) {
      setError(mensajeDeError(excepcion));
    }
  }

  return (
    <Modal
      titulo={`Presentaciones de ${producto.nombre}`}
      abierto={abierto}
      alCerrar={alCerrar}
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-500">
          Cada presentación descuenta del stock su equivalente (en{' '}
          {producto.unidadMedida.toLowerCase()}). Ej: “Docena” = 0,6 kg.
        </p>

        {presentaciones.length > 0 && (
          <div className="divide-y divide-gray-100 rounded-lg border border-gray-100">
            {presentaciones.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-2 p-2">
                <div>
                  <p className="font-semibold">{p.nombre}</p>
                  <p className="text-xs text-gray-500">
                    = {formatearCantidad(p.cantidadEquivalente, producto.unidadMedida)} ·{' '}
                    {formatearMoneda(p.precio)}
                  </p>
                </div>
                <button
                  className="text-sm font-medium text-red-600 hover:underline"
                  onClick={() => eliminar.mutateAsync(p.id)}
                >
                  Borrar
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={agregar} className="flex flex-col gap-3 border-t border-gray-200 pt-4">
          <p className="text-sm font-semibold">Agregar presentación</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="etiqueta" htmlFor="pres-nombre">Nombre</label>
              <input
                id="pres-nombre"
                className="campo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Docena"
                required
              />
            </div>
            <div>
              <label className="etiqueta" htmlFor="pres-equiv">
                Equivale a ({producto.unidadMedida.toLowerCase()})
              </label>
              <input
                id="pres-equiv"
                className="campo"
                type="number"
                min="0.001"
                step="0.001"
                value={equivalente}
                onChange={(e) => setEquivalente(e.target.value)}
                placeholder="0.6"
                required
              />
            </div>
            <div>
              <label className="etiqueta" htmlFor="pres-precio">Precio</label>
              <input
                id="pres-precio"
                className="campo"
                type="number"
                min="0"
                step="0.01"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="3000"
                required
              />
            </div>
          </div>
          <AvisoError mensaje={error} />
          <div className="flex justify-end">
            <button type="submit" className="boton-primario" disabled={crear.isPending}>
              Agregar
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
