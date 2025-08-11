import { ref, reactive, computed } from 'vue'

export function useDynamicForm(schema = null) {
    const formData = reactive({})
    const currentSchema = ref(schema)
    const errors = reactive({})
    const selectedOption = ref('')

    const schemaFields = computed(() => {
        if (!currentSchema.value) return []

        if (currentSchema.value.options && selectedOption.value) {
            const option = currentSchema.value.options.find(opt =>
                opt[currentSchema.value.optionKey] === selectedOption.value
            )
            return option ? option.columns || option.fields || [] : []
        }

        return currentSchema.value.fields || currentSchema.value.columns || []
    })

    const updateSchema = (newSchema) => {
        currentSchema.value = newSchema
        resetForm()
    }

    const selectOption = (optionValue) => {
        selectedOption.value = optionValue
        initializeForm()
    }

    const initializeForm = () => {
        Object.keys(formData).forEach(key => delete formData[key])
        Object.keys(errors).forEach(key => delete errors[key])

        schemaFields.value.forEach(field => {
            const fieldKey = normalizeFieldKey(field.label || field.name || field.key)

            switch (field.type) {
                case 'text':
                case 'textarea':
                case 'email':
                case 'password':
                case 'iframe':
                    formData[fieldKey] = ''
                    break
                case 'number':
                case 'currency':
                    formData[fieldKey] = null
                    break
                case 'image':
                case 'file':
                    formData[fieldKey] = ''
                    break
                case 'checkbox':
                case 'switch':
                    formData[fieldKey] = false
                    break
                case 'select':
                    formData[fieldKey] = field.multiple ? [] : ''
                    break
                case 'date':
                    formData[fieldKey] = null
                    break
                default:
                    formData[fieldKey] = ''
            }
        })
    }

    const resetForm = () => {
        Object.keys(formData).forEach(key => delete formData[key])
        Object.keys(errors).forEach(key => delete errors[key])
        selectedOption.value = ''
    }

    const normalizeFieldKey = (label) => {
        return label.toLowerCase()
            .replace(/\s+/g, '')
            .replace(/[áàäâ]/g, 'a')
            .replace(/[éèëê]/g, 'e')
            .replace(/[íìïî]/g, 'i')
            .replace(/[óòöô]/g, 'o')
            .replace(/[úùüû]/g, 'u')
            .replace(/[ñ]/g, 'n')
            .replace(/[^a-zA-Z0-9]/g, '')
    }

    const validateField = (fieldConfig, value) => {
        const fieldKey = normalizeFieldKey(fieldConfig.label || fieldConfig.name || fieldConfig.key)

        delete errors[fieldKey]

        if (fieldConfig.required) {
            if (!value || value.toString().trim() === '') {
                errors[fieldKey] = `${fieldConfig.label} es requerido`
                return false
            }
        }

        if (value && value.toString().trim() !== '') {
            switch (fieldConfig.type) {
                case 'number':
                case 'currency':
                    if (isNaN(value) || value < 0) {
                        errors[fieldKey] = `${fieldConfig.label} debe ser un número válido mayor o igual a 0`
                        return false
                    }
                    break
                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                    if (!emailRegex.test(value)) {
                        errors[fieldKey] = `${fieldConfig.label} debe ser un email válido`
                        return false
                    }
                    break
                case 'iframe':
                    if (value && !value.match(/^https?:\/\/.+/)) {
                        errors[fieldKey] = `${fieldConfig.label} debe ser una URL válida`
                        return false
                    }
                    break
                case 'password':
                    if (fieldConfig.minLength && value.length < fieldConfig.minLength) {
                        errors[fieldKey] = `${fieldConfig.label} debe tener al menos ${fieldConfig.minLength} caracteres`
                        return false
                    }
                    break
            }

            if (fieldConfig.validate && typeof fieldConfig.validate === 'function') {
                const customValidation = fieldConfig.validate(value)
                if (customValidation !== true) {
                    errors[fieldKey] = customValidation
                    return false
                }
            }
        }

        return true
    }

    const validateForm = () => {
        let isValid = true

        schemaFields.value.forEach(field => {
            const fieldKey = normalizeFieldKey(field.label || field.name || field.key)
            if (!validateField(field, formData[fieldKey])) {
                isValid = false
            }
        })

        return isValid
    }

    const getFieldComponent = (fieldType) => {
        const componentMap = {
            'text': 'TextField',
            'textarea': 'Textarea',
            'number': 'TextField',
            'currency': 'TextField',
            'email': 'EmailField',
            'password': 'PasswordField',
            'image': 'MultiImageField',
            'file': 'FileField',
            'iframe': 'TextField',
            'checkbox': 'CheckboxField',
            'switch': 'Switch',
            'select': 'Select',
            'date': 'DateField'
        }

        return componentMap[fieldType] || 'TextField'
    }

    const formatFormData = () => {
        const formatted = { ...formData }

        if (selectedOption.value && currentSchema.value?.optionKey) {
            formatted[currentSchema.value.optionKey] = selectedOption.value
        }

        schemaFields.value.forEach(field => {
            const fieldKey = normalizeFieldKey(field.label || field.name || field.key)

            if (fieldKey in formatted) {
                switch (field.type) {
                    case 'currency':
                    case 'number':
                        formatted[fieldKey] = formatted[fieldKey] ? Number(formatted[fieldKey]) : null
                        break
                    case 'checkbox':
                    case 'switch':
                        formatted[fieldKey] = Boolean(formatted[fieldKey])
                        break
                    case 'date':
                        if (formatted[fieldKey]) {
                            formatted[fieldKey] = new Date(formatted[fieldKey])
                        }
                        break
                }
            }
        })

        return formatted
    }

    const loadData = (data) => {
        Object.keys(data).forEach(key => {
            if (key in formData) {
                formData[key] = data[key]
            }
        })
    }

    const columnChunks = computed(() => {
        const fields = schemaFields.value
        const chunks = []
        let currentChunk = []

        fields.forEach(field => {
            const fieldWithKey = {
                key: normalizeFieldKey(field.label || field.name || field.key),
                ...field
            }

            if (field.type === 'textarea') {
                if (currentChunk.length > 0) {
                    chunks.push(currentChunk)
                    currentChunk = []
                }
                chunks.push([fieldWithKey])
            } else {
                currentChunk.push(fieldWithKey)
                if (currentChunk.length === 2) {
                    chunks.push(currentChunk)
                    currentChunk = []
                }
            }
        })

        if (currentChunk.length > 0) {
            chunks.push(currentChunk)
        }

        return chunks
    })

    const selectOptions = ref({})
    const loadingOptions = ref({})

    return {
        formData,
        currentSchema,
        schemaFields,
        selectedOption,
        errors,
        columnChunks,
        selectOptions,
        loadingOptions,
        updateSchema,
        selectOption,
        initializeForm,
        resetForm,
        validateField,
        validateForm,
        getFieldComponent,
        formatFormData,
        loadData,
        normalizeFieldKey
    }
}