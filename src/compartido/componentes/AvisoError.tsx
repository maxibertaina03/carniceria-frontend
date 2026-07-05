interface Props {
  mensaje: string | null;
}

export function AvisoError({ mensaje }: Props) {
  if (!mensaje) {
    return null;
  }
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {mensaje}
    </div>
  );
}
