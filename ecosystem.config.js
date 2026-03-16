module.exports = {
  apps: [
    {
      name: 'wagex-frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      node_args: '--max-old-space-size=192',
      max_memory_restart: '250M',
      time: true,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
