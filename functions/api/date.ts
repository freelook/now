import { NextApiRequest, NextApiResponse } from 'next';

export default (req:NextApiRequest, res:NextApiResponse) => {
    const date:string = new Date().toISOString()
        .replace(/T/, ' ')
        .replace(/\..+/, '');

    res.json({ date });
}
