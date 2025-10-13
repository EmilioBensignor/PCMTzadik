<template>
    <DefaultSection>
        <div class="flex flex-col items-center gap-6">
            <HeadingH1>Editor Masivo de Productos</HeadingH1>
            <ButtonPrimary @click="guardarCambios" :disabled="!hayProductosModificados || guardando">
                {{ guardando ? 'Guardando...' : `Guardar Cambios (${productosModificados.size})` }}
            </ButtonPrimary>
        </div>

        <div class="w-full flex flex-col lg:flex-row gap-6">
            <FormTextField v-model="searchQuery" id="search" placeholder="Buscar productos..." class="w-full lg:w-1/2" />
            <FormSelect v-model="categoriaFiltro" :options="categoriaOptions" placeholder="Todas las categorías"
                class="w-full lg:w-1/2" />
        </div>

        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <div v-else class="w-full border border-gray-dark rounded-md overflow-hidden">
            <TableLayout :data="productosFiltrados" :columns="columns" :show-actions="false"
                empty-state-text="No se encontraron productos">
            <template #cell-titulo="{ item }">
                <div :class="{ 'bg-secondary/30': productosModificados.has(item.id) }" class="w-full flex flex-col items-start rounded p-1">
                    <p class="font-medium">{{ item.titulo }}</p>
                    <p class="text-sm text-gray-600">{{ item.descripcion_corta?.substring(0, 50) }}...</p>
                </div>
            </template>

            <template #cell-precio="{ item }">
                <input type="number" v-model.number="item.precio" @input="marcarModificado(item)"
                    :id="`precio-${item.id}`" :name="`precio-${item.id}`"
                    class="w-32 text-right px-2 py-1 border border-dark rounded-[5px] bg-light"
                    step="100" min="0" />
            </template>

            <template #cell-descuento="{ item }">
                <input type="number" v-model.number="item.descuento" @input="marcarModificado(item)"
                    :id="`descuento-${item.id}`" :name="`descuento-${item.id}`"
                    class="w-24 text-right px-2 py-1 border border-dark rounded-[5px] bg-light"
                    step="1" min="0" max="100" />
            </template>

            <template #cell-precio_final="{ item }">
                <span class="font-bold">{{ formatCurrency(calcularPrecioFinal(item)) }}</span>
            </template>
        </TableLayout>
        </div>

    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES'
const { categorias, fetchCategorias } = useCategorias()
const { productos, loading, fetchAllProductos } = useProductos()
const { success, error } = useNotification()

const searchQuery = ref('')
const categoriaFiltro = ref('')
const productosModificados = ref(new Set())
const productosOriginales = ref(new Map())
const guardando = ref(false)

const categoriaOptions = computed(() => {
    return [
        { value: '', label: 'Todas las categorías' },
        ...categorias.value.map(cat => ({
            value: cat.id,
            label: cat.nombre
        }))
    ]
})

const columns = [
    { key: 'titulo', label: 'Producto', type: 'text' },
    { key: 'categorias.nombre', label: 'Categoría', type: 'text' },
    { key: 'precio', label: 'Precio', type: 'currency' },
    { key: 'descuento', label: 'Descuento (%)', type: 'number' },
    { key: 'precio_final', label: 'Precio con Descuento', type: 'currency' }
]

onMounted(async () => {
    await fetchCategorias()
    await fetchAllProductos({ includeImages: false })

    productos.value.forEach(producto => {
        productosOriginales.value.set(producto.id, {
            precio: producto.precio,
            descuento: producto.descuento || 0
        })
    })
})

const productosFiltrados = computed(() => {
    let filtered = productos.value

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(p =>
            p.titulo?.toLowerCase().includes(query) ||
            p.descripcion_corta?.toLowerCase().includes(query)
        )
    }

    if (categoriaFiltro.value) {
        filtered = filtered.filter(p => p.categoria_id === categoriaFiltro.value)
    }

    return filtered
})

const hayProductosModificados = computed(() => productosModificados.value.size > 0)

const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(value || 0)
}

const marcarModificado = (producto) => {
    productosModificados.value.add(producto.id)
}

const calcularPrecioFinal = (producto) => {
    const precio = parseFloat(producto.precio) || 0
    if (!precio) return 0

    const descuento = parseFloat(producto.descuento) || 0
    if (descuento <= 0) return precio

    return Math.round(precio * (1 - descuento / 100))
}

const guardarCambios = async () => {
    if (!hayProductosModificados.value) return

    guardando.value = true
    const supabase = useSupabaseClient()

    try {
        const updates = []

        for (const productoId of productosModificados.value) {
            const producto = productos.value.find(p => p.id === productoId)
            if (producto) {
                const precio = parseFloat(producto.precio) || 0
                const descuento = parseFloat(producto.descuento) || 0
                const precio_descuento = calcularPrecioFinal(producto)

                updates.push({
                    id: producto.id,
                    precio: precio,
                    descuento: descuento > 0 ? descuento : null,
                    precio_descuento: descuento > 0 ? precio_descuento : precio
                })
            }
        }

        const updatePromises = updates.map(update =>
            supabase
                .from('productos')
                .update({
                    precio: update.precio,
                    descuento: update.descuento,
                    precio_descuento: update.precio_descuento
                })
                .eq('id', update.id)
        )

        await Promise.all(updatePromises)

        updates.forEach(update => {
            productosOriginales.value.set(update.id, {
                precio: update.precio,
                descuento: update.descuento
            })
        })

        productosModificados.value.clear()

        success(`${updates.length} productos actualizados correctamente`)

        await navigateTo(ROUTE_NAMES.HOME)

    } catch (err) {
        console.error('Error guardando cambios:', err)
        error('Error al guardar los cambios. Por favor intenta nuevamente.')
    } finally {
        guardando.value = false
    }
}
</script>