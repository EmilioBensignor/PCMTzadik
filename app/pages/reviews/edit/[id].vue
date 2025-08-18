<template>
    <DefaultSection>
        <NuxtLink :to="ROUTE_NAMES.REVIEWS"
            class="flex items-center gap-2 self-start text-dark font-light no-underline">
            <Icon name="tabler:arrow-left" size="1.25rem" />
            Volver a reviews
        </NuxtLink>

        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="!currentReview" class="text-center py-12">
            <Icon name="tabler:file-x" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-600 text-lg">Review no encontrada</p>
            <ButtonPrimary :to="ROUTE_NAMES.REVIEWS" class="mt-4">
                Volver a reviews
            </ButtonPrimary>
        </div>

        <div v-else class="w-full flex flex-col items-center gap-6 lg:gap-9">
            <HeadingH1>Editar Review</HeadingH1>
            <FormReview 
                :is-editing="true" 
                :initial-data="currentReview"
                @submit="handleSubmit" 
                @cancel="handleCancel" 
            />
        </div>
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'

const route = useRoute()
const reviewId = route.params.id

const { 
    currentReview, 
    loading, 
    error,
    fetchReviewById,
    updateReviewCompleta
} = useReviews()

const { success, error: notificationError } = useNotification()

onMounted(async () => {
    await loadReview()
})

const loadReview = async () => {
    try {
        if (!reviewId) {
            throw new Error('ID de review no válido')
        }
        
        await fetchReviewById(reviewId)
    } catch (err) {
        console.error('Error loading review:', err)
    }
}

const handleSubmit = async (formData) => {
    try {
        await updateReviewCompleta(reviewId, formData.reviewData, formData.imagen)

        success('Review actualizada exitosamente', {
            title: 'Review actualizada'
        })

        navigateTo(ROUTE_NAMES.REVIEWS)
    } catch (err) {
        console.error('Error updating review:', err)
        notificationError('Error al actualizar la review. Inténtalo de nuevo.', {
            title: 'Error'
        })
    }
}

const handleCancel = () => {
    navigateTo(ROUTE_NAMES.REVIEWS)
}

// SEO
useHead({
    title: computed(() => 
        currentReview.value 
            ? `Editar Review: ${currentReview.value.titulo}`
            : 'Editar Review'
    )
})
</script>