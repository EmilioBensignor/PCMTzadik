<template>
    <FormLayout @submit.prevent="handleSubmit">
        <FormFieldsContainer>
            <FormTextField v-model="formData.titulo" label="Título" id="titulo" placeholder="Título de la review"
                required :error="errors.titulo" />

            <FormTextField v-model="formData.autor" label="Autor" id="autor" placeholder="Nombre del autor" required
                :error="errors.autor" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormReviewImageField v-model="imagePreview" id="imagen" label="Imagen (310px x 160px)" :error="errors.imagen"
                @upload-start="handleImageStart" @upload-complete="handleImageComplete" @upload-error="handleImageError" required />
            <FormTextField v-model="formData.rating" label="Valoración" id="rating" placeholder="Estrellas 1 al 5" 
                required :error="errors.rating" type="number" step="0.5" min="1" max="5" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextField v-model="formData.ciudad" label="Ciudad" id="ciudad" placeholder="Ciudad" required
                :error="errors.ciudad" />

            <FormTextField v-model="formData.provincia" label="Provincia" id="provincia" placeholder="Provincia"
                required :error="errors.provincia" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextarea v-model="formData.comentario" label="Comentario" id="comentario"
                placeholder="Escribe tu comentario aquí..." required :error="errors.comentario" :show-formatting="true" />
        </FormFieldsContainer>

        <div class="w-full flex flex-col lg:flex-row items-center gap-5 mt-8">
            <ButtonPrimary @click="$emit('cancel')" type="button" class="!bg-gray-mid !text-dark">
                Cancelar
            </ButtonPrimary>

            <ButtonPrimary type="submit" :disabled="submitting">
                <Icon v-if="submitting" name="tabler:loader-2" class="w-4 h-4 animate-spin mr-2" />
                {{ submitting ? (isEditing ? 'Actualizando...' : 'Creando...') : (isEditing ? 'Actualizar Review' :
                    'Crear Review') }}
            </ButtonPrimary>
        </div>
    </FormLayout>
</template>

<script setup>
const props = defineProps({
    isEditing: {
        type: Boolean,
        default: false
    },
    initialData: {
        type: Object,
        default: () => ({})
    }
})

const emit = defineEmits(['submit', 'cancel'])

const submitting = ref(false)
const imagen = ref(null)
const imagePreview = ref(null)

const formData = reactive({
    titulo: '',
    autor: '',
    comentario: '',
    rating: null,
    ciudad: '',
    provincia: '',
    img: null
})

const errors = reactive({
    titulo: '',
    autor: '',
    comentario: '',
    rating: '',
    ciudad: '',
    provincia: '',
    imagen: ''
})

onMounted(() => {
    if (props.isEditing && props.initialData) {
        Object.assign(formData, {
            titulo: props.initialData.titulo || '',
            autor: props.initialData.autor || '',
            comentario: props.initialData.comentario || '',
            rating: props.initialData.rating || 0,
            ciudad: props.initialData.ciudad || '',
            provincia: props.initialData.provincia || '',
            activo: props.initialData.activo !== false,
            img: props.initialData.img || null
        })

        if (props.initialData.img) {
            imagePreview.value = props.initialData.img
        }
    }
})


const handleImageStart = (file) => {
    imagen.value = file
    errors.imagen = ''

    if (file === null) {
        formData.img = null
        imagePreview.value = null
    }
}

const handleImageComplete = (imageUrl) => {
    if (imageUrl === null) {
        imagePreview.value = null
        formData.img = null
    } else {
        imagePreview.value = imageUrl
        if (props.isEditing && props.initialData?.img) {
            formData.img = null
        }
    }
    errors.imagen = ''
}

const handleImageError = (errorMessage) => {
    errors.imagen = errorMessage
    console.error('Error al subir imagen:', errorMessage)
}

const validateForm = () => {
    Object.keys(errors).forEach(key => {
        errors[key] = ''
    })

    let isValid = true

    if (!formData.titulo.trim()) {
        errors.titulo = 'El título es requerido'
        isValid = false
    } else if (formData.titulo.trim().length < 3) {
        errors.titulo = 'El título debe tener al menos 3 caracteres'
        isValid = false
    }

    if (!formData.autor.trim()) {
        errors.autor = 'El autor es requerido'
        isValid = false
    } else if (formData.autor.trim().length < 2) {
        errors.autor = 'El autor debe tener al menos 2 caracteres'
        isValid = false
    }

    if (!formData.comentario.trim()) {
        errors.comentario = 'El comentario es requerido'
        isValid = false
    } else if (formData.comentario.trim().length < 10) {
        errors.comentario = 'El comentario debe tener al menos 10 caracteres'
        isValid = false
    }

    const rating = parseFloat(formData.rating)
    if (!rating || rating < 1 || rating > 5) {
        errors.rating = 'La valoración debe ser un número entre 1 y 5'
        isValid = false
    }

    if (!formData.ciudad.trim()) {
        errors.ciudad = 'La ciudad es requerida'
        isValid = false
    }

    if (!formData.provincia.trim()) {
        errors.provincia = 'La provincia es requerida'
        isValid = false
    }

    if (!props.isEditing && !imagen.value) {
        errors.imagen = 'La imagen es requerida'
        isValid = false
    } else if (props.isEditing && !imagen.value && !imagePreview.value && !formData.img) {
        errors.imagen = 'La imagen es requerida'
        isValid = false
    }

    return isValid
}

const handleSubmit = async () => {
    if (!validateForm()) {
        return
    }

    submitting.value = true

    try {
        const reviewData = {
            titulo: formData.titulo.trim(),
            autor: formData.autor.trim(),
            comentario: formData.comentario.trim(),
            rating: parseFloat(formData.rating),
            ciudad: formData.ciudad.trim(),
            provincia: formData.provincia.trim()
        }

        if (props.isEditing && !imagen.value) {
            reviewData.img = formData.img
        }

        emit('submit', {
            reviewData,
            imagen: imagen.value
        })

    } catch (error) {
        console.error('Error in form submission:', error)
        errors.general = 'Error al procesar el formulario'
    } finally {
        submitting.value = false
    }
}
</script>