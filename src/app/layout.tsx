import '@/components/css/base.css'
import '@/components/css/layout.css'
import '@/components/css/messages.css'
import '@/components/css/input.css'
import '@/components/css/markdown.css'
import '@/components/css/math.css'
import '@/components/css/prism-custom.css'
import '@/components/css/utilities.css'
import '@/components/css/auth.css'
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
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
