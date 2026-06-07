const link = document.getElementById('favicon') as HTMLLinkElement | null

if (link) {
  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.beginPath()
    ctx.arc(32, 32, 32, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(img, 0, 0, 64, 64)

    link.href = canvas.toDataURL('image/png')
    link.type = 'image/png'
  }

  img.src = '/logo.gif'
}