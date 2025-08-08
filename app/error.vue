<template>
    <DefaultMain>
        <DefaultSection class="h-screen justify-center">
            <HeadingH1>¡Ups! Página no encontrada</HeadingH1>
            <p class="text-center lg:text-xl">
                Parece que has tomado un desvío inesperado. La página que buscas no está disponible o ha cambiado de
                dirección.
            </p>
            <ButtonPrimary :to="ROUTE_NAMES.HOME">
                Volver al inicio
            </ButtonPrimary>
        </DefaultSection>
    </DefaultMain>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES'

const props = defineProps({
    error: Object
})

if (props.error?.statusCode !== 404) {
    console.error('❗️Nuxt captured error:', props.error)
}

useHead({
    title: '404 - Página no encontrada',
    meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})
</script>

<style scoped>
p {
    max-width: 440px;
}

@media (width >=992px) {
    section {
        gap: 2.25rem;
    }

    p {
        max-width: 540px;
    }

    a {
        width: max-content;
    }
}
</style>