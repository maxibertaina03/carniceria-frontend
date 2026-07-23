import { FormEvent, useState } from 'react';
import { mensajeDeError } from '../../compartido/clienteHttp';
import { AvisoError } from '../../compartido/componentes/AvisoError';
import { Modal } from '../../compartido/componentes/Modal';
import { Cliente } from './clientesApi';
import { useMutacionesCliente } from './useClientes';

interface Props {
  abierto: boolean;
  alCerrar: () => void;
  cliente?: Cliente | null;
  // Se llama con el cliente recién creado (para auto-seleccionarlo, ej. en venta).
  alCrear?: (cliente: Cliente) => void;
}

export function FormularioCliente({ abierto, alCerrar, cliente, alCrear }: Props) {
  const { crear, actualizar } = useMutacionesCliente();
  const [error, setError] = useState<string | null>(null);
  const editando = Boolean(cliente);

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);
    const formulario = new FormData(evento.currentTarget);
    const datos = {
      nombre: String(formulario.get('nombre') ?? ''),
      telefono: String(formulario.get('telefono') ?? ''),
    };
    try {
      if (cliente) {
        await actualizar.mutateAsync({ id: cliente.id, datos });
      } else {
        const creado = await crear.mutateAsync(datos);
        alCrear?.(creado);
      }
      alCerrar();
    } catch (excepcion) {
      setError(mensajeDeError(excepcion));
    }
  }

  return (
    <Modal
      titulo={editando ? `Editar ${cliente?.nombre}` : 'Nuevo cliente'}
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
            defaultValue={cliente?.nombre ?? ''}
            placeholder="Ej: Juan Pérez"
            required
          />
        </div>
        <div>
          <label className="etiqueta" htmlFor="telefono">Teléfono (opcional)</label>
          <input
            id="telefono"
            name="telefono"
            className="campo"
            defaultValue={cliente?.telefono ?? ''}
            placeholder="Ej: 3564-123456"
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
            disabled={crear.isPending || actualizar.isPending}
          >
            {editando ? 'Guardar cambios' : 'Crear cliente'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
