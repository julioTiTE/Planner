"use client"

import { useEffect, useRef } from "react"

export function GreekEyeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    let eyePositions: Array<{
      x: number
      y: number
      size: number
      opacity: number
      rotation: number
      pulseOffset: number
    }> = []

    const handleResize = () => {
      if (!canvas || !ctx) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      generateEyePositions()
      drawBackground()
    }

    const generateEyePositions = () => {
      if (!canvas) return
      eyePositions = []
      const eyeCount = Math.floor((canvas.width * canvas.height) / 25000)

      for (let i = 0; i < eyeCount; i++) {
        eyePositions.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 40 + 15,
          opacity: Math.random() * 0.4 + 0.1,
          rotation: Math.random() * Math.PI * 2,
          pulseOffset: Math.random() * Math.PI * 2
        })
      }
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    function drawBackground(time: number = 0) {
      if (!canvas || !ctx) return

      // Limpar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Gradiente de fundo azul
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, "#0f172a") // slate-900
      gradient.addColorStop(0.3, "#1e3a8a") // blue-800
      gradient.addColorStop(0.7, "#2563eb") // blue-600
      gradient.addColorStop(1, "#3b82f6") // blue-500

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Desenhar olhos gregos com posições fixas
      eyePositions.forEach(eye => {
        // Adicionar sutil pulsação
        const pulse = Math.sin(time * 0.001 + eye.pulseOffset) * 0.1 + 1
        const currentOpacity = eye.opacity * pulse
        
        drawDetailedGreekEye(ctx, eye.x, eye.y, eye.size, currentOpacity, eye.rotation)
      })

      // Pontos de luz sutis (fixos)
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)"
      for (let i = 0; i < 50; i++) {
        // Usando seed baseado no índice para posições consistentes
        const x = (Math.sin(i * 12.9898) * 43758.5453) % 1 * canvas.width
        const y = (Math.sin(i * 78.233) * 43758.5453) % 1 * canvas.height
        const size = ((Math.sin(i * 23.456) * 43758.5453) % 1) * 2 + 1

        ctx.beginPath()
        ctx.arc(Math.abs(x), Math.abs(y), Math.abs(size), 0, Math.PI * 2)
        ctx.fill()
      }

      // Brilho sutil central
      const centerGradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height) / 2,
      )
      centerGradient.addColorStop(0, "rgba(255, 255, 255, 0.05)")
      centerGradient.addColorStop(1, "rgba(255, 255, 255, 0)")

      ctx.fillStyle = centerGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    // Animação otimizada
    function animate(time: number) {
      drawBackground(time)
      animationId = requestAnimationFrame(animate)
    }

    animate(0)

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full -z-10"
      style={{ background: "#1e3a8a" }}
    />
  )
}

function drawDetailedGreekEye(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  opacity: number,
  rotation: number,
) {
  ctx.save()
  ctx.globalAlpha = Math.max(0, Math.min(1, opacity)) // Garantir que opacity está entre 0 e 1
  ctx.translate(x, y)
  ctx.rotate(rotation)

  // Sombra do olho
  ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
  ctx.shadowBlur = size * 0.2
  ctx.shadowOffsetX = size * 0.1
  ctx.shadowOffsetY = size * 0.1

  // Círculo externo (azul escuro)
  ctx.beginPath()
  ctx.arc(0, 0, size, 0, Math.PI * 2)
  ctx.fillStyle = "#1e40af"
  ctx.fill()

  // Círculo do meio (azul médio)
  ctx.beginPath()
  ctx.arc(0, 0, size * 0.8, 0, Math.PI * 2)
  ctx.fillStyle = "#3b82f6"
  ctx.fill()

  // Círculo branco
  ctx.beginPath()
  ctx.arc(0, 0, size * 0.6, 0, Math.PI * 2)
  ctx.fillStyle = "white"
  ctx.fill()

  // Íris (azul)
  ctx.beginPath()
  ctx.arc(0, 0, size * 0.35, 0, Math.PI * 2)
  ctx.fillStyle = "#1e3a8a"
  ctx.fill()

  // Pupila (preta)
  ctx.beginPath()
  ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2)
  ctx.fillStyle = "#000000"
  ctx.fill()

  // Reflexo de luz
  ctx.beginPath()
  ctx.arc(-size * 0.1, -size * 0.1, size * 0.08, 0, Math.PI * 2)
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
  ctx.fill()

  // Linhas radiais decorativas
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
  ctx.lineWidth = 1
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8
    ctx.beginPath()
    ctx.moveTo(Math.cos(angle) * size * 0.7, Math.sin(angle) * size * 0.7)
    ctx.lineTo(Math.cos(angle) * size * 0.9, Math.sin(angle) * size * 0.9)
    ctx.stroke()
  }

  ctx.restore()
}