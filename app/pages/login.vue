<template>
    <DefaultSection>
        <HeadingH1>Iniciar sesión</HeadingH1>

        <FormContainer @submit.prevent="handleSubmit" class="gap-4 lg:gap-7">
            <FormFieldsContainer>
                <FormTextField v-model="formData.email" label="Correo electrónico" id="correo-electronico" type="email"
                    placeholder="stevejobs" autocomplete="username" :error="errors.email" required
                    @blur="validateEmail" />

                <FormPasswordField v-model="formData.password" label="Contraseña" id="contrasena"
                    placeholder="Ingresa tu contraseña" :error="errors.password" required @blur="validatePassword" />
            </FormFieldsContainer>

            <NuxtLink :to="ROUTE_NAMES.FORGOT_PASSWORD" class="text-dark font-light underline">
                ¿Olvidaste tu contraseña?
            </NuxtLink>

            <p class="flex items-center gap-1">Si no tienes una cuenta,<NuxtLink :to="ROUTE_NAMES.REGISTER"
                    class="text-dark font-light underline">
                    registrate</NuxtLink>
            </p>

            <ButtonPrimary type="submit" :disabled="isLoading">
                <span v-if="!isLoading">Ingresar</span>
                <span v-else class="flex items-center gap-2">
                    <Icon name="tabler:loader-2" class="animate-spin" />
                    Iniciando sesión...
                </span>
            </ButtonPrimary>
        </FormContainer>
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'

definePageMeta({
    layout: "auth",
});

const router = useRouter()

const formData = reactive({
    email: '',
    password: ''
})

const errors = reactive({
    email: '',
    password: ''
})

const isLoading = ref(false)

const isFormValid = computed(() => {
    return formData.email.length > 0 &&
        formData.password.length > 0 &&
        !errors.email &&
        !errors.password
})

const validateEmail = () => {
    if (!formData.email) {
        errors.email = 'El correo electrónico es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Formato de correo electrónico inválido'
    } else {
        errors.email = ''
    }
}

const validatePassword = () => {
    if (!formData.password) {
        errors.password = 'La contraseña es requerida'
    } else {
        errors.password = ''
    }
}

watch(() => formData.email, () => {
    if (errors.email) errors.email = ''
})

watch(() => formData.password, () => {
    if (errors.password) errors.password = ''
})

const handleSubmit = async () => {
    isLoading.value = true

    validateEmail()
    validatePassword()

    if (errors.email || errors.password) {
        isLoading.value = false
        return
    }

    try {
        // Logica login

        await router.push(ROUTE_NAMES.HOME)

    } catch (error) {
        console.error('Error en login:', error)
        errors.password = 'Credenciales incorrectas'
    } finally {
        isLoading.value = false
    }
}

</script>