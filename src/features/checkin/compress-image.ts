// Fotos de iPhone costumam vir grandes (vários MB); comprime no cliente para caber no
// limite de body da Vercel (ver MAX_TOTAL_BYTES em src/app/api/checkins/route.ts).
const MAX_DIMENSION = 1920;
const TARGET_BYTES = 1.5 * 1024 * 1024;
const MIN_QUALITY = 0.5;
const QUALITY_STEP = 0.12;

export async function compressImage(file: File): Promise<File> {
  if (file.size <= TARGET_BYTES) return file;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file; // formato que o navegador não decodifica: manda como está

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  let quality = 0.82;
  let blob = await toJpegBlob(canvas, quality);
  while (blob && blob.size > TARGET_BYTES && quality > MIN_QUALITY) {
    quality -= QUALITY_STEP;
    blob = await toJpegBlob(canvas, quality);
  }
  if (!blob || blob.size >= file.size) return file;

  return new File([blob], withJpegExtension(file.name), { type: "image/jpeg" });
}

function toJpegBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

function withJpegExtension(name: string) {
  return `${name.replace(/\.\w+$/, "")}.jpg`;
}
