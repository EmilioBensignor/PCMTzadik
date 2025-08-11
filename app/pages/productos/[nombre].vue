<template>
    <div class="max-w-7xl mx-auto p-6">
        <!-- Header de la categoría -->
        <div class="mb-8">
            <div class="flex items-center justify-between">
                <div>
                    <HeadingH1>{{ categoryName }}</HeadingH1>
                    <p class="text-gray-600 mt-2">
                        {{ categoryProducts.length }} producto{{ categoryProducts.length !== 1 ? 's' : '' }} disponible{{ categoryProducts.length !== 1 ? 's' : '' }}
                    </p>
                </div>
                <div class="flex space-x-3">
                    <NuxtLink
                        :to="ROUTE_NAMES.PRODUCTOS"
                        class="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver a Productos
                    </NuxtLink>
                    <NuxtLink
                        :to="ROUTE_NAMES.PRODUCTOS_CREAR"
                        class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Agregar Producto
                    </NuxtLink>
                </div>
            </div>
        </div>

        <!-- Filtros y búsqueda -->
        <div class="mb-6 bg-white rounded-lg shadow-sm border p-4">
            <div class="flex flex-col md:flex-row gap-4">
                <div class="flex-1">
                    <FormTextField
                        id="search-productos"
                        v-model="searchQuery"
                        placeholder="Buscar productos..."
                        type="search"
                    />
                </div>
                <div class="flex gap-4">
                    <FormSelect
                        v-model="conditionFilter"
                        :options="conditionOptions"
                        placeholder="Todas las condiciones"
                        class="w-48"
                    />
                    <FormSelect
                        v-model="sortBy"
                        :options="sortOptions"
                        placeholder="Ordenar por..."
                        class="w-48"
                    />
                </div>
            </div>
        </div>

        <!-- Grid de productos -->
        <div v-if="filteredProducts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div
                v-for="producto in paginatedProducts"
                :key="producto.id"
                class="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                @click="openProductModal(producto)"
            >
                <!-- Imagen del producto -->
                <div class="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                    <NuxtImg
                        v-if="producto.imagenes && producto.imagenes.length > 0"
                        :src="producto.imagenes[0]"
                        :alt="producto.titulo"
                        class="w-full h-full object-cover"
                        @error="handleImageError"
                    />
                    <div v-else class="flex items-center justify-center h-full">
                        <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                </div>

                <!-- Contenido del producto -->
                <div class="p-4">
                    <div class="flex items-start justify-between mb-2">
                        <h3 class="font-semibold text-gray-900 line-clamp-2">{{ producto.titulo }}</h3>
                        <span
                            :class="getConditionBadgeClass(producto.condicion)"
                            class="px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2"
                        >
                            {{ producto.condicion }}
                        </span>
                    </div>

                    <div class="space-y-1 mb-3">
                        <p v-if="producto.marca" class="text-sm text-gray-600">
                            <strong>Marca:</strong> {{ producto.marca }}
                        </p>
                        <p v-if="producto.modelo" class="text-sm text-gray-600">
                            <strong>Modelo:</strong> {{ producto.modelo }}
                        </p>
                        <p v-if="producto.anoFabricacion" class="text-sm text-gray-600">
                            <strong>Año:</strong> {{ producto.anoFabricacion }}
                        </p>
                    </div>

                    <!-- Descripción corta -->
                    <p v-if="producto.descripcionCorta" class="text-sm text-gray-600 line-clamp-2 mb-3">
                        {{ producto.descripcionCorta }}
                    </p>

                    <!-- Precio -->
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-lg font-bold text-green-600">
                                {{ formatCurrency(producto.precio) }}
                            </p>
                            <p v-if="producto.oferta && producto.oferta < producto.precio" class="text-sm text-red-500 line-through">
                                {{ formatCurrency(producto.oferta) }}
                            </p>
                        </div>
                        <div class="flex space-x-2">
                            <button 
                                @click.stop="editProduct(producto)"
                                class="text-green-600 hover:text-green-800 text-sm font-medium"
                                title="Editar producto"
                            >
                                Editar
                            </button>
                            <button class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                Ver detalles →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Estado vacío -->
        <div v-else class="text-center py-12 bg-white rounded-lg shadow-sm border">
            <div class="max-w-md mx-auto">
                <div class="mb-4">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-4.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 009.586 13H7" />
                    </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No hay productos disponibles</h3>
                <p class="text-gray-500 mb-4">
                    {{ searchQuery ? 'No se encontraron productos que coincidan con tu búsqueda' : `Aún no hay productos en la categoría ${categoryName}` }}
                </p>
                <NuxtLink
                    :to="ROUTE_NAMES.PRODUCTOS_CREAR"
                    class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    Agregar primer producto
                </NuxtLink>
            </div>
        </div>

        <!-- Paginación -->
        <div v-if="totalPages > 1" class="mt-8 flex justify-center">
            <nav class="flex items-center space-x-2">
                <button
                    @click="currentPage = currentPage - 1"
                    :disabled="currentPage === 1"
                    class="px-3 py-2 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                    Anterior
                </button>
                
                <button
                    v-for="page in visiblePages"
                    :key="page"
                    @click="currentPage = page"
                    :class="{
                        'bg-blue-600 text-white': currentPage === page,
                        'text-gray-700 hover:bg-gray-50': currentPage !== page
                    }"
                    class="px-3 py-2 text-sm border rounded-md"
                >
                    {{ page }}
                </button>
                
                <button
                    @click="currentPage = currentPage + 1"
                    :disabled="currentPage === totalPages"
                    class="px-3 py-2 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                    Siguiente
                </button>
            </nav>
        </div>
    </div>

    <!-- Modal de detalles del producto -->
    <div
        v-if="selectedProduct"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        @click="closeProductModal"
    >
        <div
            class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            @click.stop
        >
            <div class="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <HeadingH2>{{ selectedProduct.titulo }}</HeadingH2>
                <button
                    @click="closeProductModal"
                    class="text-gray-400 hover:text-gray-600"
                >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            <div class="p-6">
                <!-- Contenido del modal con toda la información del producto -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Imágenes -->
                    <div>
                        <div class="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-4">
                            <NuxtImg
                                v-if="selectedProduct.imagenes && selectedProduct.imagenes.length > 0"
                                :src="`/images/productos/${selectedProduct.imagenes[0]}`"
                                :alt="selectedProduct.titulo"
                                class="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                    
                    <!-- Información -->
                    <div>
                        <div class="space-y-4">
                            <div v-for="[key, value] in Object.entries(selectedProduct)" :key="key">
                                <div v-if="shouldShowField(key, value)" class="border-b pb-2">
                                    <dt class="font-medium text-gray-900 capitalize">{{ formatFieldName(key) }}:</dt>
                                    <dd class="mt-1 text-gray-600">{{ formatFieldValue(key, value) }}</dd>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import productos from '~/shared/productos.js'

