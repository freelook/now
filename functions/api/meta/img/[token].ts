import _ from 'lodash';
import { NextApiRequest, NextApiResponse } from 'next';
import { webtask, META_TASK } from 'hooks/webtask';
import * as route from 'hooks/route';

export default async (req:NextApiRequest, res:NextApiResponse) => {
    const token = _.get(req, 'query.token');
    if(!token) {
        return res.status(400).end();
    }
    let meta = {};
    try {
        const url = route.decode(token);
        meta = await webtask({
            taskName: META_TASK, 
            body: { url },
            cache: true
        });
        const image = _.get(meta, 'og:image', _.get(meta, 'twitter:image', _.get(meta, 'icon')));
        if(!image) {
            return res.status(404).end();
        }
        route.redirect({req, res}).to(image);
    } catch(e) {
        res.status(500).end();
    }
}
