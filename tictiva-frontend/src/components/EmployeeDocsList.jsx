// components/EmployeeDocsList.jsx
import React, { useEffect, useState } from "react";
import { getSignedUrl, listEmployeeDocs, removeEmployeeDocs } from "../lib/storageEmployeeDocs";

export default function EmployeeDocsList({ folder }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await listEmployeeDocs(folder);
      setItems(data ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [folder]);

  async function handleView(name) {
    const url = await getSignedUrl(`${folder}/${name}`, 60);
    window.open(url, "_blank");
  }

  async function handleDownload(name) {
    const url = await getSignedUrl(`${folder}/${name}`, 60);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
  }

  async function handleDelete(name) {
    await removeEmployeeDocs([`${folder}/${name}`]);
    await load();
  }

  return (
    <div className="space-y-2">
      {loading && <div>Cargando…</div>}
      {!loading && items.length === 0 && <div>Sin documentos.</div>}

      {!loading && items.map((it) => (
        <div key={it.name} className="flex items-center justify-between rounded-xl bg-white/5 p-3 border border-white/10">
          <div className="truncate">
            <div className="font-medium">{it.name}</div>
            <div className="text-xs opacity-70">
              {new Date(it.updated_at).toLocaleString()}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded-lg bg-white text-black" onClick={() => handleView(it.name)}>ver</button>
            <button className="px-3 py-1 rounded-lg bg-white text-black" onClick={() => alert("Abrir modal de edición de metadatos")}>editar</button>
            <button className="px-3 py-1 rounded-lg bg-white text-black" onClick={() => handleDownload(it.name)}>descargar</button>
            <button className="px-3 py-1 rounded-lg bg-red-500 text-white" onClick={() => handleDelete(it.name)}>eliminar</button>
          </div>
        </div>
      ))}
    </div>
  );
}
