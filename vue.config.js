/* Copyright 2019 Edouard Maleix, read LICENSE */

const CompressionPlugin = require('compression-webpack-plugin');

process.env.VUE_APP_VERSION = require('./package.json').version;

module.exports = {
  parallel: false,

  configureWebpack: {
    optimization: {
      splitChunks: {
        minSize: 10000,
        maxSize: 250000,
        cacheGroups: {
          node_vendors: {
            test: /[\\/]node_modules[\\/]/,
            // chunks: "async",
            priority: 1,
          },
        },
      },
    },
  },

  chainWebpack: config => {
    config.plugins.delete('prefetch');

    config.plugin('CompressionPlugin').use(
      new CompressionPlugin({
        filename: '[path].gz[query]',
        cache: true,
        algorithm: 'gzip',
        test: new RegExp('\\.(js|css)$'),
        threshold: 1024,
        minRatio: 0.8,
        compressionOptions: { level: 6 },
      }),
    );

    config.module
      .rule('worker')
      .test(/\.worker\.js$/i)
      .use('worker-loader')
      .loader('worker-loader')
      .tap(options => {
        if (!options) options = {};
        // options.publicPath = '/workers/';
        if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
          options.name = `[hash].${(Math.random() * 1e32).toString(36)}-worker.js`;
        } else {
          options.name = '[hash].worker.js';
        }
        options.inline = true;
        options.fallback = false;
        return options;
      });
  },
};
