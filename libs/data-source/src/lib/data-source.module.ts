import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataSourceDirective } from './data-source.directive';

@NgModule({
  imports: [CommonModule, DataSourceDirective],
  exports: [DataSourceDirective]
})
export class DataSourceModule {}
