<template>
    <div v-if="column.type === 'image'" class="flex items-center justify-center">
        <img :src="value" :alt="column.label" class="w-16 h-16 object-cover rounded-lg" />
    </div>
    <div v-else-if="(column.type === 'text' || column.type === 'textarea') && column.key !== 'subgrupos'"
        class="w-full max-w-[18.75rem] break-words">
        <span>{{ value || '-' }}</span>
    </div>
    <span v-else>{{ formatValue(value, column) }}</span>
</template>

<script setup>
const props = defineProps({
    value: {
        type: [String, Number, Boolean, Date, Object],
        default: null
    },
    column: {
        type: Object,
        required: true
    },
    relatedData: {
        type: Object,
        default: () => ({})
    }
})

const formatValue = (value, column) => {
    if (value === null || value === undefined) return '-'

    if (column.key === 'subgrupos' && Array.isArray(value)) {
        const subgruposNames = value
            .filter(subgrupo => subgrupo && typeof subgrupo === 'object' && subgrupo.nombre)
            .map(subgrupo => subgrupo.nombre)
        return subgruposNames.length > 0 ? subgruposNames.join(', ') : '-'
    }

    if (column.type === 'checkbox-multiple' && column.relatedTable && props.relatedData[column.relatedTable]) {
        if (typeof value === 'string' && value) {
            const ids = value.split(',').map(id => id.trim()).filter(Boolean)
            const names = ids.map(id => {
                const relatedItem = props.relatedData[column.relatedTable].find(item => item.id.toString() === id)
                return relatedItem ? (relatedItem.nombre || relatedItem.descripcion || relatedItem.titulo || relatedItem.label || relatedItem.h1 || relatedItem.nombreprod || id) : id
            })
            return names.join(', ')
        } else if (Array.isArray(value)) {
            const names = value.map(id => {
                const relatedItem = props.relatedData[column.relatedTable].find(item => item.id.toString() === id.toString())
                return relatedItem ? (relatedItem.nombre || relatedItem.descripcion || relatedItem.titulo || relatedItem.label || relatedItem.h1 || relatedItem.nombreprod || id) : id
            })
            return names.join(', ')
        }
        return value
    }

    if (column.type === 'select' && column.relatedTable && props.relatedData[column.relatedTable]) {
        const relatedItem = props.relatedData[column.relatedTable].find(item => item.id === value)
        if (relatedItem) {
            return relatedItem.nombre || relatedItem.descripcion || relatedItem.titulo || relatedItem.label || relatedItem.h1 || relatedItem.nombreprod || value
        }
        return value
    }

    switch (column.type) {
        case 'currency':
            return '$' + new Intl.NumberFormat('es-AR', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(value)

        case 'date':
            if (!value) return '-'
            return value.toString().split('T')[0].split('-').reverse().join('/')

        case 'datetime':
            if (!value) return '-'
            const [datePart, timePart] = value.toString().split('T')
            const formattedDate = datePart.split('-').reverse().join('/')
            const formattedTime = timePart ? timePart.substring(0, 5) : ''
            return timePart ? `${formattedDate} ${formattedTime}` : formattedDate

        case 'number':
            return new Intl.NumberFormat('es-AR').format(value)

        case 'boolean':
            return value ? 'Sí' : 'No'

        case 'image':
            return value

        case 'text':
        case 'textarea':
            if (column.key === 'subgrupos' && Array.isArray(value)) {
                const subgruposNames = value
                    .filter(subgrupo => subgrupo && typeof subgrupo === 'object' && subgrupo.nombre)
                    .map(subgrupo => subgrupo.nombre)
                return subgruposNames.length > 0 ? subgruposNames.join(', ') : '-'
            }
            return value || '-'

        default:
            return value
    }
}
</script>