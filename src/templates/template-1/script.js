// Template JS (optional): smooth anchor scrolling
document.addEventListener('click', (e) => {
  const a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null
  if (!a) return
  const id = a.getAttribute('href')
  if (!id || id === '#') return
  const el = document.querySelector(id)
  if (!el) return
  e.preventDefault()
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
})

