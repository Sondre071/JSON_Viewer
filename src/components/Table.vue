<template>
    <div class="searchBar">
        <div class="input-group-mb-5">
            <input type="search" class="form-control" name="form" v-model="searchQuery" placeholder="Name"
                aria-describedby="button-addon2">
        </div>
    </div>
    <table id="tableComponent" class="table table-bordered table-striped">
        <thead>
            <tr>
                <th v-for="field in jsonKeys" :key="field" @click="sortTable(field)">
                    {{ field }} <i class="bi bi-sort-alpha-down" aria-label="Sort Icon"></i>
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
    <button type.prevent="button" class="show-input-button display-button" @click="toggleShow('input')">Add new
        entry</button>
    <button type.prevent="button" class="show-filter-button display-button" @click="toggleShow('filter')">Filter
        properties</button>
        <button type.prevent="button" class="reset-fields-button display-button" @click="toggleShow('')">Reset fields</button>
    <div v-show="inputQueryOn" class="hidden-areas">
        <h3>Add new entry</h3>
        <form>
            <input type="text" v-for="field, index in jsonKeys" :key="field" v-model="formInput[index]" class="input-field">
            <br><button type="button" @click="submitInput()">Submit</button><br>
        </form>
    </div>

    <div v-show="filterQueryOn" class="hidden-areas">
        <h3>Filter by property</h3>
        <div class="dropdowns" v-for="(values, index) in valuesArray" :key="index">
            <div> {{ jsonKeys[index] }}</div>
            <select v-model="filterQueryField">
                <option v-for="(value, valueIndex) in values" :key="valueIndex">{{ value }}</option>
            </select>
        </div>
    </div>

    <br><br><br><br><br>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { sortBy } from "lodash";
import "bootstrap/dist/css/bootstrap.min.css";

let jsonData = ref([
    { "name": "Aria", "race": "Half-Elf", "className": "Rogue", "level": 5, "createdAt": "2021-09-01" },
    { "name": "Marcus", "race": "Human", "className": "Paladin", "level": 1, "createdAt": "2021-09-15" },
    { "name": "Tessa", "race": "Dwarf", "className": "Bard", "level": 8, "createdAt": "2021-09-22" },
    { "name": "Erik", "race": "Dwarf", "className": "Barbarian", "level": 3, "createdAt": "2021-10-01" },
    { "name": "Lila", "race": "Tiefling", "className": "Warlock", "level": 7, "createdAt": "2021-10-07" },
    { "name": "Niamh", "race": "Elf", "className": "Ranger", "level": 2, "createdAt": "2021-10-15" },
    { "name": "Tristan", "race": "Half-Orc", "className": "Fighter", "level": 6, "createdAt": "2021-10-23" },
    { "name": "Ava", "race": "Halfling", "className": "Cleric", "level": 4, "createdAt": "2021-11-01" }
])

const jsonKeys = Object.keys(jsonData.value[0]);
const searchQuery = ref("");
const sort = ref(false);
const queryJson: any = ref([]);
const searchQueryOn = ref(false);
const inputQueryOn = ref(false);
const filterQueryOn = ref(false);
const filterQueryField = ref("");
let formInput = ref(jsonKeys.map((x) => ""));
const valuesArray = ref([]);
let tempArray = [];


type Array = [string?, string?, string?, number?, string?]

jsonData.value.forEach((element) => {
    let tempArray: any = Object.values(element);
    console.log("valuesArray mapping.... it contains: " + valuesArray.value + ". tempArray containing: " + tempArray)

    for (let j = 0; j < tempArray.length; j++) {
        console.log("-inner loop accessed")
        if (!valuesArray.value[j]) { valuesArray.value[j] = [] }
        if (valuesArray.value[j].includes(tempArray[j])) {
            console.log("-- if statement accessed")
            tempArray.splice(tempArray.indexOf(tempArray[j]), 1, "")
            console.log("splicing tempArray. new value: " + tempArray);
        }
        valuesArray.value[j].push(tempArray[j])
        console.log("-inner loop iteration done")
        console.log("tempArray: " + tempArray)
    }
}
)
console.log("array mapping done. + " + valuesArray.value)

const toggleShow = (str: string) => {
    if (str === "input") {
        filterQueryOn.value = false;
        console.log("filterQueryOn toggled off")
        filterQueryField.value = ""
        inputQueryOn.value = true;
        console.log("searchQueryOn toggled on")
    } else if (str === "filter") {
        inputQueryOn.value = false;
        formInput.value = jsonKeys.map((x) => "")
        console.log("searchQueryOn toggled off")
        filterQueryOn.value = true;
        console.log("filterQueryOn toggled on")
    } else {
        filterQueryOn.value = false;
        inputQueryOn.value = false;
        formInput.value = jsonKeys.map((x) => "")
        filterQueryField.value = ""
        searchQuery.value = ""
    }
}

const sortTable = (key: string | number) => {
    console.log("- sortTable initiated")
    sort.value = true
    if (searchQueryOn.value) {
        console.log("- sortTable evaluated to true")
        queryJson.value = sortBy(queryJson.value, key)
    } else {
        console.log("- sortTable evaluated to false")
        jsonData.value = sortBy(jsonData.value, key)
    }
}


const searchFunction = (): void => {
    queryJson.value = []
    for (let i = 0; i < jsonData.value.length; i++) {
        console.log("--- searchFunction initiated")
        if (JSON.stringify(Object.values(jsonData.value[i])).toLowerCase().includes(searchQuery.value.toLowerCase()) &&
            JSON.stringify(Object.values(jsonData.value[i])).toLowerCase().includes(filterQueryField.value.toLowerCase())) {
            console.log("- If statement passed. changing the jsonData")
            queryJson.value.push(jsonData.value[i])
            searchQueryOn.value = true;
        }
    } if (searchQuery.value === "" && filterQueryField.value === "") {
        console.log("- searchquery value is null")
        searchQueryOn.value = false;
    }
}



const submitInput = (): void => {



    const newObject: any = {}
    // create object and append each value + jsonkey to it, then append to json
    for (let i = 0; i < jsonKeys.length; i++) {
        console.log(jsonKeys)
        newObject[jsonKeys[i]] = formInput.value[i]
        console.log("added " + formInput.value[i] + "to the object")
    }
    jsonData.value.push(newObject)
    formInput.value = jsonKeys.map((x) => "")

}

watch(() => searchQuery.value, searchFunction)
watch(() => filterQueryField.value, searchFunction)
</script>



<style scoped>

.hidden-areas {
    margin: 25px 0 0 0;
}

.dropdowns {
    display: inline-block;
}
</style>