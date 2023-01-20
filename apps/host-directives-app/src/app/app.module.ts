import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ComboboxModule } from '@host-directives-app/combobox';
import { ToggleModule } from '@host-directives-app/toggle';

import { AppComponent } from './app.component';
import { NxWelcomeComponent } from './nx-welcome.component';

@NgModule({
  declarations: [AppComponent, NxWelcomeComponent],
  imports: [BrowserModule, ComboboxModule, ReactiveFormsModule, FormsModule, ToggleModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
