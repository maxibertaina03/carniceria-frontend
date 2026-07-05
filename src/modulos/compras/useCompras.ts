import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { comprasApi, DatosRegistrarCompra } from './comprasApi';

export function useCompras() {
  return useQuery({ queryKey: ['compras'], queryFn: comprasApi.listar });
}

export function useRegistrarCompra() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (datos: DatosRegistrarCompra) => comprasApi.registrar(datos),
    onSuccess: () => {
      // Una compra cambia el stock y los costos de los productos.
      cliente.invalidateQueries({ queryKey: ['compras'] });
      cliente.invalidateQueries({ queryKey: ['productos'] });
      cliente.invalidateQueries({ queryKey: ['reportes'] });
    },
  });
}
