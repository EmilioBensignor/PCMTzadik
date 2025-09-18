<template>
    <div class="w-full flex flex-col gap-2" data-textarea>
        <FormLabel :id="id" :required="required" v-if="label">{{ label }}</FormLabel>
        <textarea ref="textareaElement" :id="inputId" :placeholder="placeholder" :value="modelValue"
            :required="required" :rows="rows" @input="handleInput" @blur="handleBlur" @focus="handleFocus"
            @select="handleSelection"
            class="min-h-[120px] bg-light border border-dark rounded-[5px] outline-none lg:text-xl font-light text-dark lg:placeholder:text-xl placeholder:font-light placeholder:text-gray-dark py-3 px-[0.875rem] resize-none" />
        <div class="flex gap-2" v-if="showFormatting">
            <button type="button" @click="applyFormat('bold')"
                class="w-12 h-12 rounded border bg-light border-dark text-xl hover:bg-gray-100 transition-colors duration-200"
                title="Negrita">
                <strong>B</strong>
            </button>
            <button type="button" @click="applyFormat('italic')"
                class="w-12 h-12 rounded border bg-light border-dark text-xl hover:bg-gray-100 transition-colors duration-200"
                title="Itálica">
                <em>I</em>
            </button>
            <button type="button" @click="applyFormat('underline')"
                class="w-12 h-12 rounded border bg-light border-dark text-xl hover:bg-gray-100 transition-colors duration-200"
                title="Subrayado">
                <u>U</u>
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
        default: ''
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
    rows: {
        type: Number,
        default: 4
    },
    showFormatting: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const textareaElement = ref(null)
const showError = ref(false)
const selectionStart = ref(0)
const selectionEnd = ref(0)

const inputId = computed(() => props.id)

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

const handleSelection = () => {
    if (textareaElement.value) {
        selectionStart.value = textareaElement.value.selectionStart
        selectionEnd.value = textareaElement.value.selectionEnd
    }
}

const applyFormat = (format) => {
    if (!textareaElement.value || selectionStart.value === selectionEnd.value) {
        return
    }

    const beforeText = props.modelValue.substring(0, selectionStart.value)
    const afterText = props.modelValue.substring(selectionEnd.value)
    const selectedText = props.modelValue.substring(selectionStart.value, selectionEnd.value)

    const tags = {
        bold: { open: '<b>', close: '</b>' },
        italic: { open: '<i>', close: '</i>' },
        underline: { open: '<u>', close: '</u>' }
    }

    const tag = tags[format]
    const formattedText = `${tag.open}${selectedText}${tag.close}`
    const newValue = beforeText + formattedText + afterText

    emit('update:modelValue', newValue)

    nextTick(() => {
        if (textareaElement.value) {
            const newSelectionStart = selectionStart.value
            const newSelectionEnd = newSelectionStart + formattedText.length
            textareaElement.value.setSelectionRange(newSelectionStart, newSelectionEnd)
            textareaElement.value.focus()
        }
    })
}

watchEffect(() => {
    if (props.error) {
        showError.value = true
    }
})

const focus = () => {
    if (textareaElement.value) {
        textareaElement.value.focus()
    }
}

defineExpose({
    focus
})
</script>
