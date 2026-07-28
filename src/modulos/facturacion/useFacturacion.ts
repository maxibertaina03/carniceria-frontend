import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  DatosComprobante,
  facturacionApi,
  TipoComprobante,
} from './facturacionApi';

export function useComprobantes(tipo?: TipoComprobante) {
  return useQuery({
    queryKey: ['comprobantes', tipo ?? 'todos'],
    queryFn: () => facturacionApi.listar(tipo),
  });
}

export function useComprobante(id: string) {
  return useQuery({
    queryKey: ['comprobantes', 'uno', id],
    queryFn: () => facturacionApi.obtener(id),
  });
}

export function useMutacionesComprobante() {
  const cliente = useQueryClient();
  const invalidar = () =>
    cliente.invalidateQueries({ queryKey: ['comprobantes'] });

  const crear = useMutation({
    mutationFn: (datos: DatosComprobante) => facturacionApi.crear(datos),
    onSuccess: invalidar,
  });

  const anular = useMutation({
    mutationFn: (id: string) => facturacionApi.anular(id),
    onSuccess: invalidar,
  });

  return { crear, anular };
}
