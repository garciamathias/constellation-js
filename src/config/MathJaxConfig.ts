export const MATHJAX_CONFIG = {
  loader: { 
    load: ['input/tex-full', 'output/chtml', '[tex]/ams']
  },
  tex: {
    inlineMath: [['(', ')'], ['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    processEscapes: true,
    processRefs: true,
    processEnvironments: true,
    tags: 'ams',
    packages: {
      '[+]': ['ams', 'noerrors', 'noundefined', 'html', 'configmacros']
    },
    macros: {
      // Ajout de macros courantes
      RR: '{\\mathbb{R}}',
      NN: '{\\mathbb{N}}',
      ZZ: '{\\mathbb{Z}}',
      // Ajout de macros supplémentaires pour les cas problématiques
      'int': '\\int\\!',
      'dx': '\\,\\mathrm{d}x',
    }
  },
  startup: {
    typeset: true,
    ready: () => {
      if (window.MathJax) {
        // Configuration additionnelle pour la gestion des erreurs
        window.MathJax.startup.defaultReady();
        window.MathJax.startup.input[0].preFilters.add(({math}) => {
          if (math.display) {
            math.math = math.math.replace(/\\text/g, '\\mtext');
          }
        });
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