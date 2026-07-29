import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DatosPresentacion, presentacionesApi } from './presentacionesApi';

// Todas las presentaciones (para la venta y la gestión). Habilitado según el rubro.
export function usePresentaciones(habilitado = true) {
  return useQuery({
    queryKey: ['presentaciones'],
    queryFn: () => presentacionesApi.listar(),
    enabled: habilitado,
  });
}

export function useMutacionesPresentacion() {
  const cliente = useQueryClient();
  const invalidar = () =>
    cliente.invalidateQueries({ queryKey: ['presentaciones'] });

  const crear = useMutation({
    mutationFn: (datos: DatosPresentacion) => presentacionesApi.crear(datos),
    onSuccess: invalidar,
  });

  const actualizar = useMutation({
    mutationFn: ({
      id,
      datos,
    }: {
      id: string;
      datos: { nombre?: string; cantidadEquivalente?: number; precio?: number };
    }) => presentacionesApi.actualizar(id, datos),
    onSuccess: invalidar,
  });

  const eliminar = useMutation({
    mutationFn: (id: string) => presentacionesApi.eliminar(id),
    onSuccess: invalidar,
  });

  return { crear, actualizar, eliminar };
}
