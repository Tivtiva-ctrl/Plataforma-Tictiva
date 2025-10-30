// Este es un servidor web básico usando Node.js
const http = require('http');

// Render nos dirá qué puerto usar. Si no, usamos el 3001
const port = process.env.PORT || 3001;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('¡Hola Render! Mi back-end está conectado.');
});

server.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});