<template>
    <DefaultSection>
        <HeadingH1>Productos</HeadingH1>
        <ButtonPrimary :to="ROUTE_NAMES.PRODUCTOS_CREAR">
            Nuevo Producto
        </ButtonPrimary>
        <div class="w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <div v-for="(categoria, index) in categorias" :key="index" @click="navigateToCategory(categoria.nombre)"
                class="w-full flex flex-col justify-between gap-3 border-2 border-primary/50 shadow-1 rounded-2xl p-4">
                <div class="flex flex-col gap-3">
                    <div class="flex justify-between items-center">
                        <p class="text-xl lg:text-2xl">{{ categoria.nombre }}</p>
                        <Icon :name="`tabler:${categoria.icon}`" class="w-6 lg:w-8 h-6 lg:h-8 text-secondary" />
                    </div>
                    <div class="flex items-center justify-between lg:text-xl">
                        <p>Productos:</p>
                        <span class="font-medium">{{ getProductCount(categoria.nombre) }}</span>
                    </div>
                    <div v-if="categoria.subcategorias?.length > 0" class="flex flex-col gap-2">
                        <div class="flex items-center justify-between text-sm lg:text-base">
                            <p>Subcategorías:</p>
                            <button @click.stop="editSubcategories(categoria)" class="text-terciary">
                                Editar
                            </button>
                        </div>
                        <div class="flex flex-wrap gap-1 lg:gap-2">
                            <span v-for="subcategoria in categoria.subcategorias.slice(0, 3)" :key="subcategoria"
                                class="bg-gray-300/65 border text-xs lg:text-sm rounded lg:rounded-lg px-2 py-1">
                                {{ subcategoria }}
                            </span>
                            <span v-if="categoria.subcategorias.length > 3"
                                class="bg-gray-300/65 border text-xs lg:text-sm rounded lg:rounded-lg px-2 py-1">
                                +{{ categoria.subcategorias.length - 3 }}
                            </span>
                        </div>
                    </div>
                </div>
                <ButtonPrimary class="!px-3 mt-3">Ver productos</ButtonPrimary>
            </div>
        </div>

        <div v-if="showSubcategoryModal"
            class="flex items-center justify-center fixed z-50 inset-0 bg-black bg-opacity-50"
            @click="closeModal">
            <div class="w-[85%] max-w-md lg:max-w-3xl flex flex-col gap-3 bg-light rounded-lg p-6" @click.stop>
                <div class="flex flex-col gap-2">
                    <p class="text-xl lg:text-2xl">{{ editingCategory?.nombre }}</p>
                    <p class="lg:text-xl">Editar Subcategorías</p>
                </div>

                <div class="flex flex-col gap-3">
                    <div v-for="(subcategoria, index) in subcategorias" :key="index" class="flex gap-2">
                        <FormTextField v-model="subcategorias[index]" :id="`subcategoria-${index}`"
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
import categorias from '~/shared/categorias.js'
import productos from '~/shared/productos.js'

const showSubcategoryModal = ref(false)
const editingCategory = ref(null)
const subcategorias = ref([])


const getProductCount = (categoryName) => {
    return productos.filter(producto => producto.categoria === categoryName).length
}

const navigateToCategory = (categoryName) => {
    navigateTo(`/productos/${encodeURIComponent(categoryName)}`)
}

const editSubcategories = (categoria) => {
    editingCategory.value = categoria
    subcategorias.value = [...(categoria.subcategorias || [])]
    showSubcategoryModal.value = true
}

const closeModal = () => {
    showSubcategoryModal.value = false
    editingCategory.value = null
    subcategorias.value = []
}

const addSubcategory = () => {
    subcategorias.value.push('')
}

const removeSubcategory = (index) => {
    subcategorias.value.splice(index, 1)
}

const saveSubcategories = () => {
    if (editingCategory.value) {
        const index = categorias.findIndex(cat => cat.nombre === editingCategory.value.nombre)
        if (index !== -1) {
            categorias[index].subcategorias = subcategorias.value.filter(sub => sub.trim())
        }
    }
    closeModal()
}
</script>