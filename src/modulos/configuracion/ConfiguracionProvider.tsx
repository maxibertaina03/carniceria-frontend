import { useQuery } from '@tanstack/react-query';
import { createContext, ReactNode, useContext, useMemo } from 'react';
import { ConfiguracionNegocio, configuracionApi } from './configuracionApi';

interface ContextoConfiguracion {
  config: ConfiguracionNegocio;
  // Si una sección está habilitada para este rubro.
  tieneModulo: (codigo: string) => boolean;
  // Nombre para mostrar de una categoría (por su código).
  nombreCategoria: (codigo: string) => string;
  // Códigos de categorías fabricables con receta.
  categoriasProducibles: string[];
  // Códigos de categorías de insumos.
  categoriasInsumo: string[];
}

const ConfiguracionContext = createContext<ContextoConfiguracion | null>(null);

// Trae la configuración del negocio (según el rubro) una sola vez al iniciar y
// la deja disponible para toda la app. Bloquea el render hasta tenerla, porque
// de ella dependen el menú, el nombre y las categorías.
export function ConfiguracionProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['config'],
    queryFn: configuracionApi.obtener,
    staleTime: Infinity,
  });

  const valor = useMemo<ContextoConfiguracion | null>(() => {
    if (!data) return null;
    const nombres = new Map(data.categorias.map((c) => [c.codigo, c.nombre]));
    return {
      config: data,
      tieneModulo: (codigo) => data.modulos.includes(codigo),
      nombreCategoria: (codigo) => nombres.get(codigo) ?? codigo,
      categoriasProducibles: data.categorias
        .filter((c) => c.producible)
        .map((c) => c.codigo),
      categoriasInsumo: data.categorias
        .filter((c) => c.esInsumo)
        .map((c) => c.codigo),
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        Cargando…
      </div>
    );
  }

  if (error || !valor) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-gray-700">
          No se pudo cargar la configuración del sistema.
        </p>
        <button className="boton-primario" onClick={() => refetch()}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <ConfiguracionContext.Provider value={valor}>
      {children}
    </ConfiguracionContext.Provider>
  );
}

export function useConfiguracion(): ContextoConfiguracion {
  const contexto = useContext(ConfiguracionContext);
  if (!contexto) {
    throw new Error('useConfiguracion debe usarse dentro de ConfiguracionProvider');
  }
  return contexto;
}
