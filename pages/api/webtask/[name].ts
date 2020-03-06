import _ from 'lodash';
import fetch from 'unfetch';
import { NextApiRequest, NextApiResponse } from 'next';
import { webtask } from 'hooks/webtask';
import {bad} from 'hooks/request';

export const prepare = async (req:NextApiRequest, res:NextApiResponse) => {
    if(bad(req)) {
        return res.status(400).end();
    }
    const taskName = _.get(req, 'query.name');
    const body = _.get(req, 'body', {});
    const cache = _.get(req, 'query.cache');
    const taskPath = _.get(req, 'query.taskPath'); 
    return webtask({taskName, body, cache, taskPath});
}; 

export default async (req:NextApiRequest, res:NextApiResponse) => {
    res.json(await prepare(req, res));
};
