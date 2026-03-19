module.exports = {
  apps: [{
    name: 'ollama-note-taker',
    script: './scripts/note-taker.mjs',
    args: '--auto',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
    },
    error_file: './logs/note-taker-error.log',
    out_file: './logs/note-taker-out.log',
    log_file: './logs/note-taker-combined.log',
    time: true,
    restart_delay: 5000,
    max_restarts: 10,
    min_uptime: '10s',
  }]
};