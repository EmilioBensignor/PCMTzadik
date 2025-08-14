<template>
    <DefaultSection>
        <NuxtLink :to="ROUTE_NAMES.PRODUCTOS"
            class="flex items-center gap-2 self-start text-dark font-light no-underline">
            <Icon name="tabler:arrow-left" size="1.25rem" />
            Volver a productos
        </NuxtLink>
        <HeadingH1>Crear Producto</HeadingH1>

        <FormProducto :is-editing="false" @submit="handleSubmit" @cancel="handleCancel" />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'

const { success, error } = useNotification()
const { createProductoCompleto } = useProductos()

const handleSubmit = async (formData) => {
    try {
        await createProductoCompleto(formData.productoData, formData.imagenes)

        success('Producto creado exitosamente', {
            title: 'Producto agregado'
        })

        navigateTo(ROUTE_NAMES.PRODUCTOS)
    } catch (err) {
        console.error('Error creating product:', err)
        error('Error al crear el producto. Inténtalo de nuevo.', {
            title: 'Error'
        })
    }
}

const handleCancel = () => {
    navigateTo(ROUTE_NAMES.PRODUCTOS)
}
</script>