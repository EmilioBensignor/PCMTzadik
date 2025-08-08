<template>
    <header class="flex justify-center bg-primary py-6 px-5 lg:py-8 lg:px-24">
        <NuxtLink :to="ROUTE_NAMES.LOGIN">
            <NuxtImg src="/images/Logo-Peripeteia-Blanco.svg" alt="Logo Peripeteia" class="h-8 lg:h-11" />
        </NuxtLink>
    </header>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';
</script>