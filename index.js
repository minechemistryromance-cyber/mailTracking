document.addEventListener('DOMContentLoaded', () => {

    const dateInput = document.getElementById('date')
    const direction = document.getElementById('direction')
    const category  = document.getElementById('category')
    const generate  = document.getElementById('generate')
    const download  = document.getElementById('download')
    const photo     = document.getElementById('photo')
    const result    = document.getElementById('result-canvas')
    const fromInput = document.getElementById('from')
    const toInput   = document.getElementById('to')

    const today = new Date()
    dateInput.value = today.toISOString().split('T')[0]

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

        if (!dateInput.value) { alert('Pick a date!'); return }

        const sent        = new Date(dateInput.value)
        const dir         = direction.value
        const cat         = category.value
        const range       = RANGES[dir][cat]
        const ms          = 86400000
        const earliest    = new Date(sent.getTime() + range.min * ms)
        const latest      = new Date(sent.getTime() + range.max * ms)
        const fmt         = { month: 'short', day: 'numeric' }
        const earliestStr = earliest.toLocaleDateString('en-US', fmt)
        const latestStr   = latest.toLocaleDateString('en-US', fmt)
        const dirLabel    = dir === 'US_China' ? 'US → CHINA' : 'CHINA → US'
        const fromText    = fromInput.value.trim() || '—'
        const toText      = toInput.value.trim()   || '—'
        const sentStr     = sent.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        const arrivalStr  = `${earliestStr} – ${latestStr}`
        const catStr      = cat.charAt(0).toUpperCase() + cat.slice(1)

        const ctx      = result.getContext('2d')
        const file     = photo.files[0]
        const hasImage = !!file
        const img      = new Image()
        if (hasImage) img.src = URL.createObjectURL(file)

        const draw = () => {

            const W = 800, H = 500
            result.width  = W
            result.height = H

            // ─────────────────────────────────────────────────────────
            // BACKGROUND
            // ─────────────────────────────────────────────────────────
            ctx.fillStyle = '#f5edd8'
            ctx.fillRect(0, 0, W, H)

            // paper grain lines
            ctx.fillStyle = 'rgba(120,90,60,0.025)'
            for (let i = 0; i < H; i += 4) {
                ctx.fillRect(0, i, W, 1)
            }

            // ─────────────────────────────────────────────────────────
            // OUTER BORDER — single clean line
            // ─────────────────────────────────────────────────────────
            ctx.strokeStyle = '#3a2f24'
            ctx.lineWidth = 1.5
            ctx.strokeRect(12, 12, W - 24, H - 24)

            // ─────────────────────────────────────────────────────────
            // HEADER  (y: 12 → 72)
            // ─────────────────────────────────────────────────────────

            // "AIR MAIL" title
            ctx.fillStyle = '#1f2a44'
            ctx.font = '22px "Special Elite", cursive'
            ctx.textAlign = 'left'
            ctx.fillText('AIR MAIL', 28, 50)

            // route sub-label
            ctx.fillStyle = '#8b2e2e'
            ctx.font = '10px "Courier Prime", monospace'
            ctx.fillText(dirLabel, 30, 64)

            // STAMP — positioned fully inside the border, away from the divider line
            // right-aligned inside right border (x=788), left at 788-16-72 = 700
            // vertically: top=16, height=52, bottom=68 (divider is at y=72, so 4px gap)
            const sx = 700, sy = 16, sw = 72, sh = 52
            ctx.strokeStyle = '#3a2f24'
            ctx.lineWidth = 1
            ctx.strokeRect(sx, sy, sw, sh)
            ctx.save()
            ctx.setLineDash([2, 3])
            ctx.strokeRect(sx + 5, sy + 5, sw - 10, sh - 10)
            ctx.restore()
            ctx.fillStyle = '#5a4632'
            ctx.font = '8px "Courier Prime", monospace'
            ctx.textAlign = 'center'
            ctx.fillText('POSTAGE', sx + sw / 2, sy + sh / 2 + 3)
            ctx.textAlign = 'left'

            // ─────────────────────────────────────────────────────────
            // DIVIDERS
            // ─────────────────────────────────────────────────────────
            ctx.strokeStyle = '#3a2f24'
            ctx.lineWidth = 0.8

            // horizontal — below header
            ctx.beginPath()
            ctx.moveTo(12, 72)
            ctx.lineTo(W - 12, 72)
            ctx.stroke()

            // vertical — splits left photo / right text
            ctx.beginPath()
            ctx.moveTo(W / 2, 72)
            ctx.lineTo(W / 2, H - 12)
            ctx.stroke()

            // ─────────────────────────────────────────────────────────
            // LEFT HALF — photo or decorative postmark
            // ─────────────────────────────────────────────────────────
            const pad = 12
            const bx = 12 + pad
            const by = 72 + pad
            const bw = W / 2 - 12 - pad * 2
            const bh = H - 12 - by - pad

            if (hasImage) {
                // clip + cover-fit
                ctx.save()
                ctx.beginPath()
                ctx.rect(bx, by, bw, bh)
                ctx.clip()
                const ir = img.width / img.height
                const br = bw / bh
                let dw, dh
                if (ir > br) { dh = bh; dw = bh * ir }
                else         { dw = bw; dh = bw / ir }
                ctx.drawImage(img, bx - (dw - bw) / 2, by - (dh - bh) / 2, dw, dh)
                ctx.restore()
                // photo frame
                ctx.strokeStyle = '#3a2f24'
                ctx.lineWidth = 0.8
                ctx.strokeRect(bx, by, bw, bh)
            } else {
                // postmark circle
                const cx = W / 4, cy = (72 + H) / 2
                ctx.save()
                ctx.globalAlpha = 0.15
                ctx.strokeStyle = '#1f2a44'
                ctx.lineWidth = 2
                ctx.beginPath(); ctx.arc(cx, cy, 88, 0, Math.PI * 2); ctx.stroke()
                ctx.beginPath(); ctx.arc(cx, cy, 74, 0, Math.PI * 2); ctx.stroke()
                ctx.globalAlpha = 0.2
                ctx.fillStyle = '#1f2a44'
                ctx.font = '14px "Special Elite", cursive'
                ctx.textAlign = 'center'
                ctx.fillText('AIR MAIL', cx, cy + 5)
                ctx.restore()
            }

            // ─────────────────────────────────────────────────────────
            // RIGHT HALF
            // Left edge of text: W/2 + 18 = 418
            // Right edge of text: W - 24 = 776
            // ─────────────────────────────────────────────────────────
            const rx   = W / 2 + 18
            const rEnd = W - 24

            // ── helpers ──────────────────────────────────────────────

            const smallCap = (text, x, y) => {
                ctx.fillStyle = '#8a7060'
                ctx.font = '10px "Courier Prime", monospace'
                ctx.textAlign = 'left'
                ctx.fillText(text.toUpperCase(), x, y)
            }

            const bodyText = (text, x, y, size = 15) => {
                ctx.fillStyle = '#1f2a44'
                ctx.font = `${size}px "Courier Prime", monospace`
                ctx.textAlign = 'left'
                ctx.fillText(text, x, y)
            }

            const ruleLine = (y) => {
                ctx.strokeStyle = '#c8b89a'
                ctx.lineWidth = 0.6
                ctx.beginPath()
                ctx.moveTo(rx, y)
                ctx.lineTo(rEnd, y)
                ctx.stroke()
            }

            const thinDivider = (y) => {
                ctx.strokeStyle = '#a09080'
                ctx.lineWidth = 0.4
                ctx.beginPath()
                ctx.moveTo(rx, y)
                ctx.lineTo(rEnd, y)
                ctx.stroke()
            }

            // ── TO block ─────────────────────────────────────────────
            let y = 90

            smallCap('To', rx, y);           y += 17
            bodyText(toText, rx, y, 15);     y += 12
            ruleLine(y); y += 20
            ruleLine(y); y += 20
            ruleLine(y); y += 16

            thinDivider(y); y += 16

            // ── FROM block ───────────────────────────────────────────
            smallCap('From', rx, y);         y += 17
            bodyText(fromText, rx, y, 15);   y += 12
            ruleLine(y); y += 20
            ruleLine(y); y += 16

            thinDivider(y); y += 16

            // ── INFO block ───────────────────────────────────────────
            // Label left, value immediately after — compact, no spreading
            const infoRows = [
                ['Route',   dirLabel  ],
                ['Type',    catStr    ],
                ['Sent',    sentStr   ],
                ['Arrival', arrivalStr],
            ]

            const labelW = 62   // fixed label column width
            const rowH   = 24

            infoRows.forEach(([label, value]) => {
                smallCap(label, rx, y)
                bodyText(value, rx + labelW, y, 14)
                y += rowH
            })

            // ─────────────────────────────────────────────────────────
            // AGING OVERLAY
            // ─────────────────────────────────────────────────────────
            ctx.fillStyle = 'rgba(120,90,60,0.04)'
            ctx.fillRect(0, 0, W, H)

            result.style.display = 'block'

            // ─────────────────────────────────────────────────────────
            // DOWNLOAD / SHARE
            // ─────────────────────────────────────────────────────────
            result.toBlob(async (blob) => {
                const imgFile = new File([blob], 'mail-tracker.png', { type: 'image/png' })
                download.style.display = 'block'

                if (navigator.canShare && navigator.canShare({ files: [imgFile] })) {
                    download.textContent = 'Share'
                    download.onclick = async () => {
                        try { await navigator.share({ files: [imgFile], title: 'Mail Record' }) } catch {}
                    }
                } else {
                    download.textContent = 'Download'
                    download.onclick = () => {
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = 'mail-tracker.png'
                        a.click()
                        URL.revokeObjectURL(url)
                    }
                }
            })
        }

        if (hasImage) { img.onload = draw } else { draw() }
    })
})
