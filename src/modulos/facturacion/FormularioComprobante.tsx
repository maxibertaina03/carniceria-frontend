import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mensajeDeError } from '../../compartido/clienteHttp';
import { AvisoError } from '../../compartido/componentes/AvisoError';
import { formatearMoneda } from '../../compartido/formato';
import { ETIQUETA_TIPO, TipoComprobante } from './facturacionApi';
import { useComprobantes, useMutacionesComprobante } from './useFacturacion';

interface Linea {
  descripcion: string;
  cantidad: string;
  precioUnitario: string;
}

const lineaVacia: Linea = { descripcion: '', cantidad: '', precioUnitario: '' };

const ALICUOTAS = [
  { valor: 0, etiqueta: 'Sin IVA' },
  { valor: 10.5, etiqueta: '10,5%' },
  { valor: 21, etiqueta: '21%' },
  { valor: 27, etiqueta: '27%' },
];

const TIPOS: TipoComprobante[] = [
  'FACTURA',
  'RECIBO',
  'NOTA_CREDITO',
  'NOTA_DEBITO',
];

export function FormularioComprobante() {
  const navegar = useNavigate();
  const { crear } = useMutacionesComprobante();
  const { data: facturas } = useComprobantes('FACTURA');

  const [tipo, setTipo] = useState<TipoComprobante>('FACTURA');
  const [nombre, setNombre] = useState('');
  const [docTipo, setDocTipo] = useState('');
  const [docNumero, setDocNumero] = useState('');
  const [domicilio, setDomicilio] = useState('');
  const [alicuotaIva, setAlicuotaIva] = useState(0);
  const [comprobanteOrigenId, setComprobanteOrigenId] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [lineas, setLineas] = useState<Linea[]>([{ ...lineaVacia }]);
  const [error, setError] = useState<string | null>(null);

  const requiereOrigen = tipo === 'NOTA_CREDITO' || tipo === 'NOTA_DEBITO';

  const { neto, iva, total } = useMemo(() => {
    const neto = lineas.reduce((suma, linea) => {
      const cantidad = Number(linea.cantidad);
      const precio = Number(linea.precioUnitario);
      return suma + (cantidad > 0 && precio >= 0 ? cantidad * precio : 0);
    }, 0);
    const iva = (neto * alicuotaIva) / 100;
    return { neto, iva, total: neto + iva };
  }, [lineas, alicuotaIva]);

  function cambiarLinea(indice: number, cambios: Partial<Linea>) {
    setLineas((previas) =>
      previas.map((linea, i) => (i === indice ? { ...linea, ...cambios } : linea)),
    );
  }

  async function manejarEnvio(evento: FormEvent) {
    evento.preventDefault();
    setError(null);
    const items = lineas
      .filter((linea) => linea.descripcion.trim())
      .map((linea) => ({
        descripcion: linea.descripcion.trim(),
        cantidad: Number(linea.cantidad),
        precioUnitario: Number(linea.precioUnitario),
      }));
    if (items.length === 0) {
      setError('Agregá al menos un ítem con descripción.');
      return;
    }
    if (requiereOrigen && !comprobanteOrigenId) {
      setError('Elegí la factura de origen para la nota.');
      return;
    }
    try {
      const creado = await crear.mutateAsync({
        tipo,
        receptor: {
          nombre,
          docTipo: docTipo || undefined,
          docNumero: docNumero || undefined,
          domicilio: domicilio || undefined,
        },
        alicuotaIva,
        items,
        observaciones: observaciones || undefined,
        comprobanteOrigenId: requiereOrigen ? comprobanteOrigenId : undefined,
      });
      navegar(`/admin/comprobante/${creado.id}`);
    } catch (excepcion) {
      setError(mensajeDeError(excepcion));
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/admin" className="text-sm text-blue-700 hover:underline">
        ← Volver a facturación
      </Link>
      <h2 className="mb-4 mt-2 text-2xl font-bold">Nuevo comprobante</h2>

      <form onSubmit={manejarEnvio} className="tarjeta flex flex-col gap-4">
        <div>
          <span className="etiqueta">Tipo de comprobante</span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TIPOS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTipo(t)}
                className={`rounded-lg border px-2 py-2 text-center text-sm font-medium transition ${
                  tipo === t
                    ? 'border-red-700 bg-red-50 text-red-700'
                    : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {ETIQUETA_TIPO[t]}
              </button>
            ))}
          </div>
        </div>

        {requiereOrigen && (
          <div>
            <label className="etiqueta" htmlFor="origen">Factura de origen</label>
            <select
              id="origen"
              className="campo"
              value={comprobanteOrigenId}
              onChange={(evento) => setComprobanteOrigenId(evento.target.value)}
              required
            >
              <option value="">Elegir factura…</option>
              {facturas?.map((factura) => (
                <option key={factura.id} value={factura.id}>
                  {factura.numeroFormateado} — {factura.receptorNombre}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="etiqueta" htmlFor="nombre">Cliente (nombre o razón social)</label>
            <input
              id="nombre"
              className="campo"
              value={nombre}
              onChange={(evento) => setNombre(evento.target.value)}
              placeholder="Ej: Rotisería El Buen Sabor SRL"
              required
            />
          </div>
          <div>
            <label className="etiqueta" htmlFor="docTipo">Tipo de documento (opcional)</label>
            <input
              id="docTipo"
              className="campo"
              value={docTipo}
              onChange={(evento) => setDocTipo(evento.target.value)}
              placeholder="CUIT / DNI"
            />
          </div>
          <div>
            <label className="etiqueta" htmlFor="docNumero">Número de documento (opcional)</label>
            <input
              id="docNumero"
              className="campo"
              value={docNumero}
              onChange={(evento) => setDocNumero(evento.target.value)}
              placeholder="30-12345678-9"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="etiqueta" htmlFor="domicilio">Domicilio (opcional)</label>
            <input
              id="domicilio"
              className="campo"
              value={domicilio}
              onChange={(evento) => setDomicilio(evento.target.value)}
            />
          </div>
        </div>

        <div>
          <span className="etiqueta">Detalle</span>
          <div className="flex flex-col gap-2">
            {lineas.map((linea, indice) => (
              <div key={indice} className="flex flex-wrap items-center gap-2">
                <input
                  className="campo min-w-0 flex-1"
                  placeholder="Descripción"
                  value={linea.descripcion}
                  onChange={(evento) =>
                    cambiarLinea(indice, { descripcion: evento.target.value })
                  }
                />
                <input
                  className="campo w-24"
                  type="number"
                  min="0.001"
                  step="0.001"
                  placeholder="Cant."
                  value={linea.cantidad}
                  onChange={(evento) =>
                    cambiarLinea(indice, { cantidad: evento.target.value })
                  }
                  required={Boolean(linea.descripcion)}
                />
                <input
                  className="campo w-28"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Precio"
                  value={linea.precioUnitario}
                  onChange={(evento) =>
                    cambiarLinea(indice, { precioUnitario: evento.target.value })
                  }
                  required={Boolean(linea.descripcion)}
                />
                <button
                  type="button"
                  className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                  onClick={() =>
                    setLineas((previas) =>
                      previas.length > 1
                        ? previas.filter((_, i) => i !== indice)
                        : [{ ...lineaVacia }],
                    )
                  }
                  aria-label="Quitar ítem"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-2 text-sm font-medium text-blue-700 hover:underline"
            onClick={() => setLineas((previas) => [...previas, { ...lineaVacia }])}
          >
            + Agregar ítem
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="etiqueta" htmlFor="iva">IVA</label>
            <select
              id="iva"
              className="campo"
              value={alicuotaIva}
              onChange={(evento) => setAlicuotaIva(Number(evento.target.value))}
            >
              {ALICUOTAS.map((a) => (
                <option key={a.valor} value={a.valor}>
                  {a.etiqueta}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="etiqueta" htmlFor="observaciones">Observaciones (opcional)</label>
            <input
              id="observaciones"
              className="campo"
              value={observaciones}
              onChange={(evento) => setObservaciones(evento.target.value)}
            />
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 p-3 text-right">
          <p className="text-sm text-gray-600">
            Neto: <strong>{formatearMoneda(neto)}</strong>
          </p>
          {alicuotaIva > 0 && (
            <p className="text-sm text-gray-600">
              IVA ({alicuotaIva}%): <strong>{formatearMoneda(iva)}</strong>
            </p>
          )}
          <p className="text-lg">
            Total: <strong>{formatearMoneda(total)}</strong>
          </p>
        </div>

        <AvisoError mensaje={error} />

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Link to="/admin" className="boton-secundario text-center">
            Cancelar
          </Link>
          <button type="submit" className="boton-primario" disabled={crear.isPending}>
            Crear comprobante
          </button>
        </div>
      </form>
    </div>
  );
}
