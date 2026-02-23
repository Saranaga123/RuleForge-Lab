import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-xml-error-dialog',
  templateUrl: './xml-error-dialog.component.html',
  styleUrls: ['./xml-error-dialog.component.css'],

})
export class XmlErrorDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { errorMessage: string,message: string, details?: string }) {}

  ngOnInit() {
    console.log(this.data); // Corrected: Access data via 'this'
  }
}
