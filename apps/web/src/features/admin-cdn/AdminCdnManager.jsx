"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import {
  FolderArchive,
  UploadCloud,
  RefreshCw,
  Search,
  Folder,
  FolderOpen,
  FileImage,
  FileText,
  FileCode,
  File,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  X,
  FileUp,
} from "lucide-react";

const CDN_API_BASE_URL =
  process.env.NEXT_PUBLIC_CDN_API_URL || "https://livestate.imsergioh.me/api/cdn";

export default function AdminCdnManager({ adminToken = "" }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ message: "", type: "info" });
  const [uploadFeedback, setUploadFeedback] = useState({ message: "", type: "info" });
  const [uploading, setUploading] = useState(false);

  const [fileToUpload, setFileToUpload] = useState(null);
  const [uploadPath, setUploadPath] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedPath, setCopiedPath] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  async function loadItems() {
    setLoading(true);
    setFeedback({ message: "", type: "info" });
    try {
      const headers = {};
      if (adminToken) {
        headers["Authorization"] = adminToken;
      }

      const res = await fetch(CDN_API_BASE_URL, {
        headers,
        cache: "no-store",
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || data?.error || `HTTP ${res.status}`);
      }

      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      setFeedback({
        message: `No se pudieron cargar los archivos: ${error.message}`,
        type: "error",
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, [adminToken]);

  async function handleUpload(e) {
    e.preventDefault();
    if (!fileToUpload) return;

    setUploading(true);
    setUploadFeedback({ message: "", type: "info" });

    const formData = new FormData();
    formData.append("file", fileToUpload);
    if (uploadPath.trim()) {
      formData.append("path", uploadPath.trim());
    }

    try {
      const headers = {};
      if (adminToken) {
        headers["Authorization"] = adminToken;
      }

      const res = await fetch(`${CDN_API_BASE_URL}/upload`, {
        method: "POST",
        headers,
        body: formData,
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || `Error al subir archivo (HTTP ${res.status})`);
      }

      setUploadFeedback({ message: "Archivo subido correctamente al CDN.", type: "success" });
      setFileToUpload(null);
      setUploadPath("");

      const fileInput = document.getElementById("file-upload");
      if (fileInput) fileInput.value = "";

      await loadItems();
    } catch (error) {
      setUploadFeedback({ message: `Error al subir: ${error.message}`, type: "error" });
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(path) {
    if (!window.confirm(`¿Estás seguro de eliminar "${path}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setFeedback({ message: "Eliminando archivo...", type: "info" });
    try {
      const headers = {};
      if (adminToken) {
        headers["Authorization"] = adminToken;
      }

      const res = await fetch(
        `${CDN_API_BASE_URL}?path=${encodeURIComponent(path)}`,
        {
          method: "DELETE",
          headers,
        },
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || `Error al eliminar (HTTP ${res.status})`);
      }

      setFeedback({ message: `Archivo "${path}" eliminado con éxito.`, type: "success" });
      await loadItems();
    } catch (error) {
      setFeedback({ message: `Error al eliminar: ${error.message}`, type: "error" });
    }
  }

  function copyCdnUrl(path) {
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    const url = `https://cdn.imsergioh.me/${cleanPath}`;
    navigator.clipboard.writeText(url);
    setCopiedPath(path);
    setTimeout(() => {
      setCopiedPath(null);
    }, 2000);
  }

  const filteredItems = useMemo(() => {
    return items.filter(
      (item) =>
        item.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [items, searchQuery]);

  const tree = useMemo(() => {
    return buildTree(filteredItems);
  }, [filteredItems]);

  return (
    <div className="space-y-8">
      {/* Global Feedback Banner */}
      {feedback.message && (
        <div
          className={`flex items-center justify-between rounded-2xl border p-4 backdrop-blur-md shadow-lg ${feedback.type === "error"
            ? "border-rose-500/30 bg-rose-950/40 text-rose-200"
            : "border-emerald-500/30 bg-emerald-950/40 text-emerald-200"
            }`}
        >
          <div className="flex items-center gap-3">
            {feedback.type === "error" ? (
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            )}
            <span className="text-sm font-medium">{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback({ message: "", type: "info" })}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Upload Box */}
      <section className="rounded-3xl border border-zinc-800/90 bg-zinc-950/70 p-6 sm:p-7 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/15 p-2.5 text-fuchsia-300">
            <UploadCloud className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-montserrat text-lg font-bold text-white">
              Subir nuevo recurso al CDN
            </h2>
            <p className="text-xs text-zinc-400">
              Selecciona un archivo multimedia o documento y define la carpeta destino
            </p>
          </div>
        </div>

        <form onSubmit={handleUpload} className="mt-5 grid gap-4 lg:grid-cols-12 items-end">
          {/* File Picker */}
          <div className="lg:col-span-6">
            <label className="mb-1.5 block text-xs font-semibold text-zinc-400">
              Seleccionar Archivo
            </label>
            <div className="relative">
              <input
                id="file-upload"
                type="file"
                onChange={(e) => setFileToUpload(e.target.files[0] || null)}
                required
                className="w-full rounded-xl border border-zinc-700/80 bg-zinc-900/90 px-3.5 py-2 text-xs text-zinc-300 outline-none transition focus:border-fuchsia-400 file:mr-3 file:rounded-lg file:border-0 file:bg-fuchsia-500/20 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-fuchsia-200 hover:file:bg-fuchsia-500/30 cursor-pointer"
              />
            </div>
          </div>

          {/* Path Input */}
          <div className="lg:col-span-4">
            <label className="mb-1.5 block text-xs font-semibold text-zinc-400">
              Ruta / Carpeta (Opcional)
            </label>
            <div className="relative">
              <Folder className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                value={uploadPath}
                onChange={(e) => setUploadPath(e.target.value)}
                placeholder="ej: about / wallpapers / blog"
                className="w-full rounded-xl border border-zinc-700/80 bg-zinc-900/90 pl-10 pr-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-fuchsia-400 focus:ring-1 focus:ring-fuchsia-400"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="lg:col-span-2">
            <button
              type="submit"
              disabled={uploading || !fileToUpload}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-fuchsia-400/50 bg-fuchsia-500/20 px-4 py-2.5 text-xs font-semibold text-fuchsia-200 transition hover:bg-fuchsia-500/30 hover:border-fuchsia-400 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              {uploading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Subiendo...</span>
                </>
              ) : (
                <>
                  <FileUp className="h-4 w-4" />
                  <span>Subir Archivo</span>
                </>
              )}
            </button>
          </div>
        </form>

        {uploadFeedback.message && (
          <div
            className={`mt-4 flex items-center gap-2 rounded-xl p-3 text-xs ${uploadFeedback.type === "error"
              ? "bg-rose-950/50 text-rose-200 border border-rose-500/30"
              : "bg-emerald-950/50 text-emerald-200 border border-emerald-500/30"
              }`}
          >
            {uploadFeedback.type === "error" ? (
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            )}
            <span>{uploadFeedback.message}</span>
          </div>
        )}
      </section>

      {/* Explorer Tree Section */}
      <section className="rounded-3xl border border-zinc-800/90 bg-zinc-950/70 p-6 sm:p-7 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="font-montserrat text-lg font-bold text-white">
              Explorador de Archivos CDN ({filteredItems.length})
            </h2>
            <p className="text-xs text-zinc-400">
              Navega la estructura de directorios y copia enlaces directos
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar archivo o carpeta..."
                className="w-full rounded-xl border border-zinc-700/70 bg-zinc-900/80 pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-fuchsia-400"
              />
            </div>

            <button
              type="button"
              onClick={loadItems}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700/80 bg-zinc-900/80 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Cargando..." : "Actualizar"}</span>
            </button>
          </div>
        </div>

        {/* Tree List Container */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-2 sm:p-3">
          {Object.values(tree).length > 0 ? (
            <div className="space-y-1">
              {Object.values(tree).map((node) => (
                <TreeNode
                  key={node.path}
                  node={node}
                  onDelete={handleDelete}
                  onCopy={copyCdnUrl}
                  copiedPath={copiedPath}
                  onPreview={(url) => setPreviewImage(url)}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-zinc-500 text-sm">
              {searchQuery
                ? "No se encontraron archivos que coincidan con la búsqueda."
                : "No hay archivos almacenados en el CDN."}
            </div>
          )}
        </div>
      </section>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-h-[85vh] max-w-2xl overflow-hidden rounded-3xl border border-zinc-700 bg-zinc-950 p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400 truncate max-w-sm">
                {previewImage}
              </span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative flex max-h-[70vh] items-center justify-center overflow-hidden rounded-2xl bg-zinc-900/50 p-2">
              <img
                src={previewImage}
                alt="Vista previa"
                className="max-h-[65vh] max-w-full rounded-xl object-contain shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getFileIcon(filename) {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (["png", "jpg", "jpeg", "webp", "gif", "svg", "ico"].includes(ext)) {
    return FileImage;
  }
  if (["js", "ts", "jsx", "tsx", "json", "html", "css"].includes(ext)) {
    return FileCode;
  }
  if (["md", "txt", "pdf", "doc"].includes(ext)) {
    return FileText;
  }
  return File;
}

function isImageFile(filename) {
  const ext = filename.split(".").pop()?.toLowerCase();
  return ["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext);
}

function TreeNode({
  node,
  onDelete,
  onCopy,
  copiedPath,
  onPreview,
  level = 0,
}) {
  const [open, setOpen] = useState(level < 1);

  const children = Object.values(node.children || {}).sort((a, b) => {
    if (a.directory && !b.directory) return -1;
    if (!a.directory && b.directory) return 1;
    return a.name.localeCompare(b.name);
  });

  if (node.directory) {
    return (
      <div className="select-none">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left hover:bg-zinc-800/60 transition"
          style={{ paddingLeft: `${level * 16 + 10}px` }}
        >
          <span className="text-zinc-500 transition-transform">
            {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </span>

          {open ? (
            <FolderOpen className="h-4 w-4 text-amber-400 shrink-0" />
          ) : (
            <Folder className="h-4 w-4 text-amber-400/80 shrink-0" />
          )}

          <span className="font-semibold text-xs text-zinc-200 group-hover:text-white">
            {node.name}
          </span>

          <span className="ml-auto rounded-full bg-zinc-800/80 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">
            {children.length} {children.length === 1 ? "ítem" : "ítems"}
          </span>
        </button>

        {open && (
          <div className="space-y-1">
            {children.map((child) => (
              <TreeNode
                key={child.path}
                node={child}
                level={level + 1}
                onDelete={onDelete}
                onCopy={onCopy}
                copiedPath={copiedPath}
                onPreview={onPreview}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const FileIcon = getFileIcon(node.name);
  const isImg = isImageFile(node.name);
  const isCopied = copiedPath === node.path;
  const cdnUrl = `https://cdn.imsergioh.me/${node.path.startsWith("/") ? node.path.slice(1) : node.path}`;

  return (
    <div
      className="group flex items-center justify-between gap-2 rounded-xl py-1.5 pr-2 hover:bg-zinc-800/50 transition-colors text-xs"
      style={{ paddingLeft: `${level * 16 + 28}px` }}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <FileIcon className={`h-4 w-4 shrink-0 ${isImg ? "text-cyan-400" : "text-zinc-400"}`} />

        {isImg ? (
          <button
            type="button"
            onClick={() => onPreview(cdnUrl)}
            className="truncate font-medium text-zinc-300 hover:text-cyan-300 hover:underline text-left"
            title="Ver imagen previa"
          >
            {node.name}
          </button>
        ) : (
          <span className="truncate text-zinc-300">{node.name}</span>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
        <span className="hidden sm:inline font-mono text-[11px] text-zinc-500 max-w-[200px] truncate">
          /{node.path}
        </span>

        {/* Copy CDN Link button */}
        <button
          type="button"
          onClick={() => onCopy(node.path)}
          className="inline-flex items-center gap-1 rounded-lg border border-zinc-700/60 bg-zinc-800/80 px-2 py-1 text-[11px] font-medium text-zinc-300 hover:bg-zinc-700 hover:text-cyan-300 transition"
          title="Copiar URL directa de CDN"
        >
          {isCopied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-300">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copiar URL</span>
            </>
          )}
        </button>

        {/* Open Direct URL */}
        <a
          href={cdnUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition"
          title="Abrir enlace en pestaña nueva"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>

        {/* Delete File button */}
        <button
          type="button"
          onClick={() => onDelete(node.path)}
          className="rounded-lg p-1 text-zinc-500 hover:bg-rose-500/20 hover:text-rose-300 transition"
          title="Eliminar archivo"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function buildTree(items) {
  const root = {};

  items.forEach((item) => {
    const parts = item.path.split("/");
    let current = root;

    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;

      if (!current[part]) {
        current[part] = {
          name: part,
          path: parts.slice(0, index + 1).join("/"),
          directory: !isLast || item.directory,
          children: {},
        };
      }

      current = current[part].children;
    });
  });

  return root;
}
