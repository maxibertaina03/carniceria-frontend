import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clientesApi } from './clientesApi';

export function useClientes(incluirInactivos = false) {
  return useQuery({
    queryKey: ['clientes', incluirInactivos],
    queryFn: () => clientesApi.listar(incluirInactivos),
  });
}

export function useMovimientosCliente(id: string) {
  return useQuery({
    queryKey: ['clientes', id, 'movimientos'],
    queryFn: () => clientesApi.obtenerMovimientos(id),
  });
}

export function useMutacionesCliente() {
  const cliente = useQueryClient();
  const invalidar = () => {
    cliente.invalidateQueries({ queryKey: ['clientes'] });
    cliente.invalidateQueries({ queryKey: ['reportes'] });
  };

  const crear = useMutation({
    mutationFn: (datos: { nombre: string; telefono?: string }) =>
      clientesApi.crear(datos),
    onSuccess: invalidar,
  });

  const actualizar = useMutation({
    mutationFn: ({
      id,
      datos,
    }: {
      id: string;
      datos: { nombre?: string; telefono?: string; activo?: boolean };
    }) => clientesApi.actualizar(id, datos),
    onSuccess: invalidar,
  });

  const registrarPago = useMutation({
    mutationFn: ({
      id,
      datos,
    }: {
      id: string;
      datos: { monto: number; observaciones?: string };
    }) => clientesApi.registrarPago(id, datos),
    onSuccess: invalidar,
  });

  return { crear, actualizar, registrarPago };
}
