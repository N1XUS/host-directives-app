import {
  AbstractDataSourceProvider,
  DataSource,
  DataSourceParser,
  isDataSource,
} from '@host-directives-app/data-source';
import { Nullable } from '@host-directives-app/shared';
import { isObservable, Observable, of } from 'rxjs';

export class ComboboxDataSource extends AbstractDataSourceProvider<AcceptableComboboxItem> {
  fetch(): Observable<AcceptableComboboxItem[]> {
    return isObservable(this.items) ? this.items : of(this.items);
  }
  constructor(
    public items:
      | Observable<AcceptableComboboxItem[]>
      | AcceptableComboboxItem[]
  ) {
    super();
  }
}

export interface ComboboxItem {
  label: string;
  value: string;
}

export type AcceptableComboboxItem = ComboboxItem | string;

export class ComboboxDataTransformer
  implements DataSourceParser<AcceptableComboboxItem>
{
  parse(source: Nullable<DataSource<AcceptableComboboxItem>>) {
    // If source is an instance of a data source class, return it without modifications.
    if (isDataSource(source)) {
      return source as ComboboxDataSource;
    } else if (Array.isArray(source) || isObservable(source)) {
      // If the source is an array or observable, return new instance of the datasource with items inside.
      return new ComboboxDataSource(source);
    }

    return null;
  }
}
