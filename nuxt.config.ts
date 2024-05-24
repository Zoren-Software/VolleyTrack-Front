
import * as dotenv from 'dotenv'

export default defineNuxtConfig({
  modules: [
    '@vuestic/nuxt',
    '@nuxtjs/apollo',
  ],
  ssr: false,
  apollo: {
    autoImports: true,
    authType: 'Bearer',
    authHeader: 'Authorization',
    tokenStorage: 'cookie',
    proxyCookies: true,
    clients: {
      default: {
        httpEndpoint: dotenv.config().parsed?.GRAPHQL_ENDPOINT,
        tokenStorage: 'localStorage',
      }
    },
  },
  runtimeConfig: {
    public: {
      tawkto: '', // can be overridden by NUXT_PUBLIC_TAWKTO environment variable
      nameApplication: '', // can be overridden by NUXT_PUBLIC_NAME_APPLICATION environment variable
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
      { rel: 'stylesheet', href: "https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@0,400;1,700&display=swap" },
      { rel: 'stylesheet', href: "https://fonts.googleapis.com/icon?family=Material+Icons" }
    ]
  },
  css: [
    '~/node_modules/material-design-icons-iconfont/dist/material-design-icons.css',
  ],
})
