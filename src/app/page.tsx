'use client'
import { useEffect, useRef } from 'react'
import {Moon, createCarrierRing} from "@/interfaces/carrierRing";


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
      {angularVelocity: 0.9, radius: 20 , positionRadians: 1.2 * Math.PI / 2},
      {angularVelocity: -0.7, radius: 30 , positionRadians: 3 * Math.PI / 2},
      {angularVelocity: 0.6, radius: 10 , positionRadians: 2.0 * Math.PI / 2},
      {angularVelocity: -0.1, radius: 25 , positionRadians: 1.7 * Math.PI / 2},
      {angularVelocity: 0.4, radius: 35 , positionRadians: 2.7 * Math.PI / 2},
    ]

    const carrierRing = createCarrierRing(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) - 150, circles)

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