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
            <tr v-for="item in (dataset())" :key="(dataset().indexOf(item))">
                <td v-for="key in dynamicFields.jsonKeys" :key="key"> {{ item[key as keyof typeof item] }}</td>
            </tr>
        </tbody>
    </table>
    <div class="buttons-box">
        <button type.prevent="button" class="show-input-button display-button button"
            :class="{ selectedButton: booleans.newEntryArea }"
            @click="booleans.newEntryArea ? toggleShow('hide_entry') : toggleShow('show_entry')">Add new
            entry</button>
        <button type.prevent="button" class="reset-fields-button display-button button"
            @click="resetFilterField(undefined), toggleShow('hide_entry'), booleans.searchMode = false">Reset
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
    <h2>{{ getSearch() }}</h2>
    <h3>{{ dynamicFields.filterInput }}</h3>
    <h3>{{ dynamicFields.jsonKeys }}</h3>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { Ref } from "vue";
import { sortBy } from "lodash";
import "bootstrap/dist/css/bootstrap.min.css";
import jsonImport from "../assets/data.json";
let valuesArray: Ref<Array<string | number>[]> = ref([]);
const booleans = ref({
    searchMode: false,
    newEntryArea: false,
    filterField: false,
    filterMode: false,
    sort: false
})

interface dynamicTypes {
    jsonData: typeof jsonImport,
    jsonKeys: Array<string>,
    modifiedJsonData: Array<typeof jsonImport[0]>,
    searchInput: string,
    filterInput: Array<string | null>,
    formInput: Array<string>

}

const dynamicFields: Ref<dynamicTypes> = ref({
    jsonData: jsonImport,
    jsonKeys: Object.keys(jsonImport[0]),
    modifiedJsonData: jsonImport,
    searchInput: "",
    filterInput: Object.keys(jsonImport[0]).map((x) => null),
    formInput: Object.keys(jsonImport[0]).map((x) => "")
})


const dataset = (str: string = "default") => {
    if (str === "override") {
        console.log("- returning base dataset")
        return dynamicFields.value.jsonData
    } else {
        console.log("- returning dataset")
        return dynamicFields.value.modifiedJsonData
    }
}

const setData = (text: typeof jsonImport, override = "default") => {
    console.log("*-setData called")
    if (override === "override") {
        dynamicFields.value.jsonData = text
    } else {
        dynamicFields.value.modifiedJsonData = text
    }
}

const getSearch = () => {
    return dynamicFields.value.searchInput.toLowerCase()
}

const getFilters = () => {
    return dynamicFields.value.filterInput
}
/*
// creates the array needed to render the filter dropdowns
const dropdownsMapping = () => {
    valuesArray.value = []
    console.log("*** dropdownsmapping function called. Value: " + valuesArray.value)
    for (let i = 0; i < dataset("override").length; i++) {
        console.log("-- I-loop iteration: " + i)
        const tempArray = Object.values(dataset("override")[i]);
        for (let j = 0; j < tempArray.length; j++) {
            console.log("-- J-loop iteration: " + j)
            if (!valuesArray.value[j]) {
                valuesArray.value[j] = []
                console.log("- If passed, adding empty array to valuesArray" + [j])
            }
            if (valuesArray.value[j].includes(tempArray[j])) {
                console.log("- loop continued")
                continue
            }
            valuesArray.value[j].push(tempArray[j])
            console.log("- Values pushed to valuesArray: " + valuesArray.value[j])
        }
    }
    for (let i = 0; i < valuesArray.value.length; i++) {
        valuesArray.value[i] = sortBy(valuesArray.value[i])
        console.log("- Sorting valuesArray, interation: " + i + ", containing: " + valuesArray.value[i])

    }
    console.log("*** dropdownmapping function end")
} */

