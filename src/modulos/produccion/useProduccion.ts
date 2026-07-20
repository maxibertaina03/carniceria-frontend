import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DatosProducir, DatosReceta, produccionApi } from './produccionApi';

export function useRecetas() {
  return useQuery({ queryKey: ['recetas'], queryFn: produccionApi.listarRecetas });
}

export function useOrdenesProduccion() {
  return useQuery({
    queryKey: ['ordenes-produccion'],
    queryFn: produccionApi.listarOrdenes,
  });
}

export function useMutacionesReceta() {
  const cliente = useQueryClient();
  const invalidar = () => cliente.invalidateQueries({ queryKey: ['recetas'] });

  const guardar = useMutation({
    mutationFn: (datos: DatosReceta) => produccionApi.guardarReceta(datos),
    onSuccess: invalidar,
  });

  const eliminar = useMutation({
    mutationFn: (productoTerminadoId: string) =>
      produccionApi.eliminarReceta(productoTerminadoId),
    onSuccess: invalidar,
  });

  return { guardar, eliminar };
}

export function useProducir() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (datos: DatosProducir) => produccionApi.producir(datos),
    onSuccess: () => {
      // Producir descuenta ingredientes y suma el terminado al stock.
      cliente.invalidateQueries({ queryKey: ['ordenes-produccion'] });
      cliente.invalidateQueries({ queryKey: ['productos'] });
      cliente.invalidateQueries({ queryKey: ['reportes'] });
    },
  });
}
