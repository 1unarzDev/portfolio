<template>
  <canvas ref="canvas" :width="size" :height="size" :style="{filter: glow ? `drop-shadow(0 0 ${glowSize}px ${glowColor})` : 'none'}"/>
</template>

<script setup>
const { $gsap } = useNuxtApp()

const props = defineProps({
  size: { type: Number },
  radius: { type: Number },
  amplitude: { type: Number },
  waves: { type: Number },
  speed: { type: Number },
  color: { type: String },
  strokeColor: { type: String },
  glow: { type: Boolean, default: false },
  glowColor: { type: String, default: 'rgba(255, 255, 255, 0.4)' },
  glowSize: { type: Number, default: 6 },
  scaleY: { type: Number, default: 1 },
})

const canvas = ref(null)
const points = 64
let ctx, t = 0

function drawBlob() {
  const { size, radius, amplitude, waves, color, strokeColor, scaleY } = props
  const cx = size / 2, cy = size / 2

  ctx.clearRect(0, 0, size, size)
  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(1, scaleY)
  ctx.translate(-cx, -cy)

  ctx.beginPath()
  
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2
    const ripple =
      Math.sin(angle * waves + t) * amplitude +
      Math.sin(angle * (waves + 1) + t * 0.7) * (amplitude * 0.4)
    const r = radius + ripple
    const x = cx + Math.cos(angle) * r
    const y = cy + Math.sin(angle) * r
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  }

  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
  ctx.strokeStyle = strokeColor
  ctx.lineWidth = 1.5
  ctx.stroke()
  
  ctx.restore()
}

function tick() {
  t += 0.008 * props.speed
  drawBlob()
}

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  $gsap.ticker.add(tick)
})

onUnmounted(() => {
  $gsap.ticker.remove(tick)
})
</script>