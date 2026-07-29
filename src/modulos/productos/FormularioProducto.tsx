import { FormEvent, useState } from 'react';
import { mensajeDeError } from '../../compartido/clienteHttp';
import { AvisoError } from '../../compartido/componentes/AvisoError';
import { Modal } from '../../compartido/componentes/Modal';
import { useConfiguracion } from '../configuracion/ConfiguracionProvider';
import { Producto } from './productosApi';
import { useMutacionesProducto } from './useProductos';

interface Props {
  abierto: boolean;
  alCerrar: () => void;
  // Si viene un producto, el formulario edita; si no, crea uno nuevo.
  producto?: Producto | null;
}

export function FormularioProducto({ abierto, alCerrar, producto }: Props) {
  const { crear, actualizar } = useMutacionesProducto();
  const { config } = useConfiguracion();
  const [error, setError] = useState<string | null>(null);

  const editando = Boolean(producto);

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);
    const formulario = new FormData(evento.currentTarget);
    const datos = {
      nombre: String(formulario.get('nombre') ?? ''),
      categoria: String(formulario.get('categoria') ?? 'OTROS'),
      subcategoria: String(formulario.get('subcategoria') ?? ''),
      unidadMedida: String(formulario.get('unidadMedida') ?? 'KG'),
      costoUnitarioReferencia: Number(formulario.get('costo') ?? 0),
      precioVentaReferencia: Number(formulario.get('precio') ?? 0),
      seVende: formulario.get('seVende') === 'on',
      // Solo al dar de alta: cuánto hay hoy de este producto.
      ...(producto ? {} : { stockInicial: Number(formulario.get('stockInicial') ?? 0) }),
    };
    try {
      if (producto) {
        await actualizar.mutateAsync({ id: producto.id, datos });
      } else {
        await crear.mutateAsync(datos);
      }
      alCerrar();
    } catch (excepcion) {
      setError(mensajeDeError(excepcion));
    }
  }

  return (
    <Modal
      titulo={editando ? `Editar ${producto?.nombre}` : 'Nuevo producto'}
      abierto={abierto}
      alCerrar={alCerrar}
    >
      <form onSubmit={manejarEnvio} className="flex flex-col gap-4">
        <div>
          <label className="etiqueta" htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            name="nombre"
            className="campo"
            defaultValue={producto?.nombre ?? ''}
            placeholder="Ej: Milanesas"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="etiqueta" htmlFor="categoria">Categoría</label>
            <select
              id="categoria"
              name="categoria"
              className="campo"
              defaultValue={producto?.categoria ?? config.categorias[0]?.codigo}
            >
              {config.categorias.map((categoria) => (
                <option key={categoria.codigo} value={categoria.codigo}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="etiqueta" htmlFor="unidadMedida">Se mide en</label>
            <select
              id="unidadMedida"
              name="unidadMedida"
              className="campo"
              defaultValue={producto?.unidadMedida ?? 'KG'}
            >
              <option value="KG">Kilos (kg)</option>
              <option value="GRAMO">Gramos (g)</option>
              <option value="METRO">Metros (m)</option>
              <option value="UNIDAD">Unidades</option>
            </select>
          </div>
        </div>

        <div>
          <label className="etiqueta" htmlFor="subcategoria">
            Subcategoría (opcional)
          </label>
          <input
            id="subcategoria"
            name="subcategoria"
            className="campo"
            defaultValue={producto?.subcategoria ?? ''}
            placeholder="Ej: Cerdo, Vaca, Pollo (para milanesas y hamburguesas)"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="etiqueta" htmlFor="costo">Costo (lo que sale comprarlo)</label>
            <input
              id="costo"
              name="costo"
              className="campo"
              type="number"
              min="0"
              step="0.01"
              defaultValue={producto?.costoUnitarioReferencia ?? 0}
            />
          </div>
          <div>
            <label className="etiqueta" htmlFor="precio">Precio de venta</label>
            <input
              id="precio"
              name="precio"
              className="campo"
              type="number"
              min="0"
              step="0.01"
              defaultValue={producto?.precioVentaReferencia ?? 0}
            />
          </div>
        </div>

        {!editando && (
          <div>
            <label className="etiqueta" htmlFor="stockInicial">
              ¿Cuánto tenés hoy? (stock inicial)
            </label>
            <input
              id="stockInicial"
              name="stockInicial"
              className="campo"
              type="number"
              min="0"
              step="0.001"
              defaultValue={0}
            />
            <p className="mt-1 text-xs text-gray-500">
              Si ya tenés mercadería de este producto, cargala acá. Si no, dejá 0
              y el stock va a entrar con la primera compra.
            </p>
          </div>
        )}

        <label className="flex items-start gap-2 rounded-lg bg-gray-50 p-3">
          <input
            type="checkbox"
            name="seVende"
            className="mt-1"
            defaultChecked={producto?.seVende ?? true}
          />
          <span className="text-sm text-gray-700">
            <span className="font-medium">Se vende al mostrador</span>
            <br />
            Destildá esto si es un insumo (sal, pimienta, tripa) o una carne
            intermedia que solo se usa para producir. No aparecerá en la pantalla
            de Ventas.
          </span>
        </label>

        <AvisoError mensaje={error} />

        <div className="flex justify-end gap-2">
          <button type="button" className="boton-secundario" onClick={alCerrar}>
            Cancelar
          </button>
          <button
            type="submit"
            className="boton-primario"
            disabled={crear.isPending || actualizar.isPending}
          >
            {editando ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
