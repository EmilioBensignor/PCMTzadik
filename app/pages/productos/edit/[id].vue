<template>
    <DefaultSection>
        <NuxtLink :to="ROUTE_NAMES.PRODUCTOS"
            class="flex items-center gap-2 self-start text-dark font-light no-underline">
            <Icon name="tabler:arrow-left" size="1.25rem" />
            Volver a productos
        </NuxtLink>
        <HeadingH1>Editar Producto</HeadingH1>

        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="error" class="text-center py-12">
            <p class="text-red-600">{{ error }}</p>
            <NuxtLink :to="ROUTE_NAMES.PRODUCTOS" class="text-primary hover:underline mt-4 inline-block">
                Volver a productos
            </NuxtLink>
        </div>

        <FormProducto v-else-if="producto" :is-editing="true" :product-data="producto" @submit="handleSubmit"
            @cancel="handleCancel" />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'

const route = useRoute()
const { success, error: notifyError } = useNotification()
const { updateProductoCompleto, fetchProductoById } = useProductos()

const productId = computed(() => route.params.id)

const isValidUUID = (str) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(str)
}
const producto = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
    await loadProduct()
})

const loadProduct = async () => {
    try {
        loading.value = true
        error.value = null

        if (!productId.value) {
            error.value = 'ID de producto no válido'
            return
        }

        if (!isValidUUID(productId.value)) {
            error.value = 'El ID del producto debe ser un UUID válido'
            return
        }

        producto.value = await fetchProductoById(productId.value, { includeAll: true })

        if (!producto.value) {
            error.value = 'Producto no encontrado'
        }
    } catch (err) {
        console.error('Error loading product:', err)

        if (err.message?.includes('invalid input syntax for type uuid')) {
            error.value = 'ID de producto no válido. Debe ser un UUID válido.'
        } else {
            error.value = 'Error al cargar el producto'
        }
    } finally {
        loading.value = false
    }
}

const handleSubmit = async (formData) => {
    try {
        await updateProductoCompleto(
            productId.value,
            formData.productoData,
            formData.imagenes
        )

        success('Producto actualizado exitosamente', {
            title: 'Actualización completada'
        })

        if (producto.value?.categorias?.nombre) {
            navigateTo(ROUTE_NAMES.PRODUCTOS_CATEGORIA(producto.value.categorias.nombre))
        } else {
            navigateTo(ROUTE_NAMES.PRODUCTOS)
        }
    } catch (err) {
        console.error('Error updating product:', err)
        notifyError('Error al actualizar el producto. Inténtalo de nuevo.', {
            title: 'Error'
        })
    }
}

const handleCancel = () => {
    if (producto.value?.categorias?.nombre) {
        navigateTo(ROUTE_NAMES.PRODUCTOS_CATEGORIA(producto.value.categorias.nombre))
    } else {
        navigateTo(ROUTE_NAMES.PRODUCTOS)
    }
}
</script>