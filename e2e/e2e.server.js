const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('../webpack.dev');

const compiler = webpack(config);
const devServerOptions = { ...config.devServer, open: false };
const server = new WebpackDevServer(devServerOptions, compiler);

server.startCallback(() => {
  console.log('DevServer started on port 9001');
  if (process.send) process.send('ok');
});

process.on('SIGINT', () => server.stop());
