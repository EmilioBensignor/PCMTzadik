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
        // Verificar parámetros de URL primero
        const type = route.query.type || route.hash.includes('type=recovery')
        const isRecovery = type === 'recovery' || route.hash.includes('type=recovery')
        
        console.log('Callback params:', { 
            query: route.query, 
            hash: route.hash, 
            type, 
            isRecovery 
        })

        const { data, error } = await client.auth.getSession()

        if (error) {
            console.error('Error en callback:', error)
            await router.push(ROUTE_NAMES.LOGIN)
            return
        }

        if (data.session) {
            // Si es recovery, forzar ir a reset-password independientemente
            if (isRecovery) {
                console.log('Redirigiendo a reset-password')
                await router.push(ROUTE_NAMES.RESET_PASSWORD)
                return
            }

            const next = route.query.next
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