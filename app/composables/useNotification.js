import { ref, readonly } from 'vue'

// Global state - shared across all instances
const notifications = ref([])

export const useNotification = () => {

    const addNotification = (notification) => {
        const id = Date.now() + Math.random()
        const newNotification = {
            id,
            type: 'info',
            duration: 5000,
            persistent: false,
            ...notification
        }
        
        notifications.value.push(newNotification)
        return id
    }

    const removeNotification = (id) => {
        const index = notifications.value.findIndex(n => n.id === id)
        if (index > -1) {
            notifications.value.splice(index, 1)
        }
    }

    const clearAll = () => {
        notifications.value = []
    }

    const success = (message, options = {}) => {
        return addNotification({
            type: 'success',
            message,
            ...options
        })
    }

    const error = (message, options = {}) => {
        return addNotification({
            type: 'error',
            message,
            duration: 7000,
            ...options
        })
    }

    const warning = (message, options = {}) => {
        return addNotification({
            type: 'warning',
            message,
            duration: 6000,
            ...options
        })
    }

    const info = (message, options = {}) => {
        return addNotification({
            type: 'info',
            message,
            ...options
        })
    }

    return {
        notifications: readonly(notifications),
        addNotification,
        removeNotification,
        clearAll,
        success,
        error,
        warning,
        info
    }
}