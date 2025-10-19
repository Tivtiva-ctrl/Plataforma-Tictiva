import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

/** Utils */
const toNullable = (v) => (v === "" || v === undefined || v === null ? null : v);
const onlyDigits = (s = "") => String(s).replace(/\D+/g, "");
const maskAccount = (s = "") => {
  const d = onlyDigits(s);
  if (!d) return "";
  return d.length <= 4 ? d : "**** " + d.slice(-4);
};
function validateRUT(rutInput = "") {
  const raw = String(rutInput).replace(/^0+|[^0-9kK]+/g, "").toUpperCase();
  if (raw.length < 2) return false;
  const body = raw.slice(0, -1);
  const dv = raw.slice(-1);
  let sum = 0, mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const res = 11 - (sum % 11);
  const dvCalc = res === 11 ? "0" : res === 10 ? "K" : String(res);
  return dvCalc === dv;
}
function prettyRUT(rutInput = "") {
  const clean = String(rutInput).replace(/[^0-9kK]+/g, "").toUpperCase();
  if (clean.length < 2) return rutInput;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  return `${Number(body).toLocaleString("es-CL")}-${dv}`;
}

/** Badges */
const Badge = ({ variant = "default", children }) => {
  const map = {
    default: "bg-gray-200 text-gray-800",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${map[variant] || map.default}`}>
      {children}
    </span>
  );
};
function statusBadge(status) {
  switch (status) {
    case "verified": return <Badge variant="success">Verificada</Badge>;
    case "pending": return <Badge variant="warning">Pendiente</Badge>;
    case "rejected": return <Badge variant="danger">Rechazada</Badge>;
    case "inactive": return <Badge>Inactiva</Badge>;
    default: return <Badge variant="info">{status || "—"}</Badge>;
  }
}

/** Principal */
export default function DatosBancarios({ employee, onSaved, allowEdit = false }) {
  const canEdit = !!allowEdit;

  const [banks, setBanks] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form inline (no drawer)
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    bank_code: "",
    bank_name: "",
    account_type: "",
    account_number: "",
    account_currency: "CLP",
    holder_name: employee?.nombre || "",
    holder_rut: employee?.rut || "",
    is_third_party: false,
    third_party_relation: "",
    consent_signed: false,
    consent_signed_at: null,
    valid_from: "",
    valid_to: "",
    favorite: false,
    verification_status: "pending",
    verification_notes: "",
    metadata: { iban: "", bic: "" },
  };
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  // Cerrar form si se desactiva “Editar Ficha”
  useEffect(() => { if (!canEdit) { setShowForm(false); setEditingId(null); } }, [canEdit]);

  const bankOptions = useMemo(() => {
    if (!banks?.length) {
      return [
        { code: "001", name: "Banco de Chile" },
        { code: "009", name: "Banco de Crédito e Inversiones (BCI)" },
        { code: "012", name: "BancoEstado" },
        { code: "014", name: "Scotiabank Chile" },
        { code: "016", name: "Banco Security" },
        { code: "027", name: "Banco Consorcio" },
        { code: "031", name: "Banco Santander Chile" },
        { code: "037", name: "Banco Itaú Chile" },
        { code: "051", name: "Banco Falabella" },
        { code: "053", name: "Banco Ripley" },
        { code: "055", name: "Banco Bice" },
        { code: "999", name: "Otro / Internacional" },
      ];
    }
    return banks.map((b) => ({ code: b.code || b.bank_code, name: b.name || b.bank_name }));
  }, [banks]);

  /** Catálogo de bancos (opcional) */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("bank_catalog")
        .select("code, name")
        .order("name", { ascending: true });
      if (!cancelled && data) setBanks(data);
    })();
    return () => { cancelled = true; };
  }, []);

  /** Cargar cuentas del empleado */
  useEffect(() => {
    const employeeId = employee?.id != null ? Number(employee.id) : null;
    if (!employeeId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("employee_bank_accounts_view")
        .select("*")
        .eq("employee_id", employeeId)
        .order("favorite", { ascending: false })
        .order("created_at", { ascending: false });
      if (!cancelled) {
        if (error) {
          const r = await supabase
            .from("employee_bank_accounts")
            .select("*")
            .eq("employee_id", employeeId)
            .order("favorite", { ascending: false })
            .order("created_at", { ascending: false });
          if (!r.error) setItems(r.data || []);
        } else {
          setItems(data || []);
        }
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [employee?.id]);

  /** Helpers */
  const openCreate = () => {
    if (!canEdit) return;
    setEditingId(null);
    setForm({
      ...emptyForm,
      holder_name: employee?.nombre || "",
      holder_rut: employee?.rut || "",
    });
    setErrors({});
    setShowForm(true);
  };
  const openEdit = (row) => {
    if (!canEdit) return;
    setEditingId(row.id);
    setForm({
      bank_code: row.bank_code || "",
      bank_name: row.bank_name || "",
      account_type: row.account_type || "",
      account_number: row.account_number || "",
      account_currency: row.account_currency || "CLP",
      holder_name: row.holder_name || employee?.nombre || "",
      holder_rut: row.holder_rut || employee?.rut || "",
      is_third_party: !!row.is_third_party,
      third_party_relation: row.third_party_relation || "",
      consent_signed: !!row.consent_signed,
      consent_signed_at: row.consent_signed_at || null,
      valid_from: row.valid_from || "",
      valid_to: row.valid_to || "",
      favorite: !!row.favorite,
      verification_status: row.verification_status || "pending",
      verification_notes: row.verification_notes || "",
      metadata: {
        iban: row.metadata?.iban || "",
        bic: row.metadata?.bic || "",
      },
    });
    setErrors({});
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditingId(null); setErrors({}); };
  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const e = {};
    if (!form.bank_code && !form.bank_name) e.bank_code = "Selecciona un banco.";
    if (!form.account_type) e.account_type = "Selecciona tipo de cuenta.";
    if (!onlyDigits(form.account_number)) e.account_number = "Número de cuenta inválido.";
    if (!form.holder_name?.trim()) e.holder_name = "Titular obligatorio.";
    if (!validateRUT(form.holder_rut)) e.holder_rut = "RUT del titular inválido.";
    if (form.is_third_party && !form.third_party_relation?.trim()) e.third_party_relation = "Indica relación si es cuenta de tercero.";
    if (form.consent_signed && !form.consent_signed_at) e.consent_signed_at = "Falta fecha/hora de consentimiento.";
    if (form.bank_code === "999") {
      if (!form.metadata?.iban?.trim()) e.iban = "IBAN es requerido para cuenta internacional.";
      if (!form.metadata?.bic?.trim()) e.bic = "BIC/SWIFT es requerido.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const refreshList = async () => {
    if (!employee?.id) return;
    const { data, error } = await supabase
      .from("employee_bank_accounts")
      .select("*")
      .eq("employee_id", Number(employee.id))
      .order("favorite", { ascending: false })
      .order("created_at", { ascending: false });
    if (!error) setItems(data || []);
  };

  const save = async () => {
    if (!canEdit) return;
    if (!validate()) return;

    const payload = {
      employee_id: Number(employee.id),
      bank_code: form.bank_code || null,
      bank_name: (form.bank_code && bankOptions.find((b) => b.code === form.bank_code)?.name) || toNullable(form.bank_name),
      account_type: toNullable(form.account_type),
      account_number: onlyDigits(form.account_number),
      account_currency: toNullable(form.account_currency) || "CLP",
      holder_name: toNullable(form.holder_name),
      holder_rut: toNullable(form.holder_rut),
      is_third_party: !!form.is_third_party,
      third_party_relation: toNullable(form.third_party_relation),
      consent_signed: !!form.consent_signed,
      consent_signed_at: form.consent_signed ? new Date().toISOString() : null,
      valid_from: toNullable(form.valid_from),
      valid_to: toNullable(form.valid_to),
      favorite: !!form.favorite,
      verification_status: toNullable(form.verification_status) || "pending",
      verification_notes: toNullable(form.verification_notes),
      metadata: { iban: form.metadata?.iban || "", bic: form.metadata?.bic || "" },
    };

    let resp;
    if (editingId) {
      resp = await supabase.from("employee_bank_accounts").update(payload).eq("id", editingId).select().single();
    } else {
      resp = await supabase.from("employee_bank_accounts").insert(payload).select().single();
    }
    if (resp.error) {
      console.error(resp.error);
      alert("Error al guardar datos bancarios: " + resp.error.message);
      return;
    }
    if (payload.favorite) {
      await supabase
        .from("employee_bank_accounts")
        .update({ favorite: false })
        .eq("employee_id", Number(employee.id))
        .neq("id", resp.data.id);
    }
    await refreshList();
    closeForm();
    if (onSaved) onSaved(resp.data);
  };

  const setFavorite = async (row) => {
    if (!canEdit) return;
    await supabase.from("employee_bank_accounts").update({ favorite: true }).eq("id", row.id);
    await supabase
      .from("employee_bank_accounts")
      .update({ favorite: false })
      .eq("employee_id", Number(employee.id))
      .neq("id", row.id);
    await refreshList();
  };

  const softDelete = async (row) => {
    if (!canEdit) return;
    if (!confirm("¿Inactivar esta cuenta bancaria?")) return;
    await supabase
      .from("employee_bank_accounts")
      .update({ verification_status: "inactive", favorite: false })
      .eq("id", row.id);
    await refreshList();
  };

  const askVerify = async (row) => {
    if (!canEdit) return;
    await supabase
      .from("employee_bank_accounts")
      .update({ verification_status: "pending", verification_notes: null })
      .eq("id", row.id);
    await refreshList();
  };

  const quickReject = async (row) => {
    if (!canEdit) return;
    const motivo = prompt("Motivo de rechazo:");
    await supabase
      .from("employee_bank_accounts")
      .update({ verification_status: "rejected", verification_notes: motivo || null })
      .eq("id", row.id);
    await refreshList();
  };

  const prettyBank = (row) => {
    if (row.bank_name) return row.bank_name;
    const found = bankOptions.find((b) => b.code === row.bank_code);
    return found ? found.name : row.bank_code || "Banco";
  };

  return (
    <div className="ef-card">
      <div className="ef-card-header flex items-center justify-between">
        <div>
          <h3 className="ef-title">Datos bancarios</h3>
          <p className="ef-subtitle text-sm text-gray-500">
            Gestiona las cuentas para pago de remuneraciones y reembolsos.
          </p>
        </div>

        {/* Acciones: sin "Generar informe DT" */}
        <div className="flex gap-2">
          {canEdit ? (
            <button className="btn-secondary" onClick={openCreate}>+ Agregar cuenta</button>
          ) : (
            <button className="btn-secondary" disabled title="Activa 'Editar Ficha' para agregar">
              + Agregar cuenta
            </button>
          )}
        </div>
      </div>

      {/* Formulario inline (aparece sólo cuando se abre) */}
      {canEdit && showForm && (
        <div className="ef-item p-3 rounded-md border bg-white mb-3">
          <div className="ef-title" style={{ marginBottom: 6 }}>
            {editingId ? "Editar cuenta bancaria" : "Nueva cuenta bancaria"}
          </div>

          {/* Banco */}
          <div className="ef-row">
            <div className="ef-col-label">Banco</div>
            <div className="ef-col-field">
              <div className="flex gap-2">
                <select
                  className="ef-input"
                  value={form.bank_code}
                  onChange={(e) => onChange("bank_code", e.target.value)}
                >
                  <option value="">Selecciona banco…</option>
                  {bankOptions.map((b) => (
                    <option key={b.code} value={b.code}>{b.name}</option>
                  ))}
                </select>
                {form.bank_code === "999" && (
                  <input
                    className="ef-input flex-1"
                    placeholder="Nombre banco (internacional / otro)"
                    value={form.bank_name}
                    onChange={(e) => onChange("bank_name", e.target.value)}
                  />
                )}
              </div>
              {errors.bank_code && <div className="ef-error">{errors.bank_code}</div>}
            </div>
          </div>

          {/* Tipo / Moneda */}
          <div className="ef-row">
            <div className="ef-col-label">Tipo / Moneda</div>
            <div className="ef-col-field flex gap-2">
              <select
                className="ef-input"
                value={form.account_type}
                onChange={(e) => onChange("account_type", e.target.value)}
              >
                <option value="">Tipo de cuenta…</option>
                <option>Corriente</option>
                <option>Vista</option>
                <option>Ahorro</option>
                <option>Cuenta RUT</option>
                <option>Chequera</option>
              </select>
              <select
                className="ef-input"
                value={form.account_currency}
                onChange={(e) => onChange("account_currency", e.target.value)}
              >
                <option value="CLP">CLP</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
              {errors.account_type && <div className="ef-error">{errors.account_type}</div>}
            </div>
          </div>

          {/* Número de cuenta */}
          <div className="ef-row">
            <div className="ef-col-label">Número de cuenta</div>
            <div className="ef-col-field">
              <input
                className="ef-input"
                placeholder="Sólo dígitos"
                value={form.account_number}
                onChange={(e) => onChange("account_number", onlyDigits(e.target.value))}
                inputMode="numeric"
              />
              {errors.account_number && <div className="ef-error">{errors.account_number}</div>}
            </div>
          </div>

          {/* Titular / RUT */}
          <div className="ef-row">
            <div className="ef-col-label">Titular</div>
            <div className="ef-col-field grid grid-cols-2 gap-2">
              <input
                className="ef-input"
                placeholder="Nombre del titular"
                value={form.holder_name}
                onChange={(e) => onChange("holder_name", e.target.value)}
              />
              <input
                className="ef-input"
                placeholder="RUT (12345678-9)"
                value={form.holder_rut}
                onChange={(e) => onChange("holder_rut", e.target.value)}
              />
              {errors.holder_name && <div className="ef-error col-span-2">{errors.holder_name}</div>}
              {errors.holder_rut && <div className="ef-error col-span-2">{errors.holder_rut}</div>}
            </div>
          </div>

          {/* Cuenta de tercero */}
          <div className="ef-row">
            <div className="ef-col-label">Cuenta de tercero</div>
            <div className="ef-col-field">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_third_party}
                  onChange={(e) => onChange("is_third_party", e.target.checked)}
                />
                <span>El titular no es el trabajador</span>
              </label>
              {form.is_third_party && (
                <div className="mt-2">
                  <input
                    className="ef-input"
                    placeholder="Relación (cónyuge, representante, etc.)"
                    value={form.third_party_relation}
                    onChange={(e) => onChange("third_party_relation", e.target.value)}
                  />
                  {errors.third_party_relation && <div className="ef-error">{errors.third_party_relation}</div>}
                </div>
              )}
            </div>
          </div>

          {/* Internacional */}
          {form.bank_code === "999" && (
            <>
              <div className="ef-row">
                <div className="ef-col-label">IBAN</div>
                <div className="ef-col-field">
                  <input
                    className="ef-input"
                    placeholder="IBAN"
                    value={form.metadata?.iban || ""}
                    onChange={(e) => onChange("metadata", { ...form.metadata, iban: e.target.value })}
                  />
                  {errors.iban && <div className="ef-error">{errors.iban}</div>}
                </div>
              </div>
              <div className="ef-row">
                <div className="ef-col-label">BIC/SWIFT</div>
                <div className="ef-col-field">
                  <input
                    className="ef-input"
                    placeholder="BIC/SWIFT"
                    value={form.metadata?.bic || ""}
                    onChange={(e) => onChange("metadata", { ...form.metadata, bic: e.target.value })}
                  />
                  {errors.bic && <div className="ef-error">{errors.bic}</div>}
                </div>
              </div>
            </>
          )}

          {/* Consentimiento */}
          <div className="ef-row">
            <div className="ef-col-label">Consentimiento</div>
            <div className="ef-col-field">
              <label className="inline-flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={form.consent_signed}
                  onChange={(e) => onChange("consent_signed", e.target.checked)}
                />
                <span>
                  Autorizo a la empresa a realizar transferencias a esta cuenta para efectos de remuneraciones y reembolsos.
                </span>
              </label>
              {form.consent_signed && (
                <div className="text-xs text-gray-500 mt-1">
                  Se registrará fecha/hora del consentimiento al guardar.
                </div>
              )}
              {errors.consent_signed_at && <div className="ef-error">{errors.consent_signed_at}</div>}
            </div>
          </div>

          {/* Vigencia / Favorita */}
          <div className="ef-row">
            <div className="ef-col-label">Vigencia / Preferencia</div>
            <div className="ef-col-field grid grid-cols-2 gap-2">
              <input
                type="date"
                className="ef-input"
                value={form.valid_from || ""}
                onChange={(e) => onChange("valid_from", e.target.value)}
              />
              <input
                type="date"
                className="ef-input"
                value={form.valid_to || ""}
                onChange={(e) => onChange("valid_to", e.target.value)}
              />
              <label className="inline-flex items-center gap-2 col-span-2 mt-1">
                <input
                  type="checkbox"
                  checked={form.favorite}
                  onChange={(e) => onChange("favorite", e.target.checked)}
                />
                <span>Marcar como cuenta favorita para pago de sueldo</span>
              </label>
            </div>
          </div>

          {/* Estado verificación */}
          <div className="ef-row">
            <div className="ef-col-label">Estado verificación</div>
            <div className="ef-col-field flex gap-2">
              <select
                className="ef-input"
                value={form.verification_status}
                onChange={(e) => onChange("verification_status", e.target.value)}
              >
                <option value="pending">Pendiente</option>
                <option value="verified">Verificada</option>
                <option value="rejected">Rechazada</option>
                <option value="inactive">Inactiva</option>
              </select>
              <input
                className="ef-input flex-1"
                placeholder="Notas de verificación (opcional)"
                value={form.verification_notes}
                onChange={(e) => onChange("verification_notes", e.target.value)}
              />
            </div>
          </div>

          {/* Footer inline */}
          <div className="flex justify-end gap-2 mt-3">
            <button className="btn-outline" onClick={closeForm}>Cancelar</button>
            <button className="btn-primary" onClick={save}>{editingId ? "Guardar cambios" : "Guardar"}</button>
          </div>
        </div>
      )}

      {/* Listado */}
      <div className="ef-list space-y-3">
        {loading ? (
          <div className="ef-empty">Cargando cuentas…</div>
        ) : items.length === 0 ? (
          <div className="ef-empty">Sin cuentas registradas.</div>
        ) : (
          items.map((row) => (
            <div key={row.id} className="ef-item flex items-start justify-between p-3 rounded-md border bg-white">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className="font-medium">{prettyBank(row)}</div>
                  {statusBadge(row.verification_status)}
                  {row.favorite && <Badge variant="info">Favorita ⭐</Badge>}
                  {row.is_third_party && <Badge variant="warning">Cuenta de tercero</Badge>}
                </div>
                <div className="text-sm text-gray-700">
                  <span className="mr-3">{row.account_type || "—"}</span>
                  <span className="mr-3">{maskAccount(row.account_number)}</span>
                  <span className="mr-3">{row.account_currency || "CLP"}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Titular: {row.holder_name || "—"} · {prettyRUT(row.holder_rut || "")}
                  {row.valid_from ? ` · Vigente desde ${row.valid_from}` : ""}
                  {row.valid_to ? ` · hasta ${row.valid_to}` : ""}
                  {row.verification_notes ? ` · Nota: ${row.verification_notes}` : ""}
                </div>
              </div>

              {/* Acciones (solo en modo edición) */}
              {canEdit ? (
                <div className="flex gap-2">
                  <button className="btn-sm" onClick={() => openEdit(row)}>Editar</button>
                  {!row.favorite && row.verification_status !== "inactive" && (
                    <button className="btn-sm" onClick={() => setFavorite(row)}>Favorita</button>
                  )}
                  {row.verification_status !== "verified" && row.verification_status !== "inactive" && (
                    <button className="btn-sm" onClick={() => askVerify(row)}>Solicitar verificación</button>
                  )}
                  {row.verification_status !== "inactive" && (
                    <button className="btn-sm btn-danger" onClick={() => softDelete(row)}>Inactivar</button>
                  )}
                  {row.verification_status !== "rejected" && row.verification_status !== "inactive" && (
                    <button className="btn-sm btn-outline" onClick={() => quickReject(row)}>Rechazar</button>
                  )}
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
