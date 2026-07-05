import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DatosRegistrarVenta, ventasApi } from './ventasApi';

export function useVentas() {
  return useQuery({ queryKey: ['ventas'], queryFn: ventasApi.listar });
}

export function useRegistrarVenta() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (datos: DatosRegistrarVenta) => ventasApi.registrar(datos),
    onSuccess: () => {
      // Una venta cambia el stock y puede cambiar la deuda de un cliente.
      cliente.invalidateQueries({ queryKey: ['ventas'] });
      cliente.invalidateQueries({ queryKey: ['productos'] });
      cliente.invalidateQueries({ queryKey: ['clientes'] });
      cliente.invalidateQueries({ queryKey: ['reportes'] });
    },
  });
}
