import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComboboxComponent } from './combobox/combobox.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [ComboboxComponent],
  exports: [ComboboxComponent],
})
export class ComboboxModule {}
