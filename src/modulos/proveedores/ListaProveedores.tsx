import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EstadoConsulta } from '../../compartido/componentes/EstadoConsulta';
import { formatearMoneda } from '../../compartido/formato';
import { FormularioProveedor } from './FormularioProveedor';
import { useProveedores } from './useProveedores';

export function ListaProveedores() {
  const { data: proveedores, isLoading, error } = useProveedores();
  const [modalAbierto, setModalAbierto] = useState(false);

  const totalAdeudado =
    proveedores?.reduce((suma, p) => suma + p.saldoAdeudado, 0) ?? 0;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-bold">Proveedores</h2>
        <button className="boton-primario" onClick={() => setModalAbierto(true)}>
          + Nuevo proveedor
        </button>
      </div>
      <p className="mb-4 text-sm text-gray-500">
        Lo que le debés a cada proveedor (compras y gastos a crédito).
        {totalAdeudado > 0 && (
          <>
            {' '}Total adeudado:{' '}
            <strong className="text-red-600">{formatearMoneda(totalAdeudado)}</strong>
          </>
        )}
      </p>

      <EstadoConsulta cargando={isLoading} error={error} />

      {proveedores && proveedores.length === 0 && (
        <p className="tarjeta py-8 text-center text-gray-500">
          Todavía no hay proveedores. Creá el primero con el botón de arriba.
        </p>
      )}

      {proveedores && proveedores.length > 0 && (
        <div className="space-y-2">
          {proveedores.map((proveedor) => (
            <Link
              key={proveedor.id}
              to={`/proveedores/${proveedor.id}`}
              className="tarjeta flex items-center justify-between gap-2 active:bg-gray-50"
            >
              <div>
                <p className="font-semibold">{proveedor.nombre}</p>
                <p className="text-sm text-gray-500">{proveedor.telefono ?? '—'}</p>
              </div>
              <div className="text-right">
                {proveedor.saldoAdeudado > 0 ? (
                  <p className="font-semibold text-red-600">
                    {formatearMoneda(proveedor.saldoAdeudado)}
                  </p>
                ) : (
                  <p className="text-sm font-medium text-green-700">Sin deuda</p>
                )}
                <p className="text-xs text-blue-700">Ver cuenta →</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <FormularioProveedor
        abierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
      />
    </div>
  );
}
