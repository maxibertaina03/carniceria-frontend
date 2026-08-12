import { useMutation } from '@tanstack/react-query';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { asistenteApi } from './asistenteApi';

interface Mensaje {
  autor: 'usuario' | 'asistente' | 'error';
  texto: string;
}

// Preguntas de ejemplo (sirven para cualquier rubro: ventas, deudas, stock).
const EJEMPLOS = [
  '¿Cuánto vendí ayer?',
  '¿Qué cliente es el que más me debe?',
  '¿Cómo venían las ventas el mes pasado?',
  '¿Qué boletas se me vencen esta semana?',
];

// Chatbot de soporte de SOLO LECTURA. Botón flotante + panel de chat. Se monta
// solo si el módulo 'asistente' está habilitado para el rubro del negocio.
export function WidgetAsistente() {
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState('');
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const finRef = useRef<HTMLDivElement>(null);

  const consulta = useMutation({
    mutationFn: asistenteApi.consultar,
    onSuccess: (respuesta) =>
      setMensajes((prev) => [...prev, { autor: 'asistente', texto: respuesta }]),
    onError: () =>
      setMensajes((prev) => [
        ...prev,
        {
          autor: 'error',
          texto: 'No pude responder ahora. Probá de nuevo en un ratito.',
        },
      ]),
  });

  // Mantiene la vista pegada al último mensaje.
  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, consulta.isPending]);

  const preguntar = (pregunta: string) => {
    const limpia = pregunta.trim();
    if (!limpia || consulta.isPending) return;
    setMensajes((prev) => [...prev, { autor: 'usuario', texto: limpia }]);
    setTexto('');
    consulta.mutate(limpia);
  };

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    preguntar(texto);
  };

  return (
    <>
      {/* Botón flotante (arriba de la barra inferior en el celular) */}
      <button
        type="button"
        onClick={() => setAbierto((a) => !a)}
        aria-label="Asistente"
        className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-red-700 text-2xl text-white shadow-lg transition hover:bg-red-800 md:bottom-6 md:right-6 print:hidden"
      >
        {abierto ? '✕' : '💬'}
      </button>

      {abierto && (
        <div className="fixed bottom-36 right-4 z-50 flex h-[28rem] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl md:bottom-24 md:right-6 print:hidden">
          {/* Encabezado */}
          <div className="flex items-center justify-between bg-red-700 px-4 py-3 text-white">
            <div>
              <p className="font-semibold leading-tight">Asistente</p>
              <p className="text-xs text-red-100">Consultas de tu negocio</p>
            </div>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar"
              className="text-lg text-red-100 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Conversación */}
          <div className="flex-1 space-y-2 overflow-y-auto bg-gray-50 p-3">
            {mensajes.length === 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  Preguntame sobre tu negocio. Por ejemplo:
                </p>
                {EJEMPLOS.map((ejemplo) => (
                  <button
                    key={ejemplo}
                    type="button"
                    onClick={() => preguntar(ejemplo)}
                    className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm text-gray-700 transition hover:border-red-300 hover:bg-red-50"
                  >
                    {ejemplo}
                  </button>
                ))}
              </div>
            )}

            {mensajes.map((mensaje, indice) => (
              <div
                key={indice}
                className={
                  mensaje.autor === 'usuario' ? 'flex justify-end' : 'flex justify-start'
                }
              >
                <span
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                    mensaje.autor === 'usuario'
                      ? 'rounded-br-sm bg-red-700 text-white'
                      : mensaje.autor === 'error'
                        ? 'rounded-bl-sm bg-amber-100 text-amber-800'
                        : 'rounded-bl-sm bg-white text-gray-800 shadow-sm'
                  }`}
                >
                  {mensaje.texto}
                </span>
              </div>
            ))}

            {consulta.isPending && (
              <div className="flex justify-start">
                <span className="rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-sm text-gray-400 shadow-sm">
                  Pensando…
                </span>
              </div>
            )}
            <div ref={finRef} />
          </div>

          {/* Entrada */}
          <form onSubmit={enviar} className="flex gap-2 border-t border-gray-200 p-2">
            <input
              value={texto}
              onChange={(evento) => setTexto(evento.target.value)}
              placeholder="Escribí tu pregunta…"
              maxLength={500}
              className="min-w-0 flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
            />
            <button
              type="submit"
              disabled={consulta.isPending || !texto.trim()}
              className="shrink-0 rounded-full bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Enviar
            </button>
          </form>
        </div>
      )}
    </>
  );
}
