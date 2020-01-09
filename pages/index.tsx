import _ from 'lodash';
import React from 'react';
import fetch from 'unfetch';
import useSWR from 'swr';
import { Segment } from 'semantic-ui-react';
import { NextPageContext } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from 'components/layout';
import Nav from 'components/nav';
import {useLocale, useTranslation} from 'hooks/locale';

export interface IndexContext extends NextPageContext {
    locale: string;
    t: {[key:string]: string};
}

export const getIndexProps = async (ctx: NextPageContext) => {
    return {
      locale: useLocale(ctx),
      t: await useTranslation(ctx)
  };
}

interface HomeContext extends IndexContext {}

const fetcher = async (url:string) => {
    return (await fetch(url)).json();
};

const Home = (ctx:HomeContext) => {
  const router = useRouter();
  const { data } = useSWR('/api/date', fetcher);
  const date = _.get(data, 'date', '?');

  return (
    <Layout head={{title: 'Home', description: '', url: '', ogImage: ''}}>
        <Nav />

        <Segment>
            <Link href='/ecom'><a>Ecom {ctx.t.Deals}</a></Link>
        </Segment>

        <Segment textAlign='center'>{date} - {router.route}</Segment>

        <Segment textAlign='center'>Locale - {ctx.locale}</Segment>
    </Layout>
  );
};

Home.getInitialProps = async (ctx:NextPageContext) => {
  return getIndexProps(ctx);
};

export default Home;
