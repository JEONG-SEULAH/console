import Vue from 'vue';
import { walkTreeData } from '../utils';

export function foldAll(treeData) {
    // @ts-ignore
    walkTreeData(treeData, (childNode) => {
        Vue.set(childNode, '$folded', true);
    });
}
export function unfoldAll(treeData) {
    // @ts-ignore
    walkTreeData(treeData, (childNode) => {
        Vue.set(childNode, '$folded', false);
    });
}

export default {
    props: {
        foldingTransitionName: { type: String },
        foldingTransition: {},
        foldAllAfterMounted: { type: Boolean },
    },
    methods: {
        fold(node) {
            if (!node.$folded) {
                // @ts-ignore
                this.$set(node, '$folded', true);
                // @ts-ignore
                this.$emit('nodeFoldedChanged', node);
            }
        },
        unfold(node, path, opt: any = {}) {
            // eslint-disable-next-line no-param-reassign
            opt = {
                foldOthers: false,
                ...opt,
            };
            if (opt.foldOthers) {
                this.foldAll();
            }
            if (node.$folded) {
                // @ts-ignore
                this.$set(node, '$folded', false);
                // @ts-ignore
                this.$emit('nodeFoldedChanged', node);
                // @ts-ignore
                this.$emit('node-folded-changed', node);
            }
        },
        toggleFold(node, path, opt) {
            if (node.$folded) {
                this.unfold(node, path, opt);
            } else {
                // @ts-ignore
                this.fold(node, path, opt);
            }
        },
        foldAll() {
            // @ts-ignore
            this.walkTreeData((childNode) => {
                this.fold(childNode);
            });
        },
        unfoldAll() {
            // @ts-ignore
            this.walkTreeData((childNode) => {
                this.unfold(childNode, { unfoldParent: false });
            });
        },
    },
    mounted() {
        // @ts-ignore
        if (this.foldAllAfterMounted) {
            // @ts-ignore
            this.foldAll();
        }
    },
};
