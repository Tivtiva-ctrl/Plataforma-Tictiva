// DocumentPreviewModal.jsx
import React, { useEffect, useMemo, useState } from "react";

const humanSize = (bytes = 0) => {
  if (bytes === 0 || bytes == null) return "—";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

const extFromName = (name = "") => {
  const ix = name.lastIndexOf(".");
  return ix !== -1 ? name.slice(ix + 1).toLowerCase() : "";
};

const isOffice = (ext) =>
  ["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext);

const isImage = (mime) => (mime || "").startsWith("image/");
const isPDF = (mime, ext) =>
  (mime || "").includes("pdf") || ext === "pdf";
const isTextLike = (mime, ext) =>
  (mime || "").startsWith("text/") || ["csv", "txt", "log"].includes(ext);

/**
 * Si tus archivos están en Supabase Storage con políticas privadas:
 *  - pásale a este modal un `file.previewUrl` que ya sea una URL firmada (signedUrl).
 *  - O reemplaza getPreviewUrl() para generar la signedUrl aquí.
 */
const getPreviewUrl = (file) => {
  // Preferimos una URL directa si existe:
  if (file?.previewUrl) return file.previewUrl;
  if (file?.url) return file.url;
  // Último recurso: si traes un path, aquí podrías construir tu endpoint propio.
  // return `/api/files/${encodeURIComponent(file.path)}`;
  return null;
};

export default function DocumentPreviewModal({
  open,
  onClose,
  file, // { name, size, updatedAt, mimeType, url?, previewUrl? }
}) {
  const [iframeErr, setIframeErr] = useState(false);
  const ext = useMemo(() => extFromName(file?.name || ""), [file?.name]);
  const mime = file?.mimeType || "";
  const rawUrl = getPreviewUrl(file);

  // URLs para visores externos (requieren URL pública accesible por Google/Microsoft)
  const officeViewerUrl = useMemo(() => {
    if (!rawUrl || !isOffice(ext)) return null;
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(rawUrl)}`;
  }, [rawUrl, ext]);

  const googleViewerUrl = useMemo(() => {
    // Funciona muy bien para PDF y algunos formatos (pero la URL debe ser pública)
    if (!rawUrl) return null;
    return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(rawUrl)}`;
  }, [rawUrl]);

  useEffect(() => {
    if (!open) {
      setIframeErr(false);
    }
  }, [open]);

  if (!open) return null;

  const renderBody = () => {
    if (!file) {
      return <div className="text-center text-gray-500">Sin archivo</div>;
    }

    // 1) Imágenes
    if (isImage(mime)) {
      if (!rawUrl) return noPreview("La imagen no tiene URL accesible.");
      return (
        <img
          src={rawUrl}
          alt={file.name}
          className="max-h-[60vh] w-auto rounded-lg object-contain mx-auto"
          onError={() => setIframeErr(true)}
        />
      );
    }

    // 2) PDF
    if (isPDF(mime, ext)) {
      // Intento 1: incrustar directo (requiere headers correctos + CORS OK)
      if (rawUrl && !iframeErr) {
        return (
          <iframe
            title="PDF inline"
            src={rawUrl}
            className="w-full h-[60vh] rounded-lg border"
            onError={() => setIframeErr(true)}
          />
        );
      }
      // Intento 2: Google Viewer (requiere URL pública)
      if (googleViewerUrl) {
        return (
          <iframe
            title="PDF google viewer"
            src={googleViewerUrl}
            className="w-full h-[60vh] rounded-lg border"
            onError={() => setIframeErr(true)}
          />
        );
      }
      return noPreview("No fue posible cargar el PDF.");
    }

    // 3) Office (docx/xlsx/pptx…)
    if (isOffice(ext)) {
      if (officeViewerUrl && !iframeErr) {
        return (
          <iframe
            title="Office viewer"
            src={officeViewerUrl}
            className="w-full h-[60vh] rounded-lg border"
            onError={() => setIframeErr(true)}
          />
        );
      }
      // Fallback: Google viewer a veces funciona con docx/xlsx
      if (googleViewerUrl && !iframeErr) {
        return (
          <iframe
            title="Google viewer"
            src={googleViewerUrl}
            className="w-full h-[60vh] rounded-lg border"
            onError={() => setIframeErr(true)}
          />
        );
      }
      return noPreview("Este tipo de archivo requiere URL pública para previsualizar.");
    }

    // 4) Text/CSV
    if (isTextLike(mime, ext)) {
      if (!rawUrl) return noPreview("El archivo de texto no tiene URL accesible.");
      return (
        <iframe
          title="Texto"
          src={rawUrl}
          className="w-full h-[60vh] rounded-lg border bg-white"
          onError={() => setIframeErr(true)}
        />
      );
    }

    // 5) Desconocidos: intentamos Google viewer como último recurso
    if (googleViewerUrl && !iframeErr) {
      return (
        <iframe
          title="Visor genérico"
          src={googleViewerUrl}
          className="w-full h-[60vh] rounded-lg border"
          onError={() => setIframeErr(true)}
        />
      );
    }

    return noPreview("No hay previsualización disponible para este tipo de archivo.");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
      <div className="w-[min(92vw,900px)] rounded-2xl bg-white shadow-xl p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">Documento: {file?.name || "—"}</h3>
            <p className="text-sm text-gray-500">
              Últ. mod: {file?.updatedAt ? new Date(file.updatedAt).toLocaleString() : "—"} · Tamaño: {humanSize(file?.size)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
            aria-label="Cerrar"
            title="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="mt-4">{renderBody()}</div>

        <div className="mt-5 flex items-center justify-end gap-3">
          {rawUrl && (
            <a
              href={rawUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:opacity-90"
            >
              Descargar
            </a>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function noPreview(msg) {
  return (
    <div className="h-[60vh] border rounded-xl grid place-items-center text-gray-500">
      <div className="text-center">
        <p className="font-medium mb-1">No hay previsualización disponible</p>
        <p className="text-sm">{msg}</p>
      </div>
    </div>
  );
}
