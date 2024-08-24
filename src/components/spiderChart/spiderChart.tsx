import { ReactElement, useEffect, useMemo, useRef, useState } from 'react'

const BUFFER = 10

export type CenterPlacement = 'center' | 'inner'

export type Shape = 'circle' | 'polygon'

export type DataPoint = [number, number]

export type DataProps = {
  /** Color of data polygon */
  dataColor?: string
  /** Stroke color of data polygon */
  dataStrokeColor?: string
  /** Stroke pattern of data polygon */
  dataStrokePattern?: string
  /** Stroke color of data polygon */
  dataFillOpacity?: number
  /** Radius of data points */
  dataPointRadius?: number
  /** Labels of data points */
  dataPointLabels?: string[]
  /** Class name for data points labels */
  dataPointLabelClassName?: string
  /** Controls the spacing between the labels and the data points */
  dataPointLabelGap?: number
}

export type ShapeProps = {
  /** Stroke width of the radiuses */
  strokeWidth?: number
  /** Stroke color of the radiuses */
  strokeColor?: string
  /** Stroke color of the inner radiuses */
  innerStrokeColor?: string
  /** Flag to show inner radius */
  showInnerRadius?: boolean
  /** Background color of the radiuses */
  backgroundColor?: string
  /** Number of segments */
  segments?: number
  /** Number of segments */
  alignSegmentsWithDataPoints?: boolean
  /** Number of rings */
  rings?: number
  /** Number of indicator sections along each segment */
  indicatorSections?: number
  /** Length of indicator sections */
  indicatorSectionLength?: number
}

export type SpiderChartProps = {
    /** Radius of the chart */
    radius: number
    /** Inner radius of the chart */
    innerRadius?: number
    /** Where the props should be scaled from
     *
     *  'center' - center of the chart
     *
     *  'inner' - offset the radius of the inner circle
     */
    centerPlacement?: CenterPlacement
    /** Shape of the chart */
    shape?: Shape
    /** Offset for the angle (in radians) */
    angleOffset: number
    /** Data points (values between 0 and 1) */
    data: number[]
    /** Props related to data points */
    dataProps: DataProps
    /** Props related to chart shape */
    shapeProps: ShapeProps
    /** Optional SVG <defs> element for custom effects */
    svgDefinitions?: ReactElement<SVGDefsElement>
}

