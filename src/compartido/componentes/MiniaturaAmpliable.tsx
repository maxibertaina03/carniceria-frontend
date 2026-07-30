import { useState } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  src: string;
  alt?: string;
  className?: string;
}

// Muestra una miniatura que, al tocarla, se agranda en pantalla completa
// (lightbox). Tocar de nuevo la cierra.
export function MiniaturaAmpliable({ src, alt = '', className = '' }: Props) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={`cursor-zoom-in ${className}`}
        onClick={(evento) => {
          evento.stopPropagation();
          setAbierto(true);
        }}
      />
      {abierto &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] flex cursor-zoom-out items-center justify-center bg-black/80 p-4"
            onClick={() => setAbierto(false)}
          >
            <img
              src={src}
              alt={alt}
              className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            />
          </div>,
          document.body,
        )}
    </>
  );
}
