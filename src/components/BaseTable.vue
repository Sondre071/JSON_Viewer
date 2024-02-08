<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Ref } from 'vue';
import { sortBy, cloneDeep } from 'lodash';
import sourceData from '../assets/data.json';
import * as TableTypes from './BaseTable.types';

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
  currentModifiedEntry: fillArray(''),
  expandDate: '',
  expandInput: fillArray(''),
  filterInput: fillArray(null),
  formInput: fillArray(''),
  inputFieldsTypes: Object.values(tableData.value.baseData[0]).map((x) => typeof x),
  modifyEntryInput: fillArray(''),
  searchInput: '',
});

const backupInputs: TableTypes.InputsType = cloneDeep(inputs.value);

const booleans: Ref<TableTypes.BooleansType> = ref({
  expandField: false,
  filterField: false,
  filterMode: false,
  formInputArea: false,
  manipulateTable: false,
  searchMode: false,
});

const sorting: Ref<TableTypes.SortingType> = ref({
  currentSort: '',
  sortState: 'none',
});

const getData = <K extends keyof TableTypes.TableDataType>(key: K) => {
  console.log('*-- getData(): ' + key);
  return tableData.value[key];
};

const setData = <K extends keyof TableTypes.TableDataType>(
  input: Array<TableTypes.EntryObject>,
  key: K,
) => {
  console.log('*** setData(): ' + input);
  tableData.value[key] = input as TableTypes.TableDataType[K];
};

/*
const delay = (callback: any, timeout = 800) => {
  setTimeout(() => {
    callback;
  }, timeout);
};
*/

const createEntryObject = () => {
  const newEntryObject: TableTypes.EntryObject = {};
  const dataFieldsTemp = getData('dataFields');
  const formInputTemp = getInput('formInput');
  for (let i = 0; i < dataFieldsTemp.length; i++) {
    newEntryObject[dataFieldsTemp[i]] = formInputTemp[i];
  }
  pushData(newEntryObject, 'baseData');
  resetInputsValue('formInput');
};

const pushData = <K extends keyof TableTypes.TableDataType>(
  object: TableTypes.EntryObject,
  str: K,
) => {
  tableData.value[str].push(object as TableTypes.EntryObject & TableTypes.AcceptedTypes[] & string);
};

const getInput = <K extends keyof TableTypes.InputsType>(str: K) => {
  return inputs.value[str];
};

const setInput = <K extends keyof TableTypes.InputsType>(
  str: K,
  value: TableTypes.AcceptedTypes[],
) => {
  inputs.value[str] = value as TableTypes.InputsType[K];
};

const resetInputsValue = <K extends keyof TableTypes.InputsType>(key: K) => {
  console.log('**- resetInputsValue()\n *-- Resetting: ' + key);
  inputs.value[key] = backupInputs[key];
};

const getSearch = () => {
  return inputs.value.searchInput.toLowerCase();
};

const getFilters = () => {
  return inputs.value.filterInput;
};

const getBoolean = (str: string) => {
  return booleans.value[str];
};

const changeBoolean = (str: string, setToggle: boolean | undefined = undefined, timeout = 80) => {
  setTimeout(() => {
    console.log('*** changeBoolean(): ' + str + ', ' + setToggle);
    if (typeof setToggle === 'boolean') {
      booleans.value[str] = setToggle;
    }
    booleans.value[str] = !booleans.value[str];
  }, timeout);
};

const resetButton = () => {
  console.log('*** resetButton()');
  const resetList: Array<keyof TableTypes.InputsType> = Object.keys(inputs.value) as Array<
    keyof TableTypes.InputsType
  >;
  resetList.forEach((element) => resetInputsValue(element));
};

/*
const moveEntry = (index: number | undefined) => {
  console.log('*** moveEntry()');

  if (typeof index === 'number') {
    booleans.value.formInputArea = true;
    inputs.value.formInput = Object.values(tableData.value.renderedData[index]);
    inputs.value.currentModifiedEntry = Object.values(tableData.value.renderedData[index]);
  } else if (index === undefined) {
    pushInput();
    booleans.value.formInputArea = false;
    booleans.value.expandField = false;
  } else {
    console.log('- moveEntry got a strange input');
  }
};
*/

