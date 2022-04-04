import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ProjectGroupResourceMap } from '@/store/modules/reference/project-group/type';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { REFERENCE_LOAD_TTL } from '@/store/modules/reference/config';
import { Action } from 'vuex';
import { ReferenceState } from '@/store/modules/reference/type';

let lastLoadedTime = 0;

export const load = async ({ state, commit }, lazyLoad = false): Promise<void|Error> => {
    const currentTime = new Date().getTime();

    if (
        (lazyLoad && Object.keys(state.items).length > 0)
        || (lastLoadedTime !== 0 && currentTime - lastLoadedTime < REFERENCE_LOAD_TTL)
    ) return;
    lastLoadedTime = currentTime;

    try {
        const response = await SpaceConnector.client.identity.projectGroup.list({
            query: {
                only: ['project_group_id', 'name', 'parent_project_group_info'],
            },
        }, { timeout: 3000 });
        const projectGroups: ProjectGroupResourceMap = {};

        response.results.forEach((projectGroupInfo: any): void => {
            const parentGroup = projectGroupInfo.parent_project_group_info;
            projectGroups[projectGroupInfo.project_group_id] = {
                label: (parentGroup)
                    ? `${parentGroup.name} > ${projectGroupInfo.name}` : projectGroupInfo.name,
                name: projectGroupInfo.name,
                data: {
                    parentGroupInfo: parentGroup ? {
                        id: parentGroup.project_group_id,
                        name: parentGroup.name,
                    } : undefined,
                },
            };
        });

        commit('setProjectGroups', projectGroups);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

export const sync: Action<ReferenceState, any> = ({ state, commit }, projectGroupInfo): void => {
    const parentGroup = projectGroupInfo.parent_project_group_info;
    const projectGroups = {
        ...state.items,
        [projectGroupInfo.project_group_id]: {
            label: (parentGroup)
                ? `${parentGroup.name} > ${projectGroupInfo.name}` : projectGroupInfo.name,
            name: projectGroupInfo.name,
            data: {
                parentGroupInfo: parentGroup ? {
                    id: parentGroup.project_group_id,
                    name: parentGroup.name,
                } : undefined,
            },
        },
    };
    commit('setProjectGroups', projectGroups);
};
