import _ from 'lodash';
import React from 'react';
import { NextPageContext } from 'next';
import Link from 'next/link';
import { useAmp } from 'next/amp';
import { useRouter } from 'next/router';
import { Segment, Icon, List } from 'semantic-ui-react';
import {IndexContext, useIndexProps} from 'pages';
import Layout from 'components/layout';
import Nav, {PATH} from 'components/nav';
import Footer from 'components/footer';
import Grid from 'components/grid';
import Input, {useInput} from 'components/input';
import * as route from 'hooks/route';
import { useWebtask, DEALS_TASK } from 'hooks/webtask';
import { ECOM_CACHE, ECOM_SCHEMA, ECOM_SCHEMA_OFFER } from 'pages/ecom';

export const config = { amp: 'hybrid' };

interface DealsContext extends IndexContext {
    deals: IDeal[];
    seo?: string;
}

export interface IDeal {
    payload: {
        asin: string;
        promoText: string;
        promoImage: string;
        url: string;
        shortUrl?: string;
        promoDescription?: string; // html
        promoDealPrice?: string;
        promoListPrice?: string;
        info: {
            labels: string[];
        }
    }
}

const Deals = (ctx:DealsContext) => {
  const isAmp = useAmp();
  const router = useRouter();
  const input = useInput();
  const seo = _.get(ctx, 'seo' , '');
  const deals = _.get(ctx, 'deals', []);
  const titlePrefix = _.get(ctx, 't.Deals', 'Deals');
  let title = seo ? titlePrefix.concat(`: ${seo}`): titlePrefix;
  const description = seo || 'Best Today Deals in US';

  return (
    <Layout head={{title: title, description: description, image: ''}}>
        <Nav {...{ctx}} />

        <Segment>
            <Input {...{ctx}} pathname={PATH.ECOM}/>
        </Segment>

        <Segment>
            <Grid<IDeal> 
                  items={deals} 
                  header={(d) => _.get(d, 'payload.promoText')}
                  image={(d) => _.get(d, 'payload.promoImg')}
                  meta={(d) => {
                      const asin = _.get(d, 'payload.asin', '');
                      return <Link {...{href: `${PATH.ECOM}/it/[asin]`, as: `${PATH.ECOM}/it/${asin}`}} prefetch={false}><a>{asin}</a></Link>;
                  }}
                  alt={(d) => _.get(d, 'payload.promoText')}
                  schema={() => ECOM_SCHEMA}
                  link={(d)=> {
                      const dp = _.get(d, 'payload.shortUrl') || _.get(d, 'payload.url', '');
                      return {href: dp, target: '_blank'};
                  }}
                  description={(d) => {
                    let description = _.get(d, 'payload.promoDescription');
                    let labels = _.get(d, 'payload.info.labels', []);
                    return <div>
                        {description ? <div dangerouslySetInnerHTML={{__html: description}} /> : null}
                        {labels.length > 0 ? <List horizontal>
                            {_.map(labels, (l:string, i) => (<List.Item key={`${l}-${i}`}>
                                <Link href={route.buildUrl(router, {query: {input:l}, pathname: PATH.ECOM })} prefetch={false}><a>#{l}</a></Link>
                            </List.Item>))}
                        </List> : null}
                    </div>;
                  }}
                  extra={(d) => {
                      const discount = _.get(d, 'payload.promoDiscount');
                      const price = _.get(d, 'payload.promoDealPrice') || _.get(d, 'payload.promoListPrice');
                      return (<Grid.Extra><div itemProp="offers" itemScope itemType={ECOM_SCHEMA_OFFER}>
                        {price ? <span itemProp="price">${price}</span> : null}
                        {' '}
                        {discount ? <span className="ui red tag label" itemProp="discount">-{discount}%</span> : null}
                      </div></Grid.Extra>);
                  }} />
        </Segment>

        <Footer {...{ctx}} />
    </Layout>
  );
};

Deals.getInitialProps = async (ctx:NextPageContext) => {
  const query = route.query(ctx);
  const input = _.get(query, 'input');
  const seo =  _.get(query, 'seo', '');
  const indexProps = await useIndexProps(ctx);
  const dealsTask = useWebtask(ctx)({
        taskName: DEALS_TASK,
        taskPath: 'US/today',
        body: {},
        cache: true
  });
  return {
      name: 'Deals',
      ...indexProps,
      seo: seo,
      deals: await dealsTask || [],
  };
};

export default Deals;
