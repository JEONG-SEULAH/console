import PLabel from './Label';


export default {
    title: 'atoms/label',
    component: PLabel,
    parameters: {
        info: {
            summary: '',
            components: { PLabel },
        },
    },
};

export const DefaultCase = () => ({
    components: { PLabel },
    template: '<p-label>This is label.</p-label>',
});
