// components/EmployeeDocUploader.jsx
import React, { useRef, useState } from "react";
import { uploadEmployeeDoc } from "../lib/storageEmployeeDocs";

export default function EmployeeDocUploader({ tenantId, rut, employeeId }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const path = `empleados/${rut}/documentos/${file.name}`;
      await uploadEmployeeDoc({
        file,
        path,
        tenantId,
        extraMeta: { employee_id: employeeId },
      });
      alert("Archivo subido");
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <input ref={inputRef} type="file" onChange={handleUpload} disabled={uploading} />
    </div>
  );
}