const modifyEntry = (index: number) => {
  //start her
  console.log('*** modifyEntry(): ' + index);
  const formInputTemp = Object.values(getData('renderedData')[index]);
  setInput('formInput', formInputTemp);
};

const deleteEntry = (index: number, timeout = 80) => {
  console.log('*** deleteEntry()');
  tableData.value.baseData.splice(index, 1);
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
      ascending: (key: string) => (tableData.value.baseData = sortBy(getData('baseData'), key)),
      descending: (key: string = 'default') =>
        (tableData.value.baseData = sortBy(getData('baseData').reverse())),
    };

    sorting.value.currentSort = key;
    sorting.value.sortState = nextState;
    tableData.value.baseData = sortActions[nextState](key);
  }, 80); //timeout
};

const resetFilterField = (str: number | undefined) => {
  console.log('*** resetfilterfield()');
  if (str === undefined) {
    inputs.value.filterInput = fillArray(null);
    inputs.value.searchInput = '';
    console.log('resetAll called. finterInput is now: ' + inputs.value.filterInput);
  } else {
    inputs.value.filterInput[str] = null;
  }
};

const searchFunction = () => {
  console.log('*** searc()');
  if (getFilters().every((element) => element === undefined && getSearch() === '')) {
    console.log('*** searchfunction ended early');
    setData(getData('baseData'), 'renderedData');
    booleans.value.searchMode = false;
    dropdownMapping();
    return;
  }

  setData([], 'renderedData');
  console.log('- Searchfunction starting for loop');
  for (let i = 0; i < getData('baseData').length; i++) {
    console.log('- Searchfunction for loop iteration: ' + i);
    const stringedValues = JSON.stringify(Object.values(getData('baseData')[i]));
    if (!getSearch() || stringedValues.toLowerCase().includes(getSearch())) {
      console.log('- Searchfunction if statement passed');
      if (
        Object.values(getData('baseData')[i]).every(
          (element, index) => !getFilters()[index] || element == getFilters()[index],
        )
      ) {
        console.log('- Searchfunction second if statement passed');
        tableData.value.renderedData.push(getData('baseData')[i]);
      } else {
        continue;
      }
    } else {
      continue;
    }
  }
  booleans.value.searchMode = true;
  dropdownMapping();
};

const dropdownMapping = () => {
  tableData.value.currentDropdowns = [];
  console.log('*** dropDownMapping()');
  for (let i = 0; i < getData('renderedData').length; i++) {
    const tempArray = Object.values(getData('renderedData')[i]);
    for (let j = 0; j < tempArray.length; j++) {
      if (!tableData.value.currentDropdowns[j]) {
        tableData.value.currentDropdowns[j] = [];
      }
      if (tableData.value.currentDropdowns[j].includes(tempArray[j])) {
        continue;
      }
      tableData.value.currentDropdowns[j].push(tempArray[j]);
    }
  }
  for (let i = 0; i < tableData.value.currentDropdowns.length; i++) {
    tableData.value.currentDropdowns[i] = sortBy(tableData.value.currentDropdowns[i]);
  }
  console.log('*** dropDownMapping end');
};

const dropdownMap = () => {};

