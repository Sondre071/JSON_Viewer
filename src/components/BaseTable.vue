<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Ref } from 'vue';
import { sortBy, cloneDeep } from 'lodash';
import sourceData from '../assets/data.json';
import * as TableTypes from './BaseTable.types';

//start ved tbody button Fiks søppelbøttene og checkmark ikoner.
//Muligens ditch all bootstrap og bruk unicode

const fillArray = (value: TableTypes.AcceptedTypes) => {
  return Object.keys(sourceData[0]).map(() => value);
};

const tableData: Ref<TableTypes.TableDataType> = ref({
  baseData: sourceData, // Base data to draw from
  renderedData: sourceData, // Filtered and searched data
  unsortedData: sourceData, // Original unsorted data plus new entries
  dataFields: Object.keys(sourceData[0]), // Columns/keys/fields
  currentDropdowns: [], // Dropdowns for filtering
});

const inputs: Ref<TableTypes.InputsType> = ref({
  entryEditIndex: null,
  entryEditBackup: {},
  filterInput: fillArray(null),
  searchInput: '',
});

const inputResets = cloneDeep(inputs.value);

const booleans: Ref<TableTypes.BooleansType> = ref({
  oldEntryEdit: false,
  newEntryEdit: false,
  filterField: false,
  filterMode: false,
  manipulateTable: false,
  searchMode: false,
  debug: false,
});

const sorting: Ref<TableTypes.SortingType> = ref({
  currentSort: '',
  sortState: 'none',
});

const getData = <K extends keyof TableTypes.TableDataType>(key: K, consoleString: string) => {
  console.log('*-- getData(): ' + key + ' for: ' + consoleString);
  return tableData.value[key];
};

const setData = <K extends keyof TableTypes.TableDataType, V extends TableTypes.TableDataType[K]>(
  key: K,
  input: V,
): void => {
  console.log('*-- setData(): ' + input + ' to: ' + input);
  tableData.value[key] = input;
};

const addBlankEntry = (): void => {
  console.log('*** addBlankEntry()');
  changeBoolean('oldEntryEdit', false);
  changeBoolean('newEntryEdit', true);
  const blankObject: TableTypes.EntryObject = {};
  const dataFieldsTemp = getData('dataFields', 'addBlankEntry()');
  for (let i = 0; i < dataFieldsTemp.length; i++) {
    blankObject[dataFieldsTemp[i]] = '';
  }
  setInput('entryEditIndex', getData('baseData', 'addBlankEntry()').length);
  getData('baseData', 'addBlankEntry').push(blankObject);
};

const validateNewEntry = (): boolean => {
  console.log('*-- validateNewEntry()');
  //const typeMatch = Object.values(getData('baseData')[0]).toString();
  const newEntry = Object.values(
    getData('baseData', 'validateNewEntry()')[getData('baseData', 'validateNewEntry()').length - 1],
  ); //is string already

  return newEntry.every((element) => element !== '');
};

const editSave = (): void => {
  console.log('*-- editSave()');
  inputs.value.entryEditIndex = null;
  changeBoolean('newEntryEdit', false);
  changeBoolean('oldEntryEdit', false);
};

const getInput = <K extends keyof TableTypes.InputsType>(str: K) => {
  console.log('*-- getInput(): ' + str);
  return inputs.value[str];
};

const setInput = <K extends keyof TableTypes.InputsType>(
  str: K,
  value: TableTypes.AcceptedTypes | TableTypes.AcceptedTypes[] | TableTypes.EntryObject,
) => {
  console.log('*-- setInput(): ' + str + ' to: ' + value);
  inputs.value[str] = value as TableTypes.InputsType[K];
};

const resetInputsValue = <K extends keyof TableTypes.InputsType>(key: K) => {
  console.log('**- resetInputsValue(): ' + key);
  inputs.value[key] = inputResets[key];
};

const getSearch = (): string => {
  console.log('*-- getSearch()');
  return inputs.value.searchInput.toLowerCase();
};

const getFilters = (): Array<TableTypes.AcceptedTypes> => {
  console.log('*-- getFilters()');
  return inputs.value.filterInput;
};

const entryEditStatus = (): boolean => {
  console.log('*-- entryEditStatus()');
  return getInput('entryEditIndex') !== null ? true : false;
};

