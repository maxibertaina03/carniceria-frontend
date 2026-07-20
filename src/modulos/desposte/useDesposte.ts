import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DatosRegistrarDesposte, desposteApi } from './desposteApi';

export function useDespostes() {
  return useQuery({ queryKey: ['despostes'], queryFn: desposteApi.listar });
}

export function useRegistrarDesposte() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (datos: DatosRegistrarDesposte) => desposteApi.registrar(datos),
    onSuccess: () => {
      // Un desposte suma stock y fija el costo de los cortes.
      cliente.invalidateQueries({ queryKey: ['despostes'] });
      cliente.invalidateQueries({ queryKey: ['productos'] });
      cliente.invalidateQueries({ queryKey: ['reportes'] });
    },
  });
}
