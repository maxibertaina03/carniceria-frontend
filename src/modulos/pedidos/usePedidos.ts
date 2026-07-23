import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DatosEntrega, DatosPedido, pedidosApi } from './pedidosApi';

export function usePedidos() {
  return useQuery({ queryKey: ['pedidos'], queryFn: () => pedidosApi.listar() });
}

// Entregar un pedido genera una venta (mueve stock, clientes, reportes).
function invalidarPedidos(cliente: ReturnType<typeof useQueryClient>, todo = false) {
  cliente.invalidateQueries({ queryKey: ['pedidos'] });
  if (todo) {
    cliente.invalidateQueries({ queryKey: ['ventas'] });
    cliente.invalidateQueries({ queryKey: ['productos'] });
    cliente.invalidateQueries({ queryKey: ['clientes'] });
    cliente.invalidateQueries({ queryKey: ['reportes'] });
  }
}

export function useMutacionesPedido() {
  const cliente = useQueryClient();

  const crear = useMutation({
    mutationFn: (datos: DatosPedido) => pedidosApi.crear(datos),
    onSuccess: () => invalidarPedidos(cliente),
  });

  const entregar = useMutation({
    mutationFn: ({ id, datos }: { id: string; datos: DatosEntrega }) =>
      pedidosApi.entregar(id, datos),
    onSuccess: () => invalidarPedidos(cliente, true),
  });

  const cancelar = useMutation({
    mutationFn: (id: string) => pedidosApi.cancelar(id),
    onSuccess: () => invalidarPedidos(cliente),
  });

  const eliminar = useMutation({
    mutationFn: (id: string) => pedidosApi.eliminar(id),
    onSuccess: () => invalidarPedidos(cliente),
  });

  return { crear, entregar, cancelar, eliminar };
}
