<template>
    <DefaultSection>
        <NuxtLink :to="ROUTE_NAMES.REVIEWS"
            class="flex items-center gap-2 self-start text-dark font-light no-underline">
            <Icon name="tabler:arrow-left" size="1.25rem" />
            Volver a reviews
        </NuxtLink>
        <HeadingH1>Crear Review</HeadingH1>

        <FormReview :is-editing="false" @submit="handleSubmit" @cancel="handleCancel" />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'

const { success, error } = useNotification()
const { createReviewCompleta } = useReviews()

const handleSubmit = async (formData) => {
    try {
        await createReviewCompleta(formData.reviewData, formData.imagen)

        success('Review creada exitosamente', {
            title: 'Review agregada'
        })

        navigateTo(ROUTE_NAMES.REVIEWS)
    } catch (err) {
        console.error('Error creating review:', err)
        error('Error al crear la review. Inténtalo de nuevo.', {
            title: 'Error'
        })
    }
}

const handleCancel = () => {
    navigateTo(ROUTE_NAMES.REVIEWS)
}
</script>