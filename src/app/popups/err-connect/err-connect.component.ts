import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-err-connect',
  templateUrl: './err-connect.component.html',
  styleUrls: ['./err-connect.component.css']
})
export class ErrConnectComponent {
  constructor(
    public dialogRef: MatDialogRef<ErrConnectComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string }
  ) {}

  closeModal(): void {
    this.dialogRef.close();
  }
}
