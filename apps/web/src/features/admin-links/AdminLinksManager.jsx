"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Link2,
  Plus,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Edit3,
  Trash2,
  BarChart3,
  Hash,
  Globe,
  Tag,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Sparkles,
  Search,
  X,
} from "lucide-react";

const initialCreateState = {
  shortId: "",
  targetUrl: "",
  title: "",
};

export default function AdminLinksManager() {
  const [links, setLinks] = useState([]);
  const [traffic, setTraffic] = useState([]);
  const [createData, setCreateData] = useState(initialCreateState);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [editData, setEditData] = useState(initialCreateState);
  const [trafficFilter, setTrafficFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ message: "", type: "info" });
  const [copiedId, setCopiedId] = useState(null);
  const [searchFilter, setSearchFilter] = useState("");

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isCreateOpen) {
        setIsCreateOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCreateOpen]);

  const trafficQuery = useMemo(() => {
    if (trafficFilter === "all") {
      return "/api/admin/links-data?limit=200";
    }

    return `/api/admin/links-data?limit=200&shortId=${encodeURIComponent(trafficFilter)}`;
  }, [trafficFilter]);

  async function fetchJson(url, options) {
    const response = await fetch(url, {
      credentials: "same-origin",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });

    const payload = await response.json();

    if (!response.ok || !payload?.ok) {
      throw new Error(payload?.error || "request_failed");
    }

    return payload;
  }

  async function loadAll() {
    setLoading(true);

    try {
      const [linksPayload, trafficPayload] = await Promise.all([
        fetchJson("/api/admin/links"),
        fetchJson(trafficQuery),
      ]);

      setLinks(linksPayload.items || []);
      setTraffic(trafficPayload.items || []);
    } catch (error) {
      setFeedback({
        message: `Error al cargar datos: ${error instanceof Error ? error.message : "desconocido"}`,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, [trafficQuery]);

  async function handleCreate(event) {
    event.preventDefault();

    try {
      await fetchJson("/api/admin/links", {
        method: "POST",
        body: JSON.stringify(createData),
      });

      setCreateData(initialCreateState);
      setIsCreateOpen(false);
      setFeedback({ message: `Enlace "/link/${createData.shortId}" creado correctamente.`, type: "success" });
      await loadAll();
    } catch (error) {
      setFeedback({
        message: `No se pudo crear el enlace: ${error instanceof Error ? error.message : "desconocido"}`,
        type: "error",
      });
    }
  }

  function startEdit(link) {
    setEditingId(link.shortId);
    setEditData({
      shortId: link.shortId,
      targetUrl: link.targetUrl,
      title: link.title || "",
    });
  }

  async function saveEdit(shortId) {
    try {
      await fetchJson(`/api/admin/links/${encodeURIComponent(shortId)}`, {
        method: "PATCH",
        body: JSON.stringify(editData),
      });

      setEditingId("");
      setFeedback({ message: "Enlace actualizado exitosamente.", type: "success" });
      await loadAll();
    } catch (error) {
      setFeedback({
        message: `No se pudo actualizar: ${error instanceof Error ? error.message : "desconocido"}`,
        type: "error",
      });
    }
  }

  async function deleteLink(shortId) {
    const ok = window.confirm(`¿Estás seguro de eliminar /link/${shortId} y todo su historial de tráfico?`);

    if (!ok) return;

    try {
      await fetchJson(`/api/admin/links/${encodeURIComponent(shortId)}`, {
        method: "DELETE",
      });

      if (trafficFilter === shortId) {
        setTrafficFilter("all");
      }

      setFeedback({ message: `Enlace /link/${shortId} eliminado.`, type: "success" });
      await loadAll();
    } catch (error) {
      setFeedback({
        message: `Error al eliminar enlace: ${error instanceof Error ? error.message : "desconocido"}`,
        type: "error",
      });
    }
  }

  async function deleteTrafficRecord(id) {
    try {
      await fetchJson("/api/admin/links-data", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });

      setFeedback({ message: "Registro de tráfico eliminado.", type: "success" });
      await loadAll();
    } catch (error) {
      setFeedback({
        message: `Error al eliminar registro: ${error instanceof Error ? error.message : "desconocido"}`,
        type: "error",
      });
    }
  }

  async function purgeTrafficForFilter() {
    if (trafficFilter === "all") {
      const ok = window.confirm("¿Seguro que deseas purgar TODO el historial de tráfico?");
      if (!ok) return;

      try {
        await fetchJson("/api/admin/links-data", {
          method: "DELETE",
          body: JSON.stringify({ deleteAll: true }),
        });

        setFeedback({ message: "Historial completo de tráfico eliminado.", type: "success" });
        await loadAll();
      } catch (error) {
        setFeedback({
          message: `No se pudo purgar el tráfico: ${error instanceof Error ? error.message : "desconocido"}`,
          type: "error",
        });
      }
      return;
    }

    try {
      await fetchJson("/api/admin/links-data", {
        method: "DELETE",
        body: JSON.stringify({ shortId: trafficFilter }),
      });

      setFeedback({ message: `Tráfico purgado para /link/${trafficFilter}.`, type: "success" });
      await loadAll();
    } catch (error) {
      setFeedback({
        message: `No se pudo purgar el tráfico: ${error instanceof Error ? error.message : "desconocido"}`,
        type: "error",
      });
    }
  }

  function copyToClipboard(shortId) {
    const fullUrl = `${window.location.origin}/link/${shortId}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(shortId);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  }

  const filteredLinks = useMemo(() => {
    if (!searchFilter.trim()) return links;
    const q = searchFilter.toLowerCase();
    return links.filter(
      (l) =>
        l.shortId.toLowerCase().includes(q) ||
        l.targetUrl.toLowerCase().includes(q) ||
        (l.title && l.title.toLowerCase().includes(q))
    );
  }, [links, searchFilter]);

  const totalClicks = useMemo(() => {
    return links.reduce((acc, l) => acc + (l.clickCount || 0), 0);
  }, [links]);

  return (
    <div className="space-y-8">
      {/* Feedback banner */}
      {feedback.message && (
        <div
          className={`flex items-center justify-between rounded-2xl border p-4 backdrop-blur-md shadow-lg transition-all animate-fadeIn ${feedback.type === "error"
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

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-4.5 backdrop-blur-md shadow-lg">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-400">
            <Link2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Total Enlaces
            </p>
            <p className="font-montserrat text-xl font-bold text-white">
              {links.length}
            </p>
            <p className="text-xs text-zinc-400">URLs activas en el sistema</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-4.5 backdrop-blur-md shadow-lg">
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-cyan-400">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Clicks Totales
            </p>
            <p className="font-montserrat text-xl font-bold text-white">
              {totalClicks}
            </p>
            <p className="text-xs text-zinc-400">Redirecciones acumuladas</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-4.5 backdrop-blur-md shadow-lg">
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 text-indigo-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Tráfico Registrado
            </p>
            <p className="font-montserrat text-xl font-bold text-white">
              {traffic.length}
            </p>
            <p className="text-xs text-zinc-400">Eventos en la sesión actual</p>
          </div>
        </div>
      </div>



      {/* Links List Section */}
      <section className="rounded-3xl border border-zinc-800/90 bg-zinc-950/70 p-6 sm:p-7 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="font-montserrat text-lg font-bold text-white">
              Enlaces Registrados ({links.length})
            </h2>
            <p className="text-xs text-zinc-400">
              Gestiona redirecciones, edita destinos o consulta el tráfico
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search filter */}
            <div className="relative min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
              <input
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Buscar enlace..."
                className="w-full rounded-xl border border-zinc-700/70 bg-zinc-900/80 pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="button"
              onClick={loadAll}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700/80 bg-zinc-900/80 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Cargando..." : "Actualizar"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCreateData(initialCreateState);
                setIsCreateOpen(true);
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 shadow-lg shadow-emerald-950/40 hover:bg-emerald-500/30 hover:border-emerald-400 active:scale-95 transition"
              title="Crear nuevo enlace"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nuevo enlace</span>
            </button>
          </div>
        </div>

        {/* Links Table */}
        <div className="overflow-x-auto rounded-2xl border border-zinc-800/80 bg-zinc-900/30">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/70 text-xs uppercase tracking-wider text-zinc-400">
                <th className="px-4 py-3.5 font-semibold">Enlace Corto</th>
                <th className="px-4 py-3.5 font-semibold">URL Destino</th>
                <th className="px-4 py-3.5 font-semibold">Título</th>
                <th className="px-4 py-3.5 font-semibold text-center">Clicks</th>
                <th className="px-4 py-3.5 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredLinks.map((link) => {
                const editing = editingId === link.shortId;
                const isCopied = copiedId === link.shortId;

                return (
                  <tr
                    key={link.id}
                    className="group hover:bg-zinc-900/50 transition-colors"
                  >
                    {/* Short ID column */}
                    <td className="px-4 py-3.5 align-middle">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-cyan-300">
                          /link/{link.shortId}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(link.shortId)}
                          className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-800 hover:text-cyan-300 transition"
                          title="Copiar URL completa"
                        >
                          {isCopied ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Target URL */}
                    <td className="px-4 py-3.5 align-middle max-w-[280px]">
                      <a
                        href={link.targetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 truncate text-zinc-300 hover:text-cyan-300 hover:underline"
                        title={link.targetUrl}
                      >
                        <span className="truncate">{link.targetUrl}</span>
                        <ExternalLink className="h-3 w-3 shrink-0 text-zinc-500" />
                      </a>
                    </td>

                    {/* Title */}
                    <td className="px-4 py-3.5 align-middle text-zinc-400">
                      {link.title ? (
                        <span className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-xs text-zinc-300">
                          {link.title}
                        </span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>

                    {/* Clicks */}
                    <td className="px-4 py-3.5 align-middle text-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs font-bold text-cyan-300 border border-cyan-500/20">
                        {link.clickCount || 0}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 align-middle text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => startEdit(link)}
                          className="inline-flex items-center gap-1 rounded-lg border border-zinc-700/70 bg-zinc-800/80 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition"
                          title="Editar enlace"
                        >
                          <Edit3 className="h-3 w-3" />
                          <span>Editar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setTrafficFilter(link.shortId)}
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20 transition"
                          title="Filtrar tráfico de este enlace"
                        >
                          <BarChart3 className="h-3 w-3" />
                          <span>Tráfico</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteLink(link.shortId)}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-300 hover:bg-rose-500/20 transition"
                          title="Eliminar enlace"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Inline Edit Form Drawer */}
                      {editing && (
                        <div className="mt-3 rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-left shadow-2xl">
                          <p className="mb-3 text-xs font-bold text-zinc-300 uppercase tracking-wider">
                            Modificar enlace /link/{link.shortId}
                          </p>
                          <div className="grid gap-3 sm:grid-cols-3">
                            <div>
                              <label className="text-[11px] text-zinc-400 block mb-1">ID Corto</label>
                              <input
                                value={editData.shortId}
                                onChange={(e) =>
                                  setEditData((prev) => ({ ...prev, shortId: e.target.value }))
                                }
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-100 font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] text-zinc-400 block mb-1">URL Destino</label>
                              <input
                                value={editData.targetUrl}
                                onChange={(e) =>
                                  setEditData((prev) => ({ ...prev, targetUrl: e.target.value }))
                                }
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-100"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] text-zinc-400 block mb-1">Título</label>
                              <input
                                value={editData.title}
                                onChange={(e) =>
                                  setEditData((prev) => ({ ...prev, title: e.target.value }))
                                }
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-100"
                              />
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingId("")}
                              className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-700"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => saveEdit(link.shortId)}
                              className="rounded-lg border border-cyan-500/50 bg-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/30"
                            >
                              Guardar Cambios
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredLinks.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-zinc-500 text-sm">
            No se encontraron enlaces registrados.
          </div>
        )}
      </section>

      {/* Traffic Log Section */}
      <section className="rounded-3xl border border-zinc-800/90 bg-zinc-950/70 p-6 sm:p-7 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="font-montserrat text-lg font-bold text-white">
              Historial de Tráfico & Clicks
            </h2>
            <p className="text-xs text-zinc-400">
              Auditoría en tiempo real con IP enmascarada y geolocalización
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Selector */}
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-zinc-400" />
              <select
                value={trafficFilter}
                onChange={(e) => setTrafficFilter(e.target.value)}
                className="rounded-xl border border-zinc-700/80 bg-zinc-900/90 px-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-cyan-400"
              >
                <option value="all">Todos los enlaces ({traffic.length})</option>
                {links.map((link) => (
                  <option key={link.id} value={link.shortId}>
                    /link/{link.shortId} ({link.clickCount || 0})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={purgeTrafficForFilter}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{trafficFilter === "all" ? "Purgar todo" : "Purgar filtro"}</span>
            </button>
          </div>
        </div>

        {/* Traffic Table */}
        <div className="overflow-x-auto rounded-2xl border border-zinc-800/80 bg-zinc-900/30">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/70 text-xs uppercase tracking-wider text-zinc-400">
                <th className="px-4 py-3 font-semibold">Fecha y Hora</th>
                <th className="px-4 py-3 font-semibold">Enlace</th>
                <th className="px-4 py-3 font-semibold">IP Enmascarada</th>
                <th className="px-4 py-3 font-semibold">Ubicación</th>
                <th className="px-4 py-3 font-semibold">Destino</th>
                <th className="px-4 py-3 font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {traffic.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="px-4 py-3 text-xs text-zinc-300 font-mono">
                    {new Date(item.openedAt).toLocaleString("es-ES")}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono font-semibold text-xs text-cyan-300 bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.5 rounded-md">
                      {item.shortId}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-zinc-400">
                    {item.ipMasked}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-300">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-zinc-500" />
                      <span>
                        {item.country || "Desconocido"}
                        {item.city ? ` (${item.city})` : ""}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400 max-w-[220px] truncate">
                    {item.targetUrl}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => deleteTrafficRecord(item.id)}
                      className="rounded-lg p-1 text-zinc-500 hover:bg-rose-500/20 hover:text-rose-300 transition"
                      title="Eliminar este registro"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {traffic.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-zinc-500 text-sm">
            No hay registros de tráfico para el filtro seleccionado.
          </div>
        )}
      </section>

      {/* Create Link Modal */}
      {isCreateOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsCreateOpen(false)}
        >
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/95 p-6 sm:p-7 shadow-2xl backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-emerald-400">
                  <Link2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-montserrat text-lg font-bold text-white">
                    Crear Nuevo Enlace
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Genera una URL corta con redirección y métricas
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreate} className="space-y-4">
              {/* Short ID */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                  ID Corto (Slug) <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    value={createData.shortId}
                    onChange={(e) =>
                      setCreateData((prev) => ({ ...prev, shortId: e.target.value }))
                    }
                    required
                    autoFocus
                    placeholder="discord / repo / doc"
                    className="w-full rounded-xl border border-zinc-700/80 bg-zinc-900/90 pl-10 pr-3.5 py-2.5 text-sm font-mono text-cyan-200 placeholder-zinc-500 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
                {createData.shortId && (
                  <p className="mt-1.5 text-[11px] text-zinc-400 font-mono">
                    Ruta final: <span className="text-cyan-300">/link/{createData.shortId}</span>
                  </p>
                )}
              </div>

              {/* Target URL */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                  URL Destino <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    value={createData.targetUrl}
                    onChange={(e) =>
                      setCreateData((prev) => ({ ...prev, targetUrl: e.target.value }))
                    }
                    required
                    type="url"
                    placeholder="https://ejemplo.com/destino-largo"
                    className="w-full rounded-xl border border-zinc-700/80 bg-zinc-900/90 pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
                  Título / Nota (Opcional)
                </label>
                <div className="relative">
                  <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    value={createData.title}
                    onChange={(e) =>
                      setCreateData((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Canal de Discord"
                    className="w-full rounded-xl border border-zinc-700/80 bg-zinc-900/90 pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-zinc-800/80">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/50 bg-emerald-500/20 px-5 py-2 text-xs font-semibold text-emerald-200 shadow-lg shadow-emerald-950/50 hover:bg-emerald-500/30 hover:border-emerald-400 active:scale-95 transition"
                >
                  <span>Crear Enlace</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
