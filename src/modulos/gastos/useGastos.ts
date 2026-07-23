import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DatosGasto, gastosApi } from './gastosApi';

export function useGastos() {
  return useQuery({ queryKey: ['gastos'], queryFn: gastosApi.listar });
}

export function useMutacionesGasto() {
  const cliente = useQueryClient();
  // Un gasto adeudado toca la deuda del proveedor; todos afectan el resultado.
  const invalidar = () => {
    cliente.invalidateQueries({ queryKey: ['gastos'] });
    cliente.invalidateQueries({ queryKey: ['proveedores'] });
    cliente.invalidateQueries({ queryKey: ['reportes'] });
  };

  const crear = useMutation({
    mutationFn: (datos: DatosGasto) => gastosApi.crear(datos),
    onSuccess: invalidar,
  });

  const pagar = useMutation({
    mutationFn: (id: string) => gastosApi.pagar(id),
    onSuccess: invalidar,
  });

  const eliminar = useMutation({
    mutationFn: (id: string) => gastosApi.eliminar(id),
    onSuccess: invalidar,
  });

  return { crear, pagar, eliminar };
}
