document.addEventListener('DOMContentLoaded', () => {

    const dateInput = document.getElementById('date')

    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    dateInput.value = `${yyyy}-${mm}-${dd}`

    const direction = document.getElementById('direction')
    const category  = document.getElementById('category')
    const generate  = document.getElementById('generate')
    const download  = document.getElementById('download')
    const photo     = document.getElementById('photo')
    const result    = document.getElementById('result-canvas')

    const RANGES = {
        US_China: {
            regular: { min: 7,  max: 21 },
            primary: { min: 6,  max: 10 }
        },
        China_US: {
            regular: { min: 10, max: 30 },
            primary: { min: 7,  max: 15 }
        }
    }

    generate.addEventListener('click', () => {

        if (!dateInput.value) {
            alert('Pick a date!')
            return
        }

        const sent      = new Date(dateInput.value)
        const dir       = direction.value
        const cat       = category.value
        const range     = RANGES[dir][cat]
        const msPerDay  = 86400000
        const earliest  = new Date(sent.getTime() + range.min * msPerDay)
        const latest    = new Date(sent.getTime() + range.max * msPerDay)
        const fmtOpts   = { month: 'short', day: 'numeric' }
        const earliestStr = earliest.toLocaleDateString('en-US', fmtOpts)
        const latestStr   = latest.toLocaleDateString('en-US', fmtOpts)
        const dirLabel    = dir === 'US_China' ? 'US → CHINA' : 'CHINA → US'

        const ctx      = result.getContext('2d')
        const file     = photo.files[0]
        const hasImage = !!file
        const img      = new Image()
        if (hasImage) img.src = URL.createObjectURL(file)

        const drawPostcard = () => {

            result.width  = 800
            result.height = 500

            // background
            ctx.fillStyle = '#f3e9d2'
            ctx.fillRect(0, 0, 800, 500)

            // double border
            ctx.strokeStyle = '#3a2f24'
            ctx.lineWidth = 1
            ctx.strokeRect(12, 12, 776, 476)
            ctx.strokeRect(18, 18, 764, 464)

            // photo strip (left side) if image uploaded
            if (hasImage) {
                const stripW = 340
                const stripH = 420
                const sz = Math.min(img.width, img.height)
                const sx = (img.width  - sz) / 2
                const sy = (img.height - sz) / 2
                ctx.save()
                ctx.beginPath()
                ctx.rect(28, 68, stripW, stripH)
                ctx.clip()
                ctx.drawImage(img, sx, sy, sz, sz, 28, 68, stripW, stripH)
                ctx.restore()
                ctx.strokeStyle = '#3a2f24'
                ctx.lineWidth = 0.8
                ctx.strokeRect(28, 68, stripW, stripH)
            }

            // AIR MAIL header
            ctx.fillStyle = '#1f2a44'
            ctx.font = '22px "Special Elite", cursive'
            ctx.textAlign = 'left'
            ctx.fillText('AIR MAIL', 36, 56)

            // stamp box
            ctx.strokeStyle = '#3a2f24'
            ctx.lineWidth = 1
            ctx.strokeRect(690, 26, 80, 60)
            ctx.setLineDash([3, 3])
            ctx.strokeRect(695, 31, 70, 50)
            ctx.setLineDash([])
            ctx.font = '10px "Courier Prime", monospace'
            ctx.fillStyle = '#3a2f24'
            ctx.textAlign = 'center'
            ctx.fillText('POSTAGE', 730, 60)
            ctx.textAlign = 'left'

            // horizontal divider under header
            ctx.beginPath()
            ctx.moveTo(18, 74)
            ctx.lineTo(782, 74)
            ctx.strokeStyle = '#3a2f24'
            ctx.lineWidth = 0.8
            ctx.stroke()

            // vertical center divider
            ctx.beginPath()
            ctx.moveTo(400, 74)
            ctx.lineTo(400, 482)
            ctx.stroke()

            // === LEFT HALF: mail info ===
            const infoX  = 36
            const startY = 110

            if (!hasImage) {
                // ROUTE
                ctx.fillStyle = '#5a4632'
                ctx.font = '11px "Courier Prime", monospace'
                ctx.fillText('ROUTE', infoX, startY)
                ctx.fillStyle = '#1f2a44'
                ctx.font = '15px "Courier Prime", monospace'
                ctx.fillText(dirLabel, infoX, startY + 22)

                // TYPE
                ctx.fillStyle = '#5a4632'
                ctx.font = '11px "Courier Prime", monospace'
                ctx.fillText('TYPE', infoX, startY + 66)
                ctx.fillStyle = '#1f2a44'
                ctx.font = '15px "Courier Prime", monospace'
                ctx.fillText(cat.toUpperCase(), infoX, startY + 88)

                // EST. ARRIVAL
                ctx.fillStyle = '#5a4632'
                ctx.font = '11px "Courier Prime", monospace'
                ctx.fillText('EST. ARRIVAL', infoX, startY + 132)
                ctx.fillStyle = '#1f2a44'
                ctx.font = '15px "Courier Prime", monospace'
                ctx.fillText(earliestStr, infoX, startY + 154)
                ctx.fillText('—', infoX + 72, startY + 154)
                ctx.fillText(latestStr, infoX + 88, startY + 154)

                // decorative postmark circle
                ctx.save()
                ctx.strokeStyle = '#8b2e2e'
                ctx.lineWidth = 1.5
                ctx.globalAlpha = 0.35
                ctx.beginPath()
                ctx.arc(300, 310, 70, 0, Math.PI * 2)
                ctx.stroke()
                ctx.beginPath()
                ctx.arc(300, 310, 60, 0, Math.PI * 2)
                ctx.stroke()
                ctx.font = '11px "Special Elite", cursive'
                ctx.fillStyle = '#8b2e2e'
                ctx.textAlign = 'center'
                ctx.fillText('AIR MAIL', 300, 314)
                ctx.restore()

            } else {
                // compact info when photo present
                ctx.fillStyle = '#5a4632'
                ctx.font = '10px "Courier Prime", monospace'
                ctx.fillText('ROUTE', infoX, startY)
                ctx.fillStyle = '#1f2a44'
                ctx.font = '13px "Courier Prime", monospace'
                ctx.fillText(dirLabel, infoX, startY + 18)

                ctx.fillStyle = '#5a4632'
                ctx.font = '10px "Courier Prime", monospace'
                ctx.fillText('TYPE', infoX, startY + 50)
                ctx.fillStyle = '#1f2a44'
                ctx.font = '13px "Courier Prime", monospace'
                ctx.fillText(cat.toUpperCase(), infoX, startY + 68)

                ctx.fillStyle = '#5a4632'
                ctx.font = '10px "Courier Prime", monospace'
                ctx.fillText('EST. ARRIVAL', infoX, startY + 100)
                ctx.fillStyle = '#1f2a44'
                ctx.font = '13px "Courier Prime", monospace'
                ctx.fillText(`${earliestStr} — ${latestStr}`, infoX, startY + 118)
            }

            // === RIGHT HALF: address area ===
            const rx = 420

            ctx.fillStyle = '#1f2a44'
            ctx.font = '13px "Courier Prime", monospace'
            ctx.fillText('TO:', rx, 100)

            ctx.strokeStyle = '#b0a090'
            ctx.lineWidth = 0.7
            for (let i = 0; i < 5; i++) {
                const y = 128 + i * 48
                ctx.beginPath()
                ctx.moveTo(rx, y)
                ctx.lineTo(774, y)
                ctx.stroke()
            }

            // FROM area
            ctx.fillStyle = '#5a4632'
            ctx.font = '10px "Courier Prime", monospace'
            ctx.fillText('FROM:', rx, 390)
            ctx.strokeStyle = '#b0a090'
            ctx.lineWidth = 0.7
            for (let i = 0; i < 3; i++) {
                const y = 406 + i * 24
                ctx.beginPath()
                ctx.moveTo(rx, y)
                ctx.lineTo(774, y)
                ctx.stroke()
            }

            // aging overlay
            ctx.fillStyle = 'rgba(120, 90, 60, 0.06)'
            ctx.fillRect(0, 0, 800, 500)

            result.style.display = 'block'

            result.toBlob(async (blob) => {
                const imgFile = new File([blob], 'mail-tracker.png', { type: 'image/png' })
                if (navigator.share && navigator.canShare && navigator.canShare({ files: [imgFile] })) {
                    try {
                        await navigator.share({ files: [imgFile], title: 'Mail Record' })
                    } catch (err) {
                        console.log('Share canceled')
                    }
                } else {
                    download.href = URL.createObjectURL(blob)
                    download.download = 'mail-tracker.png'
                    download.style.display = 'block'
                }
            })
        }

        if (hasImage) {
            img.onload = drawPostcard
        } else {
            drawPostcard()
        }
    })
})