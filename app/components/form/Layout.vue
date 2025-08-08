<template>
    <form class="w-full max-w-md lg:max-w-[50rem] flex flex-col items-center" @submit="$emit('submit', $event)">
        <slot />
    </form>
</template>

<script setup>
defineEmits(['submit'])
</script>