module.exports = (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    supabaseUrl: process.env.SUPABASE_URL ? 'Configured' : 'Not configured',
    supabaseKey: process.env.SUPABASE_ANON_KEY ? 'Configured' : 'Not configured'
  });
}; 