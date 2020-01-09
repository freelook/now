import { NextApiRequest, NextApiResponse } from 'next';
import {importTranslation} from 'hooks/locale';

export default async (req:NextApiRequest, res:NextApiResponse) => {
    if (req && res) {
        let t = await importTranslation(req.query.locale as string);
        res.json(t);
    }
}