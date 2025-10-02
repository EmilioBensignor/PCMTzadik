<template>
    <div class="w-full max-w-[100vw] overflow-auto">
        <table class="w-full mx-auto">
            <thead>
                <tr>
                    <th v-for="column in columns" :key="column.key"
                        class="text-center text-dark whitespace-nowrap font-medium p-3">
                        {{ column.label }}
                    </th>
                    <th v-if="showActions" class="text-center text-dark whitespace-nowrap font-medium p-3">
                        Acciones
                    </th>
                </tr>
            </thead>

            <tbody>
                <tr v-for="(item, index) in data" :key="getRowKey(item, index)"
                    class="odd:bg-gray-light even:bg-gray-mid border-b border-gray-dark last:border-none">
                    <td v-for="column in columns" :key="column.key"
                        class="border-r border-gray-dark text-dark font-light p-3 text-center"
                        style="max-height: 8rem; height: auto; vertical-align: middle;">
                        <div class="max-h-32 overflow-y-auto flex items-center justify-center" style="max-height: 8rem;">
                            <slot :name="`cell-${column.key}`" :item="item" :value="getNestedValue(item, column.key)"
                                :column="column" :index="index">
                                <TableCellRenderer :value="getNestedValue(item, column.key)" :column="column"
                                    :related-data="relatedData" />
                            </slot>
                        </div>
                    </td>

                    <td v-if="showActions" class="font-light whitespace-nowrap p-3">
                        <slot name="row-actions" :item="item" :index="index">
                            <div class="flex justify-center items-center gap-2">
                                <button type="button" @click.prevent.stop="$emit('edit', item, index)" title="Editar">
                                    <Icon name="tabler:edit" class="w-6 h-6 text-terciary" />
                                </button>
                                <button v-if="showDelete" type="button" @click.prevent.stop="openDeleteModal(item, index)"
                                    title="Eliminar">
                                    <Icon name="tabler:trash" class="w-6 h-6 text-primary" />
                                </button>
                            </div>
                        </slot>
                    </td>
                </tr>
            </tbody>
        </table>

        <div v-if="!data || data.length === 0" class="py-12 text-center text-gray-500">
            <slot name="empty">
                <p>{{ emptyStateText }}</p>
            </slot>
        </div>

        <ModalDelete :is-open="deleteModal.isOpen" :item-name="deleteModal.itemName" :table-name="deleteModal.tableName"
            @cancel="closeDeleteModal" @confirm="confirmDelete" />
    </div>
</template>


<script setup>
const props = defineProps({
    data: {
        type: Array,
        default: () => []
    },
    columns: {
        type: Array,
        required: true
    },
    relatedData: {
        type: Object,
        default: () => ({})
    },
    showActions: {
        type: Boolean,
        default: true
    },
    showDelete: {
        type: Boolean,
        default: true
    },
    emptyStateText: {
        type: String,
        default: 'No hay datos disponibles'
    },
    rowKey: {
        type: String,
        default: 'id'
    },
    tableName: {
        type: String,
        default: 'tabla'
    }
})

const emit = defineEmits(['edit', 'delete'])

const deleteModal = ref({
    isOpen: false,
    item: null,
    index: null,
    itemName: '',
    tableName: ''
})

const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj)
}

const getRowKey = (item, index) => {
    return getNestedValue(item, props.rowKey) || index
}

const openDeleteModal = (item, index) => {
    let itemName = 'este elemento'

    if (item.nombreComercio) itemName = item.nombreComercio
    else if (item.nombre) itemName = item.nombre
    else if (item.titulo) itemName = item.titulo
    else if (item.descripcion) itemName = item.descripcion
    else if (item.name) itemName = item.name
    else if (item.h1) itemName = item.h1
    else if (item.nombreprod) itemName = item.nombreprod
    else if (item.url) itemName = item.url
    else if (item.id) itemName = `ID: ${item.id}`

    deleteModal.value = {
        isOpen: true,
        item: item,
        index: index,
        itemName: itemName,
        tableName: props.tableName
    }
}

const closeDeleteModal = () => {
    deleteModal.value = {
        isOpen: false,
        item: null,
        index: null,
        itemName: '',
        tableName: ''
    }
}

const confirmDelete = () => {
    emit('delete', deleteModal.value.item, deleteModal.value.index)
    closeDeleteModal()
}
</script>