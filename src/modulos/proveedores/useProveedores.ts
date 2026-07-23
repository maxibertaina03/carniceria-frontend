import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { proveedoresApi } from './proveedoresApi';

export function useProveedores() {
  return useQuery({ queryKey: ['proveedores'], queryFn: proveedoresApi.listar });
}

export function useMovimientosProveedor(id: string) {
  return useQuery({
    queryKey: ['proveedores', id, 'movimientos'],
    queryFn: () => proveedoresApi.obtenerMovimientos(id),
  });
}

export function useMutacionesProveedor() {
  const cliente = useQueryClient();
  const invalidar = () => {
    cliente.invalidateQueries({ queryKey: ['proveedores'] });
    cliente.invalidateQueries({ queryKey: ['reportes'] });
  };

  const crear = useMutation({
    mutationFn: (datos: {
      nombre: string;
      telefono?: string;
      deudaInicial?: number;
    }) => proveedoresApi.crear(datos),
    onSuccess: invalidar,
  });

  const actualizar = useMutation({
    mutationFn: ({
      id,
      datos,
    }: {
      id: string;
      datos: { nombre?: string; telefono?: string; activo?: boolean };
    }) => proveedoresApi.actualizar(id, datos),
    onSuccess: invalidar,
  });

  const registrarPago = useMutation({
    mutationFn: ({
      id,
      datos,
    }: {
      id: string;
      datos: { monto: number; observaciones?: string };
    }) => proveedoresApi.registrarPago(id, datos),
    onSuccess: invalidar,
  });

  const desactivar = useMutation({
    mutationFn: (id: string) => proveedoresApi.desactivar(id),
    onSuccess: invalidar,
  });

  const eliminarDefinitivo = useMutation({
    mutationFn: (id: string) => proveedoresApi.eliminarDefinitivo(id),
    onSuccess: invalidar,
  });

  return { crear, actualizar, registrarPago, desactivar, eliminarDefinitivo };
}
