import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { useHead } from '#imports'

export default defineNuxtPlugin(() => {
    const runtimeConfig = useRuntimeConfig()
    const tawkto = runtimeConfig.public.tawkto

    useHead({
        script: [
            {
                src: `https://embed.tawk.to/${tawkto}`,
                type: 'text/javascript',
                async: true,
                defer: true
            }
        ]
    })
})