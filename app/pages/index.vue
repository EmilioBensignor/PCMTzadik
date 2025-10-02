<template>
    <DefaultSection>
        <div class="w-full flex flex-col items-center gap-6">
            <HeadingH1>Productos</HeadingH1>
            <div class="w-full lg:max-w-3xl flex flex-col lg:flex-row justify-center items-center gap-6">
                <ButtonPrimary :to="ROUTE_NAMES.PRODUCTOS_CREAR">
                    Nuevo Producto
                </ButtonPrimary>
                <ButtonPrimary :to="ROUTE_NAMES.EDITOR_MASIVO" class="!bg-terciary hover:!bg-terciary-dark">
                    Editor Masivo
                </ButtonPrimary>
            </div>
        </div>
        <div v-if="loading || loadingData" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <div v-else class="w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <div v-for="categoria in categorias" :key="categoria.id" @click="navigateToCategory(categoria.nombre)"
                class="w-full flex flex-col justify-between gap-3 border-2 border-primary/50 shadow-1 rounded-2xl p-4 cursor-pointer">
                <div class="flex flex-col gap-3">
                    <div class="flex justify-between items-center">
                        <p class="text-xl lg:text-2xl">{{ categoria.nombre }}</p>
                        <NuxtImg :src="categoria.icon" :alt="categoria.nombre"
                            class="w-6 lg:w-8 h-6 lg:h-8 text-primary object-contain" />
                    </div>
                    <div class="flex items-center justify-between lg:text-xl">
                        <p>Productos:</p>
                        <span class="font-medium">{{ getProductCount(categoria.id) }}</span>
                    </div>
                    <div v-if="getSubcategoriasByCategoria(categoria.id).length > 0" class="flex flex-col gap-2">
                        <div class="flex items-center justify-between text-sm lg:text-base">
                            <p>Subcategorías:</p>
                            <button @click.stop="editSubcategories(categoria)"
                                class="text-terciary hover:text-terciary-dark">
                                Editar
                            </button>
                        </div>
                        <div class="flex flex-wrap gap-1 lg:gap-2">
                            <span v-for="subcategoria in getSubcategoriasByCategoria(categoria.id).slice(0, 3)"
                                :key="subcategoria.id"
                                class="bg-gray-300/65 border text-xs lg:text-sm rounded lg:rounded-lg px-2 py-1">
                                {{ subcategoria.nombre }}
                            </span>
                            <span v-if="getSubcategoriasByCategoria(categoria.id).length > 3"
                                class="bg-gray-300/65 border text-xs lg:text-sm rounded lg:rounded-lg px-2 py-1">
                                +{{ getSubcategoriasByCategoria(categoria.id).length - 3 }}
                            </span>
                        </div>
                    </div>
                    <div v-else class="flex items-center justify-between text-sm lg:text-base text-gray-500">
                        <p>Sin subcategorías</p>
                        <button @click.stop="editSubcategories(categoria)"
                            class="flex items-center gap-1 text-terciary hover:text-terciary-dark transition-colors">
                            <Icon name="tabler:plus" class="w-4 h-4" />
                            Agregar
                        </button>
                    </div>
                </div>
                <ButtonPrimary class="!px-3 mt-3">Ver productos</ButtonPrimary>
            </div>
        </div>

        <div v-if="showSubcategoryModal"
            class="flex items-center justify-center fixed z-50 inset-0 bg-black bg-opacity-50" @click="closeModal">
            <div class="w-[85%] max-w-md lg:max-w-3xl flex flex-col gap-3 bg-light rounded-lg p-6" @click.stop>
                <div class="flex flex-col gap-2">
                    <p class="text-xl lg:text-2xl">{{ editingCategory?.nombre }}</p>
                    <p class="lg:text-xl">Editar Subcategorías</p>
                </div>

                <div class="flex flex-col gap-3">
                    <div v-for="(subcategoria, index) in editingSubcategorias" :key="index" class="flex gap-2">
                        <FormTextField v-model="editingSubcategorias[index]" :id="`subcategoria-${index}`"
                            placeholder="Nombre de subcategoría" />
                        <button @click="removeSubcategory(index)">
                            <Icon name="tabler:trash" class="w-6 h-6 text-error" />
                        </button>
                    </div>
                </div>

                <button @click="addSubcategory" class="text-secondary lg:!text-left">
                    + Agregar subcategoría
                </button>

                <div class="flex justify-center flex-wrap lg:flex-nowrap gap-3 mt-3">
                    <ButtonPrimary @click="closeModal" class="!bg-light border-2 border-primary !text-primary">
                        Cancelar
                    </ButtonPrimary>
                    <ButtonPrimary @click="saveSubcategories">
                        Guardar
                    </ButtonPrimary>
                </div>
            </div>
        </div>
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'

