const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
    transpileDependencies: true,
    publicPath: '/',
    outputDir: 'dist',
    assetsDir: 'assets',
    productionSourceMap: process.env.NODE_ENV === 'test',
    devServer: {
        port: 8085
    }
}) 