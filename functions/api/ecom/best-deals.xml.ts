import _ from 'lodash';
import { NextApiRequest, NextApiResponse } from 'next';
import { webtask, DEALS_TASK } from 'hooks/webtask';
import { encodeHTML } from 'hooks/render';
import { encode } from 'hooks/route';

const baseURL = 'https://freelook-now.herokuapp.com';
const baseLink = `${baseURL}/ecom/deals`;
const configs = {
    default: {
      taskPath: `US/today`,
      title: 'Best Deals',
      link: baseLink,
      deal: 'Deal',
      currency: 'USD',
    },
    DE: {
     taskPath: `DE/today`,
      title: 'Beste Angebote',
      link: `${baseLink}?locale=de.de`,
      deal: 'Angebot',
      currency: 'EUR',
    }
};

export default async (req:NextApiRequest, res:NextApiResponse) => {
    try {
        const geo = (_.get(req.query, 'geo', 'us') as string).toUpperCase();
        const config = _.get(configs, geo, configs.default);
        const deals = await webtask({
            taskName: DEALS_TASK,
            taskPath: config.taskPath,
            body: {},
            cache: true
        });
        const products = deals.map((deal: Object) => {
            const payload = _.get(deal, 'payload', {});
            const product = `<item>
                <g:id>${_.get(payload, 'asin', '')}</g:id>
                <title>${config.deal}: ${_.get(payload, 'asin', '')}</title>
                <description>${encodeHTML(_.get(payload, 'promoText', _.get(payload, 'promoDescription', '')))}</description>
                <g:image_link>${`${baseURL}/api/meta/img/${encode(_.get(payload, 'promoImg', '').replace(/&/g, "&amp;"))}?r=1`}</g:image_link>
                <g:availability>${'in stock'}</g:availability>
                <g:price>${_.get(payload, 'promoDealPrice', _.get(payload, 'promoListPrice', ''))} ${config.currency}</g:price>
                <g:brand>${'amzn'}</g:brand>
                <g:condition>${'new'}</g:condition>
                <link>${geo === 'US' ? 
                    `${baseURL}/ecom/it/${_.get(payload, 'asin', '')}?deal=${_.get(payload, 'promoDiscount', '')}` :
                    encodeHTML(`${baseURL}/meta/${encode(_.get(payload, 'url', ''))}?img=${encode(_.get(payload, 'promoImg', ''))}&r=1`)
                }</link>
            </item>`;
            return product;
        });
        const feed = `<?xml version="1.0" encoding="utf-8"?>
            <rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
            <channel>
                <title>${config.title}</title>
                <link>${config.link}</link>
                <description>${`Best Deals - ${geo}`}</description>
                ${products.join('\n')}
            </channel>
            </rss>`;
        res.send(feed);
    } catch(e) {
        res.status(500).end();
    }
}
