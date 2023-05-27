
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
        httpLinkOptions: {
          headers: {
            'x-tenant': 'test',
          },
        },
      }
    },
  },
  vuestic: {
    config: {
      // Config here
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
