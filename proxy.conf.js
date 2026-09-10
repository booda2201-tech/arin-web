const PROXY_CONFIG = [
  {
    context: ['/api'],
    target: 'https://arin.somee.com',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
  },
];

module.exports = PROXY_CONFIG;
