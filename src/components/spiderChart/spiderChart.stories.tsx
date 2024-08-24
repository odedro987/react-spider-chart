import type { Meta, StoryObj } from "@storybook/react"
import SpiderChart from "./spiderChart"

const meta: Meta<typeof SpiderChart> = {
  title: "Components/SpiderChart",
  component: SpiderChart,
}

export default meta
type Story = StoryObj<typeof SpiderChart>;

export const Circular: Story = {
  args: {
    radius: 100,
    shapeProps: {
      alignSegmentsWithDataPoints: true
    },
    data: [1, 0.5, 1, 0, 0.2, 0.67],
    dataProps: {
      dataColor: "red",
    }
  },
}

export const Polygonal: Story = {
  args: {
    radius: 100,
    shape: 'polygon',
    shapeProps: {
      alignSegmentsWithDataPoints: true
    },
    data: [1, 0.5, 1, 0, 0.2, 0.67],
    dataProps: {
      dataColor: "red",
    }
  },
}
