import { NextApiRequest, NextApiResponse } from 'next';
import {importTranslation} from 'hooks/locale';

export default async (req:NextApiRequest, res:NextApiResponse) => {
    let t = await importTranslation(req.query.locale as string);
    res.json(t);
}