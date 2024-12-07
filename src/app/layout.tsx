import '@/components/css/globals.css'
import '@/components/css/base.css'
import '@/components/css/layout.css'
import '@/components/css/input.css'
import '@/components/css/math.css'
import '@/components/css/prism-custom.css'
import { Inter } from 'next/font/google'
import { MATHJAX_CONFIG } from '../config/MathJaxConfig';
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Chat LLM Interface',
  description: 'Interface de discussion avec différents LLMs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Base Prism.js */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>

        {/* Prism Language Components */}
        <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-python.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-java.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-javascript.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-typescript.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-bash.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-markdown.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-json.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-yaml.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-tex.min.js"></script>

        {/* Add specific style for icons */}
        <style dangerouslySetInnerHTML={{
          __html: `
            img[src*="icons/"] {
              width: auto;
              height: auto;
            }
          `
        }} />

        {/* MathJax Configuration */}
        <Script
          id="mathjax-config"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.MathJax = ${JSON.stringify(MATHJAX_CONFIG)};`,
          }}
        />
        <Script
          id="mathjax-script"
          strategy="afterInteractive"
          src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
