<template>
    <div class="flex flex-col gap-3 rounded-xl orange-shadow p-3">
        <NuxtImg :src="imageUrl" :alt="`Opinion de ${review.autor}`" class="w-full h-32 md:h-40 object-cover rounded-xl" />
        <div class="h-full flex flex-col justify-between gap-2.5">
            <p class="lg:text-xl font-semibold">{{ review.titulo }}</p>
            <p class="text-xs lg:text-sm">{{ review.comentario }}</p>
            <div class="flex items-center gap-1">
                <Icon v-for="star in 5" :key="star" :name="star <= review.rating ? 'tabler:star-filled' : 'tabler:star'"
                    :class="star <= review.rating ? 'text-accent' : 'text-gray-300'" class="w-4 lg:w-6 h-4 lg:h-6" />
            </div>
            <p class="text-xs lg:text-sm">
                - <span>{{ review.autor }}, {{ review.ciudad }}, {{ review.provincia }}</span>
            </p>

            <div class="flex gap-2 mt-2">
                <ButtonPrimary :to="ROUTE_NAMES.REVIEWS_EDITAR(review.id)">Editar</ButtonPrimary>
                <button @click="$emit('delete', review)"
                    class="flex justify-center items-center bg-terciary text-light rounded-lg text-sm px-3 py-2">
                    <Icon name="tabler:trash" class="w-4 h-4" />
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'

const props = defineProps({
    review: {
        type: Object,
        required: true
    }
})

defineEmits(['delete'])

// Generate a stable cache bust value based on review ID and update time
const cacheBustValue = computed(() => {
    // Use review ID and a timestamp to create a stable cache bust value
    const reviewId = props.review.id || 'no-id'
    const updated = props.review.updated_at || props.review.created_at || Date.now()
    return `${reviewId}-${new Date(updated).getTime()}`
})

const imageUrl = computed(() => {
    if (!props.review.img) return null
    
    // Agregar cache busting basado en el review
    const baseUrl = props.review.img.split('?')[0] // Remover query params existentes
    
    return `${baseUrl}?v=${cacheBustValue.value}`
})
</script>