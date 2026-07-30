import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatearMoneda } from '../../compartido/formato';

// Colores de datos (una sola serie por gráfico = un solo color).
const AZUL = '#2563eb';
const VERDE = '#16a34a';
const AMBAR = '#d97706';
const EJE = '#9ca3af';
const GRILLA = '#eef2f7';

const estiloTooltip = {
  borderRadius: 8,
  border: '1px solid #e5e7eb',
  fontSize: 13,
  boxShadow: '0 4px 12px rgba(0,0,0,.08)',
};

function moneda(v: number | string) {
  return formatearMoneda(Number(v));
}

// Ventas por día del período (una barra por día). Magnitud en el tiempo.
export function GraficoVentasPorDia({
  datos,
}: {
  datos: { dia: string; etiqueta: string; total: number }[];
}) {
  if (datos.every((d) => d.total === 0)) {
    return <p className="py-8 text-center text-sm text-gray-500">Sin ventas en el período.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={datos} margin={{ top: 8, right: 8, left: 4, bottom: 4 }}>
        <CartesianGrid stroke={GRILLA} vertical={false} />
        <XAxis
          dataKey="etiqueta"
          tick={{ fill: EJE, fontSize: 11 }}
          axisLine={{ stroke: GRILLA }}
          tickLine={false}
          interval="preserveStartEnd"
          minTickGap={12}
        />
        <YAxis
          tick={{ fill: EJE, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={54}
          tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
        />
        <Tooltip
          cursor={{ fill: 'rgba(37,99,235,.06)' }}
          contentStyle={estiloTooltip}
          formatter={(v) => [moneda(v as number), 'Vendido']}
          labelFormatter={(l) => `Día ${l}`}
        />
        <Bar dataKey="total" fill={AZUL} radius={[4, 4, 0, 0]} maxBarSize={44} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Ranking de productos por total vendido (barras horizontales con el valor al lado).
export function GraficoMasVendidos({
  datos,
}: {
  datos: { nombre: string; totalVendido: number }[];
}) {
  const top = datos.slice(0, 8);
  if (top.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-500">No hubo ventas en el período.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={Math.max(180, top.length * 42)}>
      <BarChart
        data={top}
        layout="vertical"
        margin={{ top: 4, right: 64, left: 8, bottom: 4 }}
      >
        <CartesianGrid stroke={GRILLA} horizontal={false} />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="nombre"
          tick={{ fill: '#374151', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={130}
        />
        <Tooltip
          cursor={{ fill: 'rgba(37,99,235,.06)' }}
          contentStyle={estiloTooltip}
          formatter={(v) => [moneda(v as number), 'Vendido']}
        />
        <Bar dataKey="totalVendido" fill={AZUL} radius={[0, 4, 4, 0]} maxBarSize={26}>
          <LabelList
            dataKey="totalVendido"
            position="right"
            formatter={(v: any) => moneda(Number(v))}
            style={{ fill: '#6b7280', fontSize: 11 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// Barra partida contado / fiado (con etiquetas, porque son colores de estado).
export function BarraContadoFiado({
  contado,
  fiado,
}: {
  contado: number;
  fiado: number;
}) {
  const total = contado + fiado;
  if (total <= 0) return null;
  const pctContado = (contado / total) * 100;
  const pctFiado = (fiado / total) * 100;
  return (
    <div>
      <div className="flex h-6 w-full gap-0.5 overflow-hidden rounded-md">
        {contado > 0 && (
          <div style={{ width: `${pctContado}%`, background: VERDE }} title={`Contado ${moneda(contado)}`} />
        )}
        {fiado > 0 && (
          <div style={{ width: `${pctFiado}%`, background: AMBAR }} title={`Fiado ${moneda(fiado)}`} />
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-4 text-sm">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ background: VERDE }} />
          Contado <strong>{moneda(contado)}</strong>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ background: AMBAR }} />
          Fiado <strong>{moneda(fiado)}</strong>
        </span>
      </div>
    </div>
  );
}

// Barras horizontales de deudas de clientes (magnitud; un solo color de alerta suave).
export function GraficoDeudas({
  datos,
}: {
  datos: { nombre: string; saldoDeudor: number }[];
}) {
  const top = datos.slice(0, 6);
  if (top.length === 0) return null;
  return (
    <ResponsiveContainer width="100%" height={Math.max(140, top.length * 40)}>
      <BarChart data={top} layout="vertical" margin={{ top: 4, right: 70, left: 8, bottom: 4 }}>
        <CartesianGrid stroke={GRILLA} horizontal={false} />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="nombre"
          tick={{ fill: '#374151', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={120}
        />
        <Tooltip
          cursor={{ fill: 'rgba(217,119,6,.06)' }}
          contentStyle={estiloTooltip}
          formatter={(v) => [moneda(v as number), 'Debe']}
        />
        <Bar dataKey="saldoDeudor" radius={[0, 4, 4, 0]} maxBarSize={24}>
          {top.map((_, i) => (
            <Cell key={i} fill={AMBAR} />
          ))}
          <LabelList
            dataKey="saldoDeudor"
            position="right"
            formatter={(v: any) => moneda(Number(v))}
            style={{ fill: '#6b7280', fontSize: 11 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
