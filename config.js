module.exports = {
  development: {
    PORT: 3000,
    MULESOFT_URL: 'http://flowbridge.us-e2.cloudhub.io/api',
    CLIENT_ID: '6f0b2e5229c7455091966ef898fd6f68',
    CLIENT_SECRET: '8041a365CDfb448c88a7780b7699A6aC'
  },
  test: {
    PORT: process.env.PORT || 3000,
    MULESOFT_URL: process.env.MULESOFT_URL,
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET
  },
  production: {
    PORT: process.env.PORT || 3000,
    MULESOFT_URL: process.env.MULESOFT_URL,
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET
  }
}; 