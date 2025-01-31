const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
    transpileDependencies: true,
    devServer: {
        port: 8085,
        proxy: {
            '/api': {
                target: 'https://flowbridge.us-e2.cloudhub.io',
                changeOrigin: true,
                secure: false,
                pathRewrite: {
                    '^/api': '/api'
                }
            }
        },
        publicPath: '/',
        outputDir: 'dist',
        assetsDir: 'assets',
        productionSourceMap: false
    }
}) 