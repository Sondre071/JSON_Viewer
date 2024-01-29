<template>
    <h1 :style="{ 'margin-bottom': '30px' }">Sondre's JSON Viewer</h1>
    <div class="searchBar">
        <div class="input-group-mb-5">
            <input type="search" class="form-control" name="form" v-model="dynamicFields.searchInput"
                placeholder="Search for property" aria-describedby="button-addon2">
        </div>
    </div>
    <table id="tableComponent" class="table table-bordered table-striped">
        <thead>
            <tr>
                <th v-for="field, index in dynamicFields.jsonKeys">
                    {{ field }}
                    <button :key="field" class="row-header-button icon" @click="sortTable(field)"
                        aria-label="Sort Icon">&#x21F5;</button> <br>
                    <select v-model="dynamicFields.filterInput[index]">
                        <option v-for="(value, valueIndex) in valuesArray[index]" :key="valueIndex">{{ value }}</option>
                    </select>
                    <button class="bi bi-trash3 icon" @click=" resetFilterField(index)"></button>

                </th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="item in (getData())"
                :key="(booleans.searchMode ? dynamicFields.modifiedJsonData.indexOf(item) : dynamicFields.jsonData.indexOf(item))">
                <td v-for="key in dynamicFields.jsonKeys" :key="key"> {{ item[key as keyof typeof item] }}</td>
            </tr>
        </tbody>
    </table>
    <div class="buttons-box">
        <button type.prevent="button" class="show-input-button display-button button"
            :class="{ selectedButton: booleans.newEntryArea }"
            @click="booleans.newEntryArea ? toggleShow('hide_entry') : toggleShow('show_entry')">Add new
            entry</button>
        <button type.prevent="button" class="reset-fields-button display-button button" @click="toggleShow('')">Reset
            fields</button>
    </div>
    <div v-show="booleans.newEntryArea" class="hidden-area">
        <h3>Add new entry</h3>
        <form>
            <div v-for="field, index in dynamicFields.jsonKeys" class="filter-box">
                <div class="hidden-area-headers">{{ dynamicFields.jsonKeys[index] }}</div>
                <input type="text" :key="field" v-model="dynamicFields.formInput[index]" class="input-field">
            </div>
            <br><button type="button" class="button" @click="submitInput()">Submit</button><br>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { Ref } from "vue";
import { sortBy } from "lodash";
import "bootstrap/dist/css/bootstrap.min.css";
import jsonImport from "../assets/data.json";
const valuesArray: Ref<valuesArrayTS[]> = ref([]);
type valuesArrayTS = Array<Array<string | number>>
const booleans = ref({
    searchMode: false,
    newEntryArea: false,
    filterField: false,
    sort: false
})

const dynamicFields = ref({
    jsonData: jsonImport,
    jsonKeys: Object.keys(jsonImport[0]),
    modifiedJsonData: [],
    searchInput: "",
    filterInput: Object.keys(jsonImport[0]).map((x) => undefined),
    formInput: Object.keys(jsonImport[0]).map((x) => "")

})

const getData = () => {
    if (booleans.value.searchMode) {
        return dynamicFields.value.modifiedJsonData
    } else {
        return dynamicFields.value.jsonData
    }
}

const setData = (text) => {
    if (booleans.value.searchMode) {
        dynamicFields.value.modifiedJsonData = text
    } else {
        dynamicFields.value.jsonData = text
    }
}


// creates the array needed to render the filter dropdowns
const dropdownsMapping = () => {
    for (let i = 0; i < getData().length; i++) {
        let tempArray: any = Object.values(getData()[i]);
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
    }
    for (let i = 0; i < valuesArray.value.length; i++) {
        valuesArray.value[i] = sortBy(valuesArray.value[i]) 
    }

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
    setData(sortBy(getData(), key))
}


const resetFilterField = (indexNum: any) => {
    dynamicFields.value.filterInput[indexNum] = undefined
    console.log("filterInput changed")
}

// initiates search functionality
const searchFunction = () => {
    dynamicFields.value.modifiedJsonData = []
    for (let i = 0; i < dynamicFields.value.jsonData.length; i++) {
        //console.log("--- searchFunction initiated")
        if (JSON.stringify(Object.values(dynamicFields.value.jsonData[i])).toLowerCase().includes(dynamicFields.value.searchInput.toLowerCase()) &&
            Object.values(dynamicFields.value.jsonData[i]).every((element, index) => element == dynamicFields.value.filterInput[index] || dynamicFields.value.filterInput[index] === undefined)) {
            booleans.value.searchMode = true;
            getData().push(dynamicFields.value.jsonData[i])
            
        }
    } if (dynamicFields.value.searchInput === "" && dynamicFields.value.filterInput.every(element => element === undefined)) {
        //console.log("- searchInput value is null")
        booleans.value.searchMode = false;
    }
    dropdownsMapping()
}


// creates an object and appends each value + jsonkey to it, then appends to json
const submitInput = () => {

    const newEntryObject: any = {}

    for (let i = 0; i < dynamicFields.value.jsonKeys.length; i++) {
        //console.log(jsonKeys)
        newEntryObject[dynamicFields.value.jsonKeys[i]] = dynamicFields.value.formInput[i]
        //console.log("added " + formInput.value[i] + "to the object")
    }
    dynamicFields.value.jsonData.push(newEntryObject)
    dynamicFields.value.formInput = dynamicFields.value.jsonKeys.map((x) => "")
    dropdownsMapping()
}


dropdownsMapping()

watch(() => dynamicFields.value.searchInput, searchFunction)
watch(() => dynamicFields.value.filterInput, searchFunction, { deep: true })
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
    margin-left: 5px;
    ;
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
