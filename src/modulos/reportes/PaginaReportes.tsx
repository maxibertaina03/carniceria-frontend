import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EstadoConsulta } from '../../compartido/componentes/EstadoConsulta';
import { formatearCantidad, formatearMoneda } from '../../compartido/formato';
import { useConfiguracion } from '../configuracion/ConfiguracionProvider';
import { ventasApi } from '../ventas/ventasApi';
import {
  BarraContadoFiado,
  GraficoDeudas,
  GraficoMasVendidos,
  GraficoVentasPorDia,
} from './GraficosReportes';
import { reportesApi } from './reportesApi';

// Arma la serie diaria (un punto por día del rango) sumando el total de las ventas.
function serieVentasPorDia(
  ventas: { fecha: string; total: number }[],
  desde: string,
  hasta: string,
): { dia: string; etiqueta: string; total: number }[] {
  const porDia = new Map<string, number>();
  for (const venta of ventas) {
    const dia = venta.fecha.slice(0, 10);
    if (dia >= desde && dia <= hasta) {
      porDia.set(dia, (porDia.get(dia) ?? 0) + venta.total);
    }
  }
  const serie: { dia: string; etiqueta: string; total: number }[] = [];
  const cursor = new Date(`${desde}T00:00:00`);
  const fin = new Date(`${hasta}T00:00:00`);
  // Límite de seguridad para rangos enormes (no dibujar miles de barras).
  for (let i = 0; cursor <= fin && i < 120; i++) {
    const dia = cursor.toISOString().slice(0, 10);
    const etiqueta = `${String(cursor.getDate()).padStart(2, '0')}/${String(
      cursor.getMonth() + 1,
    ).padStart(2, '0')}`;
    serie.push({ dia, etiqueta, total: porDia.get(dia) ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  return serie;
}

function primerDiaDelMes(): string {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`;
}

function hoyISO(): string {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(
    hoy.getDate(),
  ).padStart(2, '0')}`;
}

export function PaginaReportes() {
  const [desde, setDesde] = useState(primerDiaDelMes());
  const [hasta, setHasta] = useState(hoyISO());
  const rango = { desde, hasta };
  const { nombreCategoria } = useConfiguracion();

  const ganancias = useQuery({
    queryKey: ['reportes', 'ganancias', rango],
    queryFn: () => reportesApi.ganancias(rango),
  });
  const masVendidos = useQuery({
    queryKey: ['reportes', 'mas-vendidos', rango],
    queryFn: () => reportesApi.productosMasVendidos(rango),
  });
  const deudas = useQuery({
    queryKey: ['reportes', 'deudas'],
    queryFn: reportesApi.deudas,
  });
  const stock = useQuery({
    queryKey: ['reportes', 'stock'],
    queryFn: reportesApi.stock,
  });
  const ventas = useQuery({ queryKey: ['ventas'], queryFn: ventasApi.listar });

  const serieDiaria = useMemo(
    () => serieVentasPorDia(ventas.data ?? [], desde, hasta),
    [ventas.data, desde, hasta],
  );

  const totalDeuda = deudas.data?.reduce((suma, deuda) => suma + deuda.saldoDeudor, 0) ?? 0;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-2xl font-bold">Reportes</h2>
        <div className="flex w-full items-end gap-2 sm:w-auto">
          <div className="flex-1 sm:flex-none">
            <label className="etiqueta" htmlFor="desde">Desde</label>
            <input
              id="desde"
              type="date"
              className="campo"
              value={desde}
              onChange={(evento) => setDesde(evento.target.value)}
            />
          </div>
          <div className="flex-1 sm:flex-none">
            <label className="etiqueta" htmlFor="hasta">Hasta</label>
            <input
              id="hasta"
              type="date"
              className="campo"
              value={hasta}
              onChange={(evento) => setHasta(evento.target.value)}
            />
          </div>
        </div>
      </div>

      <EstadoConsulta cargando={ganancias.isLoading} error={ganancias.error} />

      {ganancias.data && (
        <section className="tarjeta">
          <p className="text-sm text-gray-500">Resultado del período (ventas − gastos)</p>
          <p
            className={`text-4xl font-semibold sm:text-5xl ${
              ganancias.data.resultado < 0 ? 'text-red-600' : 'text-green-700'
            }`}
          >
            {formatearMoneda(ganancias.data.resultado)}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-gray-500">Ganancia de ventas</p>
              <p className="text-xl font-semibold">
                {formatearMoneda(ganancias.data.gananciaTotal)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Gastos</p>
              <p className="text-xl font-semibold text-red-600">
                −{formatearMoneda(ganancias.data.totalGastos)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ventas / total vendido</p>
              <p className="text-xl font-semibold">
                {ganancias.data.cantidadVentas} ·{' '}
                {formatearMoneda(ganancias.data.totalVendido)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cobrado al contado</p>
              <p className="text-xl font-semibold">
                {formatearMoneda(ganancias.data.totalContado)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Quedó fiado</p>
              <p className="text-xl font-semibold">
                {formatearMoneda(ganancias.data.totalFiado)}
              </p>
            </div>
          </div>
          {ganancias.data.totalVendido > 0 && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <p className="mb-2 text-sm text-gray-500">Cómo se cobró</p>
              <BarraContadoFiado
                contado={ganancias.data.totalContado}
                fiado={ganancias.data.totalFiado}
              />
            </div>
          )}
        </section>
      )}

      <section className="tarjeta">
        <h3 className="mb-1 text-lg font-semibold">Ventas por día</h3>
        <p className="mb-2 text-sm text-gray-500">
          Cuánto se vendió cada día del período (pasá el mouse para ver el detalle).
        </p>
        <EstadoConsulta cargando={ventas.isLoading} error={ventas.error} />
        {ventas.data && <GraficoVentasPorDia datos={serieDiaria} />}
      </section>

      <section>
        <h3 className="mb-2 text-lg font-semibold">Productos más vendidos en el período</h3>
        <EstadoConsulta cargando={masVendidos.isLoading} error={masVendidos.error} />
        {masVendidos.data && masVendidos.data.length > 0 && (
          <div className="tarjeta mb-3">
            <GraficoMasVendidos
              datos={masVendidos.data.map((p) => ({
                nombre: p.nombre,
                totalVendido: p.totalVendido,
              }))}
            />
          </div>
        )}
        {masVendidos.data && (
          <div className="tarjeta overflow-x-auto p-0">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="encabezado-tabla">#</th>
                  <th className="encabezado-tabla">Producto</th>
                  <th className="encabezado-tabla text-right">Cantidad vendida</th>
                  <th className="encabezado-tabla hidden text-right sm:table-cell">
                    Total vendido
                  </th>
                  <th className="encabezado-tabla text-right">Ganancia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {masVendidos.data.map((producto, indice) => (
                  <tr key={producto.productoId}>
                    <td className="celda text-gray-400">{indice + 1}</td>
                    <td className="celda font-medium">{producto.nombre}</td>
                    <td className="celda text-right tabular-nums">
                      {formatearCantidad(producto.cantidadVendida, producto.unidadMedida)}
                    </td>
                    <td className="celda hidden text-right tabular-nums sm:table-cell">
                      {formatearMoneda(producto.totalVendido)}
                    </td>
                    <td className="celda text-right tabular-nums">
                      {formatearMoneda(producto.gananciaGenerada)}
                    </td>
                  </tr>
                ))}
                {masVendidos.data.length === 0 && (
                  <tr>
                    <td className="celda py-6 text-center text-gray-500" colSpan={5}>
                      No hubo ventas en el período elegido.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-lg font-semibold">
          Deudas pendientes{' '}
          {totalDeuda > 0 && (
            <span className="text-base font-normal text-gray-500">
              (total: {formatearMoneda(totalDeuda)})
            </span>
          )}
        </h3>
        <EstadoConsulta cargando={deudas.isLoading} error={deudas.error} />
        {deudas.data && deudas.data.length > 0 && (
          <div className="tarjeta mb-3">
            <GraficoDeudas
              datos={deudas.data.map((d) => ({
                nombre: d.nombre,
                saldoDeudor: d.saldoDeudor,
              }))}
            />
          </div>
        )}
        {deudas.data && (
          <div className="tarjeta overflow-x-auto p-0">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="encabezado-tabla">Cliente</th>
                  <th className="encabezado-tabla hidden sm:table-cell">Teléfono</th>
                  <th className="encabezado-tabla text-right">Debe</th>
                  <th className="encabezado-tabla"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {deudas.data.map((deuda) => (
                  <tr key={deuda.clienteId}>
                    <td className="celda font-medium">{deuda.nombre}</td>
                    <td className="celda hidden sm:table-cell">
                      {deuda.telefono ?? '—'}
                    </td>
                    <td className="celda text-right font-semibold tabular-nums">
                      {formatearMoneda(deuda.saldoDeudor)}
                    </td>
                    <td className="celda text-right">
                      <Link
                        to={`/clientes/${deuda.clienteId}`}
                        className="text-sm font-medium text-blue-700 hover:underline"
                      >
                        Ver cuenta
                      </Link>
                    </td>
                  </tr>
                ))}
                {deudas.data.length === 0 && (
                  <tr>
                    <td className="celda py-6 text-center text-gray-500" colSpan={4}>
                      Nadie debe nada. 🎉
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-lg font-semibold">Stock actual</h3>
        <EstadoConsulta cargando={stock.isLoading} error={stock.error} />
        {stock.data && (
          <div className="tarjeta overflow-x-auto p-0">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="encabezado-tabla">Producto</th>
                  <th className="encabezado-tabla hidden sm:table-cell">Categoría</th>
                  <th className="encabezado-tabla text-right">Stock</th>
                  <th className="encabezado-tabla hidden text-right sm:table-cell">
                    Costo
                  </th>
                  <th className="encabezado-tabla text-right">Precio de venta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stock.data.map((producto) => (
                  <tr key={producto.productoId}>
                    <td className="celda font-medium">{producto.nombre}</td>
                    <td className="celda hidden sm:table-cell">
                      {nombreCategoria(producto.categoria)}
                    </td>
                    <td className="celda text-right tabular-nums">
                      {formatearCantidad(producto.stockActual, producto.unidadMedida)}
                    </td>
                    <td className="celda hidden text-right tabular-nums sm:table-cell">
                      {formatearMoneda(producto.costoUnitarioReferencia)}
                    </td>
                    <td className="celda text-right tabular-nums">
                      {formatearMoneda(producto.precioVentaReferencia)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
