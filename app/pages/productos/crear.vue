<template>
    <DefaultSection>
        <HeadingH1>{{ isEditing ? 'Editar Producto' : 'Crear Producto' }}</HeadingH1>
        <div class="w-full flex items-center flex-col gap-6">
            <FormSelect v-model="selectedCategory" :options="categoryOptions" placeholder="Selecciona una categoría..."
                class="max-w-md" :disabled="isEditing" @update:modelValue="onCategoryChange" />

            <div v-if="selectedCategory && subcategoryOptions.length > 0" class="w-full max-w-md lg:max-w-[50rem] flex flex-col gap-3">
                <FormLabel class="text-xl font-light text-dark">Subcategorías</FormLabel>
                <div class="w-full grid lg:grid-cols-4 gap-2 lg:gap-4">
                    <FormCheckboxField v-for="option in subcategoryOptions" :key="option.value"
                        :id="`subcategory-${option.value}`" :model-value="selectedSubcategories.includes(option.value)"
                        :label="option.label" @update:model-value="toggleSubcategory(option.value)" />
                </div>
            </div>

            <FormLayout v-if="selectedCategory" @submit.prevent="handleSubmit">
                <template v-for="(chunk, chunkIndex) in columnChunks" :key="`chunk-${chunkIndex}`">
                    <FormFieldsContainer>
                        <template v-for="column in chunk" :key="column.key">
                            <FormTextField v-if="column.type === 'text'" :id="`field-${column.key}`"
                                v-model="formData[column.key]" :label="column.label" :required="column.required"
                                :error="errors[column.key]" :placeholder="`Ingresa ${column.label.toLowerCase()}`" />

                            <FormTextarea v-else-if="column.type === 'textarea'" :id="`field-${column.key}`"
                                v-model="formData[column.key]" :label="column.label" :required="column.required"
                                :error="errors[column.key]" :placeholder="`Ingresa ${column.label.toLowerCase()}`"
                                :rows="4" />

                            <FormTextField v-else-if="column.type === 'number'" :id="`field-${column.key}`"
                                v-model="formData[column.key]" :label="column.label" :required="column.required"
                                :error="errors[column.key]" type="number"
                                :placeholder="`Ingresa ${column.label.toLowerCase()}`" />

                            <FormDateField v-else-if="column.type === 'date'" :id="`field-${column.key}`"
                                v-model="formData[column.key]" :label="column.label" :required="column.required"
                                :error="errors[column.key]" />

                            <FormTextField v-else-if="column.type === 'datetime'" :id="`field-${column.key}`"
                                v-model="formData[column.key]" :label="column.label" :required="column.required"
                                :error="errors[column.key]" type="datetime-local" />

                            <FormTextField v-else-if="column.type === 'currency'" :id="`field-${column.key}`"
                                v-model="formData[column.key]" :label="column.label" :required="column.required"
                                :error="errors[column.key]" type="number" step="0.01"
                                :placeholder="`Ingresa ${column.label.toLowerCase()}`" />

                            <FormSwitch v-else-if="column.type === 'boolean'" :id="`field-${column.key}`"
                                v-model="formData[column.key]" :label="column.label" :required="column.required"
                                :error="errors[column.key]" />

                            <FormCheckboxField v-else-if="column.type === 'checkbox-multiple'"
                                :id="`field-${column.key}`" v-model="formData[column.key]" :label="column.label"
                                :required="column.required" :error="errors[column.key]"
                                :options="selectOptions[column.key] || []" :loading="loadingOptions[column.key]" />

                            <FormSelect v-else-if="column.type === 'select'" :id="`field-${column.key}`"
                                v-model="formData[column.key]" :label="column.label" :required="column.required"
                                :error="errors[column.key]" :options="selectOptions[column.key] || []"
                                :loading="loadingOptions[column.key]"
                                :placeholder="`Seleccionar ${column.label.toLowerCase()}`" />

                            <FormSelect v-else-if="column.type === 'badge'" :id="`field-${column.key}`"
                                v-model="formData[column.key]" :label="column.label" :required="column.required"
                                :error="errors[column.key]" :options="condicionOptions"
                                :placeholder="`Seleccionar ${column.label.toLowerCase()}`" />

                            <FormImageField v-else-if="column.type === 'image'" :id="`field-${column.key}`"
                                v-model="formData[column.key]" :label="column.label" :required="column.required"
                                :error="errors[column.key]" />

                            <FormFileField v-else-if="column.type === 'file'" :id="`field-${column.key}`"
                                v-model="formData[column.key]" :label="column.label" :required="column.required"
                                :error="errors[column.key]" />
                        </template>
                    </FormFieldsContainer>
                </template>

                <div class="w-full flex flex-col lg:flex-row items-center gap-5 mt-8">
                    <ButtonPrimary @click="handleCancel" type="button" class="!bg-gray-mid !text-dark">
                        Cancelar
                    </ButtonPrimary>

                    <ButtonPrimary type="submit" :disabled="isSubmitting" class="">
                        {{ isSubmitting ? (isEditing ? 'Actualizando...' : 'Creando...') : (isEditing ? 'Actualizar' :
                        'Crear') }}
                    </ButtonPrimary>
                </div>
            </FormLayout>
        </div>
    </DefaultSection>
