import _ from 'lodash';
import { NextPageContext } from 'next';
import * as render from 'hooks/render';
import * as request from 'hooks/request';

export const RSS_TASK = 'rss';
export const AMZN_TASK = 'amazon';
export const ALLOWED_TASKS = [RSS_TASK, AMZN_TASK];

const COMMON_ERROR = 'Wrong request';

export interface IWebTaskProps {
    taskName: string;
    body: Object;
    taskPath?: string;
    cache?: boolean|string /* time in seconds */;
}

export const webtask = async (props: IWebTaskProps) => {
    const {taskName, body} = props;
    const taskPath = _.get(props, 'taskPath', '');
    const cache = _.get(props, 'cache', false);
    const {WEBTASK_ENDPOINT, WEBTASK_TOKEN} = process.env;
    const tasksSet = new Set(ALLOWED_TASKS);

    if(!tasksSet.has(taskName)) {
        return {error: `Task with name ${taskName} not supported.`};
    }

    try {
        let url = `${WEBTASK_ENDPOINT}/${taskName}-function/${taskPath}?token=${WEBTASK_TOKEN}`;
        if(cache) {
            return await request.post(
                `${WEBTASK_ENDPOINT}/cache-function/?token=${WEBTASK_TOKEN}`,
                {
                    method: request.HTTP.post,
                    url: url,
                    json: body
                }
            );
        }
        return await request.post(url, body);
    } catch(e) {
        return { error: COMMON_ERROR};
    }
};

export const useWebtask = (ctx:render.RenderContext) => async (props: IWebTaskProps) => {
    let w = {} as any;
    try {
        if(render.isSSR(ctx)) {
            w = await webtask(props);
        } else {
            try {
                const {taskName, body} = props;
                const cache = _.get(props, 'cache', false);
                const taskPath = _.get(props, 'taskPath', '');
                w = await request.post(`/api/webtask/${taskName}?cache=${cache}&taskPath=${taskPath}`, body);
            } catch(e) {
                w = { error: COMMON_ERROR};
            }
        }
    } finally {
        return w;
    }
};