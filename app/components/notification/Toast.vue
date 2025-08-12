<template>
    <Teleport to="body">
        <Transition name="toast" appear>
            <div v-if="visible" :class="toastClasses"
                class="fixed top-4 right-4 z-50 max-w-sm bg-white border-l-4 rounded-lg shadow-lg p-4 flex items-start gap-3">
                <Icon :name="iconName" :class="iconClasses" class="text-xl mt-0.5 flex-shrink-0" />
                <div class="flex-1 min-w-0">
                    <p v-if="title" class="font-medium text-sm text-gray-900 mb-1">{{ title }}</p>
                    <p class="text-sm text-gray-700">{{ message }}</p>
                </div>
                <button @click="close" class="text-gray-400 hover:text-gray-600 flex-shrink-0">
                    <Icon name="tabler:x" class="text-lg" />
                </button>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
const props = defineProps({
    type: {
        type: String,
        default: 'info',
        validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
    },
    title: {
        type: String,
        default: ''
    },
    message: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        default: 5000
    },
    persistent: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['close'])

const visible = ref(true)
const timeoutId = ref(null)

const toastClasses = computed(() => {
    const classes = {
        success: 'border-green-500',
        error: 'border-red-500',
        warning: 'border-yellow-500',
        info: 'border-blue-500'
    }
    return classes[props.type] || classes.info
})

const iconName = computed(() => {
    const icons = {
        success: 'tabler:circle-check',
        error: 'tabler:alert-circle',
        warning: 'tabler:alert-triangle',
        info: 'tabler:info-circle'
    }
    return icons[props.type] || icons.info
})

const iconClasses = computed(() => {
    const classes = {
        success: 'text-green-500',
        error: 'text-red-500',
        warning: 'text-yellow-500',
        info: 'text-blue-500'
    }
    return classes[props.type] || classes.info
})

const close = () => {
    visible.value = false
    if (timeoutId.value) {
        clearTimeout(timeoutId.value)
    }
    emit('close')
}

const startTimer = () => {
    if (!props.persistent && props.duration > 0) {
        timeoutId.value = setTimeout(() => {
            close()
        }, props.duration)
    }
}

onMounted(() => {
    startTimer()
})

onUnmounted(() => {
    if (timeoutId.value) {
        clearTimeout(timeoutId.value)
    }
})
</script>

<style scoped>
.toast-enter-active {
    transition: all 0.3s ease-out;
}

.toast-leave-active {
    transition: all 0.3s ease-in;
}

.toast-enter-from {
    transform: translateX(100%);
    opacity: 0;
}

.toast-leave-to {
    transform: translateX(100%);
    opacity: 0;
}
</style>