import React from "react";
import { useNavigate } from "react-router-dom";
import "./VolverAtras.css";

export default function VolverAtras() {
  const navigate = useNavigate();
  return (
    <div className="volver-atras" onClick={() => navigate(-1)}>
      ← Volver
    </div>
  );
}
