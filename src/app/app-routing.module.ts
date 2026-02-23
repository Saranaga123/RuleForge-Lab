import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SandBoxComponent } from './frames/sand-box/sand-box.component';
import { SandGateComponent } from './frames/sand-gate/sand-gate.component';

const routes: Routes = [
  {path: '', redirectTo: 'sandgate', pathMatch: 'full'},
  { path: 'sandgate', component: SandGateComponent },
  { path: 'sandbox', component: SandBoxComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule],
})
export class AppRoutingModule { }
