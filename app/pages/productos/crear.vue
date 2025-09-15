<template>
    <DefaultSection>
        <NuxtLink :to="ROUTE_NAMES.HOME"
            class="flex items-center gap-2 self-start text-dark font-light no-underline">
            <Icon name="tabler:arrow-left" size="1.25rem" />
            Volver a productos
        </NuxtLink>
        <HeadingH1>Crear Producto</HeadingH1>

        <FormProducto :is-editing="false" :initial-category="initialCategory" @submit="handleSubmit" @cancel="handleCancel" />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'

const { success, error } = useNotification()
const { createProductoCompleto } = useProductos()
const { categorias, fetchCategorias } = useCategorias()

const route = useRoute()
const initialCategory = ref(null)

onMounted(async () => {
    await fetchCategorias()
    
    const categoryFromQuery = route.query.categoria
    if (categoryFromQuery) {
        const foundCategory = categorias.value.find(cat => cat.nombre === categoryFromQuery)
        if (foundCategory) {
            initialCategory.value = foundCategory.id
        }
    }
})

const handleSubmit = async (formData) => {
    try {
        await createProductoCompleto(formData.productoData, formData.imagenes)

        success('Producto creado exitosamente', {
            title: 'Producto agregado'
        })

        navigateTo(ROUTE_NAMES.HOME)
    } catch (err) {
        console.error('Error creating product:', err)

        // Mostrar el error específico si está disponible
        const errorMessage = err.message || 'Error al crear el producto. Inténtalo de nuevo.'
        error(errorMessage, {
            title: 'Error al crear producto'
        })
    }
}

const handleCancel = () => {
    navigateTo(ROUTE_NAMES.HOME)
}
</script>