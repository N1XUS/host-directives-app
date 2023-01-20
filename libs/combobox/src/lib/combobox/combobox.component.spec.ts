import { Type } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { ControlValueAccessor, FormsModule } from '@angular/forms';
import { runValueAccessorTests } from 'ngx-cva-test-suite';
import { ComboboxComponent } from './combobox.component';

runValueAccessorTests({
  // This gives us ability to initialize component itself and use inner directive to read/write value
  component: ComboboxComponent as unknown as Type<
    Required<ControlValueAccessor>
  >,
  testModuleMetadata: {
    declarations: [ComboboxComponent],
    imports: [FormsModule]
  },
  hostTemplate: {
    hostComponent: ComboboxComponent,
    getTestingComponent: (fixture) => fixture.componentInstance._cvaDirective,
  },
  supportsOnBlur: true,
  nativeControlSelector: 'input.combobox-input',
  internalValueChangeSetter: (fixture, value) => {
    fixture.componentInstance._cvaDirective.setValue(value, true);
  },
  /** Function to get the value of a component in a runtime. */
  getComponentValue: (fixture: ComponentFixture<ComboboxComponent<string>>) =>
    fixture.componentInstance.value
});
