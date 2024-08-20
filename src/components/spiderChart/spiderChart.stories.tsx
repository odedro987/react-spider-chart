import type { Meta, StoryObj } from "@storybook/react"
import SpiderChart from "./spiderChart"

const meta: Meta<typeof SpiderChart> = {
  title: "Components/SpiderChart",
  component: SpiderChart,
}

export default meta
type Story = StoryObj<typeof SpiderChart>;

export const Default: Story = {
  args: {
    radius: 100,
    segments: 3,
    data: [1, 0.5, 0],
  },
}

export const Circular: Story = {
  args: {
    radius: 100,
    segments: 6,
    innerRadius: 10,
    dataColor: "red",
    strokeWidth: 2,
    data: [1, 0.5, 1, 0, 0.2, 0.67],
  },
}
