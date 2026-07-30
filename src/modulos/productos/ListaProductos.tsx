import { useState } from 'react';
import { mensajeDeError } from '../../compartido/clienteHttp';
import { EstadoConsulta } from '../../compartido/componentes/EstadoConsulta';
import { MiniaturaAmpliable } from '../../compartido/componentes/MiniaturaAmpliable';
import { formatearCantidad, formatearMoneda } from '../../compartido/formato';
import { useConfiguracion } from '../configuracion/ConfiguracionProvider';
import { GestionPresentaciones } from '../presentaciones/GestionPresentaciones';
import { FormularioProducto } from './FormularioProducto';
import { ModalAjustarStock } from './ModalAjustarStock';
import { Producto } from './productosApi';
import { useMutacionesProducto, useProductos } from './useProductos';

export function ListaProductos() {
  const [verInactivos, setVerInactivos] = useState(false);
  const { data: productos, isLoading, error } = useProductos(verInactivos);
  const { desactivar, actualizar } = useMutacionesProducto();
  const { nombreCategoria, config } = useConfiguracion();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEnEdicion, setProductoEnEdicion] = useState<Producto | null>(null);
  const [productoAAjustar, setProductoAAjustar] = useState<Producto | null>(null);
  const [productoPresentaciones, setProductoPresentaciones] =
    useState<Producto | null>(null);

  function abrirNuevo() {
    setProductoEnEdicion(null);
    setModalAbierto(true);
  }

  function abrirEdicion(producto: Producto) {
    setProductoEnEdicion(producto);
    setModalAbierto(true);
  }

  async function manejarDesactivar(producto: Producto) {
    const confirmado = window.confirm(
      `¿Desactivar "${producto.nombre}"? No se borra: deja de aparecer en las listas y se puede reactivar después.`,
    );
    if (!confirmado) {
      return;
    }
    try {
      await desactivar.mutateAsync(producto.id);
    } catch (excepcion) {
      window.alert(mensajeDeError(excepcion));
    }
  }

  async function manejarReactivar(producto: Producto) {
    try {
      await actualizar.mutateAsync({ id: producto.id, datos: { activo: true } });
    } catch (excepcion) {
      window.alert(mensajeDeError(excepcion));
    }
  }

  function accionesDe(producto: Producto) {
    return (
      <>
        <button
          className="mr-3 text-sm font-medium text-blue-700 hover:underline"
          onClick={() => setProductoAAjustar(producto)}
        >
          Ajustar stock
        </button>
        <button
          className="mr-3 text-sm font-medium text-blue-700 hover:underline"
          onClick={() => abrirEdicion(producto)}
        >
          Editar
        </button>
        {config.features.presentaciones && (
          <button
            className="mr-3 text-sm font-medium text-blue-700 hover:underline"
            onClick={() => setProductoPresentaciones(producto)}
          >
            Presentaciones
          </button>
        )}
        {producto.activo ? (
          <button
            className="text-sm font-medium text-red-600 hover:underline"
            onClick={() => manejarDesactivar(producto)}
          >
            Desactivar
          </button>
        ) : (
          <button
            className="text-sm font-medium text-green-700 hover:underline"
            onClick={() => manejarReactivar(producto)}
          >
            Reactivar
          </button>
        )}
      </>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-bold">Productos y stock</h2>
        <button className="boton-primario" onClick={abrirNuevo}>
          + Nuevo producto
        </button>
      </div>

      <label className="mb-3 flex items-center gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={verInactivos}
          onChange={(evento) => setVerInactivos(evento.target.checked)}
        />
        Mostrar también los desactivados
      </label>

      <EstadoConsulta cargando={isLoading} error={error} />

      {productos && productos.length === 0 && (
        <p className="tarjeta py-8 text-center text-gray-500">
          Todavía no hay productos. Creá el primero con el botón de arriba.
        </p>
      )}

      {/* Tarjetas apiladas: celular */}
      {productos && productos.length > 0 && (
        <div className="space-y-2 md:hidden">
          {productos.map((producto) => (
            <div
              key={producto.id}
              className={`tarjeta ${producto.activo ? '' : 'opacity-60'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="flex items-center gap-2 font-semibold">
                    {producto.imagen && (
                      <MiniaturaAmpliable
                        src={producto.imagen}
                        className="h-8 w-8 shrink-0 rounded object-cover"
                      />
                    )}
                    <span>
                      {producto.nombre}
                      {!producto.activo && (
                        <span className="ml-2 rounded bg-gray-200 px-1.5 py-0.5 text-xs font-normal">
                          desactivado
                        </span>
                      )}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    {nombreCategoria(producto.categoria)}
                    {producto.subcategoria ? ` · ${producto.subcategoria}` : ''}
                  </p>
                </div>
                <p
                  className={`text-right font-semibold ${
                    producto.stockActual <= 0 && producto.activo
                      ? 'text-red-600'
                      : ''
                  }`}
                >
                  {formatearCantidad(producto.stockActual, producto.unidadMedida)}
                </p>
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-2">
                <p className="text-sm text-gray-600">
                  Costo {formatearMoneda(producto.costoUnitarioReferencia)} · Venta{' '}
                  {formatearMoneda(producto.precioVentaReferencia)}
                </p>
                <div>{accionesDe(producto)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabla: pantallas medianas y grandes */}
      {productos && productos.length > 0 && (
        <div className="tarjeta hidden overflow-x-auto p-0 md:block">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="encabezado-tabla">Producto</th>
                <th className="encabezado-tabla">Categoría</th>
                <th className="encabezado-tabla">Stock</th>
                <th className="encabezado-tabla">Costo</th>
                <th className="encabezado-tabla">Precio de venta</th>
                <th className="encabezado-tabla"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {productos.map((producto) => (
                <tr
                  key={producto.id}
                  className={producto.activo ? '' : 'bg-gray-50 text-gray-400'}
                >
                  <td className="celda font-medium">
                    <div className="flex items-center gap-2">
                      {producto.imagen && (
                        <MiniaturaAmpliable
                          src={producto.imagen}
                          className="h-9 w-9 shrink-0 rounded object-cover"
                        />
                      )}
                      <span>
                        {producto.nombre}
                        {!producto.activo && (
                          <span className="ml-2 rounded bg-gray-200 px-1.5 py-0.5 text-xs">
                            desactivado
                          </span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="celda">
                    {nombreCategoria(producto.categoria)}
                    {producto.subcategoria ? ` · ${producto.subcategoria}` : ''}
                  </td>
                  <td className="celda">
                    <span
                      className={
                        producto.stockActual <= 0 && producto.activo
                          ? 'font-semibold text-red-600'
                          : ''
                      }
                    >
                      {formatearCantidad(producto.stockActual, producto.unidadMedida)}
                    </span>
                  </td>
                  <td className="celda">
                    {formatearMoneda(producto.costoUnitarioReferencia)}
                  </td>
                  <td className="celda">
                    {formatearMoneda(producto.precioVentaReferencia)}
                  </td>
                  <td className="celda text-right">{accionesDe(producto)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <FormularioProducto
        abierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
        producto={productoEnEdicion}
      />
      {/* Se monta al abrirse para arrancar siempre con el stock del producto elegido */}
      {productoAAjustar && (
        <ModalAjustarStock
          abierto
          alCerrar={() => setProductoAAjustar(null)}
          producto={productoAAjustar}
        />
      )}
      {productoPresentaciones && (
        <GestionPresentaciones
          abierto
          alCerrar={() => setProductoPresentaciones(null)}
          producto={productoPresentaciones}
        />
      )}
    </div>
  );
}
