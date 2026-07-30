import { useMemo, useState } from 'react';
import { mensajeDeError } from '../../compartido/clienteHttp';
import { AvisoError } from '../../compartido/componentes/AvisoError';
import { Modal } from '../../compartido/componentes/Modal';
import { formatearMoneda } from '../../compartido/formato';
import { useConfiguracion } from '../configuracion/ConfiguracionProvider';
import { nuevoPrecioPorcentaje } from './productosApi';
import { useMutacionesProducto, useProductos } from './useProductos';

interface Props {
  abierto: boolean;
  alCerrar: () => void;
}

export function ModalActualizarPrecios({ abierto, alCerrar }: Props) {
  const { data: productos } = useProductos();
  const { config } = useConfiguracion();
  const { actualizarPrecios } = useMutacionesProducto();

  const [porcentajeStr, setPorcentajeStr] = useState('');
  const [categoria, setCategoria] = useState('TODAS');
  const [redondearA, setRedondearA] = useState(10);
  const [incluirPresentaciones, setIncluirPresentaciones] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<string | null>(null);

  const porcentaje = Number(porcentajeStr);
  const porcentajeValido = porcentajeStr !== '' && Number.isFinite(porcentaje);

  // Productos afectados (activos, con precio, de la categoría elegida).
  const afectados = useMemo(() => {
    return (productos ?? []).filter(
      (p) =>
        p.activo &&
        p.precioVentaReferencia > 0 &&
        (categoria === 'TODAS' || p.categoria === categoria),
    );
  }, [productos, categoria]);

  async function aplicar() {
    setError(null);
    if (!porcentajeValido || porcentaje === 0) {
      setError('Poné un porcentaje distinto de cero.');
      return;
    }
    try {
      const r = await actualizarPrecios.mutateAsync({
        porcentaje,
        categorias: categoria === 'TODAS' ? undefined : [categoria],
        redondearA,
        incluirPresentaciones: config.features.presentaciones
          ? incluirPresentaciones
          : false,
      });
      setResultado(
        `Se actualizaron ${r.productos} producto(s)` +
          (r.presentaciones > 0 ? ` y ${r.presentaciones} presentación(es)` : '') +
          '.',
      );
    } catch (excepcion) {
      setError(mensajeDeError(excepcion));
    }
  }

  function cerrar() {
    setResultado(null);
    setError(null);
    alCerrar();
  }

  return (
    <Modal titulo="Actualizar precios" abierto={abierto} alCerrar={cerrar}>
      {resultado ? (
        <div className="flex flex-col gap-4">
          <p className="rounded-lg bg-green-50 p-3 text-green-800">✓ {resultado}</p>
          <div className="flex justify-end">
            <button className="boton-primario" onClick={cerrar}>
              Listo
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-500">
            Subí o bajá muchos precios de una. Poné un porcentaje (ej.{' '}
            <strong>10</strong> para +10%, <strong>-5</strong> para −5%).
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="etiqueta" htmlFor="pct">Ajuste (%)</label>
              <input
                id="pct"
                className="campo"
                type="number"
                step="0.5"
                value={porcentajeStr}
                onChange={(e) => setPorcentajeStr(e.target.value)}
                placeholder="10"
                autoFocus
              />
            </div>
            <div>
              <label className="etiqueta" htmlFor="cat">Alcance</label>
              <select
                id="cat"
                className="campo"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              >
                <option value="TODAS">Todas las categorías</option>
                {config.categorias.map((c) => (
                  <option key={c.codigo} value={c.codigo}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="etiqueta" htmlFor="red">Redondear a</label>
              <select
                id="red"
                className="campo"
                value={redondearA}
                onChange={(e) => setRedondearA(Number(e.target.value))}
              >
                <option value={0}>Sin redondear</option>
                <option value={10}>$10</option>
                <option value={50}>$50</option>
                <option value={100}>$100</option>
              </select>
            </div>
          </div>

          {config.features.presentaciones && (
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={incluirPresentaciones}
                onChange={(e) => setIncluirPresentaciones(e.target.checked)}
              />
              Actualizar también las presentaciones (½ kg, docena…)
            </label>
          )}

          <div>
            <p className="mb-1 text-sm font-semibold">
              Vista previa{' '}
              <span className="font-normal text-gray-500">
                ({afectados.length} producto{afectados.length === 1 ? '' : 's'})
              </span>
            </p>
            <div className="max-h-56 overflow-y-auto rounded-lg border border-gray-100">
              {afectados.length === 0 && (
                <p className="p-3 text-sm text-gray-500">
                  No hay productos con precio en este alcance.
                </p>
              )}
              {porcentajeValido &&
                afectados.map((p) => {
                  const nuevo = nuevoPrecioPorcentaje(
                    p.precioVentaReferencia,
                    porcentaje,
                    redondearA,
                  );
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-2 border-b border-gray-50 px-3 py-1.5 text-sm last:border-0"
                    >
                      <span className="truncate">{p.nombre}</span>
                      <span className="shrink-0 tabular-nums text-gray-500">
                        {formatearMoneda(p.precioVentaReferencia)}{' '}
                        <span className="text-gray-400">→</span>{' '}
                        <strong className="text-gray-900">
                          {formatearMoneda(nuevo)}
                        </strong>
                      </span>
                    </div>
                  );
                })}
              {!porcentajeValido && afectados.length > 0 && (
                <p className="p-3 text-sm text-gray-400">
                  Escribí un porcentaje para ver los precios nuevos.
                </p>
              )}
            </div>
          </div>

          <AvisoError mensaje={error} />

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button className="boton-secundario" onClick={cerrar}>
              Cancelar
            </button>
            <button
              className="boton-primario"
              onClick={aplicar}
              disabled={
                actualizarPrecios.isPending ||
                !porcentajeValido ||
                porcentaje === 0 ||
                afectados.length === 0
              }
            >
              {actualizarPrecios.isPending
                ? 'Aplicando…'
                : `Aplicar a ${afectados.length} producto${afectados.length === 1 ? '' : 's'}`}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
