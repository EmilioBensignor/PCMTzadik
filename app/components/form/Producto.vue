<template>
    <div class="w-full flex items-center flex-col gap-6">
        <FormSelect v-model="selectedCategory" :options="categoryOptions" placeholder="Selecciona una categoría..."
            class="max-w-md" :disabled="isEditing" @update:modelValue="onCategoryChange" />

        <div v-if="selectedCategory && subcategoryOptions.length > 0"
            class="w-full max-w-md lg:max-w-[50rem] flex flex-col gap-3">
            <FormLabel class="text-xl font-light text-dark">Subcategorías</FormLabel>
            <div class="w-full grid lg:grid-cols-4 gap-2 lg:gap-4">
                <FormCheckboxField v-for="option in subcategoryOptions" :key="option.value"
                    :id="`subcategory-${option.value}`" :model-value="selectedSubcategories.includes(option.value)"
                    :label="option.label" @update:model-value="toggleSubcategory(option.value)" />
            </div>
        </div>

        <FormLayout v-if="selectedCategory" @submit.prevent="handleSubmit">
            <FormFieldsContainer>
                <FormTextField id="titulo" v-model="formData.titulo" label="Título" required :error="errors.titulo"
                    placeholder="Ingresa el título del producto" />

                <FormSelect id="condicion" v-model="formData.condicion" label="Condición" required
                    :error="errors.condicion" :options="condicionOptions" placeholder="Seleccionar condición" />
            </FormFieldsContainer>

            <FormFieldsContainer>
                <FormTextField id="precio" v-model="formData.precio" label="Precio" :error="errors.precio"
                    type="number" step="1" min="0" placeholder="Ingresa el precio" @input="calcularPrecioConDescuento" />
                <FormTextField id="descuento" v-model.number="formData.descuento" label="Descuento (%)"
                    :error="errors.descuento" type="number" min="0" max="100" step="1"
                    placeholder="0" @input="calcularPrecioConDescuento" />
            </FormFieldsContainer>

            <FormFieldsContainer>
                <FormTextField id="precio_descuento" :model-value="precioConDescuento" label="Precio con Descuento"
                    type="number" step="1" placeholder="0" disabled class="bg-gray-100" />
                <FormSwitch id="moneda" v-model="formData.moneda" label="Moneda"
                    left-label="Pesos" right-label="USD" :disabled="!formData.precio" />
            </FormFieldsContainer>

            <FormFieldsContainer>
                <FormSwitch id="destacado" v-model="formData.destacado" label="Producto Destacado" />
                <FormTextField id="oferta" v-model="formData.oferta" label="Oferta" :error="errors.oferta"
                    placeholder="Ingresa el texto de oferta" />
            </FormFieldsContainer>

            <FormFieldsContainer>
                <FormTextarea id="descripcion_corta" v-model="formData.descripcion_corta" label="Descripción Corta"
                    :error="errors.descripcion_corta" placeholder="Descripción breve del producto" :rows="2" :show-formatting="true" />
            </FormFieldsContainer>

            <FormFieldsContainer>
                <FormTextarea id="descripcion_larga" v-model="formData.descripcion_larga" label="Descripción Larga"
                    :error="errors.descripcion_larga" placeholder="Descripción detallada del producto" :rows="4" :show-formatting="true" />
            </FormFieldsContainer>

            <div class="w-full flex flex-col gap-4">
                <FormMultiImageField
                    id="productos-imagenes"
                    v-model="productImages"
                    label="Imágenes del Producto (550px x 400px)"
                    :max-files="10"
                    :max-size="5242880"
                    required
                    :error="errors.imagenes"
                    @upload-start="onImagesUploadStart"
                    @upload-complete="onImagesUploadComplete"
                    @upload-error="onImagesUploadError"
                />
            </div>

            <div class="w-full flex flex-col gap-4">
                <FormLabel class="text-lg font-medium">Video del Producto (Solo la URL, src="...")</FormLabel>

                <FormFieldsContainer>
                    <FormTextField id="video-titulo" v-model="productVideo.titulo" label="Título del Video"
                        placeholder="Título del video" />
                    <FormTextField id="video-url" v-model="productVideo.url" label="URL del Video"
                        placeholder="https://www.youtube.com/embed/VIDEO_ID" />
                </FormFieldsContainer>

                <div v-if="productVideo.url" class="w-full max-w-md">
                    <div v-if="isValidYouTubeUrl(productVideo.url)">
                        <iframe :src="sanitizeYouTubeUrl(productVideo.url)" class="w-full h-48 rounded border"
                            frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                    </div>
                    <div v-else
                        class="w-full h-48 rounded border bg-gray-100 flex items-center justify-center text-gray-500">
                        URL de video no válida. Use formato: https://www.youtube.com/embed/VIDEO_ID
                    </div>
                </div>
            </div>

            <div class="w-full flex flex-col gap-4">
                <FormFileField
                    id="ficha-tecnica"
                    v-model="productFichaTecnica"
                    label="Ficha Técnica (PDF - Máximo 40MB)"
                    :accepted-types="['pdf']"
                    :max-size="41943040"
                    :error="errors.ficha_tecnica"
                    @upload-complete="onFichaTecnicaUploadComplete"
                    @upload-error="onFichaTecnicaUploadError"
                />
            </div>

            <template v-for="(chunk, chunkIndex) in columnChunks" :key="`chunk-${chunkIndex}`">
                <FormFieldsContainer>
                    <template v-for="field in chunk" :key="field.id">
                        <FormTextField v-if="field.type === 'text'" :id="`field-${field.id}`"
                            v-model="formData[field.id]" :label="field.label" :required="field.required"
                            :error="errors[field.id]" :placeholder="`Ingresa ${field.label.toLowerCase()}`" />

                        <FormTextarea v-else-if="field.type === 'textarea'" :id="`field-${field.id}`"
                            v-model="formData[field.id]" :label="field.label" :required="field.required"
                            :error="errors[field.id]" :placeholder="`Ingresa ${field.label.toLowerCase()}`" :rows="4" :show-formatting="true" />

                        <FormTextField v-else-if="field.type === 'number'" :id="`field-${field.id}`"
                            v-model="formData[field.id]" :label="field.label" :required="field.required"
                            :error="errors[field.id]" type="number"
                            :placeholder="`Ingresa ${field.label.toLowerCase()}`" />

                        <FormTextField v-else-if="field.type === 'currency'" :id="`field-${field.id}`"
                            v-model="formData[field.id]" :label="field.label" :required="field.required"
                            :error="errors[field.id]" type="number" step="0.01"
                            :placeholder="`Ingresa ${field.label.toLowerCase()}`" />

                        <FormSelect v-else-if="field.type === 'select'" :id="`field-${field.id}`"
                            v-model="formData[field.id]" :label="field.label" :required="field.required"
                            :error="errors[field.id]" :options="field.options || []"
                            :placeholder="`Seleccionar ${field.label.toLowerCase()}`" />
                    </template>
                </FormFieldsContainer>
            </template>

            <div class="w-full flex flex-col lg:flex-row items-center gap-5 mt-8">
                <ButtonPrimary @click="$emit('cancel')" type="button" class="!bg-gray-mid !text-dark">
                    Cancelar
                </ButtonPrimary>

                <ButtonPrimary type="submit" :disabled="isSubmitting" class="">
                    {{ isSubmitting ? (isEditing ? 'Actualizando...' : 'Creando...') : (isEditing ? 'Actualizar' :
                        'Crear') }}
                </ButtonPrimary>
            </div>
        </FormLayout>
    </div>
