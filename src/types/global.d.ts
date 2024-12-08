interface Window {
    MathJax: {
        typesetPromise: (elements: HTMLElement[]) => Promise<void>;
    };
    Prism: {
        highlightAllUnder: (element: HTMLElement) => void;
    };
}