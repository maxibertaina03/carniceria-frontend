import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DatosProducto, productosApi } from './productosApi';

export function useProductos(incluirInactivos = false) {
  return useQuery({
    queryKey: ['productos', incluirInactivos],
    queryFn: () => productosApi.listar(incluirInactivos),
  });
}

export function useMutacionesProducto() {
  const cliente = useQueryClient();
  const invalidar = () => cliente.invalidateQueries({ queryKey: ['productos'] });

  const crear = useMutation({
    mutationFn: (datos: DatosProducto) => productosApi.crear(datos),
    onSuccess: invalidar,
  });

  const actualizar = useMutation({
    mutationFn: ({
      id,
      datos,
    }: {
      id: string;
      datos: Partial<DatosProducto> & { activo?: boolean };
    }) => productosApi.actualizar(id, datos),
    onSuccess: invalidar,
  });

  const desactivar = useMutation({
    mutationFn: (id: string) => productosApi.desactivar(id),
    onSuccess: invalidar,
  });

  return { crear, actualizar, desactivar };
}
