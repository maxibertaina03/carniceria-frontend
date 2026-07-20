import { ReactNode } from 'react';

interface Props {
  titulo: string;
  abierto: boolean;
  alCerrar: () => void;
  children: ReactNode;
}

export function Modal({ titulo, abierto, alCerrar, children }: Props) {
  if (!abierto) {
    return null;
  }
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onClick={alCerrar}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-xl"
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{titulo}</h2>
          <button
            type="button"
            onClick={alCerrar}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