const dropdownMapping = () => {
    valuesArray.value = []
    console.log("*** newDropDown function called")
    for (let i = 0; i < dataset().length; i++) {
        const tempArray = Object.values(dataset()[i])
        for (let j = 0; j < tempArray.length; j++) {
            if (!valuesArray.value[j]) {
                valuesArray.value[j] = []
            }
            if (valuesArray.value[j].includes(tempArray[j])) {
                continue
            }
            valuesArray.value[j].push(tempArray[j])
        }
    }
    for (let i = 0; i < valuesArray.value.length; i++) {
        valuesArray.value[i] = sortBy(valuesArray.value[i])
    }
    console.log("*** dropDownMapping end")
}


    // toggle showing of filter and input fields
    const toggleShow = (str: string) => {
        console.log("*** toggleShow function called")
        if (str === "show_entry") {
            booleans.value.newEntryArea = true;
            console.log("- newEntryArea toggled on")
        } else if (str === "hide_entry") {
            booleans.value.newEntryArea = false;
            console.log("- newEntryArea toggled off")
        }
    }


    // initiates sorting functionality
    const sortTable = (key: string | number) => {
        console.log("*** sorttable function called")
        booleans.value.sort = true
        dynamicFields.value.modifiedJsonData = sortBy(dataset(), key)
    }


    const resetFilterField = (str: number | undefined) => {
        console.log("*** resetfilterfield function called")
        if (str === undefined) {
            dynamicFields.value.filterInput = dynamicFields.value.filterInput.map((x) => null)
            console.log("resetAll called. finterInput is now: " + dynamicFields.value.filterInput)
        } else {
            dynamicFields.value.filterInput[str] = null
        }

    }



    const searchFunction = () => {
        console.log("*** searchfunction called")
        if (getFilters().every(element => element === undefined && getSearch() === "")) {
            console.log("*** searchfunction ended early")
            setData(dataset("override"))
            booleans.value.searchMode = false
            dropdownMapping()
            return
        }
        setData([])
        console.log("- Searchfunction starting for loop")
        for (let i = 0; i < dataset("override").length; i++) {
            console.log("- Searchfunction for loop iteration: " + i)
            let stringedValues = Object.values(dataset("override")[i]).map(value => String(value).toLowerCase());
            console.log("- stringedValues defined as: " + stringedValues)
            if (!getSearch() || stringedValues.includes(getSearch())) {
                stringedValues = Object.values(dataset("override")[i]).map(value => String(value));
                console.log("- Searchfunction if statement passed")
                console.log("- About to check the second if-statement. \n - stringedValues :" + stringedValues[i] + "\n - getFilters: " + getFilters())
                if (stringedValues.every((element, index) => getFilters()[index] === null || element == getFilters()[index])) {
                    console.log("- Searchfunction second if statement passed")
                    dynamicFields.value.modifiedJsonData.push(dataset("override")[i])
                } else { continue }
            } else { continue }
        }
        booleans.value.searchMode = true
        dropdownMapping()
    }

    /*
    const searchFunction = () => {
        dynamicFields.value.modifiedJsonData = []
        console.log("*** searchfunction function called")
        let dataLength = dataset().length
        if (dataLength <= 1) {
            dataLength++
        }
        for (let i = 0; i < dataLength; i++) {
            console.log("- searchFunction I-loop interation: " + i)
            const itemValues = Object.values(dataset("override")[i])
            if (JSON.stringify(itemValues).toLowerCase().includes(getSearch().toLowerCase()) &&
                itemValues.every((element, index) => getFilters()[index] === undefined || element == getFilters()[index])) {
                console.log("- If-statement passed")
                dataset().push(dynamicFields.value.jsonData[i])
    
            }
        } if (getSearch() === "" && getFilters().every(element => element === undefined)) {
            console.log("- Second if-statement passed")
            booleans.value.searchMode = false;
        } else {
            booleans.value.searchMode = true;
        }
        console.log("*** searchFunction end")
        dropdownsMapping()
    }
    */

    // creates an object and appends each value + jsonkey to it, then appends to json
    const submitInput = () => {
        console.log("*** submitinput function called")
        const newEntryObject: any = {};

        for (let i = 0; i < dynamicFields.value.jsonKeys.length; i++) {
            //console.log(jsonKeys)
            newEntryObject[dynamicFields.value.jsonKeys[i]] = dynamicFields.value.formInput[i]
            //console.log("added " + formInput.value[i] + "to the object")
        }
        dataset("override").push(newEntryObject)
        dynamicFields.value.formInput = dynamicFields.value.jsonKeys.map((x) => "")
        dropdownMapping()
        searchFunction()
    }

    console.log("Website loaded")

    dropdownMapping()
    

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