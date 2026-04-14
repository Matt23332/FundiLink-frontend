<script setup>
const userDetails = JSON.parse(localStorage.getItem('userDetails'))
</script>

<template>
    <v-container width="50%" style="background-color:#091222" class="">
        <v-row>
            <v-col>
                <v-card>
                    <v-img src="" cover></v-img>
                    <v-card-title>{{ userDetails.name }}</v-card-title>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>