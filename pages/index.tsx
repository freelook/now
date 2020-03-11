import _ from 'lodash';
import React from 'react';
import fetch from 'unfetch';
import useSWR from 'swr';
import { Segment, Icon } from 'semantic-ui-react';
import { NextPageContext } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from 'components/layout';
import Nav, {PATH} from 'components/nav';
import Footer from 'components/footer';
import Grid from 'components/grid';
import Input from 'components/input';
import * as locale from 'hooks/locale';
import * as route from 'hooks/route';
import { useWebtask, RSS_TASK } from 'hooks/webtask';

export const TRENDS_ENPOINT = 'https://trends.google.com/trends/trendingsearches/daily/rss';
export const TRENDS_LOCALES = {
    [locale.EN]: 'US',
    [locale.ES]: 'ES',
    [locale.DE]: 'DE',
    [locale.FR]: 'FR',
    [locale.IT]: 'IT',
    [locale.PL]: 'PL',
    [locale.UK]: 'UA',
    [locale.RU]: 'RU',
    ['au']: 'AU',
    ['ca']: 'CA',
    ['gb']: 'GB',
    ['mx']: 'MX',
    ['ua']: 'UA'
} as {[key:string]:string};

export interface IndexContext extends NextPageContext {
    locale: string;
    t: {[key:string]: string};
}

export const useIndexProps = async (ctx: NextPageContext) => {
    return {
      locale: locale.useLocale(ctx),
      t: await locale.useTranslation(ctx)
  };
}

interface HomeContext extends IndexContext {
    trends: ITrend[];
}

interface ITrendHash {
    '#': string;
}

interface INewsItem {
    "ht:news_item_url": ITrendHash;
}

interface ITrend {
    title: string;
    description: string;
    summary: string;
    date: string;
    'ht:picture_source': ITrendHash;
    'ht:approx_traffic': ITrendHash;
    'ht:picture': ITrendHash;
    'rss:pubdate': ITrendHash;
    'ht:news_item': INewsItem | INewsItem[]
}

const fetcher = async (url:string) => {
    return (await fetch(url)).json();
};

const Home = (ctx:HomeContext) => {
  const router = useRouter();
  const { data } = useSWR(`${router.route}api/date`, fetcher);
  const date = _.get(data, 'date', '?');
  const title = _.get(ctx, 't.Trends', 'Trends');

  return (
    <Layout head={{title: title, description: title, image: ''}}>
        <Nav {...{ctx}} />

        <Segment>
            <Input {...{ctx}} pathname={PATH.NEWS}/>
        </Segment>

        <Segment>
            <Grid<ITrend> className='trends'
                  items={ctx.trends}
                  header={(tr) => _.get(tr, 'title')}
                  meta={(tr) => (<>
                    {_.get(tr, 'ht:picture_source.#')}&nbsp;
                    {_.get(tr, 'ht:approx_traffic.#')}&nbsp;
                    <Icon name='clock outline' title={_.get(tr, 'rss:pubdate.#')} />
                  </>)}
                  image={(tr) => {
                      const newsItemUrl = _.get(tr, 'ht:news_item.ht:news_item_url.#', _.get(tr, 'ht:news_item[0].ht:news_item_url.#'));
                      return newsItemUrl ? `/api/meta/img/${route.encode(newsItemUrl)}` : _.get(tr, 'ht:picture.#');
                  }}
                  imageAlternate={(tr) => _.get(tr, 'ht:picture.#')}
                  alt={(tr) => _.get(tr, 'title')}
                  link={(tr)=> {
                      const input = _.get(tr, 'title', '');
                      return {href: `${PATH.NEWS}?input=${input}`};
                  }}
                  description={(tr) => _.get(tr, 'description', _.get(tr, 'summary'))} 
                  extra={(tr) => {
                      const web = `${PATH.WEB}/?input=${_.get(tr, 'title', '')}`;
                      const images = `${PATH.WEB}/images?input=${_.get(tr, 'title', '')}`;
                      const ecom = `${PATH.ECOM}?input=${_.get(tr, 'title', '')}`;
                      return (<Grid.Extra>
                        <Link href={web} prefetch={false}><a><Icon circular name="search plus"/></a></Link>
                        <Link href={images} prefetch={false}><a><Icon circular name="images"/></a></Link>
                        <Link href={ecom} prefetch={false}><a><Icon circular name="shopping cart"/></a></Link>
                      </Grid.Extra>);
                  }}/>
        </Segment>   

        <Segment textAlign='center'>{date}</Segment>

        <Footer {...{ctx}} />
    </Layout>
  );
};

Home.getInitialProps = async (ctx:NextPageContext) => {
    const indexProps = await useIndexProps(ctx);
    const geo = TRENDS_LOCALES[locale.getGeo(indexProps.locale)] || TRENDS_LOCALES[locale.getLng(indexProps.locale)] || TRENDS_LOCALES[locale.EN];
    return {
      name: 'Home',
      ...indexProps,
      trends: (await useWebtask(ctx)({
        taskName: RSS_TASK, 
        body: {
            rss: `${TRENDS_ENPOINT}?geo=${geo}`
        },
        cache: true
      }) || {}).rss
  };
};

export default Home;
