import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { comprasApi, DatosRegistrarCompra } from './comprasApi';

export function useCompras() {
  return useQuery({ queryKey: ['compras'], queryFn: comprasApi.listar });
}

// Una compra cambia el stock y los costos de los productos.
function invalidarCompras(cliente: ReturnType<typeof useQueryClient>) {
  cliente.invalidateQueries({ queryKey: ['compras'] });
  cliente.invalidateQueries({ queryKey: ['productos'] });
  cliente.invalidateQueries({ queryKey: ['reportes'] });
}

export function useRegistrarCompra() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (datos: DatosRegistrarCompra) => comprasApi.registrar(datos),
    onSuccess: () => invalidarCompras(cliente),
  });
}

export function useEliminarCompra() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => comprasApi.eliminar(id),
    onSuccess: () => invalidarCompras(cliente),
  });
}
