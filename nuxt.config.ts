// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@vuestic/nuxt'],
  vuestic: {
    config: {
      // Config here
    },
    css: ['typography', 'reset', 'grid']
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
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/icon?family=Material+Icons' }
    ]
  },
  css: [
    '~/node_modules/material-design-icons-iconfont/dist/material-design-icons.css'
  ]
})
