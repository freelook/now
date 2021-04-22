import _ from 'lodash';
import React from 'react';
import { NextPageContext } from 'next';
import Link from 'next/link';
import { useAmp } from 'next/amp';
import { useRouter } from 'next/router';
import { Segment, Icon, List } from 'semantic-ui-react';
import {IndexContext, useIndexProps} from 'functions';
import Layout from 'components/layout';
import Nav, {PATH} from 'components/nav';
import Footer from 'components/footer';
import Grid from 'components/grid';
import Input, {useInput} from 'components/input';
import * as route from 'hooks/route';
import * as locale from 'hooks/locale';
import { useWebtask, DEALS_TASK } from 'hooks/webtask';
import { ECOM_CACHE, ECOM_SCHEMA, ECOM_SCHEMA_OFFER } from 'functions/ecom';

export const config = { amp: 'hybrid' };
export const ECOM_LOCALES = {
    default: {
        taskPath: 'US/today',
        currency: '$'
    },
    [locale.DE]: {
        taskPath: 'DE/today',
        currency: '€'
    }
} as {[key:string]:IConfig};

interface IConfig {
        taskPath: string;
        currency: string;
}

interface DealsContext extends IndexContext {
    deals: IDeal[];
    seo?: string;
    geo?: string;
    config: IConfig;
}

export interface IDeal {
    payload: {
        asin: string;
        promoText: string;
        promoImage: string;
        url: string;
        shortUrl?: string;
        promoType?: string;
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
  const geo = _.get(ctx, 'geo' , 'us').toUpperCase();
  const config = _.get(ctx, 'config' , ECOM_LOCALES.default);
  const deals = _.get(ctx, 'deals', []);
  const titlePrefix = _.get(ctx, 't.Deals', 'Deals');
  let title = seo ? titlePrefix.concat(`: ${seo}`): titlePrefix;
  const description = seo || `Best Today Deals - ${geo}`;

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
                      const discount = _.get(d, 'payload.promoDiscount');
                      const promoType = _.get(d, 'payload.promoType', '');
                      return <>
                        {geo === 'US' ? <Link {...{href: `${PATH.ECOM}/it/[asin]?deal=${discount}`, as: `${PATH.ECOM}/it/${asin}?deal=${discount}`}} prefetch={false}><a>{asin}</a></Link> : null}
                        <i className="ui">{promoType}</i>
                      </>;
                  }}
                  alt={(d) => _.get(d, 'payload.promoText')}
                  schema={() => ECOM_SCHEMA}
                  link={(d)=> {
                      const dp = _.get(d, 'payload.shortUrl') || _.get(d, 'payload.url', '');
                      return {href: dp, target: '_blank', rel: 'nofollow'};
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
                        {price ? <span itemProp="price">{config.currency}{price}</span> : null}
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
  const geo = locale.getGeo(indexProps.locale);
  const config = ECOM_LOCALES[geo] || ECOM_LOCALES.default;
  const dealsTask = useWebtask(ctx)({
        taskName: DEALS_TASK,
        taskPath: config.taskPath,
        body: {},
        cache: true
  });
  return {
      name: 'Deals',
      ...indexProps,
      geo: geo,
      seo: seo,
      config: config,
      deals: await dealsTask || [],
  };
};

export default Deals;
