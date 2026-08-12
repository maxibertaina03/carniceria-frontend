import { clienteHttp } from '../../compartido/clienteHttp';

export const asistenteApi = {
  // Envía una pregunta en lenguaje natural y devuelve la respuesta del asistente.
  async consultar(pregunta: string): Promise<string> {
    const { data } = await clienteHttp.post('/asistente/consulta', { pregunta });
    return data.respuesta as string;
  },
};
