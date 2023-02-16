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
})