</template>

<script setup>
const props = defineProps({
    isEditing: {
        type: Boolean,
        default: false
    },
    productData: {
        type: Object,
        default: () => ({})
    },
    initialCategory: {
        type: [String, Number],
        default: null
    }
})

const emit = defineEmits(['submit', 'cancel'])

const { categorias, fetchCategorias, fetchSubcategorias, fetchCategoriaCampos, getCamposPorCategoria, getSubcategoriasPorCategoria, generateFormFields, validateDynamicData } = useCategorias()
const { getImagenesByProducto } = useProductos()
const { getImageUrl, uploadProductoPdf } = useStorage()

const selectedCategory = ref('')
const selectedCategoryId = ref(null)
const selectedSubcategories = ref([])
const formData = ref({})
const errors = ref({})
const isSubmitting = ref(false)
const formFields = ref([])
const productImages = ref([])
const productVideo = ref({ titulo: '', url: '' })
const productFichaTecnica = ref('')

onMounted(async () => {
    await fetchCategorias()
    if (props.isEditing && props.productData.id) {
        await initializeForEdit()
    } else if (props.initialCategory && !props.isEditing) {
        selectedCategory.value = props.initialCategory
        selectedCategoryId.value = props.initialCategory
        await onCategoryChange(props.initialCategory)
    }
})

const categoryOptions = computed(() => {
    return categorias.value.map(cat => ({
        value: cat.id,
        label: cat.nombre
    }))
})

const currentCategory = computed(() => {
    return categorias.value.find(cat => cat.id === selectedCategoryId.value)
})

