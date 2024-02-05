export type AcceptedTypes = string | number | bigint | boolean | undefined | null;
export type EntryObject = {
  [key: string]: AcceptedTypes;
};

export type TableDataType = {
  currentDropdowns: Array<AcceptedTypes>[];
  undisplayedData: Array<EntryObject>;
  dataFields: Array<string>;
  displayedData: Array<EntryObject>;
  unsortedData: Array<EntryObject>;
};

export type InputsType = {
  expandDate: string;
  expandInput: Array<AcceptedTypes>;
  filterInput: Array<AcceptedTypes>;
  formInput: Array<AcceptedTypes>;
  modifyEntryInput: Array<AcceptedTypes>;
  searchInput: string;
};

export type SortingType = {
  currentSort: string;
  sortState: 'none' | 'ascending' | 'descending';
};
