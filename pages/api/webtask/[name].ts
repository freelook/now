import _ from 'lodash';
import fetch from 'unfetch';
import { NextApiRequest, NextApiResponse } from 'next';
import { webtask } from 'hooks/webtask';

export default async (req:NextApiRequest, res:NextApiResponse) => {
    const taskName = _.get(req, 'query.name');
    const body = _.get(req, 'body', {});
    const cache = _.get(req, 'query.cache'); 
    res.json(await webtask({taskName, body, cache}));
};
