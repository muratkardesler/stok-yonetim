const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
    transpileDependencies: true,
    devServer: {
        port: 8080,
        proxy: {
            '/api': {
                target: 'http://flowbridge.us-e2.cloudhub.io',
                changeOrigin: true,
                secure: false,
                pathRewrite: {
                    '^/api': '/api'
                },
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization, X-Request-With'
                }
            }
        }
    }
}) 