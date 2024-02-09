export type AcceptedTypes = string | number | bigint | boolean | undefined | null;
export type EntryObject = {
  [key: string]: AcceptedTypes;
};

export type TableDataType = {
  baseData: Array<EntryObject>;
  currentDropdowns: Array<AcceptedTypes>[];
  dataFields: Array<string>;
  renderedData: Array<EntryObject>;
  unsortedData: Array<EntryObject>;
};

export type BooleansType = {
  [key: string]: boolean;
};

export type InputsType = {
  entryEditIndex: null | number;
  entryEditBackup: EntryObject;
  filterInput: Array<AcceptedTypes>;
  searchInput: string;
};

export type SortingType = {
  currentSort: string;
  sortState: 'none' | 'ascending' | 'descending';
};

