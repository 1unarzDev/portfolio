<template>
  <div
    ref="blobWrap"
    class="fixed bottom-4 right-4"
    @mouseenter="handleHover(true); hoveringNav = true"
    @mouseleave="handleHover(false); hoveringNav = false"
    @click="toggle"
  >
    <Blob
      :size="size"
      :radius="20"
      :amplitude="blobState.amplitude"
      :waves="blobState.waves"
      :speed="blobState.speed"
      :color="blobColor"
      :stroke-color="blobOuterColor"
      :glow-color="blobOuterColor"
      glow
      :glow-size="15"
      :scale-y="breatheScale"
    />
    <canvas
      ref="eyeCanvas"
      :width="size"
      :height="size"
      class="absolute top-0 left-0 pointer-events-none"
    />
    <div
      ref="fxContainer"
      :width="size"
      :height="size"
      class="absolute top-0 left-0 pointer-events-none overflow-visible"
    />
  </div>
</template>

<script setup lang="ts">
const { $gsap } = useNuxtApp()
const { handleHover } = useCursor()
const { isDark, toggle } = useColorMode()

const blobState = reactive({
  speed: 3,
  amplitude: 1.2,
  waves: 5,
})

const themes = {
  light: {
    eye: { r: 60, g: 50, b: 80 },
    blob: { r: 255, g: 208, b: 72 },
    eyeOpen: 1,
    speed: 3,
    amplitude: 1.2,
    waves: 5,
  },
  dark: {
    eye: { r: 100, g: 100, b: 100 },
    blob: { r: 255, g: 255, b: 255 },
    eyeOpen: 0,
    speed: 1.5,
    amplitude: 0.8,
    waves: 3,
  },
} as const

const theme = computed(() =>
  isDark.value ? themes.dark : themes.light
)

const eyeColor = reactive({ ...theme.value.eye })
const blob = reactive({ ...theme.value.blob })

const blobColor = computed(() =>
  `rgba(${blob.r},${blob.g},${blob.b},0.8)`
)

const blobOuterColor = computed(() =>
  `rgba(${blob.r - 10},${blob.g - 25},${blob.b - 25},0.95)`
)

const blobWrap = ref<HTMLElement | null>(null)
const eyeCanvas = ref<HTMLCanvasElement | null>(null)
const fxContainer = ref<HTMLElement | null>(null)
let eyeCtx: CanvasRenderingContext2D | null = null

const size = 50
const mouse = { x: 0, y: 0 }
const look = { x: 0, y: 0 }
const breatheScale = ref(1)
const eyeOpen = ref(theme.value.eyeOpen)
const hoveringNav = ref(false)
let t = 0
let lastZ = 0
let lastRay = 0

function onMouseMove(e: MouseEvent) {
  mouse.x = e.clientX
  mouse.y = e.clientY

  $gsap.to(look, {
    x: mouse.x,
    y: mouse.y,
    duration: 1,
    ease: 'power1.out',
    overwrite: true
  })
}

function drawEyes() {
  if (!eyeCtx || !eyeCanvas.value) return
  const cx = size / 2, cy = size / 2

  eyeCtx.clearRect(0, 0, size, size)

  const rect = eyeCanvas.value.getBoundingClientRect()
  const blobCx = rect.left + size / 2
  const blobCy = rect.top + size / 2

  const angle = Math.atan2(look.y - blobCy, look.x - blobCx)

  const eyeOffsetX = 5
  const eyeOffsetY = -1
  const pupilTravel = 1.8

  const eyes = [
    { ex: cx - eyeOffsetX, ey: cy + eyeOffsetY },
    { ex: cx + eyeOffsetX, ey: cy + eyeOffsetY },
  ]

  eyes.forEach(({ ex, ey }) => {
    eyeCtx!.beginPath()
    const eyeWidth = isDark.value ? 4 : 4.5
    const eyeHeight = 4.5 * (eyeOpen.value * 0.55 + 0.45)
    
    eyeCtx!.beginPath()
    eyeCtx!.ellipse(
      ex,
      ey,
      eyeWidth,
      eyeHeight,
      0,
      0,
      Math.PI * 2
    )
    eyeCtx!.fillStyle = `rgb(${eyeColor.r}, ${eyeColor.g}, ${eyeColor.b})`
    eyeCtx!.fill()

    const px = ex + Math.cos(angle) * pupilTravel
    const py = ey + Math.sin(angle) * pupilTravel
    
    eyeCtx!.beginPath()
    eyeCtx!.arc(px, py, 2.2, 0, Math.PI * 2)
    eyeCtx!.fillStyle = `rgba(255, 255, 255, ${0.75 * eyeOpen.value})`
    eyeCtx!.fill()
    
    eyeCtx!.beginPath()
    eyeCtx!.arc(px - 0.7, py - 0.7, 0.7, 0, Math.PI * 2)
    eyeCtx!.fillStyle = `rgba(255, 255, 255, ${0.5 * eyeOpen.value})`
    eyeCtx!.fill()
  })
}

