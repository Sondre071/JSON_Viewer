<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Ref } from 'vue';
import { sortBy } from 'lodash';
import sourceData from '../assets/data.json';
import * as TableTypes from "./BaseTable.types"


const fillArray = (value: TableTypes.AcceptedTypes) => {
    return Object.keys(sourceData[0]).map((x) => value)
}

const booleans = ref({
    expandField: false,
    filterField: false,
    filterMode: false,
    inputArea: false,
    manipulateMode: false,
    searchMode: false,
});

const tableData: Ref<TableTypes.TableDataType> = ref({
    currentDropdowns: [],
    undisplayedData: sourceData,                // Base data to draw from
    dataFields: Object.keys(sourceData[0]),     // Columns/keys/fields
    displayedData: sourceData,                  // Filtered and searched data
    unsortedData: sourceData,                   // Original unsorted data plus new entries
})

const inputs: Ref<TableTypes.InputsType> = ref({
    expandDate: '',
    expandInput: fillArray(""),
    filterInput: fillArray(null),
    formInput: fillArray(""),
    modifyEntryInput: fillArray(""),
    searchInput: ""
})

const sorting: Ref<TableTypes.SortingType> = ref({
    currentSort: "",
    sortState: "none"
})


const dataset = (str: string = 'default') => {
    if (str === 'override') {
        console.log('- returning base dataset');
        return tableData.value.undisplayedData;
    } else if (str === 'raw') {
        console.log('- returning raw dataset');
        return tableData.value.unsortedData;
    } else {
        console.log('- returning dataset');
        return tableData.value.displayedData;
    }
};


const setData = (input: Array<TableTypes.EntryObject>, override = 'default') => {
    console.log('- setData called');
    if (override === 'override') {
        tableData.value.undisplayedData = input;
    } else {
        tableData.value.displayedData = input;
    }
};


const getSearch = () => {
    return inputs.value.searchInput.toLowerCase();
};


const getFilters = () => {
    return inputs.value.filterInput;
};


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


const resetFields = () => {
    resetFilterField(undefined);
    booleans.value.searchMode = false;
    resetInput();
};


const resetInput = () => {
    inputs.value.formInput = Object.keys(sourceData[0]).map((x) => '');
    booleans.value.inputArea = false;
};


const toggleShow = (str: string) => {
    console.log('*** toggleShow function called');
    if (str === 'show_entry') {
        booleans.value.inputArea = true;
        console.log('- inputArea toggled on');
    } else if (str === 'hide_entry') {
        booleans.value.inputArea = false;
        console.log('- inputArea toggled off');
    }
};


const moveEntry = (index: number | undefined) => {
    console.log('*** moveEntry function called');
    if (typeof index === 'number') {
        booleans.value.inputArea = true;
        inputs.value.formInput = Object.values(tableData.value.displayedData[index]);
    } else if (index === undefined) {
        pushInput();
        booleans.value.inputArea = false;
        booleans.value.expandField = false;
    } else {
        console.log('- moveEntry got a strange input');
    }
};


const deleteEntry = (index: number) => {
    console.log('*** deleteEntry function called');
    tableData.value.undisplayedData.splice(index, 1);
};


const expandEntry = (index: number) => {
    console.log('*** expandEntry function called');

    inputs.value.expandInput = Object.values(tableData.value.displayedData[index]);
    booleans.value.expandField = !booleans.value.expandField;
};


const sortTable = (key: string) => {
    console.log('*** sorttable function called');
    const states: ("none" | "ascending" | "descending")[] = ["none", "ascending", "descending"]
    if (sorting.value.currentSort !== key) {
        sorting.value.sortState = "none"
    }
    const currentIndex = states.indexOf(sorting.value.sortState)
    const nextIndex = (currentIndex + 1) % states.length
    const nextState = states[nextIndex]
    const sortActions = {
        none: (key: string = "default") => tableData.value.undisplayedData = tableData.value.unsortedData,
        ascending: (key: string) => tableData.value.undisplayedData = sortBy(dataset('override'), key),
        descending: (key: string = "default") => tableData.value.undisplayedData = sortBy(dataset('override').reverse())
    }

    sorting.value.currentSort = key;
    sorting.value.sortState = nextState;
    tableData.value.undisplayedData = sortActions[nextState](key)
};


