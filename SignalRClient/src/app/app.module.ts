import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { Content1Component } from './content1/content1.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule  } from '@angular/material/tabs';



import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import {  MatGridListModule } from '@angular/material/grid-list';
import {  MatListModule } from '@angular/material/list';
import {  MatCheckboxModule } from '@angular/material/checkbox';

import {  MatDividerModule } from '@angular/material/divider';



import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { AppRoutingModule } from './app-routing.module';
import { MainComponent } from './main/main.component';

import { CookieService } from 'ngx-cookie-service';
import { HttpClientModule } from '@angular/common/http';
import {MatSelectModule} from '@angular/material/select';
import { BasicPipe } from './pipes/basic/basic.pipe';


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    Content1Component,
    MainComponent,
    BasicPipe,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    NoopAnimationsModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatToolbarModule,
    ReactiveFormsModule,
    MatDialogModule,
    AppRoutingModule,
    HttpClientModule,
    MatTabsModule,
    MatGridListModule,
    MatSelectModule,
    MatListModule,
    MatDividerModule,
    MatCheckboxModule
  ],
  providers: [CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
