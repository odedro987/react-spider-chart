import { useCallback, useMemo } from "react"

const BUFFER = 10

export type CenterPlacement = 'center' | 'inner'

export type Shape = 'circle' | 'polygon'

export type DataPoint = [number, number]

export type SpiderChartProps = {
    /** Radius of the chart */
    radius: number
    /** Inner radius of the chart */
    innerRadius: number
    /** Where the props should be scaled from
     *
     *  'center' - center of the chart
     *
     *  'inner' - offset the radius of the inner circle
     */
    centerPlacement: CenterPlacement
    /** Stroke width of the radiuses */
    shape: Shape
    /** Stroke width of the radiuses */
    strokeWidth?: number
    /** Stroke color of the radiuses */
    strokeColor?: string
    /** Background color of the radiuses */
    backgroundColor?: string
    /** Number of segments */
    segments: number
    /** Number of rings */
    rings: number
    /** Data points (values between 0 and 1) */
    data: number[]
    /** Color of data polygon */
    dataColor?: string
    /** Stroke color of data polygon */
    dataStrokeColor?: string
    /** Stroke color of data polygon */
    dataFillOpacity?: number
    /** Radius of data points */
    dataPointRadius?: number
    /** Number of indicator sections along each segment */
    indicatorSections?: number
}

export const SpiderChart = (props: SpiderChartProps) => {
  const {
    radius,
    strokeWidth = 1,
    strokeColor = "black",
    shape = 'circle',
    backgroundColor = "none",
    segments,
    rings,
    data,
    dataColor = "red",
    dataStrokeColor = dataColor,
    dataFillOpacity = 0.5,
    innerRadius = radius / 10,
    dataPointRadius = 5,
    indicatorSections = 3,
    centerPlacement = 'inner',
  } = props

  const center = useMemo(() => radius + strokeWidth + BUFFER, [radius, strokeWidth])
  const centerOffset = useMemo(() => {
    switch(centerPlacement){
    case "center": return 0
    case 'inner': return innerRadius
    default: return 0
    }
  }, [innerRadius, centerPlacement])

  const spiderPoints = useMemo(() => {
    return data.map((value, i) => {
      const [cos, sin] = [Math.cos((i / data.length) * 6.28), Math.sin((i / data.length) * 6.28)]
      return [
        center + cos * ((radius - centerOffset) * value) + cos * centerOffset,
        center + sin * ((radius - centerOffset) * value) + sin * centerOffset
      ]
    })
  }, [data, center, radius, centerOffset])

  const spiderPointsString = useMemo(()=> spiderPoints.reduce((acc, curr) => acc + " " + curr.join(","), ""), [spiderPoints])

  const ringShapes = useCallback(()=> {
    if (shape === 'polygon'){
      return [...Array(rings)].map((_, i) => {
        const points = [...Array(segments)].map((_, j)=>{
          const [cos, sin] = [Math.cos((j / segments) * 6.28), Math.sin((j / segments) * 6.28)]
          const dist = ((i + 1) / (rings + 1)) * (radius - centerOffset)

          return [center + cos * centerOffset + cos * dist, center + sin * centerOffset + sin * dist]
        })
        const pointsString = points.reduce((acc, curr) => acc + " " + curr.join(","), "")
        return <polygon key={`ring-${i}`} points={pointsString} fill={'none'} stroke={strokeColor}  strokeWidth={strokeWidth} />
      })
    }

    if(shape === "circle") {
      return [...Array(rings)].map((_, i) => {
        const dist = ((i + 1) / (rings + 1)) * (radius - centerOffset)
        return <circle key={`data-${i}`} cx={center} cy={center} r={dist + centerOffset} stroke={strokeColor} strokeWidth={strokeWidth} fill={'none'} />
      })
    }
  }, [center, centerOffset, radius, rings, segments, shape, strokeColor, strokeWidth])

  const outerShape = useCallback(()=> {
    if (shape === 'polygon'){
      const points = data.map((_, i) => {
        const [cos, sin] = [Math.cos((i / segments) * 6.28), Math.sin((i / segments) * 6.28)]
        return [center + cos * radius, center + sin * radius]
      })
      const pointsString = points.reduce((acc, curr) => acc + " " + curr.join(","), "")
      return <polygon points={pointsString} fill={'none'} stroke={strokeColor}  strokeWidth={strokeWidth} />
    }

    if(shape === "circle") {
      return <circle cx={center} cy={center} r={radius} stroke={strokeColor} strokeWidth={strokeWidth} fill={backgroundColor}/>
    }
  }, [backgroundColor, center, data, radius, segments, shape, strokeColor, strokeWidth])

  const innerShape = useCallback(()=> {
    if (shape === 'polygon'){
      const points = data.map((_, i) => {
        const [cos, sin] = [Math.cos((i / segments) * 6.28), Math.sin((i / segments) * 6.28)]
        return [center + cos * centerOffset, center + sin * centerOffset]
      })
      const pointsString = points.reduce((acc, curr) => acc + " " + curr.join(","), "")
      return <polygon points={pointsString} fill={'none'} stroke={strokeColor}  strokeWidth={strokeWidth} />
    }

    if(shape === "circle") {
      return <circle cx={center} cy={center} r={innerRadius} stroke={strokeColor} strokeWidth={strokeWidth} fill="none"/>
    }
  }, [center, centerOffset, data, innerRadius, segments, shape, strokeColor, strokeWidth])

  return (
    <svg height={center * 2 + BUFFER} width={center * 2 + BUFFER}>
      {outerShape()}
      {innerRadius > 0 && innerShape()}
      {segments && [...Array(segments)].map((_, i) => {
        const [cos, sin] = [Math.cos((i / segments) * 6.28), Math.sin((i / segments) * 6.28)]
        const [cos2, sin2] = [Math.cos((i / segments) * 6.28 + 1.572), Math.sin((i / segments) * 6.28 + 1.572)]
        return (
          <>
            <line x1={center} y1={center} x2={center + cos * radius} y2={center + sin * radius} stroke={strokeColor} strokeWidth={strokeWidth} />
            {indicatorSections > 0 && [...Array(indicatorSections)].map((_, j) => {
              const dist = ((j + 1) / (indicatorSections + 1)) * (radius - centerOffset)
              return (
                <line
                  key={`indicator-${i}-${j}`}
                  x1={center + cos * centerOffset + cos * dist - cos2 * 5}
                  y1={center + sin * centerOffset + sin * dist - sin2 * 5}
                  x2={center + cos * centerOffset + cos * dist + cos2 * 5}
                  y2={center + sin * centerOffset + sin * dist + sin2 * 5}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                />
              )
            })}
          </>
        )
      })}
      {ringShapes()}
      <polygon points={spiderPointsString} fill={dataColor} stroke={dataStrokeColor} fillOpacity={dataFillOpacity} strokeWidth={strokeWidth} />
      {spiderPoints.map((p, i) => (
        <circle key={`data-${i}`} cx={p[0]} cy={p[1]} r={dataPointRadius} />
      ))}
    </svg>
  )
}

export default SpiderChart
