
import * as dotenv from 'dotenv'

// Configurar dotenv para ser silencioso e obter variáveis de ambiente
const env = dotenv.config({ quiet: true }).parsed || {}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-11-21',
  experimental: {
    // Desabilita app manifest para evitar erro de resolução do #app-manifest
    appManifest: false,
  },
  modules: [
    '@vuestic/nuxt',
    '@nuxtjs/apollo',
  ],
  ssr: false,
  vite: {
    server: {
      // Dinâmico: lê de NUXT_ALLOWED_HOSTS (ex: "test.volleytrack.local,.volleytrack.com")
      // Padrão: local + produção (subdomínios de .volleytrack.local e .volleytrack.com)
      allowedHosts: (() => {
        const fromEnv = process.env.NUXT_ALLOWED_HOSTS
          ? process.env.NUXT_ALLOWED_HOSTS.split(',').map((h) => h.trim()).filter(Boolean)
          : []
        const defaultHosts = [
          'localhost',
          'local',
          'test',
          '.volleytrack.local', // subdomínios locais (test., api., etc.)
          '.volleytrack.com',   // subdomínios produção (test., app., etc.)
        ]
        return [...new Set([...defaultHosts, ...fromEnv])]
      })(),
      watch: {
        // Ignorar arquivos e pastas para reduzir file watchers
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/.nuxt/**',
          '**/.output/**',
          '**/dist/**',
          '**/coverage/**',
          '**/*.log',
          '**/.DS_Store',
          '**/pnpm-lock.yaml',
          '**/package-lock.json',
          '**/yarn.lock',
        ],
      },
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
    // Variáveis privadas (apenas servidor) - NÃO expostas no cliente
    // Usam prefixo NUXT_ (sem PUBLIC_) no .env
    stripeSecretKey: '', // can be overridden by NUXT_STRIPE_SECRET_KEY environment variable
    
    // Variáveis públicas (acessíveis no cliente e servidor)
    // Usam prefixo NUXT_PUBLIC_ no .env
    public: {
      tawkto: '', // can be overridden by NUXT_PUBLIC_TAWKTO environment variable
      nameApplication: '', // can be overridden by NUXT_PUBLIC_NAME_APPLICATION environment variable
      stripePublishableKey: '', // can be overridden by NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable
      // Prioridade: NUXT_PUBLIC_ (override em prod) > API_ENDPOINT > .env > fallback local
      apiEndpoint: process.env.NUXT_PUBLIC_API_ENDPOINT || process.env.API_ENDPOINT || env.API_ENDPOINT || 'http://api.volleytrack.local',
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
    'sweetalert2/dist/sweetalert2.css',
  ],
  app: {
    pageTransition: {
      name: 'page',
      mode: 'out-in',
    },
  },
})