const getBoolean = (str: string): boolean => {
  console.log('*-- getBoolean(): ' + str);
  return booleans.value[str];
};

const changeBoolean = (str: string, setToggle: boolean | undefined = undefined): void => {
  console.log(
    '*-- changeBoolean(): ' + str + ', ' + (setToggle === undefined ? 'toggle' : setToggle),
  );
  if (typeof setToggle === 'boolean') {
    booleans.value[str] = setToggle;
  } else {
    booleans.value[str] = !booleans.value[str];
  }
};

const resetButton = () => {
  console.log('*** resetButton()');
  if (getBoolean('newEntryEdit')) {
    deleteEntry(getInput('entryEditIndex') as number);
    changeBoolean('newEntryEdit');
  }
  const resetList: Array<keyof TableTypes.InputsType> = Object.keys(inputs.value) as Array<
    keyof TableTypes.InputsType
  >;
  resetList.forEach((element) => resetInputsValue(element));
  changeBoolean('filterMode', false);
  console.log('*** resetButton end');
};

const modifyEntry = (index: number) => {
  console.log('*** modifyEntry(): ' + index);
  if (getBoolean('newEntryEdit')) {
    getData('baseData', 'modifyEntry()').splice(getData('baseData', 'modifyEntry()').length - 1);
    changeBoolean('newEntryEdit', false);
  }
  changeBoolean('oldEntryEdit', true);
  setInput('entryEditBackup', cloneDeep(getData('renderedData', 'modifyEntry()')[index]));
  setInput('entryEditIndex', index);
  console.log('*** modifyEntry() end');
};

const deleteEntry = (index: number) => {
  console.log('*-- deleteEntry()');
  getData('baseData', 'deleteEntry').splice(index, 1);
};

const sortTable = (key: string) => {
  console.log('*** sorttable()');
  const states: ('none' | 'ascending' | 'descending')[] = [
    'none',
    'ascending',
    'descending',
  ] as const;
  setTimeout(() => {
    if (sorting.value.currentSort !== key) {
      sorting.value.sortState = 'none';
    }
    const currentIndex = states.indexOf(sorting.value.sortState);
    const nextIndex = (currentIndex + 1) % states.length;
    const nextState = states[nextIndex];
    const sortActions = {
      none: (key: string = 'default') => (tableData.value.baseData = tableData.value.unsortedData),
      ascending: (key: string) =>
        (tableData.value.baseData = sortBy(getData('baseData', 'sortTable()'), key)),
      descending: (key: string = 'default') =>
        (tableData.value.baseData = sortBy(getData('baseData', 'sortTable()').reverse())),
    };

    sorting.value.currentSort = key;
    sorting.value.sortState = nextState;
    setData('baseData', sortActions[nextState](key));
  }, 80); //timeout
  console.log('*** sortTable() end');
};

const resetFilterField = (str: number | undefined) => {
  console.log('*-- resetfilterfield()');
  if (str === undefined) {
    inputs.value.filterInput = fillArray(null);
    inputs.value.searchInput = '';
    console.log('resetAll called. finterInput is now: ' + inputs.value.filterInput);
  } else {
    inputs.value.filterInput[str] = null;
  }
};

const searchFunction = (): void => {
  console.log('*** searchFunction()');
  if (getFilters().every((element) => element === undefined && getSearch() === '')) {
    setData('renderedData', getData('baseData', 'searchFunction()'));
    changeBoolean('searchMode', false);
    dropdownMapping();
    console.log('*** searchfunction() return');
    return;
  }

  const tempBaseData = getData('baseData', 'searchFunction()');
  let tempRenderedData: Array<TableTypes.EntryObject> = [];
  const tempSearch = getSearch()
  const tempFilters = getFilters();

  for (let i = 0; i < tempBaseData.length; i++) {
    console.log('*- Searchfunction() working... Iteration: ' + i);
    const stringedValues = JSON.stringify(Object.values(tempBaseData[i]));
    if (!tempSearch || stringedValues.toLowerCase().includes(tempSearch)) {
      if (
        Object.values(tempBaseData[i]).every(
          (element, index) => !tempFilters[index] || element == tempFilters[index],
        )
      ) {
        tempRenderedData.push(tempBaseData[i]);
      } else {
        continue;
      }
    } else {
      continue;
    }
  }
  setData('renderedData', tempRenderedData);
  changeBoolean('searchMode', true);
  dropdownMapping();
  console.log('***searchFunction() end');
};

