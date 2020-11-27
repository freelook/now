import _ from 'lodash';
import { NextApiRequest, NextApiResponse } from 'next';
import { webtask, DEALS_TASK } from 'hooks/webtask';
import { encodeHTML } from 'hooks/render';

export default async (req:NextApiRequest, res:NextApiResponse) => {
    try {
        const deals = await webtask({
            taskName: DEALS_TASK,
            taskPath: 'US/today',
            body: {},
            cache: true
        });
        const products = deals.map((deal: Object) => {
            const payload = _.get(deal, 'payload', {});
            const product = `<item>
                <g:id>${_.get(payload, 'asin', '')}</g:id>
                <title>Deal: ${_.get(payload, 'asin', '')}</title>
                <description>${encodeHTML(_.get(payload, 'promoText', _.get(payload, 'promoDescription', '')))}</description>
                <g:image_link>${_.get(payload, 'promoImg', '').replace(/&/g, "&amp;")}</g:image_link>
                <g:availability>${'in stock'}</g:availability>
                <g:price>${_.get(payload, 'promoDealPrice', _.get(payload, 'promoListPrice', ''))} USD</g:price>
                <g:brand>${'amzn'}</g:brand>
                <g:condition>${'new'}</g:condition>
                <link>https://freelook-now.herokuapp.com/ecom/it/${_.get(payload, 'asin', '')}?deal=${_.get(payload, 'promoDiscount', '')}</link>
            </item>`;
            return product;
        });
        const feed = `<?xml version="1.0" encoding="utf-8"?>
            <rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
            <channel>
                <title>${'Best Deals'}</title>
                <link>${'https://freelook-now.herokuapp.com/ecom/deals'}</link>
                <description>${'Best Deals in United States'}</description>
                ${products.join('\n')}
            </channel>
            </rss>`;
        res.send(feed);
    } catch(e) {
        res.status(500).end();
    }
}
