<template>
    <DefaultSection>
        <NuxtLink :to="ROUTE_NAMES.HOME" class="flex items-center gap-2 self-start text-dark font-light no-underline">
            <Icon name="tabler:arrow-left" size="1.25rem" />
            Volver a productos
        </NuxtLink>
        <div class="w-full max-w-md flex flex-col items-center gap-3">
            <HeadingH1>{{ categoryName }}</HeadingH1>
            <p>{{ categoryProducts.length }} producto{{ categoryProducts.length !== 1 ? 's' : '' }} disponible{{
                categoryProducts.length !== 1 ? 's' : '' }}</p>
            <ButtonPrimary :to="`${ROUTE_NAMES.PRODUCTOS_CREAR}?categoria=${encodeURIComponent(categoryName)}`">
                Agregar Producto
            </ButtonPrimary>
            <FormTextField id="search-productos" v-model="searchQuery" placeholder="Buscar productos..." type="search"
                class="mt-3" />
        </div>
        <div v-if="productos.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div v-for="producto in productos" :key="producto.id" class="bg-white rounded-lg shadow-1">
                <div class="aspect-video rounded-t-lg overflow-hidden">
                    <NuxtImg :src="getMainImage(producto)" :alt="producto.titulo" class="w-full h-full object-cover"
                        loading="lazy" @error="handleImageError" />
                </div>

                <div class="flex flex-col gap-3 p-4">
                    <p class="text-2xl font-medium">{{ producto.titulo }}</p>
                    <p class="text-xl font-bold text-dark">
                        {{ formatCurrency(producto.precio) }}
                    </p>
                    <div class="flex justify-between">
                        <button @click.stop="editProduct(producto)"
                            class="bg-primary text-light font-medium rounded-xl py-2 px-4" title="Editar producto">
                            Editar
                        </button>
                        <button @click.stop="openDeleteModal(producto)"
                            class="bg-error text-light font-medium rounded-xl py-2 px-4" title="Eliminar producto">
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <p v-else class="text-dark">
            {{ searchQuery ? 'No se encontraron productos que coincidan con tu búsqueda' : `Aún no hay productos
            en la categoría ${categoryName}` }}
        </p>

        <div v-if="totalPages > 1" class="mt-8 flex justify-center">
            <nav class="flex items-center space-x-2">
                <button @click="currentPage = currentPage - 1" :disabled="currentPage === 1"
                    class="px-3 py-2 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                    Anterior
                </button>

                <button v-for="page in visiblePages" :key="page" @click="currentPage = page" :class="{
                    'bg-blue-600 text-white': currentPage === page,
                    'text-gray-700 hover:bg-gray-50': currentPage !== page
                }" class="px-3 py-2 text-sm border rounded-md">
                    {{ page }}
                </button>

                <button @click="currentPage = currentPage + 1" :disabled="currentPage === totalPages"
                    class="px-3 py-2 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                    Siguiente
                </button>
            </nav>
        </div>

    </DefaultSection>

    <ModalDelete :is-open="showDeleteModal" :item-name="productToDelete?.titulo" table-name="productos"
        @cancel="closeDeleteModal" @confirm="confirmDelete" />
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'

const { categorias, fetchCategorias } = useCategorias()
const {
    productos,
    loading,
    setFilter,
    fetchProductos,
    currentPage,
    totalPages,
    getImagenesByProducto,
    deleteProducto
} = useProductos()

const { getImageUrl } = useStorage()

const route = useRoute()
const categoryName = computed(() => decodeURIComponent(route.params.nombre))

const searchQuery = ref('')
const showDeleteModal = ref(false)
const productToDelete = ref(null)

const currentCategory = computed(() => {
    return categorias.value.find(cat => cat.nombre === categoryName.value)
})

const categoryProducts = computed(() => productos.value)

const visiblePages = computed(() => {
    const maxVisible = 5
    const current = currentPage.value
    const total = totalPages.value

    if (total <= maxVisible) {
        return Array.from({ length: total }, (_, i) => i + 1)
    }

    let start = Math.max(1, current - Math.floor(maxVisible / 2))
    let end = Math.min(total, start + maxVisible - 1)

    if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1)
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})


onMounted(async () => {
    await fetchCategorias()

    if (currentCategory.value) {
        setFilter('categoria_id', currentCategory.value.id)
        await fetchProductos({ includeImages: true })
    }
})

watch(currentCategory, async (newCategory) => {
    if (newCategory) {
        setFilter('categoria_id', newCategory.id)
        await fetchProductos({ includeImages: true })
    }
})


watch(searchQuery, async () => {
    if (searchQuery.value) {
        setFilter('search', searchQuery.value)
    } else {
        setFilter('search', null)
    }

    await fetchProductos({ includeImages: true })
})

const formatCurrency = (amount) => {
    if (!amount) return 'Precio a consultar'
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(amount)
}

const handleImageError = (event) => {
    event.target.src = '/images/Placeholder.png'
}

const getMainImage = (producto) => {
    const imagenes = getImagenesByProducto(producto.id)
    const mainImage = imagenes.find(img => img.es_principal) || imagenes[0]

    if (mainImage && mainImage.storage_path) {
        return getImageUrl(mainImage.storage_path)
    }

    // Fallback to placeholder
    return '/images/Placeholder.png'
}


const editProduct = (producto) => {
    navigateTo(ROUTE_NAMES.PRODUCTOS_EDITAR(producto.id))
}

const openDeleteModal = (producto) => {
    productToDelete.value = producto
    showDeleteModal.value = true
}

const closeDeleteModal = () => {
    productToDelete.value = null
    showDeleteModal.value = false
}

const confirmDelete = async () => {
    if (productToDelete.value) {
        try {
            await deleteProducto(productToDelete.value.id)
            await fetchProductos({ includeImages: true })
            closeDeleteModal()
        } catch (error) {
            console.error('Error deleting product:', error)
        }
    }
}

</script>