// Props de la ruta
const route = useRoute()
const categoryName = computed(() => decodeURIComponent(route.params.nombre))

// Estado del componente
const searchQuery = ref('')
const conditionFilter = ref('')
const sortBy = ref('titulo')
const currentPage = ref(1)
const productsPerPage = 12
const selectedProduct = ref(null)

// Productos de la categoría actual
const categoryProducts = computed(() => {
    return productos.filter(producto => producto.categoria === categoryName.value)
})

// Opciones de filtros
const conditionOptions = computed(() => {
    const conditions = [...new Set(categoryProducts.value.map(p => p.condicion).filter(Boolean))]
    return conditions.map(condition => ({
        value: condition,
        label: condition
    }))
})

const sortOptions = [
    { value: 'titulo', label: 'Título A-Z' },
    { value: 'titulo-desc', label: 'Título Z-A' },
    { value: 'precio', label: 'Precio menor a mayor' },
    { value: 'precio-desc', label: 'Precio mayor a menor' },
    { value: 'fecha', label: 'Más recientes' }
]

// Productos filtrados y ordenados
const filteredProducts = computed(() => {
    let filtered = [...categoryProducts.value]
    
    // Filtro por búsqueda
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(producto => 
            producto.titulo?.toLowerCase().includes(query) ||
            producto.marca?.toLowerCase().includes(query) ||
            producto.modelo?.toLowerCase().includes(query) ||
            producto.descripcionCorta?.toLowerCase().includes(query)
        )
    }
    
    // Filtro por condición
    if (conditionFilter.value) {
        filtered = filtered.filter(producto => producto.condicion === conditionFilter.value)
    }
    
    // Ordenamiento
    filtered.sort((a, b) => {
        switch (sortBy.value) {
            case 'titulo-desc':
                return (b.titulo || '').localeCompare(a.titulo || '')
            case 'precio':
                return (a.precio || 0) - (b.precio || 0)
            case 'precio-desc':
                return (b.precio || 0) - (a.precio || 0)
            case 'fecha':
                return (b.id || 0) - (a.id || 0)
            default: // titulo
                return (a.titulo || '').localeCompare(b.titulo || '')
        }
    })
    
    return filtered
})