const search = () => {};

const crossButton = (index: number) => {
  if (getBoolean('oldEntryEdit')) {
    getData('baseData', 'crossButton()')[index] = getInput('entryEditBackup');
  } else if (getBoolean('newEntryEdit')) {
    deleteEntry(getData('baseData', 'crossButton()').length - 1);
    changeBoolean('newEntryEdit', false);
  }
  setInput('entryEditIndex', null);
  setInput('entryEditBackup', {});
  console.log('*** crossButton() end');
};

const dropdownMapping = (): void => {
  console.log('*** dropDownMapping()');

  const tempDropdowns: Set<TableTypes.AcceptedTypes>[] = getData('dataFields', 'dropdownMapping').map(() => new Set());

  console.log('bing');
  getData('renderedData', 'dropdownMapping()').forEach((element) => {
    Object.values(element).forEach((value: TableTypes.AcceptedTypes, index) => {
      tempDropdowns[index].add(value);
    });
  });
  console.log('chilling');

  const tempSortedDropdowns: Array<TableTypes.AcceptedTypes>[] = tempDropdowns.map((element) =>
    sortBy([...element]),
  );
  setData('currentDropdowns', tempSortedDropdowns);
  console.log('*** dropDownMapping end');
  console.log('bang');
};

// const dropdownMap = () => {};

const deleteButton = (index: number) => {
  console.log('*** deleteButton()');
  const currentIndex = getInput('entryEditIndex');
  getData('baseData', 'deleteButton()').splice(index, 1);
  if (index === currentIndex) {
    console.log('**- if passed');
    resetInputsValue('entryEditIndex');
    console.log('*** deleteButton return');
    return;
  } else if (currentIndex !== null && currentIndex !== 0 && index < currentIndex) {
    console.log('**- else if passed');
    setInput('entryEditIndex', currentIndex - 1);
  }
  console.log('*** deleteButton() end');
};

const sortStateIcon = (field: string) => {
  console.log('*-- sortStateIcon()');
  if (field !== sorting.value.currentSort) {
    return '&#8693;';
  }
  const icons = {
    none: '&#8693;',
    ascending: '&#8648;',
    descending: '&#8650;',
  } as const;

  return icons[sorting.value.sortState];
};

/*
const getAge = (dateString: string) => {
    const today = new Date();
    const date = new Date(dateString);

    let years = today.getFullYear() - date.getFullYear();
    let months = today.getMonth() - date.getMonth();
    let days = today.getDate() - date.getDate();

    if (days < 0) {
        months--;
        days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }

    return `Character was created ${years} years, ${months} months, ${days} days ago`;
};
*/

const alertFunction = (str: string) => {
  alert(str);
};

dropdownMapping();
console.log('----- Website loaded -----');

watch(() => tableData.value.baseData, searchFunction, { deep: true });
watch(() => inputs.value.searchInput, searchFunction);
watch(() => inputs.value.filterInput, searchFunction, { deep: true });
</script>

