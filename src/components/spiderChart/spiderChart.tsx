import { useMemo } from "react";

export type SpiderChartProps = {
    radius: number;
    strokeWidth?: number;
    strokeColor?: string;
    slices: number;
};

const SpiderChart = (props: SpiderChartProps) => {
    const { radius, strokeWidth = 1, strokeColor = "black", slices } = props;

    const center = useMemo(() => radius + strokeWidth, [radius, strokeWidth]);

    return (
        <svg height={center * 2} width={center * 2}>
            <circle cx={center} cy={center} r={radius} stroke={strokeColor} stroke-width={strokeWidth} fill="none" />
            <circle
                cx={center}
                cy={center}
                r={radius / 10}
                stroke={strokeColor}
                stroke-width={strokeWidth}
                fill="none"
            />
            {[...Array(slices)].map((_, i) => {
                return (
                    <line
                        x1={center}
                        y1={center}
                        x2={center + Math.cos((i / slices) * 6.28) * radius}
                        y2={center + Math.sin((i / slices) * 6.28) * radius}
                        stroke={strokeColor}
                        stroke-width={strokeWidth}
                    />
                );
            })}
        </svg>
    );
};

export default SpiderChart;
