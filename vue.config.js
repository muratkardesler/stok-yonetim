module.exports = {
    transpileDependencies: true,
    devServer: {
        port: 8085,
        proxy: {
            '/api': {
                target: 'http://flowbridge.us-e2.cloudhub.io',
                changeOrigin: true,
                pathRewrite: {
                    '^/api': '/api'
                }
            }
        }
    }
} 