<template>
  <main>
    <header>
      <h1 class="centered text">Sondre's JSON Viewer</h1>
    </header>
    <div>
      <div class="table-and-side-buttons">
        <div class="table-component">
          <div class="table-container">
            <div class="search-bar">
              <input
                type="search"
                name="form"
                v-model="inputs.searchInput"
                placeholder="Search for property"
                aria-describedby="button-addon2"
              />
            </div>
            <table id="" class="table-element">
              <thead>
                <tr>
                  <th
                    class=""
                    :class="{
                      'filter-mode': getBoolean('filterMode'),
                      'non-filter-mode': !getBoolean('filterMode'),
                    }"
                    v-for="(field, index) in tableData.dataFields"
                  >
                    {{ field }}
                    <button
                      :key="field"
                      :class="{ interactable: !entryEditStatus() }"
                      class="sort-button icon"
                      @click="!entryEditStatus() ? sortTable(field) : {}"
                      aria-label="Sort Icon"
                    >
                      <span v-html="sortStateIcon(field)"></span>
                    </button>
                    <div v-show="getBoolean('filterMode')" class="dropdowns-container">
                      <div class="dropdowns">
                        <select v-model="inputs.filterInput[index]">
                          <option
                            v-for="(value, valueIndex) in tableData.currentDropdowns[index]"
                            :key="valueIndex"
                          >
                            {{ value }}
                          </option>
                        </select>
                        <button
                          class="bi bi-trash3 icon interactable"
                          @click="resetFilterField(index)"
                        ></button>
                      </div>
                    </div>
                  </th>
                  <th class="filler-header" colspan="2"></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in getData('renderedData', 'v-for html tr')"
                  :key="getData('renderedData', 'v-for html :key').indexOf(item)"
                >
                  <template v-if="getInput('entryEditIndex') === index">
                    <td v-for="key in tableData.dataFields" :key="key" class="full-opacity">
                      <input
                        type="text"
                        v-model="getData('baseData', 'v-for html input')[index][key]"
                      />
                    </td>
                    <td class="list-buttons">
                      <button
                        type="submit"
                        class="new-entry-submit icon interactable"
                        @click="validateNewEntry() ? editSave() : alertFunction('Invalid entry')"
                      >
                        &#10003;
                      </button>
                    </td>
                    <td class="list-buttons">
                      <button class="icon interactable" @click="crossButton(index)">
                        &#10006;
                      </button>
                    </td>
                  </template>
                  <template v-else>
                    <td v-for="key in tableData.dataFields" :key="key">
                      {{ item[key] }}
                    </td>
                    <td class="list-buttons">
                      <button
                        id="pen"
                        :class="{
                          invisible: !getBoolean('manipulateTable'),
                          fade: entryEditStatus(),
                        }"
                        class="icon interactable"
                        style="transform: rotate(90deg)"
                        @click="modifyEntry(index)"
                      >
                        &#9998;
                      </button>
                    </td>
                    <td class="list-buttons">
                      <button
                        id="trash-can"
                        :class="{
                          invisible: !getBoolean('manipulateTable'),
                        }"
                        class="bi bi-trash3 icon interactable"
                        @click="deleteButton(index)"
                      ></button>
                    </td>
                  </template>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="side-buttons">
          <button
            id="funnel-button"
            class="bi bi-funnel-fill interactable icon"
            v
            @click="
              getBoolean('filterMode')
                ? [changeBoolean('filterMode'), resetFilterField(undefined)]
                : changeBoolean('filterMode')
            "
            title="Filter by properties"
          ></button>
          <button
            class="bi bi-wrench icon interactable"
            @click="changeBoolean('manipulateTable')"
            title="Modify table"
          ></button>
          <button
            id="plus-button"
            class="icon"
            :class="{ interactable: !entryEditStatus() }"
            @click="!entryEditStatus() ? [resetButton(), addBlankEntry()] : {}"
            title="Add new entry"
          >
            &#43;
          </button>
          <button
            id="clear-button"
            class="icon interactable"
            @click="resetButton()"
            title="Reset inputs and filters"
          >
            &#8634;
          </button>
          <button
            id="debug-button"
            class="bi bi-bug icon interactable fade"
            @click="changeBoolean('debug')"
            title="Debug mode"
          ></button>
        </div>
      </div>
      <h4 style="font-size: 15px; margin-top: 5px; font-weight: normal">
        Total entries: {{ tableData.baseData.length }}
      </h4>
    </div>
    <footer>
      <div class="debug-box" v-show="getBoolean('debug')">
        <div class="debug-inner-box">
          <div class="inputs-and-booleans-debug">
            <div class="inner-boxes">
              <div v-for="(item, key) in inputs">
                <p>
                  {{ key }}:<br />
                  {{ item }}
                </p>
              </div>
            </div>
            <div class="inner-boxes">
              <div v-for="(item, key) in booleans">
                <p :class="{ green: getBoolean(key as string), red: !getBoolean(key as string) }">
                  {{ key }}:<br />
                  {{ item }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="inner-boxes">
          <div class="tableData-debug" v-for="(item, keys) in tableData">
            <p :class="{ green: getBoolean(keys) }">{{ keys }}:<br />{{ item }}</p>
          </div>
        </div>
      </div>
    </footer>
  </main>
</template>

<style scoped>
main {
  background-color: #2d282c;
  border: 2px groove rgba(255, 255, 255, 0.2);
  border-top: 0;
  border-radius: 17px;
  box-shadow: 0 0 15px 0px rgba(255, 255, 255, 0.375);
  max-width: 70%;
  margin-left: auto;
  margin-right: auto;
  padding: 10px 0 50px 0;
  font-family: 'Segoe UI', system-ui, sans-serif;
  color: #eae9ea;
  text-align: center;
}

.search-bar {
  width: 100%;

  input {
    width: 100%;
    border: 1px solid #eae9ea;
    padding: 8px 0;
    background-color: #eae9ea;
    text-indent: 10px;
    color: black;
    font-weight: bold;
  }
}

.table-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: 0 auto;
  max-width: 100%;
}

