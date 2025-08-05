export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Health check working'
  }));
} 