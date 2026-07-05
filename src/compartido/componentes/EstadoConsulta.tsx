import { mensajeDeError } from '../clienteHttp';

interface Props {
  cargando: boolean;
  error: unknown;
}

// Muestra el estado de carga o error de una consulta; si no hay ninguno, nada.
export function EstadoConsulta({ cargando, error }: Props) {
  if (cargando) {
    return <p className="py-8 text-center text-gray-500">Cargando…</p>;
  }
  if (error) {
    return (
      <p className="rounded-lg bg-red-50 p-4 text-center text-red-700">
        {mensajeDeError(error)}
      </p>
    );
  }
  return null;
}
