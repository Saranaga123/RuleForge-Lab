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
import { MatDialog } from '@angular/material/dialog';
import { ErrConnectComponent } from 'src/app/popups/err-connect/err-connect.component';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { XmlErrorDialogComponent } from './popups/xml-error-dialog/xml-error-dialog.component';
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
      return 'https://ms.khutzi.com';
    } else {
      return window.location.origin;
    }
  }
  isDarkMode = false;
  audit: boolean = false;
  run: boolean = true;
  rules: any[] = [];
  Dev:any=""
  functions: { [key: string]: string } = {};
  @ViewChild('jsonFileInput', { static: false }) jsonFileInput!: ElementRef;
  @ViewChild('xmlFileInput', { static: false }) xmlFileInput!: ElementRef;
  @ViewChild('xmlCodeBlock', { static: false }) xmlCodeBlock!: ElementRef;
  @ViewChild('xmlResultPre', { static: false }) xmlResultPre!: ElementRef;
  jsonData: any = null;
  jsonString: string = '';
  jsonFileName: string = '';
  xmlString: string = '';
  xmlResult: string = '';
  MatrixRun:boolean=true
  displayResult: boolean = false;
  constructor(private spinner: NgxSpinnerService,private route: ActivatedRoute,
    private router: Router,private themeService: ThemeService,private RunrulesService: RunrulesService,private dialog: MatDialog) {}

  ngOnInit() {
    let theme = localStorage.getItem('app-theme')
    if(theme=='dark-theme'){
      this.isDarkMode = true
    }else{
      this.isDarkMode = false
    }
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
              this.openErrorModal('Product type issue !');
            }else{
              this.xmlResult = response.quote.message;
              this.openErrorModal(response.quote.message);
            }
          }else{
            this.xmlResult =  JSON.stringify(response.quote, null, 2);  
          }
          console.log("Res:", this.xmlResult);
          // Use the ViewChild reference to highlight the specific element
          if (this.xmlResult) {
            console.log("highlightXml",this.xmlResult);
            this.highlightXml();
          }
        },
        (error) => {
          console.error('Error executing rules:', error);
          this.openErrorModal('Failed to process rules. Check the Forge console for details.');
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
    this.jsonFileInput.nativeElement.click();
  }
  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.themeService.setTheme(this.isDarkMode);
  }
  triggerXmlFileInput(): void {
    this.MatrixRun=false;
    this.xmlResult=""
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
            this.highlightXml();
          } catch (error) {
            alert('Invalid XML file');
          }
        };
        reader.readAsText(file);
      }, 1000);

    }else{
      setTimeout(() => {
        this.spinner.hide();
      }, 1000);
    }
  }

  highlightXml(): void {
    setTimeout(() => {
      const xmlElement = document.querySelector('.language-xml');
      if (xmlElement) {
        Prism.highlightElement(xmlElement);
      }
    }, 0);
    setTimeout(() => {
      this.spinner.hide();
    }, 1000);
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
            this.jsonData = JSON.parse(e.target.result);
            this.jsonString = JSON.stringify(this.jsonData, null, 2);
            this.rules = this.jsonData.rules || [];
            this.functions = this.jsonData.functions || {};
            this.formatAllFunctions();
            this.highlightJson();
          } catch (error) {
            alert('Invalid JSON file');
          }
        };
        reader.readAsText(file);
      }, 1000);

    }else{
        this.spinner.hide();
    }
  }
  formattedFunctions: string = '';
  formatAllFunctions(): void {
    if (this.functions) {
      const allFunctions = Object.values(this.functions)
        .map((func) => this.formatFunction(func))
        .join('\n\n');

      this.formattedFunctions = Prism.highlight(
        allFunctions,
        Prism.languages['javascript'],
        'javascript'
      );
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

  reuploadFiles(): void {
    this.jsonData = null;
    this.jsonString = '';
    this.jsonFileName = '';

    if (this.jsonFileInput) {
      this.jsonFileInput.nativeElement.value = '';
    }

    this.triggerJsonFileInput();
  }

  highlightJson(): void {
    setTimeout(() => {
      const jsonElement = document.querySelector('.language-json');
      if (jsonElement) {
        Prism.highlightElement(jsonElement);
      }
    }, 500);
    setTimeout(() => {
      this.spinner.hide();
    }, 1000);
  }
  logout(){
    this.MatrixRun=false;
    this.xmlResult=""
    this.spinner.show();
    setTimeout(() => {
      this.router.navigate(['/sandgate']);
      this.spinner.hide();
    }, 1000);
  }
}
