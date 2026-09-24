import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import * as Prism from 'prismjs';

@Component({
  selector: 'app-xml-code-editor',
  templateUrl: './xml-code-editor.component.html',
  styleUrls: ['./xml-code-editor.component.css'],
})
export class XmlCodeEditorComponent implements OnChanges {
  @Input() code = '';
  @Output() codeChange = new EventEmitter<string>();

  @ViewChild('preEl') preEl!: ElementRef<HTMLElement>;

  highlightedHtml = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['code']) {
      this.rehighlight();
    }
  }

  onInput(newCode: string): void {
    this.code = newCode;
    this.codeChange.emit(newCode);
    this.rehighlight();
  }

  onScroll(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    const pre = this.preEl?.nativeElement;
    if (pre) {
      pre.scrollTop = textarea.scrollTop;
      pre.scrollLeft = textarea.scrollLeft;
    }
  }

  private rehighlight(): void {
    this.highlightedHtml = Prism.highlight(this.code || '', Prism.languages['markup'], 'markup');
  }
}