const sortStateIcon = (field: string) => {
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

const expandEntry = (index: number) => {
  console.log('*** expandEntry()');
  setTimeout(() => {
    inputs.value.expandInput = Object.values(tableData.value.renderedData[index]);
    booleans.value.expandField = !booleans.value.expandField;
  }, 80); //timeout
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
                      class="sort-button icon interactable"
                      @click="sortTable(field)"
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
                  v-for="(item, index) in getData('renderedData')"
                  :key="getData('renderedData').indexOf(item)"
                >
                  <td v-for="key in tableData.dataFields" :key="key">
                    {{ item[key as keyof typeof item] }}
                  </td>
                  <!---
                                    <td v-show="booleans.manipulateTable">
                                        <button class="bi bi-arrows-angle-expand icon list-buttons interactable" @click="
                                            !booleans.expandField
                                                ? [expandEntry(index), deleteEntry(index)]
                                                : alertFunction('Finish what you\'re doing first!')
                                            "></button>
                                    </td>
                                -->
                  <td>
                    <button
                      :class="{
                        invisible: getBoolean('formInputArea') || !getBoolean('manipulateTable'),
                      }"
                      class="bi bi-wrench icon list-buttons interactable"
                      @click="
                        !getBoolean('formInputArea')
                          ? [
                              modifyEntry(index),
                              changeBoolean('formInputArea', undefined, 0),
                              deleteEntry(index, 0),
                            ]
                          : alertFunction('Finish what you\'re doing first!')
                      "
                    ></button>
                  </td>
                  <td>
                    <button
                      :class="{ invisible: !getBoolean('manipulateTable') }"
                      class="bi bi-trash3 icon list-buttons interactable"
                      @click="deleteEntry(index)"
                    ></button>
                  </td>
                </tr>
                <tr class="input-area">
                  <td
                    v-show="getBoolean('formInputArea')"
                    v-for="(item, index) in tableData.dataFields"
                  >
                    <input type="text" required :key="index" v-model="inputs.formInput[index]" />
                  </td>
                  <td v-show="getBoolean('formInputArea')" colspan="1">
                    <button
                      type="submit"
                      class="new-entry-submit icon interactable"
                      @click="
                        createEntryObject(), changeBoolean('formInputArea', undefined, 0)
                      "
                    >
                      &#10003;
                    </button>
                  </td>
                  <td v-show="getBoolean('formInputArea')">
                    <button
                      @click="resetInputsValue('formInput')"
                      class="bi bi-trash3 icon interactable"
                    ></button>
                  </td>
                </tr>
                <tr class="" v-show="getBoolean('expandField')">
                  <td v-for="(item, index) in inputs.expandInput">
                    <strong>{{ inputs.expandInput[index] }}</strong>
                  </td>
                  <td rowspan="2" colspan="3">
                    <button
                      @click="createEntryObject()"
                      class="bi bi-arrows-angle-contract icon interactable"
                    ></button>
                  </td>
                </tr>
                <!-- Show Age section
                            <tr class="" v-show="booleans.expandField">
                                <td><strong> Age: </strong></td>
                                <td>{{ getAge(inputs.expandInput[4]) }}</td>
                            </tr>
                            --->
              </tbody>
            </table>
          </div>
        </div>
        <div class="side-buttons">
          <button
            id="funnel-button"
            class="bi bi-funnel-fill icon interactable"
            @click="
              getBoolean('filterMode')
                ? [changeBoolean('filterMode'), resetFilterField(undefined)]
                : changeBoolean('filterMode')
            "
            title="Filter by properties"
          ></button>
          <button
            class="icon interactable"
            @click="changeBoolean('manipulateTable')"
            style="transform: rotate(90deg)"
            title="Modify table"
          >
            &#9998;
          </button>
          <button
            id="plus-button"
            class="icon interactable"
            @click="changeBoolean('formInputArea')"
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
        </div>
      </div>
      <h4 style="font-size: 15px; margin-top: 5px; font-weight: normal">
        Total entries: {{ tableData.baseData.length }}
      </h4>
    </div>
    <footer>
      <div></div>
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

.input-area input {
  text-align: center;
  font-size: 14px;
  margin-top: 0;
  background-color: #eae9ea;
  border-radius: 5px;
  height: 18px;
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
  width: 11px;
  padding: 0;
  margin: 0;
}

.side-buttons {
  margin-top: 40px;
  width: 32px;
  margin-left: 5px;
  border-collapse: collapse;

  button {
    border: 1px solid rgb(59, 54, 58);
    border-radius: 7px;
    margin-top: 3px;
    margin-bottom: 3px;
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

.new-entry-submit {
  font-size: 14px;
  font-weight: bold;
  padding-left: 7.8px;
  padding-right: 7.8px;
}

#clear-button {
  text-align: center;
  font-size: 5;
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

.button {
  cursor: pointer;
}

.invisible {
  visibility: hidden;
}

.icon {
  border: 0;
  background-color: transparent;
  color: #eae9ea;
}
</style>
