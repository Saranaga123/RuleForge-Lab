import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { SandBoxComponent } from './frames/sand-box/sand-box.component';
import { SandGateComponent } from './frames/sand-gate/sand-gate.component';
import { HttpClientModule } from '@angular/common/http';
import { ErrConnectComponent } from './popups/err-connect/err-connect.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { Auth2faComponent } from './popups/auth2fa/auth2fa.component';
import { XmlErrorDialogComponent } from './frames/sand-box/popups/xml-error-dialog/xml-error-dialog.component';
@NgModule({
  declarations: [
    AppComponent,
    SandBoxComponent,
    SandGateComponent,
    ErrConnectComponent,
    Auth2faComponent,
    XmlErrorDialogComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatDialogModule,
    NgxSpinnerModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
