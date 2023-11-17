# dApp Starter Boilerplate

A dApp starter kit template to quick start a dapp project with Next.js + Tailwind CSS + Ethers + wagmi + RainbowKit.

Other tools/components included: Headless UI, Heroicons, Autoprefixer, Sass, PostCSS, ESLint, Prettier.

Live preview for this repo: https://dapp-starter.aris.ac

## Getting Started

```bash
# Install Dependencies
yarn

# Run the development server
yarn dev
```

### ENV

```bash
# Copy ENV File
cp .env.example .env.local
```

### Configs

- `src/appConfig.ts`: app name, title, SEO etc.
- `src/pages/_app.tsx`: chains, providers, wallet connectors

### Scripts

**Next.js**

```bash
# Build
yarn build

# Start server with build files
yarn start
```

**Prettier**

```bash
# Use Prettier to do Format Check for files under ./src
yarn fc

# Use Prettier to do Format Fix for files under ./src
yarn ff
```

**Contract Types**

```bash
# Generate contract types from src/contracts/*.json
yarn compile-contract-types
```

### Deployment

The easiest way to deploy your Next.js app is to use [Vercel](https://vercel.com/), by the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## More

Learn about components of this kit is using:

- [Next.js](https://nextjs.org/) - React Framework by Vercel
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS Framework
- [Ethers.js](https://github.com/ethers-io/ethers.js/) - Compact library for interacting with Ethereum.
- [wagmi](https://wagmi.sh/) - React Hooks for Ethereum
- [RainbowKit](https://rainbowkit.com/) - React library for wallet connections with dApp.
- [Headless UI](https://headlessui.dev/) - Unstyled, fully accessible UI components

## License

This app is open-source and licensed under the MIT license. For more details, check the [License file](LICENSE).
