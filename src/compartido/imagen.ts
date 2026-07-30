// Redimensiona una foto elegida por el usuario a un tamaño chico y la devuelve
// como data URI (base64) para guardarla. Así las fotos ocupan poco (unos KB).
export function redimensionarImagen(
  archivo: File,
  maxLado = 500,
  calidad = 0.8,
): Promise<string> {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onerror = () => rechazar(new Error('No se pudo leer el archivo'));
    lector.onload = () => {
      const img = new Image();
      img.onerror = () => rechazar(new Error('No se pudo abrir la imagen'));
      img.onload = () => {
        let { width, height } = img;
        if (width >= height && width > maxLado) {
          height = Math.round((height * maxLado) / width);
          width = maxLado;
        } else if (height > width && height > maxLado) {
          width = Math.round((width * maxLado) / height);
          height = maxLado;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          rechazar(new Error('No se pudo procesar la imagen'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolver(canvas.toDataURL('image/jpeg', calidad));
      };
      img.src = lector.result as string;
    };
    lector.readAsDataURL(archivo);
  });
}
