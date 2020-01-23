import _ from 'lodash';
import React from 'react';
import fetch from 'unfetch';
import useSWR from 'swr';
import { Segment, Grid, Card, Image, Icon } from 'semantic-ui-react';
import { NextPageContext } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from 'components/layout';
import Nav from 'components/nav';
import Footer from 'components/footer';
import * as locale from 'hooks/locale';
import { useWebtask, RSS_TASK } from 'hooks/webtask';
import { useRandomColor } from 'hooks/render';

export const TRENDS_ENPOINT = 'https://trends.google.com/trends/trendingsearches/daily/rss';
export let TRENDS_LOCALES = {} as {[key:string]:string};
TRENDS_LOCALES[locale.EN] = 'US';
TRENDS_LOCALES[locale.ES] = 'MX';
TRENDS_LOCALES[locale.DE] = 'DE';

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
            <Grid centered className='trends'>
                {_.map(ctx.trends, (tr: ITrend, i:number) => <Grid.Column mobile={8} tablet={5} computer={3} key={`trend-${i}`}>   
                    <Card color={useRandomColor(i)}>
                        <Card.Content>
                            <Card.Header>{_.get(tr, 'title')}</Card.Header>
                            <Card.Meta>
                                {_.get(tr, 'ht:picture_source.#')}&nbsp;
                                {_.get(tr, 'ht:approx_traffic.#')}&nbsp;
                                <Icon name='clock outline' title={_.get(tr, 'rss:pubdate.#')} />
                            </Card.Meta>
                            <Image src={_.get(tr, 'ht:picture.#', '/static/no_image.png')} wrapped />
                            <Card.Description>{_.get(tr, 'description', _.get(tr, 'summary'))}</Card.Description>
                        </Card.Content>
                        
                    </Card>
                </Grid.Column>)}
            </Grid>
        </Segment>   

        <Segment textAlign='center'>{date}</Segment>

        <Footer {...{ctx}} />

        <style jsx global>{`
            .trends .image {
                width: 100%;
                text-align: center;
                margin 7px;
            }
            .trends .card {
                width: 100%;
                margin: auto;
            }
            .trends .image > img {
                max-width: 100px;
            }
        `}</style>
    </Layout>
  );
};

Home.getInitialProps = async (ctx:NextPageContext) => {
    let indexProps = await useIndexProps(ctx);
    return {
      name: 'Home',
      ... indexProps,
      trends: (await useWebtask(ctx)({
        taskName: RSS_TASK, 
        body: {
            rss: `https://trends.google.com/trends/trendingsearches/daily/rss?geo=${TRENDS_LOCALES[indexProps.locale]}`
        },
        cache: true
      })).rss
  };
};

export default Home;
