import React from 'react'
import ReactDOM from 'react-dom/client'
// 1. Importar el BrowserRouter
import { BrowserRouter } from 'react-router-dom' 
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Envolver <App /> con el BrowserRouter */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)