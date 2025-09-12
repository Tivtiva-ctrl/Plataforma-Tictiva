  // ==== helpers documentos (persisten con registrarMovimiento) ====
  const updateDocumentos = async (newDocs, accion, detalle) => {
    const empAfter = { ...empleado, documentos: newDocs };
    await registrarMovimiento(empAfter, {
      accion,
      categoria: "Documentos",
      detalle,
      actor: "Usuario",
    });
    alert("Acción realizada.");
  };

  const eliminarDocumento = async (id) => {
    const it = (empleado.documentos || []).find(x => x.id === id);
    const newDocs = (empleado.documentos || []).filter(x => x.id !== id);
    await updateDocumentos(newDocs, "Eliminación", `Se eliminó “${it?.nombre || id}”`);
  };

  const renombrarDocumento = async (id, nuevoNombre) => {
    const newDocs = (empleado.documentos || []).map(x => x.id === id ? { ...x, nombre: nuevoNombre } : x);
    await updateDocumentos(newDocs, "Renombrar", `Se renombró “${id}” a “${nuevoNombre}”`);
  };

  // Modifica tu onSubirArchivo para aceptar parentId (carpeta destino)
  const onSubirArchivo = async (fileFromUI, parentId) => {
    if (!empleado) return;
    let file = fileFromUI;
    if (!file) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg";
      const p = new Promise((resolve) => { input.onchange = (e) => resolve(e.target.files?.[0] || null); });
      input.click();
      file = await p;
      if (!file) return;
    }
    const hoy = new Date().toISOString().slice(0,10);
    const nuevo = { id: `d_${Date.now()}`, tipo: "file", nombre: file.name, mod: hoy, tam: humanSize(file.size), parentId };
    const newDocs = [...(empleado.documentos || []), nuevo];
    await updateDocumentos(newDocs, "Subida de archivo", `Se subió “${file.name}”${parentId ? ` a carpeta ${parentId}`:""}`);
  };
