<template>
    <div>
        <ul>
            <li v-for="item in jsonData">{{ item }}</li>
        </ul>
    </div>
    <br><br>
    <div>
        <table>
            <thead>
                <tr>
                    <th v-for="item in colNames" >{{ item }}</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td v-for="item in rowNames" >{{ item }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup lang="ts">
import jsonData from "../../public/data.json";
const colNames = Object.keys(jsonData[0]);
const rowNames = Object.values(jsonData[0]);

</script>

<style scoped></style>