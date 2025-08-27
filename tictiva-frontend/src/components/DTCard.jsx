// src/components/DTCard.jsx
import React from "react";
import iconDT from "../assets/icon-dt.png"; // Usa el tuyo o cambia por emoji

const DTCard = () => (
  <div className="dt-card">
    <span className="dt-card-icon">
      {/* Usa tu imagen o un emoji */}
      <img src={iconDT} alt="icono dt" style={{height: 32, width: 32, marginRight: 10, marginTop: 2}} />
      {/* O reemplaza por 🛡️ si no tienes el PNG */}
    </span>
    <div className="dt-card-text">
      <span className="dt-card-title">Acceso para Fiscalización DT</span>
      <span className="dt-card-desc">Acceso temporal para fiscalizadores de la DT según normativa legal</span>
    </div>
    <span className="dt-card-arrow">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M9 18l6-6-6-6" stroke="#bdbdbd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  </div>
);

export default DTCard;
