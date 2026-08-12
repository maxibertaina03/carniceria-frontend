import { useConfiguracion } from '../configuracion/ConfiguracionProvider';

interface AyudaModulo {
  codigo: string;
  titulo: string;
  icono: string;
  descripcion: string;
}

// Explicación de cada módulo, en palabras simples. Se muestran solo los módulos
// que el negocio tiene habilitados (según el rubro). El ícono puede venir
// cambiado por la config (ej. Productos 🥩 en carnicería vs 🍝 en pastas).
const MODULOS: AyudaModulo[] = [
  {
    codigo: 'inicio',
    titulo: 'Inicio',
    icono: '🏠',
    descripcion:
      'La foto del día de un vistazo: cuánto vendiste hoy (en efectivo y fiado), cuánto te deben tus clientes, cuánto le debés a proveedores, los pedidos por entregar y las boletas vencidas o por vencer.',
  },
  {
    codigo: 'ventas',
    titulo: 'Ventas',
    icono: '🧾',
    descripcion:
      'Registrás cada venta: al contado, fiada o una parte de cada una (mixta). Descuenta el stock automáticamente. Si es fiada, queda anotada en la cuenta del cliente.',
  },
  {
    codigo: 'pedidos',
    titulo: 'Pedidos',
    icono: '📋',
    descripcion:
      'Los encargues de tus clientes para más adelante. Cuando entregás el pedido, se convierte en una venta con un solo paso.',
  },
  {
    codigo: 'clientes',
    titulo: 'Clientes',
    icono: '👥',
    descripcion:
      'Tu lista de clientes con su cuenta corriente (el fiado). Ves cuánto debe cada uno, el detalle de sus movimientos y registrás los pagos que te van haciendo.',
  },
  {
    codigo: 'productos',
    titulo: 'Productos',
    icono: '🥩',
    descripcion:
      'Tu catálogo: precios, stock actual y foto de cada producto. Podés ajustar el stock a mano y subir todos los precios de golpe por un porcentaje.',
  },
  {
    codigo: 'reportes',
    titulo: 'Reportes',
    icono: '📊',
    descripcion:
      'Los números del negocio con gráficos: ganancias, productos más vendidos, deudas y stock, para el período que elijas.',
  },
  {
    codigo: 'compras',
    titulo: 'Compras',
    icono: '🚚',
    descripcion:
      'Lo que le comprás a tus proveedores. Suma stock automáticamente y, si te queda a deber, se anota como deuda con ese proveedor.',
  },
  {
    codigo: 'proveedores',
    titulo: 'Proveedores',
    icono: '🏪',
    descripcion:
      'Tus proveedores y lo que les debés (cuentas por pagar). Podés cargar una deuda inicial y registrar los pagos que les hacés. También sirve para servicios como luz o gas.',
  },
  {
    codigo: 'gastos',
    titulo: 'Gastos',
    icono: '💸',
    descripcion:
      'Las boletas y gastos del negocio (alquiler, luz, gas, etc.). Cargás cuándo vencen y las marcás como pagadas cuando las abonás.',
  },
  {
    codigo: 'desposte',
    titulo: 'Desposte',
    icono: '🔪',
    descripcion:
      'Tomás una media res y la despiezás en cortes. El sistema reparte el costo de la res entre los cortes, así sabés cuánto te cuesta cada uno.',
  },
  {
    codigo: 'produccion',
    titulo: 'Producción',
    icono: '🏭',
    descripcion:
      'Fabricás productos a partir de una receta: descuenta los insumos usados y suma el producto terminado al stock. Podés producir por unidad o por presentación (docena, ½ kg…).',
  },
  {
    codigo: 'admin',
    titulo: 'Admin',
    icono: '🔒',
    descripcion:
      'Un área protegida con contraseña propia, para la facturación y los comprobantes internos (facturas, notas de crédito/débito, recibos).',
  },
];

export function PaginaAyuda() {
  const { config, tieneModulo } = useConfiguracion();

  const conIcono = (m: AyudaModulo): string => config.iconos[m.codigo] ?? m.icono;
  const disponibles = MODULOS.filter((m) => tieneModulo(m.codigo));

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="text-2xl font-black text-red-700">Guía de ayuda</h1>
        <p className="mt-1 text-gray-600">
          Qué hace cada parte de <strong>{config.nombreNegocio}</strong>. Tocá un tema
          para entender para qué sirve.
        </p>
      </header>

      {/* Primeros pasos */}
      <section className="tarjeta mb-6">
        <h2 className="mb-3 text-lg font-bold text-gray-800">📌 Primeros pasos</h2>
        <ol className="space-y-2 text-sm text-gray-700">
          <li>
            <strong>1.</strong> Cargá tus productos con su precio y stock, en{' '}
            <em>Productos</em>.
          </li>
          <li>
            <strong>2.</strong> Registrá tu primera venta desde <em>Ventas</em>.
          </li>
          <li>
            <strong>3.</strong> Cargá un cliente y probá una venta fiada; después mirá su
            cuenta en <em>Clientes</em>.
          </li>
          <li>
            <strong>4.</strong> Entrá a <em>Inicio</em> para ver el resumen del día.
          </li>
        </ol>
      </section>

      {/* Módulos */}
      <section className="grid gap-3">
        {disponibles.map((m) => (
          <article key={m.codigo} className="tarjeta">
            <div className="flex items-start gap-3">
              <span className="text-2xl leading-none" aria-hidden>
                {conIcono(m)}
              </span>
              <div>
                <h3 className="font-bold text-gray-800">{m.titulo}</h3>
                <p className="mt-1 text-sm text-gray-600">{m.descripcion}</p>
              </div>
            </div>
          </article>
        ))}

        {/* Asistente (chatbot): solo si está habilitado en este negocio */}
        {tieneModulo('asistente') && (
          <article className="tarjeta border-red-200 bg-red-50">
            <div className="flex items-start gap-3">
              <span className="text-2xl leading-none" aria-hidden>
                💬
              </span>
              <div>
                <h3 className="font-bold text-gray-800">Asistente</h3>
                <p className="mt-1 text-sm text-gray-600">
                  El botón de chat abajo a la derecha. Preguntale en palabras normales
                  sobre tu negocio —por ejemplo <em>"¿cuánto vendí ayer?"</em> o{' '}
                  <em>"¿qué cliente me debe más?"</em>— y te responde al toque. Es de{' '}
                  <strong>solo lectura</strong>: te informa, no cambia ni borra nada.
                </p>
              </div>
            </div>
          </article>
        )}
      </section>

      <p className="mt-6 text-center text-xs text-gray-400">
        {tieneModulo('asistente')
          ? '¿Te quedó una duda? Preguntale al asistente 💬 o escribinos.'
          : '¿Te quedó una duda? Escribinos y te ayudamos.'}
      </p>
    </div>
  );
}
