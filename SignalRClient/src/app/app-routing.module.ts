import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Content1Component } from './content1/content1.component';
import { MainComponent } from './main/main.component';

const routes: Routes = [
  { path: 'login', component: MainComponent},
  { path: '', redirectTo: 'login', pathMatch: 'full'}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
