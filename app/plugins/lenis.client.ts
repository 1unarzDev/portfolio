import type { NuxtApp } from '#app'
import Lenis from 'lenis'

export default defineNuxtPlugin((nuxtApp) => {
    const { $gsap, $ScrollTrigger } = nuxtApp as unknown as NuxtApp

    const lenis = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
    })

    const ticker = (time: number) => lenis.raf(time * 1000)

    $gsap.ticker.add(ticker)
    $gsap.ticker.lagSmoothing(0)
    lenis.on('scroll', $ScrollTrigger.update)

    nuxtApp.hook('page:finish', () => {
        lenis.start()
    })

    if (import.meta.hot) {
        import.meta.hot.dispose(() => {
            lenis.destroy()
            $gsap.ticker.remove(ticker)
        })
    }

    return {
        provide: { lenis },
    }
})