
import * as dotenv from 'dotenv'

// Configurar dotenv para ser silencioso e obter variáveis de ambiente
const env = dotenv.config({ quiet: true }).parsed || {}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-11-21',
  modules: [
    '@vuestic/nuxt',
    '@nuxtjs/apollo',
  ],
  ssr: false,
  vite: {
    server: {
      allowedHosts: [
        'test.volleytrack.local',
        'test.volleytrack.localhost',
        'localhost',
      ],
    },
  },
  apollo: {
    autoImports: true,
    authType: 'Bearer',
    authHeader: 'Authorization',
    tokenStorage: 'cookie',
    proxyCookies: true,
    clients: {
      default: {
        httpEndpoint: env.GRAPHQL_ENDPOINT,
        tokenStorage: 'localStorage',
      }
    },
  },
  runtimeConfig: {
    public: {
      tawkto: '', // can be overridden by NUXT_PUBLIC_TAWKTO environment variable
      nameApplication: '', // can be overridden by NUXT_PUBLIC_NAME_APPLICATION environment variable
      stripeSecretKey: '', // can be overridden by NUXT_PUBLIC_STRIPE_SECRET_KEY environment variable
      stripePublishableKey: '', // can be overridden by NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable
      apiEndpoint: env.API_ENDPOINT || 'http://api.volleytrack.local',
    }
  },
  vuestic: {
    config: {
        colors: {
            presets: {
                light: {
                    primary: '#FF4E1B',
                    myCoolColor: '#ff00ff',
                    onMyCoolColor: '#ffffff',
                    dark: '#131B23'
                }
            }
        },
    },
    css: true,
  },
  components: [
    {
      pathPrefix: true,
      extensions: ['.vue'],
    },
  ],
  head: {
    link: [
      //NOTE - List Icons https://fonts.google.com/icons?selected=Material+Icons
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/icon?family=Material+Icons' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/icon?family=Material+Icons+Outlined' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/icon?family=Material+Icons+Round' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/icon?family=Material+Icons+Sharp' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/icon?family=Material+Icons+Two+Tone' },
      // Material Symbols (versão mais nova)
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap' },
      { rel: 'stylesheet', href: "https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@0,400;1,700&display=swap" },
    ]
  },
  css: [
    '~/node_modules/material-design-icons-iconfont/dist/material-design-icons.css',
  ],
})
