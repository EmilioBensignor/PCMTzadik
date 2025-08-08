<template>
    <label v-if="id" :for="id" class="text-dark font-light lg:text-xl">
        <slot />
        <span v-if="required" class="text-primary ml-1">*</span>
    </label>
    <p v-else class="text-dark font-light lg:text-xl">
        <slot />
        <span v-if="required" class="text-primary ml-1">*</span>
    </p>
</template>

<script setup>
defineProps({
    id: {
        type: String,
        required: false
    },
    required: {
        type: Boolean,
        default: false
    }
})
</script>