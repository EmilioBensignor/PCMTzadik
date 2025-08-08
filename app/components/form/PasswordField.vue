<template>
    <div class="w-full flex flex-col gap-2">
        <FormLabel :id="id" v-if="label">{{ label }}</FormLabel>

        <div
            class="relative bg-light border border-dark rounded-md lg:text-xl font-light text-dark lg:placeholder:text-xl placeholder:font-light placeholder:text-gray-dark py-3 px-[0.875rem]">
            <input :id="inputId" :type="showPassword ? 'text' : 'password'" :placeholder="placeholder"
                :value="modelValue" :required="required" @input="handleInput" @blur="handleBlur" @focus="handleFocus"
                autocomplete="current-password" class="w-full bg-light outline-none" />

            <button type="button"
                class="flex justify-center itemsce absolute right-3 top-1/2 transform -translate-y-1/2 text-dark"
                @click="togglePasswordVisibility"
                :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'">
                <Icon :name="showPassword ? 'tabler:eye-off' : 'tabler:eye'" class="w-6 h-6" />
            </button>
        </div>

        <FormError v-if="error && showError">{{ error }}</FormError>
    </div>
</template>

<script setup>
const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    },
    label: {
        type: String,
        default: ''
    },
    placeholder: {
        type: String,
        default: 'Contraseña'
    },
    error: {
        type: String,
        default: ''
    },
    required: {
        type: Boolean,
        default: false
    },
    id: {
        type: String,
        required: true,
    },
    initiallyVisible: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus', 'toggle-visibility'])

// Estado interno
const showPassword = ref(props.initiallyVisible)
const showError = ref(false)

const inputId = computed(() => props.id)

// Funciones
const togglePasswordVisibility = () => {
    if (!props.disabled) {
        showPassword.value = !showPassword.value
        emit('toggle-visibility', showPassword.value)
    }
}

const handleInput = (event) => {
    emit('update:modelValue', event.target.value)

    if (showError.value) {
        showError.value = false
    }
}

const handleBlur = (event) => {
    if (props.error) {
        showError.value = true
    }
    emit('blur', event)
}

const handleFocus = (event) => {
    emit('focus', event)
}

watchEffect(() => {
    if (props.error) {
        showError.value = true
    }
})

const handleKeydown = (event) => {
    if (event.altKey && event.key === 'Enter') {
        event.preventDefault()
        togglePasswordVisibility()
    }
}

onMounted(() => {
    const input = document.getElementById(inputId.value)
    if (input) {
        input.addEventListener('keydown', handleKeydown)
    }
})

onUnmounted(() => {
    const input = document.getElementById(inputId.value)
    if (input) {
        input.removeEventListener('keydown', handleKeydown)
    }
})
</script>