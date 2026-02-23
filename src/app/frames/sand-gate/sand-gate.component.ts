import { Component } from '@angular/core';
import { Router,ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ThemeService } from 'src/app/services/theme.service';
import { RunrulesService } from 'src/app/services/runrules.service';
import { SafeHtml } from '@angular/platform-browser';
import { Auth2faComponent } from 'src/app/popups/auth2fa/auth2fa.component';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-sand-gate',
  templateUrl: './sand-gate.component.html',
  styleUrls: ['./sand-gate.component.css']
})
export class SandGateComponent {
  isDarkMode = false;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private themeService: ThemeService,
    private RunrulesService:RunrulesService,
    private dialog: MatDialog
  ) {
  }
  ngOnInit() {
    let theme = localStorage.getItem('app-theme')
    if(theme=='dark-theme'){
      this.isDarkMode = true
    }else{
      this.isDarkMode = true
    }
  }
  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.themeService.setTheme(this.isDarkMode);
  }
  onAccessClick() {
    this.spinner.show();
    setTimeout(() => {
      this.router.navigate(['/sandbox']);
      this.spinner.hide();
    }, 1000);
  }
  user: any = {};
  unval:boolean=true;
  pwval:boolean=true;
  auth2FAMsg:boolean=false
  loggedUserInfo: any;
  auth2FAEnabled: boolean = false;
  resdata:boolean = true;
  passwordSnippet: SafeHtml | undefined;
  userIdSnippet:SafeHtml | undefined;
  validateCreds(){
    console.log(`Username: ${this.user.userName || 'empty'}`);
    console.log(`Password: ${this.user.password ? 'provided' : 'empty'}`);
    if(this.user.userName==''||this.user.userName==undefined){
      console.log("4",this.user.userName)
      this.unval=false
    }else{
      console.log("5")
      this.unval=true
    }
    if(this.user.password==''||this.user.password==undefined){
      console.log("6",this.user.password)
      this.pwval = false
    }else{
      console.log("7")
      this.pwval = true
    }
  }
  doLogin(){
    console.log("1")
    // if(sessionStorage.getItem("userInfo")==undefined){
    //   console.log("2")
    //   this.validateCreds()
    //   if(this.unval && this.pwval ){
    //     console.log("3")
    //     this.spinner.show()
    //     this.RunrulesService.loginWithOAuth(this.user.userName,this.user.password).subscribe({
    //       next: (response: any) => {
    //         this.auth2FAMsg = false;
    //         this.loggedUserInfo = this.RunrulesService.storeUserInfo(response);
    //         this.RunrulesService.is2FAEnabled(response).subscribe({
    //           next: (response: any) => {
    //             this.auth2FAEnabled = response;
    //             this.user.authCode = "";
    //             this.user.intermediaryId = ""
    //             if (!this.auth2FAEnabled) {
    //               this.RunrulesService.getBrokerHierarchy(this.loggedUserInfo.access_token, this.user.intermediaryId).subscribe({
    //                 next: (response: any) => {
    //                   sessionStorage.setItem("brokerHierarchy",JSON.stringify(response)) ;
    //                   this.spinner.hide();
    //                   this.router.navigate(['sandbox']);
    //                 },
    //                 error: (error: any) => {
    //                   this.spinner.hide();
    //                 }
    //               });
    //             }else{
    //               this.spinner.hide();
    //               this.open2faModal(this.user,this.loggedUserInfo);
    //             }
    //           },
    //           error: (error: any) => {
    //             this.spinner.hide();
    //           }
    //         });
    //         this.resdata=true
    //       },
    //       error: (error: any) => {
    //         this.spinner.hide();
    //         this.resdata=false
    //       },
    //     });
    //     sessionStorage.setItem('userId', this.user.userName);
    //    }
    // }else{
    //   this.doLogout()
    // }
    this.router.navigate(['sandbox']);

  }
  open2faModal(user: any,loggedUserInfo:any): void {
    this.dialog.open(Auth2faComponent, {
      data: { user, loggedUserInfo }
    });
}
  doLogout(){
    sessionStorage.removeItem("userInfo")
    sessionStorage.removeItem("brokerHierarchy")
    this.doLogin()
  }
  pwChange() {
    this.passwordSnippet = this.user.password;
  }
  unChange() {
    this.userIdSnippet = this.user.userName;
  }
}
