<template>
    <NuxtLink v-if="to" :to="to"
        class="w-full max-w-[480px] bg-primary hover:bg-primaryHover text-center text-light lg:text-xl rounded-xl shadow-1 transition duration-300 py-3 px-12">
        <slot />
    </NuxtLink>
    <button v-else type="button"
        class="w-full max-w-[480px] bg-primary hover:bg-primaryHover text-center text-light lg:text-xl rounded-xl shadow-1 transition duration-300 py-3 px-12">
        <slot />
    </button>
</template>

<script>
export default {
    props: {
        to: {
            type: [String, Object],
            default: null
        }
    }
}
</script>