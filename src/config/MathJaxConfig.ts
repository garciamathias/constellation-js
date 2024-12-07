export const MATHJAX_CONFIG = {
  loader: { 
    load: ['input/tex-full', 'output/chtml', '[tex]/ams']
  },
  tex: {
    inlineMath: [['(', ')'], ['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    processEscapes: true,
    processEnvironments: true,
    tags: 'ams',
    packages: {
      '[+]': ['ams', 'noerrors', 'noundefined', 'html']
    },
    macros: {
      // Ajout de macros courantes
      RR: '{\\mathbb{R}}',
      NN: '{\\mathbb{N}}',
      ZZ: '{\\mathbb{Z}}'
    }
  },
  startup: {
    typeset: true,
    ready: () => {
      if (window.MathJax) {
        window.MathJax.startup.defaultReady();
      }
    }
  },
  options: {
    enableMenu: false,
    processHtmlClass: 'mathjax'
  },
  chtml: {
    scale: 1,
    minScale: .5,
    mtextInheritFont: true,
    matchFontHeight: true
  }
};