import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    ssr: true, // Nuxt ile tam uyumlu Server-Side Rendering desteği
    components,
    directives,
    theme: {
      defaultTheme: 'light',
      themes: {
        light: {
          colors: {
            primary: '#1976D2', // Kurumsal İK Mavisi
            secondary: '#424242',
            success: '#4CAF50',
            error: '#FF5252'
          }
        }
      }
    }
  })

  // Nuxt uygulamamıza Vuetify'ı enjekte ediyoruz
  nuxtApp.vueApp.use(vuetify)
})