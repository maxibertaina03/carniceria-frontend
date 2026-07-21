import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DatosRegistrarDesposte, desposteApi } from './desposteApi';

export function useDespostes() {
  return useQuery({ queryKey: ['despostes'], queryFn: desposteApi.listar });
}

// Un desposte suma stock y fija el costo de los cortes.
function invalidarDespostes(cliente: ReturnType<typeof useQueryClient>) {
  cliente.invalidateQueries({ queryKey: ['despostes'] });
  cliente.invalidateQueries({ queryKey: ['productos'] });
  cliente.invalidateQueries({ queryKey: ['reportes'] });
}

export function useRegistrarDesposte() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (datos: DatosRegistrarDesposte) => desposteApi.registrar(datos),
    onSuccess: () => invalidarDespostes(cliente),
  });
}

export function useEliminarDesposte() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => desposteApi.eliminar(id),
    onSuccess: () => invalidarDespostes(cliente),
  });
}
