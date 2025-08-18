<template>
    <DefaultSection>
        <HeadingH1>Reviews</HeadingH1>
        <ButtonPrimary :to="ROUTE_NAMES.REVIEWS_CREAR">
            Nueva Review
        </ButtonPrimary>

        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="reviews.length === 0" class="text-center py-12">
            <Icon name="tabler:message-circle" class="w-16 h-16" />
            <p class="text-dark text-lg">No hay reviews disponibles</p>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            <ReviewCard v-for="review in reviews" :key="review.id" :review="review" @delete="confirmDelete" />
        </div>

        <ModalDelete :is-open="showDeleteModal" :item-name="reviewToDelete?.titulo" table-name="reviews"
            @confirm="handleDelete" @cancel="cancelDelete" />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'

const { reviews, loading, fetchReviews, deleteReviewCompleta } = useReviews()
const { success, error: notificationError } = useNotification()

const showDeleteModal = ref(false)
const reviewToDelete = ref(null)

onMounted(async () => {
    try {
        await fetchReviews()
    } catch (err) {
        console.error('Error loading reviews:', err)
    }
})

const confirmDelete = (review) => {
    reviewToDelete.value = review
    showDeleteModal.value = true
}

const cancelDelete = () => {
    reviewToDelete.value = null
    showDeleteModal.value = false
}

const handleDelete = async () => {
    try {
        await deleteReviewCompleta(reviewToDelete.value.id)

        success('Review eliminada exitosamente', {
            title: 'Review eliminada'
        })

        cancelDelete()
        
        // Recargar las reviews
        await fetchReviews()
    } catch (err) {
        console.error('Error deleting review:', err)
        notificationError('Error al eliminar la review', {
            title: 'Error'
        })
    }
}
</script>

