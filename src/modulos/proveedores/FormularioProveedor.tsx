import { FormEvent, useState } from 'react';
import { mensajeDeError } from '../../compartido/clienteHttp';
import { AvisoError } from '../../compartido/componentes/AvisoError';
import { Modal } from '../../compartido/componentes/Modal';
import { Proveedor } from './proveedoresApi';
import { useMutacionesProveedor } from './useProveedores';

interface Props {
  abierto: boolean;
  alCerrar: () => void;
  proveedor?: Proveedor | null;
  // Se llama con el proveedor recién creado (para auto-seleccionarlo, ej. en compra).
  alCrear?: (proveedor: Proveedor) => void;
}

export function FormularioProveedor({
  abierto,
  alCerrar,
  proveedor,
  alCrear,
}: Props) {
  const { crear, actualizar } = useMutacionesProveedor();
  const [error, setError] = useState<string | null>(null);
  const editando = Boolean(proveedor);

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);
    const formulario = new FormData(evento.currentTarget);
    const datos = {
      nombre: String(formulario.get('nombre') ?? ''),
      telefono: String(formulario.get('telefono') ?? ''),
    };
    try {
      if (proveedor) {
        await actualizar.mutateAsync({ id: proveedor.id, datos });
      } else {
        const deudaInicial = Number(formulario.get('deudaInicial') ?? 0);
        const creado = await crear.mutateAsync({
          ...datos,
          deudaInicial: deudaInicial > 0 ? deudaInicial : undefined,
        });
        alCrear?.(creado);
      }
      alCerrar();
    } catch (excepcion) {
      setError(mensajeDeError(excepcion));
    }
  }

  return (
    <Modal
      titulo={editando ? `Editar ${proveedor?.nombre}` : 'Nuevo proveedor'}
      abierto={abierto}
      alCerrar={alCerrar}
    >
      <form onSubmit={manejarEnvio} className="flex flex-col gap-4">
        <div>
          <label className="etiqueta" htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            name="nombre"
            className="campo"
            defaultValue={proveedor?.nombre ?? ''}
            placeholder="Ej: Frigorífico San José"
            required
          />
        </div>
        <div>
          <label className="etiqueta" htmlFor="telefono">Teléfono (opcional)</label>
          <input
            id="telefono"
            name="telefono"
            className="campo"
            defaultValue={proveedor?.telefono ?? ''}
          />
        </div>

        {!editando && (
          <div>
            <label className="etiqueta" htmlFor="deudaInicial">
              ¿Ya le debés algo? (opcional)
            </label>
            <input
              id="deudaInicial"
              name="deudaInicial"
              className="campo"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
            />
            <p className="mt-1 text-xs text-gray-500">
              Si arrancás con una deuda ya existente, ponela acá y queda como saldo
              inicial.
            </p>
          </div>
        )}

        <AvisoError mensaje={error} />

        <div className="flex justify-end gap-2">
          <button type="button" className="boton-secundario" onClick={alCerrar}>
            Cancelar
          </button>
          <button
            type="submit"
            className="boton-primario"
            disabled={crear.isPending || actualizar.isPending}
          >
            {editando ? 'Guardar cambios' : 'Crear proveedor'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