export const SpiderChart = (props: SpiderChartProps) => {
  const {
    radius: initialRadius = 100,
    innerRadius = initialRadius / 10,
    shapeProps = {} as ShapeProps,
    shape = 'circle',
    data = [],
    dataProps = {} as DataProps,
    centerPlacement = 'inner',
    angleOffset = 0,
    svgDefinitions
  } = props

  const {
    dataColor = 'none',
    dataStrokeColor = 'black',
    dataFillOpacity = 0.5,
    dataPointRadius = 5,
    dataPointLabels = [],
    dataStrokePattern = '',
    dataPointLabelClassName = undefined,
    dataPointLabelGap = 0
  } = dataProps

  const {
    strokeWidth = 1,
    strokeColor = 'black',
    innerStrokeColor = 'black',
    showInnerRadius = true,
    backgroundColor = 'none',
    rings = 0,
    segments: initialSegments = 0,
    alignSegmentsWithDataPoints = false,
    indicatorSections = 0,
    indicatorSectionLength = 5
  } = shapeProps

  const labelRefs = useRef<(HTMLSpanElement|null)[]>([])

  const [labelPositions, setLabelPositions] = useState<DataPoint[]>([...Array(data.length).fill([0,0])])
  useEffect(()=> {
    labelRefs.current = labelRefs.current.slice(0, dataPointLabels.length)
  }, [dataPointLabels.length])

  const radius = useMemo(() => initialRadius >= 0 ? initialRadius : 0, [initialRadius])
  const segments = useMemo(()=> alignSegmentsWithDataPoints ? data.length : initialSegments >= 0 ? initialSegments : 0, [initialSegments, alignSegmentsWithDataPoints, data.length])
  const center = useMemo(() => radius + strokeWidth + BUFFER, [radius, strokeWidth])
  const centerOffset = useMemo(() => {
    switch (centerPlacement){
    case 'center': return 0
    case 'inner': return innerRadius
    default: return 0
    }
  }, [innerRadius, centerPlacement])

  const [spiderPoints, circumPoints] = useMemo(() => {
    const res: [DataPoint[], DataPoint[]] = [[], []]
    data.forEach((value, i) => {
      const [cos, sin] = [Math.cos((i / data.length) * 6.28 + angleOffset), Math.sin((i / data.length) * 6.28 + angleOffset)]
      res[0].push([
        center + cos * ((radius - centerOffset) * value) + cos * centerOffset,
        center + sin * ((radius - centerOffset) * value) + sin * centerOffset
      ])
      res[1].push([
        center + cos * ((radius - centerOffset)) + cos * centerOffset,
        center + sin * ((radius - centerOffset)) + sin * centerOffset
      ])
    })
    return [res[0], res[1]]
  }, [data, center, radius, centerOffset, angleOffset])

  const spiderPointsString = useMemo(()=> spiderPoints.reduce((acc, curr) => acc + ' ' + curr.join(','), ''), [spiderPoints])

  useEffect(()=> {
    const positions: DataPoint[] = []
    labelRefs.current.forEach((ref, i)=> {
      const [x, y] = circumPoints[i]
      if (ref){
        positions.push([
          x - (x < (center - radius / 4) ? ref.clientWidth + dataPointLabelGap : x > (center + radius / 4) ? -dataPointLabelGap : ref.clientWidth / 2),
          y - (y < (center - radius / 4) ? ref.clientHeight + dataPointLabelGap : y > (center + radius / 4) ? -dataPointLabelGap : ref.clientHeight / 2)
        ])
      }
    })
    setLabelPositions(positions)
  }, [center, circumPoints, labelRefs, radius, dataPointLabelGap])

  const ringShapes = useMemo(()=> {
    if (rings <= 0) {
      return null
    }

    if (shape === 'polygon'){
      return [...Array(rings)].map((_, i) => {
        const points = [...Array(segments)].map((_, j)=>{
          const [cos, sin] = [Math.cos((j / segments) * 6.28 + angleOffset), Math.sin((j / segments) * 6.28 + angleOffset)]
          const dist = ((i + 1) / (rings + 1)) * (radius - centerOffset)

          return [center + cos * centerOffset + cos * dist, center + sin * centerOffset + sin * dist]
        })
        const pointsString = points.reduce((acc, curr) => acc + ' ' + curr.join(','), '')
        return <polygon key={`ring-${i}`} points={pointsString} fill={'none'} stroke={strokeColor} strokeWidth={strokeWidth} />
      })
    }

    if (shape === 'circle') {
      return [...Array(rings)].map((_, i) => {
        const dist = ((i + 1) / (rings + 1)) * (radius - centerOffset)
        return <circle key={`data-${i}`} cx={center} cy={center} r={dist + centerOffset} stroke={strokeColor} strokeWidth={strokeWidth} fill={'none'} />
      })
    }
  }, [angleOffset, center, centerOffset, radius, rings, segments, shape, strokeColor, strokeWidth])

  const outerShape = useMemo(()=> {
    if (shape === 'polygon'){
      const points = data.map((_, i) => {
        const [cos, sin] = [Math.cos((i / data.length) * 6.28 + angleOffset), Math.sin((i / data.length) * 6.28 + angleOffset)]
        return [center + cos * radius, center + sin * radius]
      })
      const pointsString = points.reduce((acc, curr) => acc + ' ' + curr.join(','), '')
      return <polygon points={pointsString} fill={backgroundColor} stroke={strokeColor} strokeWidth={strokeWidth} />
    }

    if (shape === 'circle') {
      return <circle cx={center} cy={center} r={radius} stroke={strokeColor} strokeWidth={strokeWidth} fill={backgroundColor}/>
    }
  }, [angleOffset, backgroundColor, center, data, radius, shape, strokeColor, strokeWidth])

  const innerShape = useMemo(()=> {
    if (shape === 'polygon'){
      const points = data.map((_, i) => {
        const [cos, sin] = [Math.cos((i / data.length) * 6.28 + angleOffset), Math.sin((i / data.length) * 6.28 + angleOffset)]
        return [center + cos * centerOffset, center + sin * centerOffset]
      })
      const pointsString = points.reduce((acc, curr) => acc + ' ' + curr.join(','), '')
      return <polygon points={pointsString} fill={'none'} stroke={innerStrokeColor} strokeWidth={strokeWidth} />
    }

    if (shape === 'circle') {
      return <circle cx={center} cy={center} r={innerRadius} stroke={innerStrokeColor} strokeWidth={strokeWidth} fill={'none'}/>
    }
  }, [angleOffset, center, centerOffset, data, innerRadius, shape, innerStrokeColor, strokeWidth])

  const [segmentLines, indicatorLines] = useMemo(()=> {
    const [segmentLines, indicatorLines]: [JSX.Element[],JSX.Element[]] = [[], []]
    for (let i = 0; i < segments; i++) {
      const [cos, sin] = [Math.cos((i / segments) * 6.28 + angleOffset), Math.sin((i / segments) * 6.28 + angleOffset)]
      const [cos2, sin2] = [Math.cos((i / segments) * 6.28 + 1.572 + angleOffset), Math.sin((i / segments) * 6.28 + 1.572 + angleOffset)]
      segmentLines.push(<line x1={center} y1={center} x2={center + cos * radius} y2={center + sin * radius} stroke={innerStrokeColor} strokeWidth={strokeWidth} />)
      for (let j = 0; j < indicatorSections; j++) {
        [...Array(indicatorSections)].map((_, j) => {
          const dist = ((j + 1) / (indicatorSections + 1)) * (radius - centerOffset)
          indicatorLines.push( <line
            key={`indicator-${i}-${j}`}
            x1={center + cos * centerOffset + cos * dist - cos2 * indicatorSectionLength}
            y1={center + sin * centerOffset + sin * dist - sin2 * indicatorSectionLength}
            x2={center + cos * centerOffset + cos * dist + cos2 * indicatorSectionLength}
            y2={center + sin * centerOffset + sin * dist + sin2 * indicatorSectionLength}
            stroke={innerStrokeColor}
            strokeWidth={strokeWidth}
          />)
        })
      }
    }
    return [segmentLines, indicatorLines]
  }, [angleOffset, center, centerOffset, indicatorSectionLength, indicatorSections, innerStrokeColor, radius, segments, strokeWidth])

  return (
    <div>
      <svg height={center * 2 + BUFFER} width={center * 2 + BUFFER} style={{position: 'relative'}}>
        {svgDefinitions}
        {outerShape}
        {showInnerRadius && innerRadius > 0 && innerShape}
        {segments > 0 && segmentLines}
        {indicatorSections > 0 && indicatorLines}
        {rings > 0 && ringShapes}
        <polygon points={spiderPointsString} fill={dataColor} stroke={dataStrokeColor} strokeDasharray={dataStrokePattern} fillOpacity={dataFillOpacity} strokeWidth={strokeWidth} />
        {spiderPoints.map((p, i) => (
          <circle key={`data-${i}`} cx={p[0]} cy={p[1]} r={dataPointRadius} />
        ))}
      </svg>
      {dataPointLabels.map((label, i) => {
        return <span key={`label-${i}`} className={dataPointLabelClassName} ref={e=> {labelRefs.current[i] = e}} style={{position: 'absolute', top: labelPositions[i][1], left: labelPositions[i][0] }}>{label}</span>
      })}
    </div>
  )
}

