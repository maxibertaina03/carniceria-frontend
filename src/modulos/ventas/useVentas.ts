import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DatosRegistrarVenta, ventasApi } from './ventasApi';

export function useVentas() {
  return useQuery({ queryKey: ['ventas'], queryFn: ventasApi.listar });
}

// Una venta cambia el stock y puede cambiar la deuda de un cliente.
function invalidarVentas(cliente: ReturnType<typeof useQueryClient>) {
  cliente.invalidateQueries({ queryKey: ['ventas'] });
  cliente.invalidateQueries({ queryKey: ['productos'] });
  cliente.invalidateQueries({ queryKey: ['clientes'] });
  cliente.invalidateQueries({ queryKey: ['reportes'] });
}

export function useRegistrarVenta() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (datos: DatosRegistrarVenta) => ventasApi.registrar(datos),
    onSuccess: () => invalidarVentas(cliente),
  });
}

export function useEliminarVenta() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ventasApi.eliminar(id),
    onSuccess: () => invalidarVentas(cliente),
  });
}
