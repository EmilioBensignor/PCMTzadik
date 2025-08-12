<template>
    <div class="min-h-screen flex items-center justify-center">
        <div class="text-center">
            <Icon name="tabler:loader-2" class="animate-spin h-8 w-8 mx-auto mb-4" />
            <p>Procesando autenticación...</p>
        </div>
    </div>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'

definePageMeta({
    layout: "auth",
});

const client = useSupabaseClient()
const router = useRouter()
const route = useRoute()

onMounted(async () => {
    try {
        const { data, error } = await client.auth.getSession()

        if (error) {
            console.error('Error en callback:', error)
            await router.push(ROUTE_NAMES.LOGIN)
            return
        }

        if (data.session) {
            const type = route.query.type
            const next = route.query.next

            if (type === 'recovery') {
                await router.push(ROUTE_NAMES.RESET_PASSWORD)
                return
            }

            if (next) {
                await router.push(next)
                return
            }

            await router.push(ROUTE_NAMES.HOME)
        } else {
            await router.push(ROUTE_NAMES.LOGIN)
        }

    } catch (error) {
        console.error('Error en callback:', error)
        await router.push(ROUTE_NAMES.LOGIN)
    }
})
</script>