import { useMemo } from "react"

export type SpiderChartProps = {
    radius: number
    innerRadius?: number
    strokeWidth?: number
    strokeColor?: string
    slices: number
    data: number[]
    dataColor?: string
    dataStrokeColor?: string
    dataPointRadius?: number
    indicatorSections?: number
}

const SpiderChart = (props: SpiderChartProps) => {
  const { radius, strokeWidth = 1, strokeColor = "black", slices, data, dataColor="red", dataStrokeColor=dataColor, innerRadius = radius / 10, dataPointRadius = 5, indicatorSections = 3 } = props

  if (data.length !== slices) {
    throw new Error(`data array must have length: ${slices}`)
  }

  const center = useMemo(() => radius + strokeWidth, [radius, strokeWidth])

  const spiderPoints = useMemo(() => {
    return data.map((value, i) => {
      const [cos, sin] = [Math.cos((i / slices) * 6.28), Math.sin((i / slices) * 6.28)]
      return [
        center + cos * ((radius - innerRadius) * value) + cos * innerRadius,
        center + sin * ((radius - innerRadius) * value) + sin * innerRadius
      ]
    })
  }, [data, slices, center, radius, innerRadius])
  
  const spiderPointsString = useMemo(()=> spiderPoints.reduce((acc, curr) => acc + " " + curr.join(","), ""), [spiderPoints])

  return (
    <svg height={center * 2 + 10} width={center * 2 + 10}>
      <circle cx={center} cy={center} r={radius} stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />
      {innerRadius > 0 && <circle cx={center} cy={center} r={innerRadius} stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />}
      {[...Array(slices)].map((_, i) => {
        const [cos, sin] = [Math.cos((i / slices) * 6.28), Math.sin((i / slices) * 6.28)]
        const [cos2, sin2] = [Math.cos((i / slices) * 6.28 + 1.572), Math.sin((i / slices) * 6.28 + 1.572)]
        return (
          <>
            <line x1={center} y1={center} x2={center + cos * radius} y2={center + sin * radius} stroke={strokeColor} strokeWidth={strokeWidth} />
            {[...Array(indicatorSections)].map((_, j) => {
              const dist = ((j + 1) / (indicatorSections + 1)) * (radius - innerRadius)
              return (
                <line
                  key={`indicator-${i}-${j}`}
                  x1={center + cos * innerRadius + cos * dist - cos2 * 5}
                  y1={center + sin * innerRadius + sin * dist - sin2 * 5}
                  x2={center + cos * innerRadius + cos * dist + cos2 * 5}
                  y2={center + sin * innerRadius + sin * dist + sin2 * 5}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                />
              )
            })}
          </>
        )
      })}
      <polygon points={spiderPointsString} fill={dataColor} stroke={dataStrokeColor} fillOpacity={0.4} strokeWidth={strokeWidth} />
      {spiderPoints.map((p, i) => (
        <circle key={`data-${i}`} cx={p[0]} cy={p[1]} r={dataPointRadius} />
      ))}
    </svg>
  )
}

export default SpiderChart
