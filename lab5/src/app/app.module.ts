import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from "@angular/forms";

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const routes: Routes = [
  {path: " ", component:LoginComponent}
];

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(routes),
    BrowserAnimationsModule,
  ],
  declarations: [
    AppComponent,
    LoginComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
