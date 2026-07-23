import { FormEvent, useState } from 'react';
import { mensajeDeError } from '../../compartido/clienteHttp';
import { AvisoError } from '../../compartido/componentes/AvisoError';
import { EstadoConsulta } from '../../compartido/componentes/EstadoConsulta';
import {
  formatearFecha,
  formatearMes,
  formatearMoneda,
} from '../../compartido/formato';
import { useProveedores } from '../proveedores/useProveedores';
import { Gasto } from './gastosApi';
import { useGastos, useMutacionesGasto } from './useGastos';

function hoyISO(): string {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(
    hoy.getDate(),
  ).padStart(2, '0')}`;
}

interface GrupoMes {
  mes: string;
  etiqueta: string;
  total: number;
  gastos: Gasto[];
}

// Agrupa los gastos por mes (más reciente primero) con el total de cada mes.
function agruparPorMes(gastos: Gasto[]): GrupoMes[] {
  const grupos = new Map<string, GrupoMes>();
  for (const gasto of gastos) {
    const mes = gasto.fecha.slice(0, 7); // AAAA-MM
    let grupo = grupos.get(mes);
    if (!grupo) {
      grupo = { mes, etiqueta: formatearMes(gasto.fecha), total: 0, gastos: [] };
      grupos.set(mes, grupo);
    }
    grupo.total += gasto.monto;
    grupo.gastos.push(gasto);
  }
  return [...grupos.values()].sort((a, b) => (a.mes < b.mes ? 1 : -1));
}

export function PaginaGastos() {
  const { data: gastos, isLoading, error } = useGastos();
  const { data: proveedores } = useProveedores();
  const { crear, pagar, eliminar } = useMutacionesGasto();

  const [concepto, setConcepto] = useState('');
  const [categoria, setCategoria] = useState('');
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(hoyISO());
  const [adeudado, setAdeudado] = useState(false);
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [proveedorId, setProveedorId] = useState('');
  const [errorForm, setErrorForm] = useState<string | null>(null);

  async function manejarEnvio(evento: FormEvent) {
    evento.preventDefault();
    setErrorForm(null);
    if (adeudado && !proveedorId) {
      setErrorForm('Para un gasto a deber, elegí el proveedor.');
      return;
    }
    try {
      await crear.mutateAsync({
        concepto,
        categoria: categoria || undefined,
        monto: Number(monto),
        fecha,
        adeudado,
        fechaVencimiento: adeudado && fechaVencimiento ? fechaVencimiento : undefined,
        proveedorId: adeudado ? proveedorId : undefined,
      });
      setConcepto('');
      setCategoria('');
      setMonto('');
      setAdeudado(false);
      setFechaVencimiento('');
      setProveedorId('');
      // La fecha se deja en la última usada, para cargar varias boletas del mismo mes.
    } catch (excepcion) {
      setErrorForm(mensajeDeError(excepcion));
    }
  }

  async function manejarPagar(id: string) {
    try {
      await pagar.mutateAsync(id);
    } catch (excepcion) {
      window.alert(mensajeDeError(excepcion));
    }
  }

  async function manejarEliminar(id: string) {
    if (!window.confirm('¿Borrar este gasto?')) return;
    try {
      await eliminar.mutateAsync(id);
    } catch (excepcion) {
      window.alert(mensajeDeError(excepcion));
    }
  }

  const grupos = gastos ? agruparPorMes(gastos) : [];

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mb-1 text-2xl font-bold">Gastos del negocio</h2>
      <p className="mb-4 text-sm text-gray-500">
        Gastos que no son mercadería (alquiler, luz, sueldos…). Cargá cada boleta
        con su fecha: quedan agrupadas por mes y se descuentan del resultado real
        en Reportes.
      </p>

      <form onSubmit={manejarEnvio} className="tarjeta mb-6 flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="etiqueta" htmlFor="concepto">Concepto</label>
            <input
              id="concepto"
              className="campo"
              value={concepto}
              onChange={(evento) => setConcepto(evento.target.value)}
              placeholder="Ej: Alquiler"
              required
            />
          </div>
          <div>
            <label className="etiqueta" htmlFor="monto">Monto</label>
            <input
              id="monto"
              className="campo"
              type="number"
              min="0.01"
              step="0.01"
              value={monto}
              onChange={(evento) => setMonto(evento.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="etiqueta" htmlFor="fecha">¿De qué mes es? (fecha)</label>
            <input
              id="fecha"
              className="campo"
              type="date"
              value={fecha}
              onChange={(evento) => setFecha(evento.target.value)}
              required
            />
          </div>
          <div>
            <label className="etiqueta" htmlFor="categoria">Categoría (opcional)</label>
            <input
              id="categoria"
              className="campo"
              value={categoria}
              onChange={(evento) => setCategoria(evento.target.value)}
              placeholder="Ej: Servicios"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={adeudado}
            onChange={(evento) => setAdeudado(evento.target.checked)}
          />
          Todavía no lo pagué (queda a deber a un proveedor)
        </label>

        {adeudado && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="etiqueta" htmlFor="proveedor">¿A quién se lo debés?</label>
              <select
                id="proveedor"
                className="campo"
                value={proveedorId}
                onChange={(evento) => setProveedorId(evento.target.value)}
                required
              >
                <option value="">Elegir proveedor…</option>
                {proveedores?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Ej: EPEC (luz), Ecogas (gas). Si no está, cargalo en Proveedores.
              </p>
            </div>
            <div>
              <label className="etiqueta" htmlFor="vencimiento">¿Cuándo vence? (opcional)</label>
              <input
                id="vencimiento"
                className="campo"
                type="date"
                value={fechaVencimiento}
                onChange={(evento) => setFechaVencimiento(evento.target.value)}
              />
            </div>
          </div>
        )}

        <AvisoError mensaje={errorForm} />

        <div className="flex justify-end">
          <button type="submit" className="boton-primario" disabled={crear.isPending}>
            Registrar gasto
          </button>
        </div>
      </form>

      <EstadoConsulta cargando={isLoading} error={error} />

      {gastos && gastos.length === 0 && (
        <p className="tarjeta py-8 text-center text-gray-500">
          Todavía no cargaste gastos.
        </p>
      )}

      {grupos.map((grupo) => (
        <div key={grupo.mes} className="mb-5">
          <div className="mb-2 flex items-baseline justify-between">
            <h3 className="text-lg font-semibold">{grupo.etiqueta}</h3>
            <span className="text-sm text-gray-500">
              Total del mes:{' '}
              <strong className="text-gray-900">{formatearMoneda(grupo.total)}</strong>
            </span>
          </div>
          <div className="space-y-2">
            {grupo.gastos.map((gasto) => {
              const pendiente = gasto.adeudado && !gasto.pagado;
              const vencida =
                pendiente &&
                gasto.fechaVencimiento != null &&
                gasto.fechaVencimiento.slice(0, 10) < hoyISO();
              return (
                <div
                  key={gasto.id}
                  className={`tarjeta flex items-center justify-between gap-2 ${
                    vencida ? 'border-l-4 border-red-500' : ''
                  }`}
                >
                  <div>
                    <p className="font-semibold">
                      {gasto.concepto}
                      {gasto.categoria ? (
                        <span className="ml-2 text-sm font-normal text-gray-500">
                          {gasto.categoria}
                        </span>
                      ) : null}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatearFecha(gasto.fecha)}
                      {gasto.adeudado
                        ? ` · ${gasto.proveedorNombre ?? 'proveedor'}`
                        : ' · pagado'}
                    </p>
                    {pendiente ? (
                      <p
                        className={`mt-1 text-sm font-semibold ${
                          vencida ? 'text-red-600' : 'text-amber-600'
                        }`}
                      >
                        {vencida ? '¡Vencida!' : 'A deber'}
                        {gasto.fechaVencimiento
                          ? ` · vence ${formatearFecha(gasto.fechaVencimiento)}`
                          : ''}
                      </p>
                    ) : gasto.adeudado ? (
                      <p className="mt-1 text-sm font-semibold text-green-700">
                        Pagada ✓
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-col items-end gap-1 text-right">
                    <p className="font-semibold">{formatearMoneda(gasto.monto)}</p>
                    {pendiente && (
                      <button
                        className="rounded bg-green-600 px-3 py-1 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                        onClick={() => manejarPagar(gasto.id)}
                        disabled={pagar.isPending}
                      >
                        Marcar pagada
                      </button>
                    )}
                    <button
                      className="text-sm font-medium text-red-600 hover:underline"
                      onClick={() => manejarEliminar(gasto.id)}
                    >
                      Borrar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
