<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Ref } from 'vue';
import { sortBy } from 'lodash';
import jsonImport from '../assets/data.json';

let valuesArray: Ref<Array<string | number>[]> = ref([]);
const booleans = ref({
    searchMode: false,
    inputArea: false,
    filterField: false,
    filterMode: false,
    expandField: false,
    sort: false
});

type DynamicField = {
    jsonData: typeof jsonImport;
    jsonKeys: Array<string>;
    modifiedJsonData: Array<(typeof jsonImport)[0]>;
    searchInput: string;
    filterInput: Array<string | null>;
    formInput: Array<any>;
    modifyEntryInput: Array<string>;
    expandInput: Array<any>;
    expandDate: string;
};

type Field = {};

const field: Field = {
    label: '',
    value: '',
};

const form: Field[] = [field, field];

const dynamicFields: Ref<DynamicField> = ref({
    jsonData: jsonImport,
    jsonKeys: Object.keys(jsonImport[0]),
    modifiedJsonData: jsonImport,
    expandInput: Object.keys(jsonImport[0]).map((x) => ''),
    expandDate: '',
    searchInput: '',
    filterInput: Object.keys(jsonImport[0]).map((x) => null),
    formInput: Object.keys(jsonImport[0]).map((x) => ''),
    modifyEntryInput: Object.keys(jsonImport[0]).map((x) => '')
});

const dataset = (str: string = 'default') => {
    if (str === 'override') {
        console.log('- returning base dataset');
        return dynamicFields.value.jsonData;
    } else {
        console.log('- returning dataset');
        return dynamicFields.value.modifiedJsonData;
    }
};

const setData = (text: typeof jsonImport, override = 'default') => {
    console.log('- setData called');
    if (override === 'override') {
        dynamicFields.value.jsonData = text;
    } else {
        dynamicFields.value.modifiedJsonData = text;
    }
};

const getSearch = () => {
    return dynamicFields.value.searchInput.toLowerCase();
};

const getFilters = () => {
    return dynamicFields.value.filterInput;
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
    dynamicFields.value.formInput = Object.keys(jsonImport[0]).map((x) => '');
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
        dynamicFields.value.formInput = Object.values(dynamicFields.value.modifiedJsonData[index]);
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
    dynamicFields.value.jsonData.splice(index, 1);
};

const expandEntry = (index: number) => {
    console.log('*** expandEntry function called');

    dynamicFields.value.expandInput = Object.values(dynamicFields.value.modifiedJsonData[index]);
    booleans.value.expandField = !booleans.value.expandField;
};

const sortTable = (key: string | number) => {
    console.log('*** sorttable function called');
    booleans.value.sort = true;
    dynamicFields.value.modifiedJsonData = sortBy(dataset(), key);
};

