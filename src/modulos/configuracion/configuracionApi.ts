import { clienteHttp } from '../../compartido/clienteHttp';

export interface CategoriaConfig {
  codigo: string;
  nombre: string;
  producible: boolean;
  esInsumo: boolean;
}

export interface FeaturesNegocio {
  lotes: boolean;
  presentaciones: boolean;
}

export interface ConfiguracionNegocio {
  rubro: string;
  nombreNegocio: string;
  modulos: string[];
  categorias: CategoriaConfig[];
  features: FeaturesNegocio;
  etiquetas: Record<string, string>;
}

export const configuracionApi = {
  async obtener(): Promise<ConfiguracionNegocio> {
    const { data } = await clienteHttp.get('/config');
    return data;
  },
};
