import type { RouteConfig } from 'vue-router';

import { store } from '@/store';

import { ACCESS_LEVEL } from '@/lib/access-control/config';
import { getRedirectRouteByPagePermission } from '@/lib/access-control/redirect-route-helper';
import { MENU_ID } from '@/lib/menu/config';

import { INFO_ROUTE } from '@/services/info/route-config';

const InfoContainer = () => import(/* webpackChunkName: "InfoContainer" */ '@/services/info/InfoContainer.vue');

const NoticePage = () => import(/* webpackChunkName: "NoticePage" */ '@/services/info/notice/NoticePage.vue');
const NoticeDetailPage = () => import(/* webpackChunkName: "NoticeDetailPage" */ '@/services/info/notice/notice-detail/NoticeDetailPage.vue');
const NoticeCreatePage = () => import(/* webpackChunkName: "NoticeCreatePage" */ '@/services/info/notice/notice-create/NoticeCreatePage.vue');
const NoticeUpdatePage = () => import(/* webpackChunkName: "NoticeUpdatePage" */ '@/services/info/notice/notice-update/NoticeUpdatePage.vue');

const infoRoute: RouteConfig = {
    path: 'info',
    name: INFO_ROUTE._NAME,
    meta: { menuId: MENU_ID.INFO },
    redirect: () => getRedirectRouteByPagePermission(MENU_ID.INFO, store.getters['user/pagePermissionMap']),
    component: InfoContainer,
    children: [
        {
            path: 'notice',
            meta: {
                lnbVisible: true,
                menuId: MENU_ID.INFO_NOTICE,
            },
            component: { template: '<router-view />' },
            children: [
                {
                    path: '/',
                    name: INFO_ROUTE.NOTICE._NAME,
                    meta: { lnbVisible: true, accessLevel: ACCESS_LEVEL.VIEW_PERMISSION },
                    component: NoticePage as any,
                },
                {
                    path: 'create',
                    name: INFO_ROUTE.NOTICE.CREATE._NAME,
                    // song-lang
                    meta: { lnbVisible: true, accessLevel: ACCESS_LEVEL.MANAGE_PERMISSION },
                    component: NoticeCreatePage as any,
                },
                {
                    path: 'update',
                    name: INFO_ROUTE.NOTICE.UPDATE._NAME,
                    // song-lang
                    meta: { lnbVisible: true, accessLevel: ACCESS_LEVEL.MANAGE_PERMISSION },
                    component: NoticeUpdatePage as any,
                },
                {
                    path: ':id',
                    name: INFO_ROUTE.NOTICE.DETAIL._NAME,
                    // song-lang
                    meta: {
                        lnbVisible: true, accessLevel: ACCESS_LEVEL.VIEW_PERMISSION, label: ({ params }) => params.id, copiable: true,
                    },
                    component: NoticeDetailPage as any,
                },
            ],
        },
    ],
};

export default infoRoute;
