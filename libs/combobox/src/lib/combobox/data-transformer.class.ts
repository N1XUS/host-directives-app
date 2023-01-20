import { AbstractDataProvider, AbstractDataSourceProvider, DataSource, DataSourceParser, isDataSource } from "@host-directives-app/data-source";
import { Nullable } from "@host-directives-app/shared";
import { isObservable, Observable, of } from "rxjs";

export class ComboboxDataProvider extends AbstractDataProvider<AcceptableComboboxItem> {
  constructor(private _values: Observable<AcceptableComboboxItem[]> | AcceptableComboboxItem[]) {
    super();
  }

  fetch(): Observable<AcceptableComboboxItem[]> {
    return isObservable(this._values) ? this._values : of(this._values);
  }
}

export class ComboboxDataSource extends AbstractDataSourceProvider<AcceptableComboboxItem> {
  constructor(dataProvider: ComboboxDataProvider) {
    super(dataProvider);
  }
}

export class ArrayComboboxDataSource extends ComboboxDataSource {
  /** @hidden */
  constructor(data: AcceptableComboboxItem[]) {
      super(new ComboboxDataProvider(data));
  }
}

export class ObservableComboboxDataSource extends ComboboxDataSource {
  /** @hidden */
  constructor(data: Observable<AcceptableComboboxItem[]>) {
      super(new ComboboxDataProvider(data));
  }
}

export interface ComboboxItem {
  label: string;
  value: string;
}

export type AcceptableComboboxItem = ComboboxItem | string;

export class ComboboxDataTransformer implements DataSourceParser<AcceptableComboboxItem> {
  parse(source: Nullable<DataSource<AcceptableComboboxItem>>) {
    if (isDataSource(source)) {
      return source as ComboboxDataSource;
    }
    if (Array.isArray(source)) {
      return new ArrayComboboxDataSource(source);
    }
    if (isObservable(source)) {
      return new ObservableComboboxDataSource(source);
    }

    return null;
  }
}
