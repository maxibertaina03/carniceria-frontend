import { FormEvent, ReactNode, useState } from 'react';
import { AvisoError } from '../../compartido/componentes/AvisoError';
import {
  guardarClaveAdmin,
  hayClaveAdmin,
  verificarClaveAdmin,
} from './adminAuth';

// Envuelve las pantallas de administrador: si no hay contraseña válida cargada,
// muestra el candado; una vez desbloqueado, muestra el contenido.
export function RequiereAdmin({ children }: { children: ReactNode }) {
  const [desbloqueado, setDesbloqueado] = useState(hayClaveAdmin());
  const [clave, setClave] = useState('');
  const [verificando, setVerificando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function manejarEnvio(evento: FormEvent) {
    evento.preventDefault();
    setError(null);
    setVerificando(true);
    try {
      const ok = await verificarClaveAdmin(clave);
      if (ok) {
        guardarClaveAdmin(clave);
        setDesbloqueado(true);
      } else {
        setError('Contraseña incorrecta.');
      }
    } finally {
      setVerificando(false);
    }
  }

  if (desbloqueado) {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto max-w-sm">
      <div className="tarjeta flex flex-col gap-4">
        <div className="text-center">
          <div className="text-4xl">🔒</div>
          <h2 className="mt-2 text-xl font-bold">Área de administrador</h2>
          <p className="text-sm text-gray-500">
            Esta sección es privada. Ingresá tu contraseña de administrador.
          </p>
        </div>
        <form onSubmit={manejarEnvio} className="flex flex-col gap-3">
          <input
            type="password"
            className="campo"
            placeholder="Contraseña"
            value={clave}
            onChange={(evento) => setClave(evento.target.value)}
            autoFocus
            required
          />
          <AvisoError mensaje={error} />
          <button
            type="submit"
            className="boton-primario"
            disabled={verificando || !clave}
          >
            {verificando ? 'Verificando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
