'use client'
import { useEffect, useRef } from 'react'

interface Moon {
  angularVelocity: number
  radius: number
  positionRadians: number
}

interface CarrierRing {
  centerX: number
  centerY: number
  radius: number
  moons: Moon[]
  draw(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, elapsed: DOMHighResTimeStamp): void
}

const createCarrierRing = (centerX: number, centerY: number, radius: number, moons: Moon[]): CarrierRing => {
  return {
    centerX,
    centerY,
    radius,
    moons,
    draw(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, elapsed: DOMHighResTimeStamp) {

      console.log(elapsed)

      ctx.beginPath()
      ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI)
      ctx.strokeStyle = '#ffffff'
      ctx.stroke()
      ctx.closePath()

      for (const moon of this.moons) {
        const thisX: number = this.centerX + Math.cos(moon.positionRadians) * this.radius
        const thisY: number = this.centerY + Math.sin(moon.positionRadians) * this.radius

        ctx.beginPath()
        ctx.arc(thisX, thisY, moon.radius, 0, Math.PI * 2)
        ctx.strokeStyle = '#ffffff'
        ctx.stroke()
        ctx.closePath()

        // moon.positionRadians += moon.angularVelocity * elapsed
      }
    }
  }
}

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    document.title = 'greene.cam'

    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let previousTimestamp: DOMHighResTimeStamp
    const MAX_DELTA_TIME: number = 0.05;

    const circles: Moon[] = [
      {angularVelocity: 0.1, radius: 20 , positionRadians: Math.PI / 2},
      {angularVelocity: -0.3, radius: 30 , positionRadians: 3 * Math.PI / 2}
    ]

    const carrierRing = createCarrierRing(canvas.width / 2, canvas.height / 2, 200, circles)

    const animateStep = (timestamp: DOMHighResTimeStamp) => {
      if (previousTimestamp === undefined) {
        previousTimestamp = timestamp
      }

      let elapsed: DOMHighResTimeStamp = (timestamp - previousTimestamp) / 1000
      previousTimestamp = timestamp

      elapsed = Math.min(elapsed, MAX_DELTA_TIME);

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      carrierRing.draw(canvas, ctx, elapsed)

      animationFrameId = window.requestAnimationFrame(animateStep)
    }

    window.requestAnimationFrame(animateStep)
    return () => window.cancelAnimationFrame(animationFrameId)
  }, [])

  return (
    <>
      <canvas
          ref={canvasRef}
          style={{
            border: '1px solid black',
            display: 'block',
          }}/>
      <div className="bg-blue-500 w-20 h-20"></div>
    </>
  )
}