const subcategoryOptions = computed(() => {
    if (!selectedCategoryId.value) return []
    return getSubcategoriasPorCategoria(selectedCategoryId.value).map(sub => ({
        value: sub.id,
        label: sub.nombre
    }))
})

const columnChunks = computed(() => {
    if (!formFields.value.length) return []

    const chunks = []
    let currentChunk = []

    formFields.value.forEach(field => {
        if (field.type === 'textarea') {
            if (currentChunk.length > 0) {
                chunks.push([...currentChunk])
                currentChunk = []
            }
            chunks.push([field])
        } else {
            currentChunk.push(field)
            if (currentChunk.length === 2) {
                chunks.push([...currentChunk])
                currentChunk = []
            }
        }
    })

    if (currentChunk.length > 0) {
        chunks.push(currentChunk)
    }

    return chunks
})

const condicionOptions = [
    { value: 'Nuevo', label: 'Nuevo' },
    { value: 'Usado', label: 'Usado' },
    { value: 'Seminuevo', label: 'Seminuevo' }
]

const isValidYouTubeUrl = (url) => {
    if (!url) return false
    const youtubeEmbedRegex = /^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]+(\?.*)?$/
    const youtubeWatchRegex = /^https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)(&.*)?$/
    const youtubeShortRegex = /^https:\/\/youtu\.be\/([a-zA-Z0-9_-]+)(\?.*)?$/
    const youtubeShortsRegex = /^https:\/\/www\.youtube\.com\/shorts\/([a-zA-Z0-9_-]+)(\?.*)?$/

    return youtubeEmbedRegex.test(url) || youtubeWatchRegex.test(url) || youtubeShortRegex.test(url) || youtubeShortsRegex.test(url)
}

const sanitizeYouTubeUrl = (url) => {
    if (!url) return ''

    if (url.includes('/embed/')) {
        return url
    }

    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/)
    if (watchMatch) {
        return `https://www.youtube.com/embed/${watchMatch[1]}`
    }

    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)
    if (shortMatch) {
        return `https://www.youtube.com/embed/${shortMatch[1]}`
    }

    const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/)
    if (shortsMatch) {
        return `https://www.youtube.com/embed/${shortsMatch[1]}`
    }

    return url
}

