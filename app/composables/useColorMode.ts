export const useColorMode = () => {
  const isDark = useState('isDark', () => false)

  const toggle = () => {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }

  const init = () => {
    const saved = localStorage.getItem('theme')
    isDark.value = saved === 'dark'
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  return { isDark, toggle, init }
}