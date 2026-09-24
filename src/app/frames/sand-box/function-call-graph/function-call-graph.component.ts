import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { buildCallGraph, CallGraph, ENGINE_NODE_ID, GraphNode } from 'src/app/utils/call-graph.util';

@Component({
  selector: 'app-function-call-graph',
  templateUrl: './function-call-graph.component.html',
  styleUrls: ['./function-call-graph.component.css'],
})
export class FunctionCallGraphComponent implements OnChanges {
  @Input() functions: Record<string, string> = {};
  @Output() nodeClick = new EventEmitter<string>();

  graph: CallGraph | null = null;
  readonly engineNodeId = ENGINE_NODE_ID;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['functions']) {
      this.graph = Object.keys(this.functions).length ? buildCallGraph(this.functions) : null;
    }
  }

  onNodeClick(node: GraphNode): void {
    if (node.kind !== 'engine') {
      this.nodeClick.emit(node.id);
    }
  }

  edgePath(fromId: string, toId: string): string {
    const from = this.graph?.nodes.find((n) => n.id === fromId);
    const to = this.graph?.nodes.find((n) => n.id === toId);
    if (!from || !to) {
      return '';
    }
    const midY = (from.y + to.y) / 2;
    return `M ${from.x} ${from.y + 20} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y - 20}`;
  }
}
