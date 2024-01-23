<template>
    <div class="searchBar">
        <div class="input-group-mb-5">
            <input type="search" class="form-control" v-model="searchQuery" placeholder="Name" aria-describedby="button-addon2">
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
            <tr v-for="item in json" :key="json.indexOf(item) + 1">
                <td v-for="key in jsonKeys" :key="key"> {{ item[key as keyof typeof item] }}</td>
            </tr>
        </tbody>
    </table>
    <h1>hi</h1>
    <h2>{{ json }}</h2>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"
import { sortBy } from "lodash"
import "bootstrap/dist/css/bootstrap.min.css";
//import jsonData from "../assets/data.json"
let json = ref([
    { "name": "Aria", "race": "Half-Elf", "className": "Rogue", "level": 5, "createdAt": "2021-09-01" },
    { "name": "Marcus", "race": "Human", "className": "Paladin", "level": 1, "createdAt": "2021-09-15" },
    { "name": "Tessa", "race": "Dwarf", "className": "Bard", "level": 8, "createdAt": "2021-09-22" },
    { "name": "Erik", "race": "Dwarf", "className": "Barbarian", "level": 3, "createdAt": "2021-10-01" },
    { "name": "Lila", "race": "Tiefling", "className": "Warlock", "level": 7, "createdAt": "2021-10-07" },
    { "name": "Niamh", "race": "Elf", "className": "Ranger", "level": 2, "createdAt": "2021-10-15" },
    { "name": "Tristan", "race": "Half-Orc", "className": "Fighter", "level": 6, "createdAt": "2021-10-23" },
    { "name": "Ava", "race": "Halfling", "className": "Cleric", "level": 4, "createdAt": "2021-11-01" }
])

let jsonKeys = Object.keys(json.value[0]);


let sort = ref(false);

const sortTable = (key: string | number) => {
    sort.value = true
    json.value = sortBy(json.value, key)
}

const filteredList = computed(() => {
    return sortedList.value.filter((product => {
        return (
            product.Name.toLowerCase().indexOf(searchQuery.value.toLowerCase()) != -1
        )
    }))
})


</script>



<style scoped></style>