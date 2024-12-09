import Script from 'next/script'
import '@/components/css/base.css'
import '@/components/css/layout.css'
import '@/components/css/messages.css'
import '@/components/css/input.css'
import '@/components/css/markdown.css'
import '@/components/css/math.css'
import '@/components/css/prism-custom.css'
import '@/components/css/utilities.css'
import { Scripts } from '@/components/Scripts'

export const metadata = {
  title: 'Constellation',
  description: 'Interface de discussion avec différents LLMs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/logo.png" type="image/x-icon" />
        {/* Prism.js Styles */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/toolbar/prism-toolbar.min.css" rel="stylesheet" />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.css" rel="stylesheet" />
        <link rel="stylesheet" href="/static/css/base.css" />
        <link rel="stylesheet" href="/static/css/auth.css" />
        {/* ...autres liens... */}
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
