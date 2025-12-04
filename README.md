## About the project

This is a free development project, which is being developed with the aim of practicing and developing web infrastructure and programming skills.

This project will be 100% frontend, using [Nuxt3](https://nuxt.com) and [Vue3](https://vuejs.org).

This project will be 100% free and will be maintained by the company [Zoren Software](http://zorensoftware.com/).

## Contributions

Thank you for considering contributing to the project! To contribute, simply send a pull request or open an issue on GitHub.

## License

This project is open source software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## Nuxt 3 Minimal Starter

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install the dependencies:

```bash
# pnpm
pnpm install
```

Node version: v20.11.1 (recomendado) ou superior

```
node --version
v20.11.1
```

**Nota:** Versões mais recentes do Node.js (v24+) podem exibir warnings de depreciação que são suprimidos automaticamente no script de desenvolvimento.

## Development Server

Start the development server on http://test.volleytrack.localhost:3000

```bash
pnpm run dev
```

### Config Domain for Development

Add the following to your `/etc/hosts` file:

```
# VOLLEYTRACK

127.0.0.1   pma.volleytrack.local
127.0.0.1   api.volleytrack.local
127.0.0.1   horizon.volleytrack.local
```

### Development Local Network Access

To access the development server from:

```bash
http://test.volleytrack.localhost:3000
```

## Production

Build the application for production:

```bash
pnpm run build
```

Locally preview production build:

```bash
pnpm run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
