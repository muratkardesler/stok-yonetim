module.exports = {
    devServer: {
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true
            }
        }
    },
    configureWebpack: {
        performance: {
            hints: false
        }
    },
    publicPath: '/',
    outputDir: 'dist'
} 