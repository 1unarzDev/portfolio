<template>
    <Teleport to="body">
        <div class="fixed top-0 left-0 z-9999 pointer-events-none translate-[-50%]" ref="blobEl">
            <div 
                class="w-5 h-5 rounded-full bg-slate-800 dark:bg-white opacity-0"
                ref="innerEl"
            ></div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
const { $gsap } = useNuxtApp()
const { x, y, isHovering } = useCursor()
const { isDark } = useColorMode()

const blobEl = ref<HTMLElement | null>(null)
const innerEl = ref<HTMLElement | null>(null)

onMounted(() => {
    const onFirstMove = () => {
        $gsap.set(blobEl.value, { x: x.value, y: y.value })
        $gsap.to(innerEl.value, { opacity: 1, duration: 0.3 })
        window.removeEventListener('mousemove', onFirstMove)
    }
    window.addEventListener('mousemove', onFirstMove)
    
    const spawnClick = (e: MouseEvent) => {
        if (!innerEl.value) return
        const w = innerEl.value.offsetWidth
        const h = innerEl.value.offsetHeight
        const ringColor = isDark.value ? 'white' : 'rgb(30, 20, 60)'
    
        ;[0, 0.08].forEach((delay) => {
            const ring = document.createElement('div')
            Object.assign(ring.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                width: `${w}px`,
                height: `${h}px`,
                borderRadius: '50%',
                border: `2px solid ${ringColor}`,
                pointerEvents: 'none',
                zIndex: '9998',
                transform: `translate(${e.clientX - w / 2}px, ${e.clientY - h / 2}px)`,
            })
            document.body.appendChild(ring)
    
            $gsap.to(ring, {
                scale: 4,
                opacity: 0,
                duration: 0.5,
                delay,
                ease: 'power3.out',
                onComplete: () => ring.remove(),
            })
        })
    }
    window.addEventListener('click', spawnClick)

    const spawnPulse = () => {
      if (!innerEl.value) return

      const { width, height, left, top } = innerEl.value.getBoundingClientRect()
      const ringColor = isDark.value ? 'white' : 'rgb(30, 20, 60)'

      const ring = document.createElement('div')

      Object.assign(ring.style, {
        position: 'fixed',
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: '50%',
        border: `1px solid ${ringColor}`,
        pointerEvents: 'none',
        zIndex: '9998',
        boxSizing: 'border-box',
        transformOrigin: 'center center',
      })

      document.body.appendChild(ring)

      $gsap.fromTo(
        ring,
        {
          scale: 1,
          opacity: 1,
        },
        {
          scale: 6,
          opacity: 0,
          duration: 1,
          ease: 'power1.out',
          onComplete: () => ring.remove(),
        }
      )
    }

    const isPressed = ref(false)
    const onMouseDown = () => { isPressed.value = true; lastPulseTime = Date.now() }
    const onMouseUp = () => { isPressed.value = false }
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)

    let lastTrailTime = 0
    let lastPulseTime = 0
    const ticker = () => {
        if (!blobEl.value || !innerEl.value) return
        const blobX = $gsap.getProperty(blobEl.value, 'x') as number
        const blobY = $gsap.getProperty(blobEl.value, 'y') as number
        const dx = x.value - blobX
        const dy = y.value - blobY
        const speed = Math.sqrt(dx * dx + dy * dy)
        const angle = Math.atan2(dy, dx) * (180 / Math.PI)
        const stretch = Math.min(speed * 0.005, 0.5)
        const pressScale = isPressed.value ? 0.7 : 1
        const scaleX = isHovering.value ? 1.7 * pressScale : (1 + stretch) * pressScale
        const scaleY = isHovering.value ? 1.7 * pressScale : (1 - stretch * 0.5) * pressScale
        const opacity = isHovering.value ? 0.7 : 1

        $gsap.to(innerEl.value, {
            scaleX,
            scaleY,
            rotation: speed > 1 ? angle : 0,
            opacity,
            duration: 0.15,
            overwrite: 'auto',
            ease: 'power2.out',
        })

        const now = Date.now()
        const spawnInterval = speed > 10 ? 30 : speed > 3 ? 60 : 120
        const pulseInterval = 900

        if (speed > 1 && now - lastTrailTime > spawnInterval) {
            lastTrailTime = now
            spawnTrail(blobX, blobY, speed, scaleX, scaleY, angle)
        }

        if (isPressed.value && now - lastPulseTime > pulseInterval) {
            lastPulseTime = now
            spawnPulse()
        }
    }

    const spawnTrail = (
        px: number,
        py: number,
        speed: number,
        scaleX: number,
        scaleY: number,
        angle: number
    ) => {
        if (!innerEl.value || isHovering.value) return
        const w = innerEl.value.offsetWidth
        const h = innerEl.value.offsetHeight
        const ghost = innerEl.value.cloneNode(true) as HTMLElement
        Object.assign(ghost.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            pointerEvents: 'none',
            zIndex: '9998',
            transform: `translate(${px - w / 2}px, ${py - h / 2}px) rotate(${angle}deg) scaleX(${scaleX}) scaleY(${scaleY})`,
            opacity: '0.6',
            willChange: 'opacity',
        })
        document.body.appendChild(ghost)

        const fadeDuration = Math.min(0.1 + speed * 0.02, 0.8)

        $gsap.to(ghost, {
            opacity: 0,
            duration: fadeDuration,
            ease: 'power2.out',
            onComplete: () => ghost.remove(),
        })
    }

    watchEffect(() => {
        if (!blobEl.value) return
        $gsap.to(blobEl.value, {
            x: x.value,
            y: y.value,
            duration: 0.4,
            overwrite: 'auto',
        })
    })

    $gsap.ticker.add(ticker)

    onUnmounted(() => {
        $gsap.ticker.remove(ticker)
        window.removeEventListener('mousemove', onFirstMove)
        window.removeEventListener('click', spawnClick)
        window.removeEventListener('mouseup', onMouseUp)
        window.removeEventListener('mousedown', onMouseDown)
        document.querySelectorAll('[data-trail]').forEach(el => el.remove())
    })
})
</script>