import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { js_beautify } from 'js-beautify';
import { KNOWN_OPERATORS, parseConditionValue, stringifyConditionValue } from 'src/app/utils/rule-value.util';

@Component({
  selector: 'app-rules-tree-editor',
  templateUrl: './rules-tree-editor.component.html',
  styleUrls: ['./rules-tree-editor.component.css'],
})
export class RulesTreeEditorComponent implements OnChanges {
  @Input() rules: any[] = [];
  @Input() functions: Record<string, string> = {};
  @Output() rulesChange = new EventEmitter<any[]>();
  @Output() functionsChange = new EventEmitter<Record<string, string>>();

  ngOnChanges(changes: SimpleChanges): void {
    // Only beautify when a genuinely new functions object arrives (file load,
    // raw-JSON apply) -- not on every keystroke, since editing a function's
    // own textarea re-emits the same object reference and would otherwise
    // reformat the text out from under the user's cursor while they type.
    if (changes['functions'] && changes['functions'].currentValue) {
      Object.keys(this.functions).forEach((name) => {
        try {
          this.functions[name] = js_beautify(this.functions[name], { indent_size: 2 });
        } catch {
          // leave malformed/non-JS content as-is
        }
      });
    }
  }

  operators = KNOWN_OPERATORS;
  stringifyValue = stringifyConditionValue;
  newFunctionName = '';
  addingFunction = false;
  functionNameError = '';

  private emitRules(): void {
    this.rulesChange.emit(this.rules);
  }

  private emitFunctions(): void {
    this.functionsChange.emit(this.functions);
  }

  private paramRows = new WeakMap<any, { key: string; value: string }[]>();

  conditionsOf(rule: any): any[] {
    rule.conditions = rule.conditions || { all: [] };
    rule.conditions.all = rule.conditions.all || [];
    return rule.conditions.all;
  }

  // Returns a stable row array (cached per rule) instead of Object.entries(),
  // which would create new tuple objects every call and make ngFor rebuild
  // the inputs (losing focus) on every keystroke.
  paramsOf(rule: any): { key: string; value: string }[] {
    rule.event = rule.event || { type: '', params: {} };
    rule.event.params = rule.event.params || {};
    if (!this.paramRows.has(rule)) {
      this.paramRows.set(
        rule,
        Object.entries(rule.event.params).map(([key, value]) => ({ key, value: String(value) }))
      );
    }
    return this.paramRows.get(rule)!;
  }

  private syncParams(rule: any): void {
    const params: Record<string, any> = {};
    this.paramsOf(rule).forEach((row) => {
      if (row.key) {
        params[row.key] = row.value;
      }
    });
    rule.event.params = params;
    this.emitRules();
  }

  onValueInput(condition: any, raw: string): void {
    condition.value = parseConditionValue(raw, condition.operator);
    this.emitRules();
  }

  addRule(): void {
    this.rules.push({
      conditions: { all: [{ fact: '', operator: 'isEqualTo', value: '' }] },
      event: { type: '', params: {} },
    });
    this.emitRules();
  }

  deleteRule(index: number): void {
    this.rules.splice(index, 1);
    this.emitRules();
  }

  addCondition(rule: any): void {
    this.conditionsOf(rule).push({ fact: '', operator: 'isEqualTo', value: '' });
    this.emitRules();
  }

  deleteCondition(rule: any, index: number): void {
    this.conditionsOf(rule).splice(index, 1);
    this.emitRules();
  }

  addParam(rule: any): void {
    const rows = this.paramsOf(rule);
    const existingKeys = new Set(rows.map((r) => r.key));
    let key = 'param';
    let n = 1;
    while (existingKeys.has(key)) {
      key = `param${n++}`;
    }
    rows.push({ key, value: '' });
    this.syncParams(rule);
  }

  deleteParamRow(rule: any, row: { key: string; value: string }): void {
    const rows = this.paramsOf(rule);
    const index = rows.indexOf(row);
    if (index > -1) {
      rows.splice(index, 1);
    }
    this.syncParams(rule);
  }

  onParamRowChange(rule: any): void {
    this.syncParams(rule);
  }

  onRuleFieldChange(): void {
    this.emitRules();
  }

  startAddFunction(): void {
    this.addingFunction = true;
    this.newFunctionName = '';
    this.functionNameError = '';
  }

  cancelAddFunction(): void {
    this.addingFunction = false;
  }

  confirmAddFunction(): void {
    const name = this.newFunctionName.trim();
    if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name)) {
      this.functionNameError = 'Enter a valid JS function name (letters, digits, _ or $, not starting with a digit).';
      return;
    }
    if (name in this.functions) {
      this.functionNameError = 'A function with this name already exists.';
      return;
    }
    this.functions[name] = `function ${name}() {\n\n}`;
    this.addingFunction = false;
    this.emitFunctions();
  }

  deleteFunction(name: string): void {
    delete this.functions[name];
    this.emitFunctions();
  }

  onFunctionBodyChange(): void {
    this.emitFunctions();
  }

  functionNames(): string[] {
    return Object.keys(this.functions);
  }
}