const resetFilterField = (str: number | undefined) => {
    console.log('*** resetfilterfield function called');
    if (str === undefined) {
        dynamicFields.value.filterInput = dynamicFields.value.filterInput.map((x) => null);
        dynamicFields.value.searchInput = '';
        console.log('resetAll called. finterInput is now: ' + dynamicFields.value.filterInput);
    } else {
        dynamicFields.value.filterInput[str] = null;
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
                dynamicFields.value.modifiedJsonData.push(dataset('override')[i]);
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
    valuesArray.value = [];
    console.log('*** newDropDown function called');
    for (let i = 0; i < dataset().length; i++) {
        const tempArray = Object.values(dataset()[i]);
        for (let j = 0; j < tempArray.length; j++) {
            if (!valuesArray.value[j]) {
                valuesArray.value[j] = [];
            }
            if (valuesArray.value[j].includes(tempArray[j])) {
                continue;
            }
            valuesArray.value[j].push(tempArray[j]);
        }
    }
    for (let i = 0; i < valuesArray.value.length; i++) {
        valuesArray.value[i] = sortBy(valuesArray.value[i]);
    }
    console.log('*** dropDownMapping end');
};

const pushInput = () => {
    console.log('*** pushInput function called');
    const newEntryObject: any = {};

    for (let i = 0; i < dynamicFields.value.jsonKeys.length; i++) {
        //console.log(jsonKeys)
        newEntryObject[dynamicFields.value.jsonKeys[i]] = booleans.value.expandField
            ? dynamicFields.value.expandInput[i]
            : dynamicFields.value.formInput[i];
        //console.log("added " + formInput.value[i] + "to the object")
    }
    dataset('override').push(newEntryObject);
    booleans.value.inputArea = false;
    dynamicFields.value.formInput = dynamicFields.value.jsonKeys.map((x) => '');
    dropdownMapping();
    searchFunction();
};

dropdownMapping();
console.log('----- Website loaded -----');

watch(() => dynamicFields.value.jsonData, searchFunction, { deep: true });
watch(() => dynamicFields.value.searchInput, searchFunction);
watch(() => dynamicFields.value.filterInput, searchFunction, { deep: true });
</script>

<template>
    <header>
        <h1>Sondre's JSON Viewer</h1>
    </header>
    <main>
        <div class="table-and-side-buttons">
            <div class="table-component">

                <div class="table-container">
                    <div class="search-bar">
                        <input type="search" name="form" v-model="dynamicFields.searchInput"
                            placeholder="Search for property" aria-describedby="button-addon2" />
                    </div>
                    <table id="" class="table-element">
                        <thead>
                            <tr>
                                <th class=""
                                    :class="{ 'filter-mode': booleans.filterMode, 'non-filter-mode': !booleans.filterMode }"
                                    v-for="(field, index) in dynamicFields.jsonKeys">
                                    {{ field }}
                                    <button :key="field" class="sort-button icon interactive" @click="sortTable(field)"
                                        aria-label="Sort Icon">
                                        &#x21F5;
                                    </button>
                                    <div v-show="booleans.filterMode" class="dropdowns-container">
                                        <div class="dropdowns">
                                            <select v-model="dynamicFields.filterInput[index]">
                                                <option v-for="(value, valueIndex) in valuesArray[index]" :key="valueIndex">
                                                    {{ value }}
                                                </option>
                                            </select>
                                            <button class="bi bi-trash3 icon interactive"
                                                @click="resetFilterField(index)"></button>
                                        </div>
                                    </div>
                                </th>
                                <th class="filler-header" colspan="3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in dataset()" :key="dataset().indexOf(item)">
                                <td v-for="key in dynamicFields.jsonKeys" :key="key">
                                    {{ item[key as keyof typeof item] }}
                                </td>
                                <td>
                                    <button class="bi bi-arrows-angle-expand icon interactive" @click="
                                        !booleans.expandField
                                            ? [expandEntry(index), deleteEntry(index)]
                                            : alertFunction('Finish what you\'re doing first!')
                                        "></button>
                                </td>
                                <td>
                                    <button class="bi bi-wrench icon interactive" @click="
                                        !booleans.inputArea
                                            ? [moveEntry(index), deleteEntry(index)]
                                            : alertFunction('Finish what you\'re doing first!')
                                        "></button>
                                </td>
                                <td><button class="bi bi-trash3 icon interactive" @click="deleteEntry(index)"></button></td>
                            </tr>
                            <tr class="">
                                <td v-show="booleans.inputArea" v-for="(field, index) in dynamicFields.jsonKeys">
                                    <input type="text" :key="index" v-model="dynamicFields.formInput[index]" />
                                </td>
                                <td v-show="booleans.inputArea" colspan="2">
                                    <button type="button" class="interactive" @click="pushInput()">Submit</button>
                                </td>
                                <td v-show="booleans.inputArea">
                                    <button @click="resetInput()" class="bi bi-trash3 icon interactive"></button>
                                </td>
                            </tr>
                            <tr class="" v-show="booleans.expandField">
                                <td v-for="(item, index) in dynamicFields.expandInput">
                                    <strong>{{ dynamicFields.expandInput[index] }}</strong>
                                </td>
                                <td rowspan="2" colspan="3">
                                    <button @click="moveEntry(undefined)"
                                        class="bi bi-arrows-angle-contract icon interactive"></button>
                                </td>
                            </tr>
                            <tr class="" v-show="booleans.expandField">
                                <td><strong> Index in dataset: </strong></td>
                                <td>{{ getAge(dynamicFields.expandInput[4]) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="side-buttons">
                <button class="bi bi-funnel-fill icon interactive" @click="
                    booleans.filterMode
                        ? [(booleans.filterMode = false), resetFilterField(undefined)]
                        : (booleans.filterMode = true)
                    ">
                </button>
                <button class="icon">
                    +
                </button>
                <button class="icon">
                    R
                </button>
            </div>
        </div>


    </main>
    <footer>
        <div class="bottom-buttons-box">
            <button type.prevent="button" class="interactive"
                @click="booleans.inputArea ? toggleShow('hide_entry') : toggleShow('show_entry')">
                Add new entry
            </button>
            <button type.prevent="button" class="interactive" @click="resetFields()">
                Reset fields
            </button>
        </div>
        <div>
            <h2>{{ getSearch() }}</h2>
            <h3>{{ dynamicFields.filterInput }}</h3>
            <h3>{{ dynamicFields.jsonKeys }}</h3>
            <h3>Modify: {{ dynamicFields.formInput }}</h3>
            <h3>Expand: {{ dynamicFields.expandInput }}</h3>
            <h3>{{ getAge('1997-04-29') }}</h3>
        </div>
    </footer>
</template>

<style scoped>
main {
    background-color: #2d282c;
    border: 2px groove rgba(255, 255, 255, 0.20);
    border-top: 0;
    border-radius: 17px;
    box-shadow: 0 0 15px 0px rgba(255, 255, 255, 0.375);
    max-width: 80%;
    margin-left: auto;
    margin-right: auto;
    padding: 50px 0 50px 0;
}

.search-bar {
    width: 100%;

    input {
        width: 100%;
        border: 1px solid #eae9ea;
        padding: 8px 0;
        background-color: #eae9ea;

        &::placeholder {
            color: black;
            padding-left: 10px;
            font-weight: bold;
        }
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
    font-family: 'Segoe UI', system-ui, sans-serif;
    color: #eae9ea;
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
    width: 85%;
    margin-left: auto;
    margin-right: auto;
}

.table-element th {
    border: 1px solid rgb(235, 234, 235, 0.8);
    padding-top: 10px;
    padding-right: 20px;
}

.filter-mode {
    padding-bottom: 35px;
    margin-bottom: 40px;
}

.non-filter-mode {
    padding-bottom: 10px;
}

.table-element td {
    border: 1px solid rgb(235, 234, 235, 0.8);
    padding: 9px 0;
    background-color: #3b363a;
}

.dropdowns-container {
    position: relative;
    align-items: center;
    left: 10px;
}

.dropdowns {
    position: absolute;
    left: 0;
    right: 0;
}

.filler-header {
    width: 10px;
    padding: 0;
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
        width: 30px;
        height: 30px;
        font-size: 18px;
        background-color: rgb(235, 234, 235);
        color: black;

    }
}

.interactive {
    cursor: pointer;
}

.sort-button {
    position: absolute;
    margin: 2px;
    font-size: 17px;
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
