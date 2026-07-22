import { FormEvent, useState } from 'react';
import { mensajeDeError } from '../../compartido/clienteHttp';
import { AvisoError } from '../../compartido/componentes/AvisoError';
import { Modal } from '../../compartido/componentes/Modal';
import { abreviarUnidad, formatearCantidad } from '../../compartido/formato';
import { Producto } from './productosApi';
import { useMutacionesProducto } from './useProductos';

interface Props {
  abierto: boolean;
  alCerrar: () => void;
  producto: Producto | null;
}

// Corrige el stock de un producto dejándolo en la cantidad real contada
// (por ejemplo después de revisar la heladera).
export function ModalAjustarStock({ abierto, alCerrar, producto }: Props) {
  const { ajustarStock } = useMutacionesProducto();
  const [cantidad, setCantidad] = useState(
    producto ? String(producto.stockActual) : '',
  );
  const [error, setError] = useState<string | null>(null);

  if (!producto) {
    return null;
  }

  async function manejarEnvio(evento: FormEvent) {
    evento.preventDefault();
    setError(null);
    try {
      await ajustarStock.mutateAsync({
        id: producto!.id,
        cantidad: Number(cantidad),
      });
      alCerrar();
    } catch (excepcion) {
      setError(mensajeDeError(excepcion));
    }
  }

  return (
    <Modal titulo={`Stock de ${producto.nombre}`} abierto={abierto} alCerrar={alCerrar}>
      <form onSubmit={manejarEnvio} className="flex flex-col gap-4">
        <p className="text-sm text-gray-600">
          Ahora figuran{' '}
          <strong>{formatearCantidad(producto.stockActual, producto.unidadMedida)}</strong>
          . Poné la cantidad real que tenés y se corrige.
        </p>

        <div>
          <label className="etiqueta" htmlFor="cantidad">
            Cantidad real ({abreviarUnidad(producto.unidadMedida)})
          </label>
          <input
            id="cantidad"
            className="campo"
            type="number"
            min="0"
            step="0.001"
            value={cantidad}
            onChange={(evento) => setCantidad(evento.target.value)}
            required
            autoFocus
          />
        </div>

        <AvisoError mensaje={error} />

        <div className="flex justify-end gap-2">
          <button type="button" className="boton-secundario" onClick={alCerrar}>
            Cancelar
          </button>
          <button
            type="submit"
            className="boton-primario"
            disabled={ajustarStock.isPending}
          >
            Guardar stock
          </button>
        </div>
      </form>
    </Modal>
  );
}
