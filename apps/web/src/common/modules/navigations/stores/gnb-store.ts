import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { UserConfigGetParameters } from '@/schema/config/user-config/api-verbs/get';
import type { UserConfigModel } from '@/schema/config/user-config/model';
import type { CostQuerySetListParameters } from '@/schema/cost-analysis/cost-query-set/api-verbs/list';
import type { CostQuerySetModel } from '@/schema/cost-analysis/cost-query-set/model';
import { store } from '@/store';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import type { FavoriteOptions } from '@/common/modules/favorites/favorite-button/type';
import type { Breadcrumb } from '@/common/modules/page-layouts/type';

interface GnbStoreState {
    breadcrumbs: Breadcrumb[];
    selectedItem: Breadcrumb;
    id?: string;
    favoriteItem?: FavoriteOptions;
    isHideNavRail?: boolean;
    isMinimizeNavRail?: boolean;
    costQuerySets: CostQuerySetModel[];
}

export const useGnbStore = defineStore('gnb', () => {
    const allReferenceStore = useAllReferenceStore();
    const userWorkspaceStore = useUserWorkspaceStore();

    const _getters = reactive({
        userId: computed(() => store.state.user.userId),
        costDataSource: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
        currentWorkspaceId: computed(() => userWorkspaceStore.getters.currentWorkspaceId as string),
    });

    const state = reactive<GnbStoreState>({
        breadcrumbs: [],
        selectedItem: {} as Breadcrumb,
        id: '',
        favoriteItem: {} as FavoriteOptions,
        costQuerySets: [] as CostQuerySetModel[],
        isHideNavRail: false,
        isMinimizeNavRail: false,
    });

    const getters = reactive({
        breadcrumbs: computed<Breadcrumb[]>(() => state.breadcrumbs),
        selectedItem: computed<Breadcrumb>(() => state.selectedItem),
        id: computed<string|undefined>(() => state.id),
        favoriteItem: computed<FavoriteOptions|undefined>(() => state.favoriteItem),
        costQuerySets: computed<CostQuerySetModel[]>(() => state.costQuerySets),
        isHideNavRail: computed<boolean|undefined>(() => state.isHideNavRail),
        isMinimizeNavRail: computed<boolean|undefined>(() => state.isMinimizeNavRail),
    });

    const actions = {
        setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => {
            state.breadcrumbs = breadcrumbs;
        },
        setId: (id?: string) => {
            state.id = id;
        },
        setSelectedItem: (item: Breadcrumb) => {
            state.selectedItem = item;
        },
        setFavoriteItemId: (favoriteItem?: FavoriteOptions) => {
            state.favoriteItem = favoriteItem;
        },
        fetchNavRailStatus: async () => {
            try {
                const response = await SpaceConnector.clientV2.config.userConfig.get<UserConfigGetParameters, UserConfigModel>({
                    name: 'console:gnb:navRail',
                });
                state.isMinimizeNavRail = response.data.isMinimizeNavRail;
                state.isHideNavRail = response.data.isHideNavRail;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.isMinimizeNavRail = undefined;
                state.isHideNavRail = undefined;
            }
        },
        createMinimizeNavRail: async (isMinimizeNavRail?: boolean) => {
            state.isMinimizeNavRail = isMinimizeNavRail;
            try {
                await SpaceConnector.clientV2.config.userConfig.set({
                    name: 'console:gnb:navRail',
                    data: { isMinimizeNavRail },
                });
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
        createHideNavRail: async (isHideNavRail?: boolean) => {
            state.isHideNavRail = isHideNavRail;
            try {
                await SpaceConnector.clientV2.config.userConfig.set({
                    name: 'console:gnb:navRail',
                    data: { isHideNavRail },
                });
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
        fetchCostQuerySet: async () => {
            const costQuerySetPromiseResults = await Promise.allSettled(
                Object.keys(_getters.costDataSource).map(async (dataSourceId) => {
                    try {
                        const res = await SpaceConnector.clientV2.costAnalysis.costQuerySet.list<CostQuerySetListParameters, ListResponse<CostQuerySetModel>>({
                            data_source_id: dataSourceId,
                            query: {
                                filter: [
                                    { k: 'user_id', v: store.state.user.userId, o: 'eq' },
                                    { k: 'workspace_id', v: _getters.currentWorkspaceId, o: 'eq' },
                                ],
                                only: ['cost_query_set_id', 'data_source_id', 'name'],
                            },
                        });
                        return res.results ?? [];
                    } catch (e) {
                        ErrorHandler.handleError(e);
                        return [];
                    }
                }),
            );
            const costQuerySets: CostQuerySetModel[] = [];
            costQuerySetPromiseResults.forEach((res) => {
                if (res.status === 'fulfilled' && res.value.length) {
                    res.value.forEach((item) => {
                        costQuerySets.push(item);
                    });
                }
            });
            state.costQuerySets = costQuerySets;
        },
        initState: () => {
            state.breadcrumbs = [];
            state.selectedItem = {} as Breadcrumb;
            state.id = '';
            state.favoriteItem = {} as FavoriteOptions;
        },
    };

    return {
        state,
        getters,
        ...actions,
    };
});
