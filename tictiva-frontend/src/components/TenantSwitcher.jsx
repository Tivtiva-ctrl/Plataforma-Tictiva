import React, { useState } from "react";
import { useTenant } from "../context/TenantProvider";

export default function TenantSwitcher() {
  const { tenants, tenant, setActiveTenant, loading } = useTenant();
  const [open, setOpen] = useState(false);

  if (loading || tenants.length <= 1) return null;

  return (
    <div className="tenantSwitchWrap" style={{ position: "relative" }}>
      <button
        className="tenantChip"
        onClick={() => setOpen(v => !v)}
        title="Cambiar empresa"
        style={{
          border: "1px solid #e5eaf2",
          background: "#fff",
          borderRadius: "999px",
          padding: "8px 12px",
          fontWeight: 700,
          boxShadow: "0 2px 10px rgba(15,23,42,.06)",
          cursor: "pointer"
        }}
      >
        {tenant?.name || "Seleccionar empresa"}
      </button>

      {open && (
        <div
          className="tenantMenu"
          style={{
            position: "absolute",
            right: 0, marginTop: 8,
            background: "#fff",
            border: "1px solid #eef2f7",
            borderRadius: 12,
            boxShadow: "0 12px 28px rgba(15,23,42,.12)",
            minWidth: 220,
            zIndex: 50
          }}
        >
          {tenants.map(t => (
            <button
              key={t.id}
              onClick={async () => { await setActiveTenant(t); setOpen(false); }}
              style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "10px 12px", background: "transparent", border: 0,
                cursor: "pointer", fontWeight: t.id === tenant?.id ? 800 : 600
              }}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
