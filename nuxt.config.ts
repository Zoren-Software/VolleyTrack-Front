// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@vuestic/nuxt'],
  vuestic: {
    config: {
      // Config here
    },
    css: ['typography', 'reset']
  },
  components: [
    {
      pathPrefix: true,
      extensions: ['.vue'],
    },
  ],
})
