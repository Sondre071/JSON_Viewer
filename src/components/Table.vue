<template>
    <h1 :style="{ 'margin-bottom': '30px' }">Sondre's JSON Viewer</h1>
    <div class="searchBar">
        <div class="input-group-mb-5">
            <input type="search" class="form-control" name="form" v-model="dynamicFields.searchInput" placeholder="Search for property"
                aria-describedby="button-addon2">
        </div>
    </div>
    <table id="tableComponent" class="table table-bordered table-striped">
        <thead>
            <tr>
                <th v-for="field, index in jsonKeys">
                    {{ field }}
                    <button :key="field" class="row-header-button icon" @click="sortTable(field)"
                        aria-label="Sort Icon">&#x21F5;</button> <br>
                    <select v-model="dynamicFields.filterInput">
                        <option v-for="(value, valueIndex) in valuesArray[index]" :key="valueIndex">{{ value }}</option>
                    </select>
                    <button class="bi bi-trash3 icon" @click=" setFilterInput('')"></button>

                </th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="item in (booleans.searchField ? modifiedJsonData : jsonData)"
                :key="(booleans.searchField ? modifiedJsonData.indexOf(item) : jsonData.indexOf(item))">
                <td v-for="key in jsonKeys" :key="key"> {{ item[key as keyof typeof item] }}</td>
            </tr>
        </tbody>
    </table>
    <div class="buttons-box">
        <button type.prevent="button" class="show-input-button display-button button"
            :class="{ selectedButton: booleans.newEntryArea }" @click="booleans.newEntryArea ? toggleShow('hide_entry'): toggleShow('show_entry')">Add new
            entry</button>
        <button type.prevent="button" class="reset-fields-button display-button button" @click="toggleShow('')">Reset
            fields</button>
    </div>
    <div v-show="booleans.newEntryArea" class="hidden-area">
        <h3>Add new entry</h3>
        <form>
            <div v-for="field, index in jsonKeys" class="filter-box">
                <div class="hidden-area-headers">{{ jsonKeys[index] }}</div>
                <input type="text" :key="field" v-model="dynamicFields.formInput[index]" class="input-field">
            </div>
            <br><button type="button" class="button" @click="submitInput()">Submit</button><br>
        </form>
    </div>
    <h2>{{ dynamicFields.searchInput }}</h2>
    <h2></h2>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { Ref } from "vue";
import { sortBy } from "lodash";
import "bootstrap/dist/css/bootstrap.min.css";
import jsonImport from "../assets/data.json";

const jsonData = ref(jsonImport)
const jsonKeys = Object.keys(jsonData.value[0]);
const modifiedJsonData: any = ref([]);
const booleans = ref({
    searchField: false,
    newEntryArea: false,
    filterField: false,
    sort: false
})

const dynamicFields = ref({
    modifiedJsonData: [],
    searchInput: "",
    filterInput: "",
    formInput: jsonKeys.map((x) => "")

})



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
        }
    })
}


// toggle showing of filter and input fields
const toggleShow = (str: string) => {
    if (str === "show_entry") {
        booleans.value.newEntryArea = true;
        console.log("newEntryArea toggled on")
    } else if (str === "hide_entry") {
        booleans.value.newEntryArea = false;
        console.log("newEntryArea toggled off")
        
    } else {
        console.log("toggleShow did something weird")
    }
}


// initiates sorting functionality
const sortTable = (key: string | number) => {
    //console.log("- sortTable initiated")
    booleans.value.sort = true
    if (booleans.value.searchField) {
        //console.log("- sortTable evaluated to true")
        modifiedJsonData.value = sortBy(modifiedJsonData.value, key)
    } else {
        //console.log("- sortTable evaluated to false")
        jsonData.value = sortBy(jsonData.value, key)
    }
}


const setFilterInput = (str: string) => {
    dynamicFields.value.filterInput = str;
    console.log("filterInput changed to " + str)
}

// initiates search functionality
const searchFunction = () => {
    modifiedJsonData.value = []
    for (let i = 0; i < jsonData.value.length; i++) {
        //console.log("--- searchFunction initiated")
        if (JSON.stringify(Object.values(jsonData.value[i])).toLowerCase().includes(dynamicFields.value.searchInput.toLowerCase()) &&
            JSON.stringify(Object.values(jsonData.value[i])).toLowerCase().includes(dynamicFields.value.filterInput.toLowerCase())) {
            //console.log("- If statement passed. changing the jsonData")
            modifiedJsonData.value.push(jsonData.value[i])
            booleans.value.searchField = true;
        }
    } if (dynamicFields.value.searchInput === "" && dynamicFields.value.filterInput === "") {
        //console.log("- searchInput value is null")
        booleans.value.searchField = false;
    }
}


// creates an object and appends each value + jsonkey to it, then appends to json
const submitInput = () => {

    const newObject: any = {}

    for (let i = 0; i < jsonKeys.length; i++) {
        //console.log(jsonKeys)
        newObject[jsonKeys[i]] = dynamicFields.value.formInput[i]
        //console.log("added " + formInput.value[i] + "to the object")
    }
    jsonData.value.push(newObject)
    dynamicFields.value.formInput = jsonKeys.map((x) => "")
    valueMapping()
}

valueMapping()

watch(() => dynamicFields.value.searchInput, searchFunction)
watch(() => dynamicFields.value.filterInput, searchFunction)
</script>





<style scoped>
.icon {
    border: 0;
    background-color: transparent;
}

.row-header-button {
    box-sizing: border-box;
    font-weight: normal;
    border-radius: 3px;
}

.bi-funnel-fill {
    font: black;
}

.bi-trash3 {
    margin-left: 5px;;
}

.hidden-area {
    margin: 25px 0 0 0;
}

.dropdowns {
    display: inline-block;
}

.filter-box {
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
    background-color: rgb(58, 58, 58);
    color: white;
}

.hidden-area-headers {
    font-weight: bold;
}
</style>