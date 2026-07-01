// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  // Vuetify css dosyasının her sayfada otomatik yüklenmesini sağlıyoruz
  css: [
    'vuetify/styles'
  ],

  build: {
    transpile: ['vuetify']
  }
})