function spawnZ() {
  if (!fxContainer.value) return
  const now = Date.now()
  if (now - lastZ < 1800) return
  lastZ = now

  const z = document.createElement('span')
  const fontSize = 10 + Math.random() * 5
  const plusMinus =  Math.random() < 0.5 ? -1 : 1
  const startX = size / 2 + Math.random() * 20 * plusMinus
  const drift = Math.random() * 10 * plusMinus
  z.textContent = 'z'
  Object.assign(z.style, {
    position: 'absolute',
    left: startX + 'px',
    top: '0px',
    fontSize: fontSize + 'px',
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
    pointerEvents: 'none',
    opacity: '0',
  })
  fxContainer.value.appendChild(z)

  $gsap.fromTo(z,
    { opacity: 0, y: 0, x: 0, scale: 0.7 },
    {
      opacity: 0.9,
      y: -20,
      x: drift,
      scale: 1.1,
      duration: 1.2,
      ease: 'power1.out',
      onComplete: () => {
        $gsap.to(z, {
          opacity: 0,
          duration: 0.6,
          onComplete: () => z.remove()
        })
      }
    }
  )
}

function spawnRay() {
  if (!fxContainer.value) return
  const now = Date.now()
  if (now - lastRay < 40) return
  lastRay = now

  const ray = document.createElement('span')

  const angle = Math.random() * Math.PI * 2
  const distance = 12 + Math.random() * 12
  const length = 5 + Math.random() * 8

  const startX = size / 2 + Math.cos(angle) * 9
  const startY = size / 2 + Math.sin(angle) * 9

  Object.assign(ray.style, {
    position: 'absolute',
    left: `${startX}px`,
    top: `${startY}px`,
    width: `${length}px`,
    height: '2px',
    borderRadius: '999px',
    background: 'rgba(245, 200, 100, 0.9)',
    transformOrigin: 'left center',
    transform: `rotate(${angle}rad)`,
    opacity: '0',
    pointerEvents: 'none',
  })

  fxContainer.value.appendChild(ray)

  $gsap.fromTo(
    ray,
    {
      opacity: 0,
      scaleX: 0.2,
    },
    {
      opacity: 0.8,
      scaleX: 1,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      duration: 0.5 + Math.random() * 0.4,
      ease: 'power2.out',
      onComplete: () => {
        $gsap.to(ray, {
          opacity: 0,
          duration: 0.4,
          onComplete: () => ray.remove(),
        })
      },
    }
  )
}

function clearFx() {
  if (!fxContainer.value) return
  fxContainer.value.innerHTML = ''
}

function tick() {
  t += 0.008 * (isDark.value ? 1.5 : 3)
  breatheScale.value = isDark.value ? 1 + Math.sin(t * 0.5) * 0.07 : 1

  if (isDark.value) {
    spawnZ()
  } else {
    spawnRay()
  }
  drawEyes()
}

watch(isDark, () => {
  const target = theme.value

  $gsap.to(eyeOpen, {
    value: target.eyeOpen,
    duration: 0.6,
    ease: "power2.inOut",
  })

  $gsap.to(eyeColor, {
    ...target.eye,
    duration: 0.8,
    ease: "power2.inOut",
  })

  $gsap.to(blob, {
    ...target.blob,
    duration: 0.8,
    ease: "power2.inOut",
  })

  $gsap.to(blobState, {
    amplitude: target.amplitude,
    waves: target.waves,
    speed: target.speed,
    duration: 0.8,
    ease: "power2.inOut",
  })
})

watch(hoveringNav, (value) => {
  if(isDark.value) {
    $gsap.to(eyeOpen, {
      value,
      duration: 1,
      ease: "power2.out"
    })
  }
})

onMounted(() => {
  mouse.x = window.innerWidth / 2
  mouse.y = window.innerHeight / 2

  eyeCtx = eyeCanvas.value!.getContext('2d')
  window.addEventListener('mousemove', onMouseMove)
  $gsap.ticker.add(tick)
})

onUnmounted(() => {
  $gsap.ticker.remove(tick)
  window.removeEventListener('mousemove', onMouseMove)
})
</script>