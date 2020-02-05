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
import * as locale from 'hooks/locale';
import { useWebtask, RSS_TASK } from 'hooks/webtask';

export const TRENDS_ENPOINT = 'https://trends.google.com/trends/trendingsearches/daily/rss';
export const TRENDS_LOCALES = {
    [locale.EN]: 'US',
    [locale.ES]: 'MX',
    [locale.DE]: 'DE'
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

interface ITrend {
    title: string;
    description: string;
    summary: string;
    date: string;
    'ht:picture_source': ITrendHash;
    'ht:approx_traffic': ITrendHash;
    'ht:picture': ITrendHash;
    'rss:pubdate': ITrendHash;
}

const fetcher = async (url:string) => {
    return (await fetch(url)).json();
};

const Home = (ctx:HomeContext) => {
  const router = useRouter();
  const { data } = useSWR(`${router.route}api/date`, fetcher);
  const date = _.get(data, 'date', '?');

  return (
    <Layout head={{title: _.get(ctx, 't.Trends', 'Trends'), description: '', url: '', ogImage: ''}}>
        <Nav {...{ctx}} />

        <Segment>
            <Grid<ITrend> className='trends'
                  items={ctx.trends}
                  header={(tr) => _.get(tr, 'title')}
                  meta={(tr) => (<>
                    {_.get(tr, 'ht:picture_source.#')}&nbsp;
                    {_.get(tr, 'ht:approx_traffic.#')}&nbsp;
                    <Icon name='clock outline' title={_.get(tr, 'rss:pubdate.#')} />
                  </>)}
                  image={(tr) => _.get(tr, 'ht:picture.#')}
                  alt={(tr) => _.get(tr, 'title')}
                  description={(tr) => _.get(tr, 'description', _.get(tr, 'summary'))} 
                  extra={(tr) => {
                      const href = `${PATH.ECOM}?input=${_.get(tr, 'title', '')}`;
                      return (<Grid.Extra>
                        <Link href={href}><a><Icon circular name="shopping cart"/></a></Link>
                      </Grid.Extra>);
                  }}/>
        </Segment>   

        <Segment textAlign='center'>{date}</Segment>

        <Footer {...{ctx}} />

        <style jsx global>{`
            .trends .image {
                width: 100%;
                text-align: center;
                margin 7px;
            }
            .trends .image > img {
                max-width: 100px;
            }
        `}</style>
    </Layout>
  );
};

Home.getInitialProps = async (ctx:NextPageContext) => {
    const indexProps = await useIndexProps(ctx);
    const geo = TRENDS_LOCALES[indexProps.locale] || TRENDS_LOCALES[locale.EN];
    return {
      name: 'Home',
      ...indexProps,
      trends: (await useWebtask(ctx)({
        taskName: RSS_TASK, 
        body: {
            rss: `https://trends.google.com/trends/trendingsearches/daily/rss?geo=${geo}`
        },
        cache: true
      })).rss
  };
};

export default Home;
