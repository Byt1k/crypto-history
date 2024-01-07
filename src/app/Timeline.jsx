'use client'

import {useEffect, useRef, useState} from 'react'
import { data } from '../data'

const Timeline = () => {
    const [zoomLevel, setZoomLevel] = useState(1)

    const ZOOM_MIN = 1
    const ZOOM_MAX = 12
    const [WIDTH, SET_WIDTH] = useState(0)
    const [HEIGHT, SET_HEIGHT] = useState(0)
    const PADDING = 50
    const VIEW_WIDTH = WIDTH - PADDING

    useEffect(() => {
        SET_WIDTH(window.innerWidth + 0.5)
        SET_HEIGHT(window.innerHeight - 24)
    }, [])

    const timelineRef = useRef(null)
    const containerRef = useRef(null)
    const [ctx, setCtx] = useState(null)

    const dayDuration = 1000 * 60 * 60 * 24 // seconds
    const firstDate = new Date('2008-10-31').getTime()
    const currentDate = new Date().getTime()

    const x = []
    for (let i = firstDate; i <= currentDate; i += dayDuration) {
        x.push(i)
    }

    const months = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    const clear = () => {
        ctx.clearRect(0, 0, WIDTH, HEIGHT)
    }

    const [clientX, setClientX] = useState(0)

    const xAxis = (ctx, segments) => {

        const columnsCount = segments.length
        const step = VIEW_WIDTH / columnsCount * zoomLevel
        const xOffset = containerRef.current.scrollLeft
        const currentPositionOnTimeline = clientX + xOffset
        const newPositionOnTimeline = currentPositionOnTimeline * zoomLevel
        containerRef.current.scrollBy(newPositionOnTimeline - currentPositionOnTimeline - xOffset * zoomLevel, 0)

        ctx.beginPath()
        for (let i = 0; i < columnsCount; i++) {
            const x = step * i
            ctx.fillText(segments[i], x + PADDING - 14, HEIGHT - 8)
            ctx.moveTo(x + PADDING, HEIGHT)
            ctx.lineTo(x + PADDING, 0)
            ctx.fillStyle = '#757480'
            ctx.font = '500 12px sans-serif'
        }
        ctx.strokeStyle = '#2d344f' // '#161b2b'
        ctx.stroke()
        ctx.closePath()
    }

    useEffect(() => {
        const canvas = timelineRef.current
        const ctx = canvas?.getContext('2d')
        setCtx(ctx)
    }, [])

    useEffect(() => {
        if (!ctx) return
        clear()

        let segments = []

        if (zoomLevel < ZOOM_MAX / 3) {
            for (let i = new Date(firstDate).getFullYear(); i <= new Date().getFullYear(); i++) {
                segments.push(i)
            }
        }

        if (zoomLevel >= ZOOM_MAX / 3 && zoomLevel < ZOOM_MAX / 3 * 2) {
            const quarters = months.filter((_, i) => (i + 1) % 3 === 0)
            for (let i = new Date(firstDate).getFullYear(); i <= new Date().getFullYear(); i++) {
                segments.push(i, ...quarters)
            }
        }

        if (zoomLevel >= ZOOM_MAX / 3 * 2 && zoomLevel <= ZOOM_MAX) {
            for (let i = new Date(firstDate).getFullYear(); i <= new Date().getFullYear(); i++) {
                segments.push(i, ...months)
            }
        }
        xAxis(ctx, segments)
    }, [ctx, zoomLevel, clientX])


    const onWheel = ({ deltaY, clientX }) => {
        const delta = deltaY / 500
        if ((zoomLevel < ZOOM_MAX && delta < 0) || (zoomLevel > ZOOM_MIN && delta > 0)) {
            setZoomLevel(prev => prev - delta)
            setClientX(clientX)
        }
    }

    return (
        <div className="timeline" ref={containerRef}>
            <canvas
                ref={timelineRef}
                width={WIDTH * zoomLevel}
                height={HEIGHT}
                style={{
                    width: WIDTH * zoomLevel,
                    height: HEIGHT,
                    background: 'transparent',
                    display: 'block',
                }}
                onWheel={onWheel}
            />
        </div>
    )
}

export default Timeline