import { ref, onUnmounted } from 'vue';

export function useDebounceFn(fn, delay = 300) {
    const timeoutRef = ref(null);

    const debouncedFn = (...args) => {
        clearTimeout(timeoutRef.value);
        timeoutRef.value = setTimeout(() => {
            fn(...args);
        }, delay);
    };

    onUnmounted(() => {
        clearTimeout(timeoutRef.value);
    });

    return debouncedFn;
}