import { marked } from 'marked';

export class RenderingService {
    private static instance: RenderingService;
    
    private constructor() {}

    static getInstance(): RenderingService {
        if (!RenderingService.instance) {
            RenderingService.instance = new RenderingService();
        }
        return RenderingService.instance;
    }

    private protectLatexFormulas(content: string): string {
        return content
            .replace(/\\\[([\s\S]*?)\\\]/g, (match, formula) => 
                `@@LATEX_DISPLAY@@${encodeURIComponent(formula)}@@`)
            .replace(/\\\(([\s\S]*?)\\\)/g, (match, formula) => 
                `@@LATEX_INLINE@@${encodeURIComponent(formula)}@@`)
            .replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => 
                `@@LATEX_DISPLAY@@${encodeURIComponent(formula)}@@`)
            .replace(/\$([\s\S]*?)\$/g, (match, formula) => 
                `@@LATEX_INLINE@@${encodeURIComponent(formula)}@@`);
    }

    private restoreLatexFormulas(content: string): string {
        return content
            .replace(/@@LATEX_DISPLAY@@(.*?)@@/g, (match, formula) => 
                `\\[${decodeURIComponent(formula)}\\]`)
            .replace(/@@LATEX_INLINE@@(.*?)@@/g, (match, formula) => 
                `\\(${decodeURIComponent(formula)}\\)`);
    }

    private containsLatex(content: string): boolean {
        return /\\\[|\\\]|\\\(|\\\)|\$\$|\$/g.test(content);
    }

    private async typeset(element: HTMLElement) {
        if (window.MathJax) {
            try {
                await window.MathJax.typesetPromise([element]);
            } catch (error) {
                console.error('Error rendering MathJax:', error);
            }
        }
    }

    private addCodeWrappers(tempDiv: HTMLDivElement) {
        tempDiv.querySelectorAll('pre').forEach(pre => {
            const wrapper = document.createElement('div');
            wrapper.className = 'code-block-wrapper';
            wrapper.style.position = 'relative';
            pre.parentNode?.insertBefore(wrapper, pre);
            wrapper.appendChild(pre);
        });
    }

    async render(content: string): Promise<string> {
        try {
            const protectedContent = this.protectLatexFormulas(content);
            const htmlContent = await marked(protectedContent);

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlContent;

            // Add table wrappers
            tempDiv.querySelectorAll('table').forEach(table => {
                const wrapper = document.createElement('div');
                wrapper.className = 'table-container';
                table.parentNode?.insertBefore(wrapper, table);
                wrapper.appendChild(table);
            });

            // Add code wrappers
            this.addCodeWrappers(tempDiv);

            const finalContent = this.restoreLatexFormulas(tempDiv.innerHTML);

            return finalContent;
        } catch (error) {
            console.error('Error rendering content:', error);
            return content;
        }
    }

    async streamContent(chunk: string, element: HTMLElement): Promise<void> {
        try {
            const renderedContent = await this.render(chunk);
            if (element) {
                element.innerHTML = renderedContent;
                
                if (this.containsLatex(chunk)) {
                    await this.typeset(element);
                }
                
                if (window.Prism) {
                    window.Prism.highlightAllUnder(element);
                }
            }
        } catch (error) {
            console.error('Error streaming content:', error);
        }
    }
}