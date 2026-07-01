import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

declare module '#app' {
    interface NuxtApp {
        $gsap: typeof gsap
        $ScrollTrigger: typeof ScrollTrigger
        $lenis: Lenis
    }
}
declare module 'vue' {
    interface ComponentCustomProperties {
        $gsap: typeof gsap
        $ScrollTrigger: typeof ScrollTrigger
        $lenis: Lenis
    }
}
export {}