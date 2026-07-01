<template>
  <div class="h-[200vh] bg-stone-200 text-black dark:bg-stone-900 dark:text-white p-12 transition-all duration-500 ease-in-out">
        <p 
            href="#"
            @mouseenter="handleHover(true)"
            @mouseleave="handleHover(false)"
        >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
    </div>
</template>

<script setup lang="ts">
const { handleHover } = useCursor()
</script>