const onCategoryChange = async (categoryId) => {
    if (categoryId) {
        selectedCategoryId.value = categoryId
        selectedSubcategories.value = []

        await fetchSubcategorias(categoryId)
        await fetchCategoriaCampos(categoryId)

        formFields.value = generateFormFields(categoryId)

        formData.value = {}
        errors.value = {}

        formData.value = {
            titulo: '',
            condicion: '',
            precio: '',
            descuento: 0,
            moneda: true,
            oferta: '',
            destacado: false,
            descripcion_larga: '',
            descripcion_corta: ''
        }

        productFichaTecnica.value = ''
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

const onImagesUploadStart = (files) => {
    console.log('Iniciando subida de imágenes:', files.length)
}

const onImagesUploadComplete = (newImages) => {
    console.log('Imágenes procesadas:', newImages.length)
}

const onImagesUploadError = (errorMessage) => {
    errors.value.imagenes = errorMessage
    console.error('Error al subir imágenes:', errorMessage)
}

const onFichaTecnicaUploadComplete = (file) => {
    if (errors.value.ficha_tecnica) {
        delete errors.value.ficha_tecnica
    }
}

const onFichaTecnicaUploadError = (errorMessage) => {
    errors.value.ficha_tecnica = errorMessage
    console.error('Error al subir ficha técnica:', errorMessage)
}

const initializeForEdit = async () => {
    const product = props.productData
    if (product) {
        selectedCategoryId.value = product.categoria_id
        selectedCategory.value = product.categoria_id

        if (product.subcategoria_id) {
            selectedSubcategories.value = Array.isArray(product.subcategoria_id)
                ? product.subcategoria_id
                : [product.subcategoria_id]
        }

        await fetchCategoriaCampos(product.categoria_id)
        formFields.value = generateFormFields(product.categoria_id)

        formData.value = {
            titulo: product.titulo || '',
            condicion: product.condicion || '',
            precio: product.precio || '',
            descuento: product.descuento || 0,
            moneda: product.moneda !== undefined ? product.moneda : true,
            oferta: product.oferta || '',
            destacado: product.destacado || false,
            descripcion_larga: product.descripcion_larga || '',
            descripcion_corta: product.descripcion_corta || '',
            ...product.datos_dinamicos
        }

        const imagenes = getImagenesByProducto(product.id)
        if (imagenes.length > 0) {
            productImages.value = imagenes
                .sort((a, b) => (a.orden || 0) - (b.orden || 0))
                .map((img, index) => ({
                    id: img.id,
                    name: img.filename || `imagen-${index + 1}.jpg`,
                    url: getImageUrl(img.storage_path, false) || '',
                    preview: getImageUrl(img.storage_path, false) || '',
                    file: null,
                    isExisting: true,
                    orden: img.orden || (index + 1),
                    es_principal: img.es_principal || (index === 0),
                    filename: img.filename,
                    file_size: img.file_size,
                    mime_type: img.mime_type,
                    storage_path: img.storage_path
                }))
        }

        if (product.videos && Array.isArray(product.videos) && product.videos.length > 0) {
            productVideo.value = {
                titulo: product.videos[0].titulo || '',
                url: product.videos[0].url || ''
            }
        }

        productFichaTecnica.value = product.ficha_tecnica || ''
    }
}

const precioConDescuento = computed(() => {
    const precio = parseFloat(formData.value.precio) || 0
    if (!precio) return 0

    const descuento = parseFloat(formData.value.descuento) || 0
    if (descuento <= 0) return precio

    return Math.round(precio * (1 - descuento / 100))
})

const calcularPrecioConDescuento = () => {
    // Trigger reactivity
}

const handleSubmit = async () => {
    const validation = validateDynamicData(selectedCategoryId.value, formData.value)
    if (!validation.isValid) {
        errors.value = validation.errors
        return
    }

    if (productImages.value.length === 0) {
        errors.value = { imagenes: 'Debe agregar al menos una imagen al producto' }
        return
    }

    if (errors.value.imagenes) {
        delete errors.value.imagenes
    }

    isSubmitting.value = true

    try {
        const { titulo, condicion, precio, descuento, moneda, oferta, destacado, descripcion_larga, descripcion_corta, ...datosDinamicos } = formData.value

        let fichaTecnicaPath = null

        if (productFichaTecnica.value && productFichaTecnica.value instanceof File) {
            try {
                const tempSlug = titulo.toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .trim('-') || 'producto'

                const oldPdfPath = props.isEditing && props.productData?.ficha_tecnica
                    ? props.productData.ficha_tecnica
                    : null

                fichaTecnicaPath = await uploadProductoPdf(productFichaTecnica.value, tempSlug, oldPdfPath)
            } catch (pdfError) {
                errors.value.ficha_tecnica = 'Error al subir la ficha técnica'
                console.error('Error uploading PDF:', pdfError)
                return
            }
        } else if (typeof productFichaTecnica.value === 'string') {
            fichaTecnicaPath = productFichaTecnica.value
        }

        const descuentoValue = parseFloat(descuento) || 0
        const precioValue = parseFloat(precio) || 0

        const productoData = {
            categoria_id: selectedCategoryId.value,
            subcategoria_id: selectedSubcategories.value.length > 0 ? selectedSubcategories.value[0] : null,
            titulo,
            condicion,
            precio: precioValue > 0 ? precioValue : null,
            descuento: precioValue > 0 && descuentoValue > 0 ? descuentoValue : null,
            precio_descuento: precioValue > 0 ? (descuentoValue > 0 ? precioConDescuento.value : precioValue) : null,
            moneda: precioValue > 0 ? (moneda !== undefined ? moneda : true) : null,
            oferta: oferta || null,
            destacado: destacado || false,
            descripcion_larga,
            descripcion_corta,
            datos_dinamicos: datosDinamicos,
            ficha_tecnica: fichaTecnicaPath || null
        }

        const videoData = productVideo.value.url && productVideo.value.url.trim() !== ''
            ? [{ titulo: productVideo.value.titulo || '', url: productVideo.value.url, orden: 1 }]
            : []

        productoData.videos = videoData

        emit('submit', {
            productoData,
            imagenes: productImages.value,
            isEditing: props.isEditing,
            productId: props.productData?.id
        })

    } catch (err) {
        console.error('Error en formulario:', err)
        errors.value = { general: 'Error al procesar el formulario' }
    } finally {
        isSubmitting.value = false
    }
}

watch(() => props.productData, async (newData) => {
    if (newData && Object.keys(newData).length > 0) {
        await initializeForEdit()
    }
}, { deep: true })

watch(() => props.initialCategory, async (newCategory) => {
    if (newCategory && !props.isEditing && categorias.value.length > 0) {
        selectedCategory.value = newCategory
        selectedCategoryId.value = newCategory
        await onCategoryChange(newCategory)
    }
})
</script>