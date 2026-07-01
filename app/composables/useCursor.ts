const x = ref(0)
const y = ref(0)
const isHovering = ref(false)

export const useCursor = () => {
    const updatePosition = (e: MouseEvent) => {
        x.value = e.clientX
        y.value = e.clientY
    }

    onMounted(() => {
        window.addEventListener('mousemove', updatePosition)
    })

    onUnmounted(() => {
        window.removeEventListener('mousemove', updatePosition)
    })

    const handleHover = (hovering: boolean) => {
        isHovering.value = hovering
    }

    return { x, y, isHovering, handleHover }
}