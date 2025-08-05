module.exports = (req, res) => {
  res.json({
    status: 'success',
    message: 'Simple API endpoint working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    supabaseUrl: process.env.SUPABASE_URL ? 'Configured' : 'Not configured',
    supabaseKey: process.env.SUPABASE_ANON_KEY ? 'Configured' : 'Not configured'
  });
}; 