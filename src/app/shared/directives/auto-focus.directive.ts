import { Directive, ElementRef, OnInit, Input, Renderer2 } from '@angular/core';
import { FocusMonitor } from '@angular/cdk/a11y';

@Directive({
  selector: '[appAutoFocus]',
  standalone: true,
})
export class AutoFocusDirective implements OnInit {
  @Input() appAutoFocus: boolean | string = true;
  @Input() autoFocusDelay: number = 0;
  @Input() autoFocusMethod: 'focus' | 'program' | 'mouse' | 'touch' = 'program';
  @Input() addFocusClass: boolean = true;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private focusMonitor: FocusMonitor,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    // Verificar se deve aplicar autofocus
    if (this.shouldApplyAutoFocus()) {
      this.applyAutoFocus();
    }
  }

  private shouldApplyAutoFocus(): boolean {
    // Se for string, verificar se não é 'false'
    if (typeof this.appAutoFocus === 'string') {
      return this.appAutoFocus !== 'false' && this.appAutoFocus !== '';
    }

    // Se for boolean
    return this.appAutoFocus === true;
  }

  private applyAutoFocus(): void {
    // Aplicar delay se especificado
    const delay = this.autoFocusDelay || 0;

    setTimeout(() => {
      const element = this.elementRef.nativeElement;

      if (!element || !this.isElementFocusable(element)) {
        console.warn('[AutoFocus] Elemento não é focável', element);
        return;
      }

      // Adicionar classe de foco se solicitado
      if (this.addFocusClass) {
        this.renderer.addClass(element, 'auto-focused');
      }

      // Aplicar foco usando o método especificado
      this.focusElement(element);

      console.debug('[AutoFocus] Foco aplicado', { element, method: this.autoFocusMethod });
    }, delay);
  }

  private focusElement(element: HTMLElement): void {
    switch (this.autoFocusMethod) {
      case 'program':
        this.focusMonitor.focusVia(element, 'program');
        break;
      case 'mouse':
        this.focusMonitor.focusVia(element, 'mouse');
        break;
      case 'touch':
        this.focusMonitor.focusVia(element, 'touch');
        break;
      case 'focus':
      default:
        element.focus();
        break;
    }
  }

  private isElementFocusable(element: HTMLElement): boolean {
    // Verificar se está visível
    if (!element.offsetParent && element.offsetHeight === 0 && element.offsetWidth === 0) {
      return false;
    }

    // Verificar se está desabilitado
    if (element.hasAttribute('disabled')) {
      return false;
    }

    // Verificar tabindex
    const tabindex = element.getAttribute('tabindex');
    if (tabindex === '-1') {
      return false;
    }

    // Verificar se é um elemento naturalmente focável
    const focusableElements = ['input', 'button', 'select', 'textarea', 'a', 'area'];

    const tagName = element.tagName.toLowerCase();
    const isFocusableTag = focusableElements.includes(tagName);
    const hasTabindex = tabindex !== null && tabindex !== '-1';
    const isContentEditable = element.contentEditable === 'true';

    return isFocusableTag || hasTabindex || isContentEditable;
  }
}
