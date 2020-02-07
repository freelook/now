import _ from 'lodash';
import request from 'request';
import atob from 'atob';
import { NextApiRequest, NextApiResponse } from 'next';
import { webtask, META_TASK } from 'hooks/webtask';

export default async (req:NextApiRequest, res:NextApiResponse) => {
    const token = _.get(req, 'query.token');
    if(!token) {
        return res.status(400).end();
    }
    let meta = {};
    try {
        const url = atob(token);
        meta = await webtask({
            taskName: META_TASK, 
            body: { url },
            cache: true
        });
        const image = _.get(meta, 'og:image', _.get(meta, 'twitter:image'));
        if(!image) {
            return res.status(404).end();
        }
        const stream = request.get(image);
        stream.on('error', () => res.send(500)).pipe(res);
        req.on('end', () => {
            stream.destroy();
            res.end();
        });
    } catch(e) {
        res.status(500).end();
    }
}
