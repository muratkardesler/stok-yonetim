const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack')

module.exports = defineConfig({
    transpileDependencies: true,
    publicPath: '/',
    outputDir: 'dist',
    assetsDir: 'assets',
    productionSourceMap: process.env.NODE_ENV === 'test',
    devServer: {
        port: 8085
    },
    configureWebpack: {
        resolve: {
            fallback: {
                crypto: require.resolve('crypto-browserify'),
                stream: require.resolve('stream-browserify'),
                assert: require.resolve('assert/'),
                http: require.resolve('stream-http'),
                https: require.resolve('https-browserify'),
                os: require.resolve('os-browserify/browser'),
                vm: require.resolve('vm-browserify'),
                buffer: require.resolve('buffer/'),
                process: require.resolve('process/browser')
            }
        },
        plugins: [
            new webpack.ProvidePlugin({
                process: 'process/browser',
                Buffer: ['buffer', 'Buffer']
            })
        ]
    }
}) 