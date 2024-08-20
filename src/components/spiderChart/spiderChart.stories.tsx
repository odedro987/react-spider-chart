import type { Meta, StoryObj } from "@storybook/react";
import SpiderChart from "./spiderChart";

const meta: Meta<typeof SpiderChart> = {
    title: "Components/SpiderChart",
    component: SpiderChart,
};

export default meta;
type Story = StoryObj<typeof SpiderChart>;

export const Default: Story = {
    args: {
        radius: 100,
        slices: 6,
    },
};
