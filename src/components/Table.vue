<template>
    <h1 :style="{ 'margin-bottom': '30px' }">Sondre's JSON Viewer</h1>
    <div class="searchBar">
        <div class="input-group-mb-5">
            <input type="search" class="form-control" name="form" v-model="searchQuery" placeholder="Search for property"
                aria-describedby="button-addon2">
        </div>
    </div>
    <table id="tableComponent" class="table table-bordered table-striped">
        <thead>
            <tr>
                <th v-for="field in jsonKeys" :key="field" @click="sortTable(field)">
                    {{ field }} <i :style="{ 'fontWeight': 'normal', 'fontStyle': 'normal' }"
                        aria-label="Sort Icon">&#x21F5;</i>
                </th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="item in (searchQueryOn ? queryJson : jsonData)"
                :key="(searchQueryOn ? queryJson.indexOf(item) : jsonData.indexOf(item))">
                <td v-for="key in jsonKeys" :key="key"> {{ item[key as keyof typeof item] }}</td>
            </tr>
        </tbody>
    </table>
    <div class="buttons-box">
        <button type.prevent="button" class="show-input-button display-button button" :class="{ selectedButton: inputQueryOn }"
            @click="toggleShow('input')">Add new
            entry</button>
        <button type.prevent="button" class="show-filter-button display-button button"
            :class="{ selectedButton: filterQueryOn }" @click="toggleShow('filter')">Filter
            properties</button>
        <button type.prevent="button" class="reset-fields-button display-button button" @click="toggleShow('')">Reset
            fields</button>
    </div>
    <div v-show="inputQueryOn" class="hidden-area">
        <h3>Add new entry</h3>
        <form>
            <input type="text" v-for="field, index in jsonKeys" :key="field" v-model="formInput[index]" class="input-field" :placeholder=jsonKeys[index]>
            <br><button type="button" class="button" @click="submitInput()">Submit</button><br>
        </form>
    </div>

    <div v-show="filterQueryOn" class="hidden-area">
        <h3>Filter by existing property</h3>
        <div class="dropdowns" v-for="(values, index) in valuesArray" :key="index">
            <div> {{ jsonKeys[index] }}</div>
            <select v-model="filterQueryField">
                <option v-for="(value, valueIndex) in values" :key="valueIndex">{{ value }}</option>
            </select>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { Ref } from "vue"
import { sortBy } from "lodash";
import "bootstrap/dist/css/bootstrap.min.css";
import jsonImport from "../assets/data.json"

const jsonData = ref(jsonImport)
const jsonKeys = Object.keys(jsonData.value[0]);
const searchQuery = ref("");
const sort = ref(false);
const queryJson: any = ref([]);
const searchQueryOn = ref(false);
const inputQueryOn = ref(false);
const filterQueryOn = ref(false);
const filterQueryField = ref("");
const formInput = ref(jsonKeys.map((x) => ""));
const valuesArray: Ref<valuesArrayTS[]> = ref([]);
type valuesArrayTS = [string[]?, string[]?, string[]?, number[]?, string[]?]


// creates the array needed to render the filter dropdowns
const valueMapping = () => {
jsonData.value.forEach((element) => {
    let tempArray: any = Object.values(element);
    //console.log("valuesArray mapping.... it contains: " + valuesArray.value + ". tempArray containing: " + tempArray)

    for (let j = 0; j < tempArray.length; j++) {
        //console.log("-inner loop accessed")
        if (!valuesArray.value[j]) { valuesArray.value[j] = [] }
        if (valuesArray.value[j].includes(tempArray[j])) {
            //console.log("-- if statement accessed")
            continue
        }
        valuesArray.value[j].push(tempArray[j])
        //console.log("-inner loop iteration done")
        //console.log("tempArray: " + tempArray)
    }})}


// toggle showing of filter and input fields
const toggleShow = (str: string) => {
    if (str === "input") {
        filterQueryOn.value = false;
        //console.log("filterQueryOn toggled off")
        filterQueryField.value = ""
        inputQueryOn.value = true;
        //console.log("searchQueryOn toggled on")
    } else if (str === "filter") {
        inputQueryOn.value = false;
        formInput.value = jsonKeys.map((x) => "")
        //console.log("searchQueryOn toggled off")
        filterQueryOn.value = true;
        //console.log("filterQueryOn toggled on")
    } else {
        filterQueryOn.value = false;
        inputQueryOn.value = false;
        formInput.value = jsonKeys.map((x) => "")
        filterQueryField.value = ""
        searchQuery.value = ""
    }}


// initiates sorting functionality
const sortTable = (key: string | number) => {
    //console.log("- sortTable initiated")
    sort.value = true
    if (searchQueryOn.value) {
        //console.log("- sortTable evaluated to true")
        queryJson.value = sortBy(queryJson.value, key)
    } else {
        //console.log("- sortTable evaluated to false")
        jsonData.value = sortBy(jsonData.value, key)
    }}


// initiates search functionality
const searchFunction = (): void => {
    queryJson.value = []
    for (let i = 0; i < jsonData.value.length; i++) {
        //console.log("--- searchFunction initiated")
        if (JSON.stringify(Object.values(jsonData.value[i])).toLowerCase().includes(searchQuery.value.toLowerCase()) &&
            JSON.stringify(Object.values(jsonData.value[i])).toLowerCase().includes(filterQueryField.value.toLowerCase())) {
            //console.log("- If statement passed. changing the jsonData")
            queryJson.value.push(jsonData.value[i])
            searchQueryOn.value = true;
        }
    } if (searchQuery.value === "" && filterQueryField.value === "") {
        //console.log("- searchquery value is null")
        searchQueryOn.value = false;
    }}


// creates an object and appends each value + jsonkey to it, then appends to json
const submitInput = () => {
    
    const newObject: any = {}

    for (let i = 0; i < jsonKeys.length; i++) {
        //console.log(jsonKeys)
        newObject[jsonKeys[i]] = formInput.value[i]
        //console.log("added " + formInput.value[i] + "to the object")
    }
    jsonData.value.push(newObject)
    formInput.value = jsonKeys.map((x) => "")
    valueMapping()
}

valueMapping()

watch(() => searchQuery.value, searchFunction)
watch(() => filterQueryField.value, searchFunction)
</script>





<style scoped>

.hidden-area {
    margin: 25px 0 0 0;
}

.dropdowns {
    display: inline-block;
}

.button {
    margin: 5px 2px;
    border-radius: 5px;
}

.selectedButton {
    box-shadow: 0px 0px 2px 1px gray;
}

.reset-fields-button {
    background-color: black;
    color: white;
}</style>