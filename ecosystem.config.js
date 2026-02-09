module.exports = {
  apps: [{
    name: 'prior-web',
    script: 'npx',
    args: 'serve -s dist -p 8008',
    cwd: '/Users/rikaisho/Desktop/prior-app',
    env: {
      NODE_ENV: 'production'
    },
    max_memory_restart: '256M',
    autorestart: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    // Restart if the dist folder changes
    watch: ['dist'],
    ignore_watch: ['dist/_next', 'node_modules', '.git']
  }]
};
