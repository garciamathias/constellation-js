import { MathJaxObject } from 'mathjax-full';

declare global {
  interface Window {
    MathJax: MathJaxObject;
  }
}

const LATEX_PLACEHOLDER = '__LATEX_FORMULA__';
let placeholderCounter = 0;

export interface LatexMapping {
  placeholder: string;
  formula: string;
}

export const protectLatexFormulas = (content: string): { text: string; mappings: LatexMapping[] } => {
  const mappings: LatexMapping[] = [];
  const text = content.replace(/\$\$(.*?)\$\$|\$(.*?)\$/g, (match) => {
    const placeholder = `${LATEX_PLACEHOLDER}${placeholderCounter++}`;
    mappings.push({ placeholder, formula: match });
    return placeholder;
  });
  return { text, mappings };
};

export const restoreLatexFormulas = (content: string, mappings: LatexMapping[]): string => {
  let restoredContent = content;
  mappings.forEach(({ placeholder, formula }) => {
    restoredContent = restoredContent.replace(placeholder, formula);
  });
  return restoredContent;
};

export const containsLatex = (content: string): boolean => {
  return /\$\$(.*?)\$\$|\$(.*?)\$/g.test(content);
};

export const renderMathJax = async (element: HTMLElement): Promise<void> => {
  if (typeof window !== 'undefined' && window.MathJax) {
    try {
      await window.MathJax.typesetPromise([element]);
    } catch (error) {
      console.error('Error during MathJax typesetting:', error);
    }
  }
};

export const sanitizeMathContent = (content: string): string => {
  return content
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&(?!(?:amp|lt|gt|quot|apos);)/g, '&amp;');
};

export const preprocessLatex = (content: string): string => {
  return content
    .replace(/\\\[/g, '$$')
    .replace(/\\\]/g, '$$')
    .replace(/\\\(/g, '$')
    .replace(/\\\)/g, '$');
};
