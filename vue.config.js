module.exports = {
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
        }
    }
} 