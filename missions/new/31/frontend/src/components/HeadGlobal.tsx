import Head from 'next/head'
import { app } from 'appConfig'
import { useTheme } from 'next-themes'

export default function HeadGlobal() {
  const { resolvedTheme } = useTheme()
  return (
    <Head>
      <meta charSet="utf-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta
        name="viewport"
        content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
      />

      <meta name="apple-mobile-web-app-title" content={app.name} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="application-name" content={app.name} />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />

      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="theme-color" content={resolvedTheme === 'dark' ? app.themeColorDark : app.themeColor} />

      <link rel="apple-touch-icon" href={app.image} />
      <link rel="icon" type="image/png" sizes="512x512" href={app.image} />

      <link rel="icon" href={app.favicon} />

      {/* <link rel="manifest" href="/manifest.json" /> */}

      <meta property="og:type" content="website" />
      <meta property="og:title" content={app.title} />
      <meta property="og:description" content={app.description} />
      <meta property="og:site_name" content={app.name} />
      <meta property="og:url" content={app.url} />
      <meta property="og:image" content={app.image} />

      <meta name="description" content={app.description} />
      <meta name="keywords" content={app.keywords} />
      <title>{app.title}</title>
    </Head>
  )
}
