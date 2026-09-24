import {
  Component,
  AfterViewChecked,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import * as Prism from 'prismjs';
import { js_beautify } from 'js-beautify';
import xmlFormatter from 'xml-formatter';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { ThemeService } from 'src/app/services/theme.service';
import { RunrulesService } from 'src/app/services/runrules.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ErrConnectComponent } from 'src/app/popups/err-connect/err-connect.component';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { XmlErrorDialogComponent } from './popups/xml-error-dialog/xml-error-dialog.component';
import { toLabeledRules } from 'src/app/utils/rule-label.util';
import { saveAs } from 'file-saver';
@Component({
  selector: 'app-sand-box',
  templateUrl: './sand-box.component.html',
  styleUrls: ['./sand-box.component.css'],

})
export class SandBoxComponent {
  private determineServerURL(): string {
    const isLocalhost =
      window.location.hostname === 'localhost' &&
      window.location.port === '4200';
    if (isLocalhost) {
      return 'https://rule-forge-two.vercel.app';
    } else {
      return window.location.origin;
    }
  }
  isDarkMode = false;
  audit: boolean = false;
  run: boolean = true;
  rules: any[] = [];
  xmlFileName: string = '';
  Dev:any=""
  functions: { [key: string]: string } = {};
  @ViewChild('jsonFileInput', { static: false }) jsonFileInput!: ElementRef;
  @ViewChild('xmlFileInput', { static: false }) xmlFileInput!: ElementRef;
  @ViewChild('xmlCodeBlock', { static: false }) xmlCodeBlock!: ElementRef;
  @ViewChild('xmlResultPre', { static: false }) xmlResultPre!: ElementRef;
  jsonData: any = null;
  displayJsonData: any = null;
  displayRules: Record<string, any> = {};
  jsonString: string = '';
  jsonFileName: string = '';
  xmlString: string = '';
  xmlResult: string = '';
  resultData: any = null;
  MatrixRun:boolean=true
  displayResult: boolean = false;
  rulesViewMode: 'tree' | 'edit' | 'raw' = 'tree';
  rawJsonEditText: string = '';
  constructor(private spinner: NgxSpinnerService,private route: ActivatedRoute,
    private router: Router,private themeService: ThemeService,private RunrulesService: RunrulesService,private dialog: MatDialog) {}

  ngOnInit() {
    this.isDarkMode = this.themeService.isDark();
    let userdata = sessionStorage.getItem("userId")
    if(userdata){
      this.Dev = userdata
    }else{
      this.Dev = "Developer"
    }
  }
  formaterr:boolean=false
  formatXml(inputXml?: string): boolean {
    try {
      const sourceXml = inputXml ?? this.xmlString;
      this.xmlString = xmlFormatter(sourceXml, {
        indentation: '  ',
        collapseContent: true,
        lineSeparator: '\n',
      });
      return true;
    } catch (error: any) { // Keep 'any' here for robustness, or cast more specifically
      console.error('XML formatting error:', error);

      this.dialog.open(XmlErrorDialogComponent, {
        data: {
          message: 'Failed to format XML. Please check for syntax issues.',
          errorMessage: error // Pass the entire error object here
        }
      });
      return false;
    }
  }
  sendDataToRulesEngine(): void {
    this.MatrixRun=true;
    this.spinner.show();
    setTimeout(() => {
      this.xmlResult=""
      this.resultData = null;
      if (!this.jsonData || !this.xmlString) {
        alert('Please upload both JSON and XML files before executing rules.');
        return;
      }

      const payload = {
        rules: this.jsonData,
        xml: this.xmlString,
      };


      this.RunrulesService.executeRules(payload).subscribe(
        (response) => {
          if(response.quote.message){
            if(response.quote.message=="global[product] is not a function"){
              this.xmlResult = "Product type issue !";
              this.resultData = { error: true, message: 'Product type issue !' };
              this.openErrorModal('Product type issue !');
            }else{
              this.xmlResult = response.quote.message;
              this.resultData = { error: true, message: response.quote.message };
              this.openErrorModal(response.quote.message);
            }
          }else{
            this.xmlResult =  JSON.stringify(response.quote, null, 2);
            this.resultData = response.quote;
          }
          console.log("Res:", this.xmlResult);
          this.spinner.hide();
        },
        (error: HttpErrorResponse) => {
          console.error('Error executing rules:', error);
          const detail = error?.error?.message || error?.error?.error || error?.message || 'Unknown error';
          this.resultData = { error: true, status: error?.status ?? null, message: detail };
          this.openErrorModal('Failed to process rules: ' + detail);
          this.spinner.hide();
        }
      );

    }, 500);

  }
  openErrorModal(message: string): void {
    this.dialog.open(ErrConnectComponent, {
      data: { message: message }
    });
  }
  triggerJsonFileInput(): void {
    this.MatrixRun=false;
    this.xmlResult=""
    this.resultData = null;
    this.jsonFileInput.nativeElement.click();
  }
  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.themeService.setTheme(this.isDarkMode);
  }
  triggerXmlFileInput(): void {
    this.MatrixRun=false;
    this.xmlResult=""
    this.resultData = null;
    this.xmlString = '';
    this.xmlFileInput.nativeElement.click();
  }
  changeTab(tab: string) {
    if (tab == 'run') {
      this.audit = false;
      this.run = true;
    } else {
      this.audit = true;
      this.run = false;
    }
  }
  loadXmlFile(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.xmlFileName = file.name;
      this.spinner.show();
      setTimeout(() => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(
              e.target.result,
              'application/xml'
            );
            this.xmlString = new XMLSerializer().serializeToString(xmlDoc);
          } catch (error) {
            alert('Invalid XML file');
          }
          setTimeout(() => {
            this.spinner.hide();
          }, 1000);
        };
        reader.readAsText(file);
      }, 1000);

    }else{
      setTimeout(() => {
        this.spinner.hide();
      }, 1000);
    }
  }

  loadJsonFile(event: any): void {
    let file = event.target.files[0];
    if (file) {
      this.spinner.show();
      setTimeout(() => {
        this.jsonFileName = file.name;
        const reader = new FileReader();
        reader.onload = (e: any) => {
          try {
            this.applyParsedJson(JSON.parse(e.target.result));
          } catch (error) {
            alert('Invalid JSON file');
          }
          setTimeout(() => {
            this.spinner.hide();
          }, 1000);
        };
        reader.readAsText(file);
      }, 1000);

    }else{
        this.spinner.hide();
    }
  }
  functionCards: { name: string; code: string; html: string; expanded: boolean; copied: boolean; copyFailed: boolean }[] = [];

  private buildFunctionCards(): void {
    this.functionCards = Object.entries(this.functions).map(([name, fn]) => {
      const code = this.formatFunction(fn as string);
      return {
        name,
        code,
        html: Prism.highlight(code, Prism.languages['javascript'], 'javascript'),
        expanded: this.functionCards.find((c) => c.name === name)?.expanded ?? true,
        copied: false,
        copyFailed: false,
      };
    });
  }

  toggleFunctionCard(card: { expanded: boolean }): void {
    card.expanded = !card.expanded;
  }

  scrollToFunctionCard(name: string): void {
    const card = this.functionCards.find((c) => c.name === name);
    if (card) {
      card.expanded = true;
    }
    setTimeout(() => {
      document.getElementById('function-card-' + name)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  private legacyCopy(text: string): boolean {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    document.body.removeChild(textarea);
    return ok;
  }

  copyFunctionCode(card: { code: string; copied: boolean; copyFailed: boolean }): void {
    const markCopied = () => {
      card.copied = true;
      setTimeout(() => (card.copied = false), 1500);
    };
    const markFailed = () => {
      card.copyFailed = true;
      setTimeout(() => (card.copyFailed = false), 1500);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(card.code).then(markCopied, () => {
        if (this.legacyCopy(card.code)) {
          markCopied();
        } else {
          markFailed();
        }
      });
    } else if (this.legacyCopy(card.code)) {
      markCopied();
    } else {
      markFailed();
    }
  }

  formatFunction(funcValue: string): string {
    try {
      return js_beautify(funcValue, { indent_size: 2 });
    } catch (error) {
      console.error('Error formatting function:', error);
      return funcValue;
    }
  }

  private refreshDisplay(): void {
    this.jsonString = JSON.stringify(this.jsonData, null, 2);
    this.displayRules = toLabeledRules(this.rules);
    const displayFunctions = Object.fromEntries(
      Object.entries(this.functions).map(([name, fn]) => [name, this.formatFunction(fn as string)])
    );
    this.displayJsonData = { ...this.jsonData, rules: this.displayRules, functions: displayFunctions };
    this.buildFunctionCards();
  }

  private applyParsedJson(parsed: any): void {
    this.jsonData = parsed;
    this.rules = parsed.rules || [];
    this.functions = parsed.functions || {};
    this.refreshDisplay();
  }

  setRulesViewMode(mode: 'tree' | 'edit' | 'raw'): void {
    if (mode === 'raw') {
      this.rawJsonEditText = JSON.stringify(this.jsonData, null, 2);
    }
    this.rulesViewMode = mode;
  }

  applyRawJsonEdit(): void {
    try {
      this.applyParsedJson(JSON.parse(this.rawJsonEditText));
      this.rulesViewMode = 'tree';
    } catch (error: any) {
      this.openErrorModal('Invalid JSON: ' + error.message);
    }
  }

  // Inline edits already write through live (see onRulesEdited/onFunctionsEdited);
  // this just gives an explicit confirm action and returns to Tree View, symmetric with Raw Edit.
  applyInlineEdits(): void {
    this.rulesViewMode = 'tree';
  }

  onRulesEdited(updatedRules: any[]): void {
    this.rules = updatedRules;
    this.jsonData = { ...this.jsonData, rules: this.rules, functions: this.functions };
    this.refreshDisplay();
  }

  onFunctionsEdited(updatedFunctions: Record<string, string>): void {
    this.functions = updatedFunctions;
    this.jsonData = { ...this.jsonData, rules: this.rules, functions: this.functions };
    this.refreshDisplay();
  }

  downloadRulesJson(): void {
    const blob = new Blob([JSON.stringify(this.jsonData, null, 2)], { type: 'application/json' });
    saveAs(blob, this.jsonFileName || 'rules.json');
  }

  downloadXmlPayload(): void {
    const blob = new Blob([this.xmlString], { type: 'application/xml' });
    saveAs(blob, 'payload.xml');
  }

  reuploadFiles(): void {
    this.jsonData = null;
    this.jsonString = '';
    this.jsonFileName = '';
    this.rulesViewMode = 'tree';

    if (this.jsonFileInput) {
      this.jsonFileInput.nativeElement.value = '';
    }

    this.triggerJsonFileInput();
  }

  logout(){
    this.MatrixRun=false;
    this.xmlResult=""
    this.resultData = null;
    this.spinner.show();
    setTimeout(() => {
      this.router.navigate(['/sandgate']);
      this.spinner.hide();
    }, 1000);
  }
}
