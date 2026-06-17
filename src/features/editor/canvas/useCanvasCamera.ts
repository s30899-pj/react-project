import { useEffect, useRef } from 'react'
import { useEditor } from '@/hooks/useEditor'

const ZOOM_MIN = 0.3
const ZOOM_MAX = 4

export function useCanvasCamera(ref: React.RefObject<HTMLElement>) {
  const { state, dispatch } = useEditor()
  const cameraRef = useRef(state.project.camera)
  cameraRef.current = state.project.camera
  const toolRef = useRef(state.tool)
  toolRef.current = state.tool

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      const camera = cameraRef.current
      const factor = event.deltaY < 0 ? 1.12 : 1 / 1.12
      const zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, camera.zoom * factor))
      dispatch({ type: 'SET_CAMERA', camera: { zoom: Number(zoom.toFixed(3)) } })
    }

    let panning = false
    let lastX = 0
    let lastY = 0

    const onPointerDown = (event: PointerEvent) => {
      const handTool = event.button === 0 && toolRef.current === 'pan'
      if (event.button === 1 || handTool) {
        panning = true
        lastX = event.clientX
        lastY = event.clientY
        node.setPointerCapture(event.pointerId)
        node.style.cursor = 'grabbing'
      }
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!panning) return
      const camera = cameraRef.current
      dispatch({
        type: 'SET_CAMERA',
        camera: { x: camera.x + (event.clientX - lastX), y: camera.y + (event.clientY - lastY) },
      })
      lastX = event.clientX
      lastY = event.clientY
    }

    const onPointerUp = (event: PointerEvent) => {
      if (!panning) return
      panning = false
      node.releasePointerCapture(event.pointerId)
      node.style.cursor = ''
    }

    node.addEventListener('wheel', onWheel, { passive: false })
    node.addEventListener('pointerdown', onPointerDown)
    node.addEventListener('pointermove', onPointerMove)
    node.addEventListener('pointerup', onPointerUp)

    return () => {
      node.removeEventListener('wheel', onWheel)
      node.removeEventListener('pointerdown', onPointerDown)
      node.removeEventListener('pointermove', onPointerMove)
      node.removeEventListener('pointerup', onPointerUp)
    }
  }, [ref, dispatch])
}