const { categorias, loading, fetchCategorias, fetchSubcategorias, getSubcategoriasPorCategoria } = useCategorias()
const { getProductosByCategoria, fetchProductos, productos, clearFilters, setFilter } = useProductos()

const showSubcategoryModal = ref(false)
const editingCategory = ref(null)
const editingSubcategorias = ref([])
const loadingData = ref(true)

onMounted(async () => {
    loadingData.value = true
    try {
        await fetchCategorias()
        await fetchSubcategorias()
        await fetchProductCounts()

        clearFilters()
    } catch (error) {
        console.error('Error loading data:', error)
    } finally {
        loadingData.value = false
    }
})

const productCounts = ref({})

const getProductCount = (categoriaId) => {
    return productCounts.value[categoriaId] || 0
}

const fetchProductCounts = async () => {
    try {
        const supabase = useSupabaseClient()
        const counts = {}

        // Fetch count for each category in parallel
        const countPromises = categorias.value.map(async (categoria) => {
            const { count, error } = await supabase
                .from('productos')
                .select('*', { count: 'exact', head: true })
                .eq('categoria_id', categoria.id)

            if (error) throw error
            counts[categoria.id] = count || 0
        })

        await Promise.all(countPromises)
        productCounts.value = counts
    } catch (error) {
        console.error('Error fetching product counts:', error)
    }
}

const getSubcategoriasByCategoria = (categoriaId) => {
    return getSubcategoriasPorCategoria(categoriaId)
}

const navigateToCategory = async (categoryName) => {
    // Find the category to get its ID
    const categoria = categorias.value.find(cat => cat.nombre === categoryName)
    if (categoria) {
        // Apply the category filter before navigation
        setFilter('categoria_id', categoria.id)

        // Preload products for this category
        await fetchProductos({ includeImages: false })
    }

    navigateTo(ROUTE_NAMES.PRODUCTOS_CATEGORIA(categoryName))
}

const { createSubcategoria, deleteSubcategoria } = useCategorias()

const editSubcategories = async (categoria) => {
    editingCategory.value = categoria
    await fetchSubcategorias(categoria.id)
    const existingSubs = getSubcategoriasPorCategoria(categoria.id).map(sub => sub.nombre)

    editingSubcategorias.value = existingSubs.length > 0 ? existingSubs : ['']
    showSubcategoryModal.value = true
}

const closeModal = () => {
    showSubcategoryModal.value = false
    editingCategory.value = null
    editingSubcategorias.value = []
}

const addSubcategory = () => {
    editingSubcategorias.value.push('')
}

const removeSubcategory = (index) => {
    editingSubcategorias.value.splice(index, 1)
}

const saveSubcategories = async () => {
    if (editingCategory.value) {
        try {
            const existingSubs = getSubcategoriasPorCategoria(editingCategory.value.id)

            for (const nombre of editingSubcategorias.value) {
                if (nombre.trim() && !existingSubs.find(sub => sub.nombre === nombre.trim())) {
                    await createSubcategoria({
                        categoria_id: editingCategory.value.id,
                        nombre: nombre.trim()
                    })
                }
            }

            for (const existingSub of existingSubs) {
                if (!editingSubcategorias.value.includes(existingSub.nombre)) {
                    await deleteSubcategoria(existingSub.id)
                }
            }

            await fetchSubcategorias(editingCategory.value.id)
        } catch (error) {
            console.error('Error saving subcategories:', error)
        }
    }
    closeModal()
}
</script>