import { addParameters } from '@storybook/react';

addParameters({
    options: {
        storySort: {
            order: ['Intro', 'Features', 'Visualization'],
        },
    },
});

export const parameters = {
    controls: { hideNoControlsWarning: true },
};
