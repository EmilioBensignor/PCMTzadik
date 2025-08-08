<template>
    <FormContainer @submit.prevent="$emit('submit')">
        <slot />
    </FormContainer>
</template>

<script setup>
defineEmits(['submit'])
</script>