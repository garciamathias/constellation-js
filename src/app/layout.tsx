import Script from 'next/script'
import '@/components/css/base.css'
import '@/components/css/layout.css'
import '@/components/css/messages.css'
import '@/components/css/input.css'
import '@/components/css/markdown.css'
import '@/components/css/math.css'
import '@/components/css/prism-custom.css'
import '@/components/css/utilities.css'

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
        <link rel="icon" href="/static/images/logo.png" type="image/x-icon" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" />
      </head>
      <body>
        {children}
        
        {/* Core scripts */}
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js" strategy="afterInteractive" />
        <Script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js" strategy="afterInteractive" />
        
        {/* Prism language components */}
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-python.min.js" strategy="afterInteractive" />
        {/* ...Add all other Prism language components... */}
        
        {/* Prism plugins */}
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/toolbar/prism-toolbar.min.js" strategy="afterInteractive" />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js" strategy="afterInteractive" />
        
        {/* MathJax */}
        <Script id="mathjax-config" strategy="beforeInteractive">
          {`
            window.MathJax = {
              tex: {
                inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
                displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],
                processEscapes: true
              },
              svg: {
                fontCache: 'global'
              },
              options: {
                enableMenu: false
              }
            };
          `}
        </Script>
        <Script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js" strategy="afterInteractive" />
      </body>
    </html>
  )
}