.table-component {
  display: block;
  justify-content: center;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
}

table {
  display: table;
  table-layout: auto;
  width: 100%;
  font-size: 16px;
  text-align: center;
  border-collapse: collapse;
  overflow: scroll;
}

.table-and-side-buttons {
  display: flex;
  align-items: flex-start;
  align-self: center;
  width: 95%;
  margin-left: auto;
  margin-right: auto;
}

.table-element th {
  border: 1px solid rgb(235, 234, 235, 0.8);
  padding-top: 10px;
  padding-right: 20px;
}

.filter-mode {
  padding-bottom: 31px;
  margin-bottom: 40px;
}

.non-filter-mode {
  padding-bottom: 10px;
}

.table-element td {
  border: 1px solid rgb(235, 234, 235, 0.8);
  padding: 9px 0;
}

tbody tr {
  background-color: #3b363a;
}

tbody tr:nth-child(odd) {
  background-color: #504a4f;
}

tbody button {
  font-size: 15px;
}

tbody input {
  margin: -100px;
  width: 80%;
  border-radius: 4px;
  background-color: #eae9ea;
}

.dropdowns-container {
  padding-top: 3px;
  position: relative;
  align-items: center;
  left: 10px;
}

.dropdowns {
  position: absolute;
  left: 0;
  right: 0;

  select {
    background-color: #eae9ea;
    border-radius: 6px;
    font-size: 15px;
  }
}

.list-buttons {
  max-width: 12px;
  min-width: 12px;
}

.side-buttons {
  margin-top: 40px;
  width: 32px;
  margin-left: 5px;
  border-collapse: collapse;

  button {
    border: 1px solid rgb(59, 54, 58);
    border-radius: 7px;
    margin-top: 2px;
    margin-bottom: 2px;
    padding-right: 5px;
    width: 30px;
    height: 30px;
    font-size: 18px;
    background-color: rgb(235, 234, 235);
    color: black;
  }
}

#funnel-button {
  font-size: 17px;
}

#plus-button {
  text-align: center;
  font-size: 25px;
}

#clear-button {
  text-align: center;
  font-size: 5;
}

#wrench-button {
  position: fixed;
}

footer {
  color: white;
}

.interactable {
  cursor: pointer;
}

.sort-button {
  position: absolute;
  margin: -2px;
  font-size: 20px;
  font-weight: bold;
}

.bottom-buttons {
  top: 3px;
  position: relative;
  text-align: right;
  right: calc(2.56% + 34px);

  button {
    border: solid 1px black;
    padding: 5px 7px;
    border-radius: 4px;
    font-size: 14.5px;
  }
}
.debug-inner-box {
  margin-bottom: 50px;
  width: 100%;
  .inner-boxes {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
  p {
    padding: 0 10px;
  }
}

.green {
  color: lightgreen !important;
}

.red {
  color: lightcoral !important;
}

.inputs-and-booleans-debug {
  display: flex;
}

.fade {
  opacity: 50%;
}

.invisible {
  visibility: hidden;
}

.icon {
  border: 0;
  background-color: transparent;
  color: #eae9ea;
}

.half-opacity {
  opacity: 50%;
}

.full-opacity {
  opacity: initial;
  color: red;
}
</style>
