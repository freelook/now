import _ from 'lodash';
import { NextApiRequest, NextApiResponse } from 'next';
import * as request from 'hooks/request';
import { LIST_ENDPOINT } from './sitemap.xml';

export default async (req:NextApiRequest, res:NextApiResponse) => {

    const keywords = ["deals", "discounts"];
    const list = await request.get(LIST_ENDPOINT);
    const states = _.keys(list);
    const cities:string[] = _.reduce(states, (acc, s) => acc.concat(list[s]), []);
    const places = [...(new Set([...states, ...cities]))];
    const urls:string[] = [];

    keywords.map((k) => {
        places.map((p)=> {
            let seo = (`${k} in ${p}`).replace(/ /mig, '%20');
            urls.push(`
            <url>
                <loc>https://freelook-now.herokuapp.com/ecom/deals/${seo}/</loc>
                <changefreq>hourly</changefreq>
                <priority>1.0</priority>
            </url>
            `);
        });
    });

    const xml:string = `<?xml version="1.0" encoding="UTF-8"?>

    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${urls.join('')}
    </urlset>
    `;

    res.send(xml);
}
