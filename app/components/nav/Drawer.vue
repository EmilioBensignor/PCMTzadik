<template>
    <Transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0"
        enter-to-class="opacity-100" leave-active-class="transition-opacity duration-300" leave-from-class="opacity-100"
        leave-to-class="opacity-0">
        <div v-if="isOpen" @click="$emit('close')" class="fixed inset-0 bg-black/50 z-40"></div>
    </Transition>

    <!-- Drawer -->
    <Transition enter-active-class="transition-transform duration-300 ease-out" enter-from-class="-translate-x-full"
        enter-to-class="translate-x-0" leave-active-class="transition-transform duration-300 ease-in"
        leave-from-class="translate-x-0" leave-to-class="-translate-x-full">
        <nav v-if="isOpen"
            class="w-[65%] max-w-80 h-full flex flex-col justify-between fixed top-0 left-0 bg-primary z-50 transform py-6 px-3">
            <div class="flex items-center justify-between text-light px-3">
                <p class="text-xl font-semibold">Tzadik</p>
                <button @click="$emit('close')" class="p-2 rounded-md hover:bg-gray-100 transition-colors"
                    aria-label="Cerrar menú">
                    <Icon name="tabler:x" class="w-6 h-6" />
                </button>
            </div>

            <button @click="handleSignOut" :disabled="loggingOut" class="flex items-center gap-3 text-light font-light p-3">
                <Icon v-if="!loggingOut" name="tabler:logout" class="w-5 h-5" />
                <Icon v-else name="tabler:loader-2" class="w-5 h-5 animate-spin" />
                <span class="font-medium">
                    {{ loggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión' }}
                </span>
            </button>
        </nav>
    </Transition>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES'

const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['close'])

// Estado para logout
const loggingOut = ref(false)
const router = useRouter()

// Función para cerrar sesión
async function handleSignOut() {
    if (loggingOut.value) return;

    loggingOut.value = true;

    try {
        const supabase = useSupabaseClient();
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        localStorage.removeItem('lastLoginEmail');

        // Cerrar drawer antes de redirigir
        emit('close');

        router.push(ROUTE_NAMES.LOGIN);
    } catch (error) {
        console.error('Error al cerrar sesión:', error.message);
    } finally {
        loggingOut.value = false;
    }
}

// Cerrar drawer al presionar Escape
onMounted(() => {
    const handleEscapeKey = (e) => {
        if (e.key === 'Escape' && props.isOpen) {
            emit('close')
        }
    }

    document.addEventListener('keydown', handleEscapeKey)

    onUnmounted(() => {
        document.removeEventListener('keydown', handleEscapeKey)
    })
})

// Prevenir scroll del body cuando el drawer está abierto
watch(() => props.isOpen, (isOpen) => {
    if (import.meta.client) {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
    }
})

onUnmounted(() => {
    if (import.meta.client) {
        document.body.style.overflow = ''
    }
})
</script>