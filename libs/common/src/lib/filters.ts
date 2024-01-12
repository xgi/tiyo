import { SortDirection, TriState } from "./enums";

export enum FilterOptionType {
  Header = "header",
  Separator = "separator",
  Checkbox = "checkbox",
  TriStateCheckbox = "tristatecheckbox",
  Select = "select",
  Input = "input",
  MultiToggle = "multitoggle",
  Sort = "sort",
  Cycle = "cycle",
}

export interface FilterOption {
  kind: FilterOptionType;
  id: string;
  label: string;
  defaultValue: unknown;
}

export abstract class FilterOptionAbstract implements FilterOption {
  kind = FilterOptionType.Separator;
  id: string;
  label: string;
  defaultValue: unknown;

  constructor(id: string, label: string, defaultValue: unknown) {
    this.id = id;
    this.label = label;
    this.defaultValue = defaultValue;
  }
}

export class FilterCheckbox extends FilterOptionAbstract {
  override kind = FilterOptionType.Checkbox;
}

export class FilterTriStateCheckbox extends FilterOptionAbstract {
  override kind = FilterOptionType.TriStateCheckbox;
}

export class FilterSelect extends FilterOptionAbstract {
  override kind = FilterOptionType.Select;
  options: { label: string; value: string }[] = [];

  withOptions(options: { label: string; value: string }[]): FilterSelect {
    this.options = options;
    return this;
  }
}

export class FilterInput extends FilterOptionAbstract {
  override kind = FilterOptionType.Input;
  placeholder?: string;

  withPlaceholder(placeholder: string): FilterInput {
    this.placeholder = placeholder;
    return this;
  }
}

export type MultiToggleValues = { [key: string]: TriState };
export class FilterMultiToggle extends FilterOptionAbstract {
  override kind = FilterOptionType.MultiToggle;
  fields: { key: string; label: string }[] = [];
  isTriState: boolean = false;

  withFields(fields: { key: string; label: string }[]) {
    this.fields = fields;
    return this;
  }

  withIsTriState(isTriState: boolean) {
    this.isTriState = isTriState;
    return this;
  }
}

export type FilterSortValue = { key: string; direction: SortDirection };
export class FilterSort extends FilterOptionAbstract {
  override kind = FilterOptionType.Sort;
  fields?: { key: string; label: string }[];
  supportsBothDirections: boolean = false;

  withFields(fields: { key: string; label: string }[]) {
    this.fields = fields;
    return this;
  }

  withSupportsBothDirections(supportsBothDirections: boolean) {
    this.supportsBothDirections = supportsBothDirections;
    return this;
  }
}

export class FilterCycle extends FilterOptionAbstract {
  override kind = FilterOptionType.Cycle;
  options: { label: string; value: string }[] = [];

  withOptions(options: { label: string; value: string }[]): FilterCycle {
    this.options = options;
    return this;
  }
}

export class FilterHeader extends FilterOptionAbstract {
  override kind = FilterOptionType.Header;
  order?: number;

  withOrder(order: number): FilterHeader {
    this.order = order;
    return this;
  }
}

export class FilterSeparator extends FilterOptionAbstract {
  override kind = FilterOptionType.Separator;
}