</template>

<script setup>
import { useDynamicForm } from '~/composables/useDynamicForm.js'
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import categorias from '~/shared/categorias.js'
import productos from '~/shared/productos.js'

const route = useRoute()
const selectedCategory = ref('')
const selectedSubcategories = ref([])
const isSubmitting = ref(false)
const isEditing = ref(false)
const editingProductId = ref(null)
const editingProduct = ref(null)

const categoriasSchema = {
    options: categorias,
    optionKey: 'nombre'
}

const dynamicForm = useDynamicForm(categoriasSchema)

const { formData, errors, columnChunks, selectOptions, loadingOptions } = dynamicForm

const categoryOptions = computed(() => {
    return categorias.map(cat => ({
        value: cat.nombre,
        label: cat.nombre
    }))
})

const subcategoryOptions = computed(() => {
    if (!selectedCategory.value) return []
    const categoria = categorias.find(cat => cat.nombre === selectedCategory.value)
    if (!categoria || !categoria.subcategorias) return []
    return categoria.subcategorias.map(subcat => ({
        value: subcat,
        label: subcat
    }))
})

const condicionOptions = [
    { value: 'nuevo', label: 'Nuevo' },
    { value: 'usado', label: 'Usado' },
    { value: 'seminuevo', label: 'Seminuevo' }
]

const onCategoryChange = (category) => {
    if (category) {
        selectedSubcategories.value = []
        dynamicForm.selectOption(category)
    }
}

const toggleSubcategory = (subcategoryValue) => {
    const index = selectedSubcategories.value.indexOf(subcategoryValue)
    if (index > -1) {
        selectedSubcategories.value.splice(index, 1)
    } else {
        selectedSubcategories.value.push(subcategoryValue)
    }
}

const handleCancel = () => {
    if (isEditing.value) {
        navigateTo(ROUTE_NAMES.PRODUCTOS_CATEGORIA(selectedCategory.value))
    } else {
        resetForm()
        navigateTo(ROUTE_NAMES.PRODUCTOS)
    }
}

const resetForm = () => {
    dynamicForm.resetForm()
    selectedCategory.value = ''
    selectedSubcategories.value = []
}

const initializeForEdit = () => {
    const editId = route.query.edit
    if (editId) {
        const product = productos.find(p => p.id === parseInt(editId))
        if (product) {
            isEditing.value = true
            editingProductId.value = parseInt(editId)
            editingProduct.value = { ...product }

            selectedCategory.value = product.categoria
            selectedSubcategories.value = product.subcategorias ?? []
            dynamicForm.selectOption(product.categoria)

            nextTick(() => {
                dynamicForm.loadData(product)
            })
        }
    }
}

const handleSubmit = async () => {
    if (!dynamicForm.validateForm()) {
        console.log('Formulario inválido:', dynamicForm.errors)
        return
    }

    isSubmitting.value = true

    try {
        const formattedData = dynamicForm.formatFormData()

        if (selectedSubcategories.value && selectedSubcategories.value.length > 0) {
            formattedData.subcategorias = selectedSubcategories.value
        }

        if (isEditing.value) {
            const index = productos.findIndex(p => p.id === editingProductId.value)
            if (index !== -1) {
                productos[index] = { ...productos[index], ...formattedData, id: editingProductId.value }
                console.log('Producto actualizado:', productos[index])
                navigateTo(ROUTE_NAMES.PRODUCTOS_CATEGORIA(selectedCategory.value))
            }
        } else {
            const maxId = Math.max(...productos.map(p => p.id), 0)
            formattedData.id = maxId + 1
            productos.push(formattedData)
            console.log('Producto creado:', formattedData)
            resetForm()
            alert('Producto creado exitosamente!')
        }

    } catch (error) {
        console.error('Error al procesar producto:', error)
        alert(`Error al ${isEditing.value ? 'actualizar' : 'crear'} el producto. Inténtalo de nuevo.`)
    } finally {
        isSubmitting.value = false
    }
}

onMounted(() => {
    initializeForEdit()
})
</script>