import { Story } from "@storybook/react";
import * as React from "react";
import { Label, LabelProps } from "../../../../annotations/src/Label";
import Annotations from "./Annotations";

export default {
    component: Label,
    title: "Features/Annotations",
    argTypes: {
        fillStyle: { control: "color" },
        text: {
            control: {
                type: "text",
            },
        },
    },
};

const Template: Story<LabelProps> = (args) => <Annotations {...args} />;

export const background = Template.bind({});