export type UseSpiderChartProps = {
  data: number[]
  radius: number
  strokeWidth?: number
  centerPlacement?: CenterPlacement
  innerRadius?: number
  angleOffset: number
}

export const useSpiderChart = (props: UseSpiderChartProps) => {
  const {data, radius, strokeWidth = 2, centerPlacement = 'inner', innerRadius = radius / 10, angleOffset} = props

  const center = useMemo(() => radius + strokeWidth + BUFFER, [radius, strokeWidth])
  const centerOffset = useMemo(() => {
    switch (centerPlacement){
    case 'center': return 0
    case 'inner': return innerRadius
    default: return 0
    }
  }, [innerRadius, centerPlacement])

  const [spiderPoints, circumPoints] = useMemo(() => {
    const res: [DataPoint[], DataPoint[]] = [[], []]
    data.forEach((value, i) => {
      const [cos, sin] = [Math.cos((i / data.length) * 6.28 + angleOffset), Math.sin((i / data.length) * 6.28 + angleOffset)]
      res[0].push([
        center + cos * ((radius - centerOffset) * value) + cos * centerOffset,
        center + sin * ((radius - centerOffset) * value) + sin * centerOffset
      ])
      res[1].push([
        center + cos * ((radius - centerOffset)) + cos * centerOffset,
        center + sin * ((radius - centerOffset)) + sin * centerOffset
      ])
    })
    return [res[0], res[1]]
  }, [data, center, radius, centerOffset, angleOffset])

  return {spiderPoints, circumPoints, center, BUFFER}
}

export default SpiderChart