const resetFilterField = (str: number | undefined) => {
    console.log('*** resetfilterfield function called');
    if (str === undefined) {
        inputs.value.filterInput = inputs.value.filterInput.map((x) => null);
        inputs.value.searchInput = '';
        console.log('resetAll called. finterInput is now: ' + inputs.value.filterInput);
    } else {
        inputs.value.filterInput[str] = null;
    }
};


const alertFunction = (str: string) => {
    alert(str);
};


const searchFunction = () => {
    console.log('*** searchfunction called');
    if (getFilters().every((element) => element === undefined && getSearch() === '')) {
        console.log('*** searchfunction ended early');
        setData(dataset('override'));
        booleans.value.searchMode = false;
        dropdownMapping();
        return;
    }

    setData([]);
    console.log('- Searchfunction starting for loop');
    for (let i = 0; i < dataset('override').length; i++) {
        console.log('- Searchfunction for loop iteration: ' + i);
        const stringedValues = JSON.stringify(Object.values(dataset('override')[i]));
        if (!getSearch() || stringedValues.toLowerCase().includes(getSearch())) {
            console.log('- Searchfunction if statement passed');
            if (
                Object.values(dataset('override')[i]).every(
                    (element, index) => !getFilters()[index] || element == getFilters()[index]
                )
            ) {
                console.log('- Searchfunction second if statement passed');
                tableData.value.displayedData.push(dataset('override')[i]);
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
    console.log('*** dropDownMapping function called');
    for (let i = 0; i < dataset().length; i++) {
        const tempArray = Object.values(dataset()[i]);
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


const pushInput = () => {
    console.log('*** pushInput function called');
    const newEntryObject: TableTypes.EntryObject = {};

    for (let i = 0; i < tableData.value.dataFields.length; i++) {
        newEntryObject[tableData.value.dataFields[i]] = booleans.value.expandField
            ? inputs.value.expandInput[i]
            : inputs.value.formInput[i];
    }
    dataset('override').push(newEntryObject);
    dataset('raw').push(newEntryObject);

    booleans.value.inputArea = false;
    inputs.value.formInput = tableData.value.dataFields.map((x) => '');
    dropdownMapping();
    searchFunction();
};


const sortStateIcon = (field: string) => {
    if (field !== sorting.value.currentSort) {
        return '&#8693;'
    }
    const icons = {
        "none": "&#8693;",
        "ascending": "&#8648;",
        "descending": "&#8650;"
    }

    return icons[sorting.value.sortState]
}

dropdownMapping();
console.log('----- Website loaded -----');

watch(() => tableData.value.undisplayedData, searchFunction, { deep: true });
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
                            <input type="search" name="form" v-model="inputs.searchInput" placeholder="Search for property"
                                aria-describedby="button-addon2" />
                        </div>
                        <table id="" class="table-element">
                            <thead>
                                <tr>
                                    <th class=""
                                        :class="{ 'filter-mode': booleans.filterMode, 'non-filter-mode': !booleans.filterMode }"
                                        v-for="(field, index) in tableData.dataFields">
                                        {{ field }}
                                        <button :key="field" class="sort-button icon interactive" @click="sortTable(field)"
                                            aria-label="Sort Icon">
                                            <span v-html="sortStateIcon(field)"></span>
                                        </button>
                                        <div v-show="booleans.filterMode" class="dropdowns-container">
                                            <div class="dropdowns">
                                                <select v-model="inputs.filterInput[index]">
                                                    <option v-for="(value, valueIndex) in tableData.currentDropdowns[index]"
                                                        :key="valueIndex">
                                                        {{ value }}
                                                    </option>
                                                </select>
                                                <button class="bi bi-trash3 icon interactive"
                                                    @click="resetFilterField(index)"></button>
                                            </div>
                                        </div>
                                    </th>
                                    <th v-show="booleans.manipulateMode" class="filler-header" colspan="3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(item, index) in dataset()" :key="dataset().indexOf(item)">
                                    <td v-for="key in tableData.dataFields" :key="key">
                                        {{ item[key as keyof typeof item] }}
                                    </td>
                                    <td v-show="booleans.manipulateMode">
                                        <button class="bi bi-arrows-angle-expand icon list-buttons interactive" @click="
                                            !booleans.expandField
                                                ? [expandEntry(index), deleteEntry(index)]
                                                : alertFunction('Finish what you\'re doing first!')
                                            "></button>
                                    </td>
                                    <td v-show="booleans.manipulateMode">
                                        <button class="bi bi-wrench icon list-buttons interactive" @click="
                                            !booleans.inputArea
                                                ? [moveEntry(index), deleteEntry(index)]
                                                : alertFunction('Finish what you\'re doing first!')
                                            "></button>
                                    </td>
                                    <td v-show="booleans.manipulateMode"><button
                                            class="bi bi-trash3 icon list-buttons interactive"
                                            @click="deleteEntry(index)"></button></td>
                                </tr>
                                <tr class="">
                                    <td v-show="booleans.inputArea" v-for="(item, index) in tableData.dataFields">
                                        <input type="text" :key="index" v-model="inputs.formInput[index]" />
                                    </td>
                                    <td v-show="booleans.inputArea" colspan="2">
                                        <button type="button" class="interactive" @click="pushInput()">Submit</button>
                                    </td>
                                    <td v-show="booleans.inputArea">
                                        <button @click="resetInput()"
                                            class="bi bi-trash3 icon list-buttons interactive"></button>
                                    </td>
                                </tr>
                                <tr class="" v-show="booleans.expandField">
                                    <td v-for="(item, index) in inputs.expandInput">
                                        <strong>{{ inputs.expandInput[index] }}</strong>
                                    </td>
                                    <td rowspan="2" colspan="3">
                                        <button @click="moveEntry(undefined)"
                                            class="bi bi-arrows-angle-contract icon interactive"></button>
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
                    <button id="funnel-button" class="bi bi-funnel-fill icon interactive" @click="
                        booleans.filterMode
                            ? [(booleans.filterMode = false), resetFilterField(undefined)]
                            : (booleans.filterMode = true)
                        " title="Filter by properties">
                    </button>
                    <button class="icon interactive" @click="booleans.manipulateMode = !booleans.manipulateMode"
                        style="transform: rotate(90deg);" title="Modify table">
                        &#9998;
                    </button>
                    <button id="plus-button" class="icon interactive"
                        @click="booleans.inputArea ? toggleShow('hide_entry') : toggleShow('show_entry')"
                        title="Add new entry">
                        &#43;
                    </button>
                    <button id="clear-button" class="icon interactive" @click="resetFields()"
                        title="Reset inputs and filters">
                        &#8634;
                    </button>
                </div>
            </div>
            <h4 style=" font-size:15px; margin-top: 5px; font-weight:normal;">Total entries: {{
                tableData.undisplayedData.length }}</h4>
        </div>



        <footer>


            <div>
                <h2>{{ getSearch() }}</h2>
                <h3>{{ inputs.filterInput }}</h3>
                <h3>{{ tableData.dataFields }}</h3>
                <h3>Modify: {{ inputs.formInput }}</h3>
                <h3>Expand: {{ inputs.expandInput }}</h3>
                <h3>{{ getAge('1997-04-29') }}</h3>
            </div>
        </footer>
    </main>
</template>

<style scoped>
main {
    background-color: #2d282c;
    border: 2px groove rgba(255, 255, 255, 0.20);
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

tbody tr:nth-child(even) {
    background-color: #504a4f;
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

#clear-button {
    text-align: center;
    font-size: 5;
}


footer {
    color: white;
}

.interactive {
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

.icon {
    border: 0;
    background-color: transparent;
    color: #eae9ea;
}
</style>