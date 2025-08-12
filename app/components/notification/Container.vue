<template>
    <div class="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        <NotificationToast
            v-for="notification in notifications"
            :key="notification.id"
            :type="notification.type"
            :title="notification.title"
            :message="notification.message"
            :duration="notification.duration"
            :persistent="notification.persistent"
            @close="removeNotification(notification.id)"
        />
    </div>
</template>

<script setup>
const { notifications, removeNotification } = useNotification()
</script>