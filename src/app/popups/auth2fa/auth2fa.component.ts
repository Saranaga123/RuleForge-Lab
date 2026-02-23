import { Component,Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { RunrulesService } from 'src/app/services/runrules.service';

@Component({
  selector: 'app-auth2fa',
  templateUrl: './auth2fa.component.html',
  styleUrls: ['./auth2fa.component.css'],
})
export class Auth2faComponent {
  auth2fa: string = '';
  loggedUserInfo: any;
  faerr: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { user: any; loggedUserInfo: any },
    public dialogRef: MatDialogRef<Auth2faComponent>,
    private spinner: NgxSpinnerService,
    private RunrulesService: RunrulesService,
    private router: Router
  ) {
    this.loggedUserInfo = this.data.loggedUserInfo;
  }

  closeModal(): void {
    this.dialogRef.close();
  }

  Submit() {
    const authCode = this.auth2fa.trim();

    // Validate auth code
    if (!authCode) {
      this.faerr = true;
      return;
    }

    // Show spinner and start 2FA authentication
    this.spinner.show();
    this.RunrulesService.do2FAuthentication(authCode, this.loggedUserInfo.access_token).subscribe({
      next: () => {
        this.RunrulesService.getBrokerHierarchy(this.loggedUserInfo.access_token, this.data.user.intermediaryId).subscribe({
          next: (response: any) => {
            sessionStorage.setItem("brokerHierarchy", JSON.stringify(response));
            this.spinner.hide();
            this.closeModal()
            this.router.navigate(['sandbox']);
          },
          error: (error: any) => {
            console.error('Failed to fetch broker hierarchy:', error);
            this.spinner.hide();
          }
        });
      },
      error: (error: any) => {
        console.error('2FA authentication failed:', error);
        this.faerr = true;
        this.spinner.hide();
      }
    });
  }
}