// Paginación
const totalPages = computed(() => Math.ceil(filteredProducts.value.length / productsPerPage))

const paginatedProducts = computed(() => {
    const start = (currentPage.value - 1) * productsPerPage
    const end = start + productsPerPage
    return filteredProducts.value.slice(start, end)
})

const visiblePages = computed(() => {
    const total = totalPages.value
    const current = currentPage.value
    const delta = 2
    
    let range = []
    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
        range.push(i)
    }
    
    if (current - delta > 2) range.unshift('...')
    if (current + delta < total - 1) range.push('...')
    
    range.unshift(1)
    if (total > 1) range.push(total)
    
    return range.filter((item, index, arr) => arr.indexOf(item) === index)
})

// Resetear página cuando cambien los filtros
watch([searchQuery, conditionFilter, sortBy], () => {
    currentPage.value = 1
})

// Utilidades de formato
const formatCurrency = (amount) => {
    if (!amount) return 'Precio a consultar'
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(amount)
}

const getConditionBadgeClass = (condition) => {
    const classes = {
        'Nuevo': 'bg-green-100 text-green-800',
        'Seminuevo': 'bg-blue-100 text-blue-800',
        'Usado': 'bg-yellow-100 text-yellow-800'
    }
    return classes[condition] || 'bg-gray-100 text-gray-800'
}

const handleImageError = (event) => {
    event.target.style.display = 'none'
}

// Modal de producto
const openProductModal = (producto) => {
    selectedProduct.value = producto
    document.body.style.overflow = 'hidden'
}

const closeProductModal = () => {
    selectedProduct.value = null
    document.body.style.overflow = 'auto'
}

// Editar producto
const editProduct = (producto) => {
    navigateTo(ROUTE_NAMES.PRODUCTOS_EDITAR(producto.id))
}

// Formateo para el modal
const shouldShowField = (key, value) => {
    const excludeFields = ['id', 'imagenes']
    return !excludeFields.includes(key) && value != null && value !== ''
}

const formatFieldName = (key) => {
    const fieldNames = {
        titulo: 'Título',
        marca: 'Marca',
        condicion: 'Condición',
        modelo: 'Modelo',
        categoria: 'Categoría',
        precio: 'Precio',
        oferta: 'Precio de oferta',
        anoFabricacion: 'Año de fabricación',
        potenciaHP: 'Potencia (HP)',
        descripcionLarga: 'Descripción',
        descripcionCorta: 'Resumen'
    }
    
    return fieldNames[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
}

const formatFieldValue = (key, value) => {
    if (key === 'precio' || key === 'oferta') {
        return formatCurrency(value)
    }
    return value
}

// SEO
useHead({
    title: `${categoryName.value} - Productos`,
    meta: [
        { name: 'description', content: `Explora nuestra selección de ${categoryName.value.toLowerCase()}. ${categoryProducts.value.length} productos disponibles.` }
    ]
})
</script>