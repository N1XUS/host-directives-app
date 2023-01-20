import { Component, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  private readonly _fb = inject(FormBuilder);

  comboboxValue = 'Banana';
  toggleValue = true;

  readonly form = this._fb.group({
    fruit: '',
    toggle: [true]
  })

  readonly options: string[] = ['Banana', 'Apple', 'Pineapple', 'Avocado', 'Cherry', 'Lemon', 'Orange'];
}
