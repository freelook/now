import _ from 'lodash';
import React from 'react';
import { NextPageContext } from 'next';
import { Segment } from 'semantic-ui-react';
import {IndexContext, useIndexProps} from 'pages';
import Layout from 'components/layout';
import Nav from 'components/nav';
import Footer from 'components/footer';
import * as locale from 'hooks/locale';

export const ECOM_LOCALES = [locale.EN, locale.ES];

interface EcommerceContext extends IndexContext {}

const Ecommerce = (ctx:EcommerceContext) => {
  return (
    <Layout head={{title: 'E-commerce', description: '', url: '', ogImage: ''}}>
        <Nav {...{ctx}} />

        <Segment></Segment>

        <Footer {...{ctx}} />
    </Layout>
  );
};

Ecommerce.getInitialProps = async (ctx:NextPageContext) => {
  return {
      name: 'Ecommerce',
      ... await useIndexProps(ctx)
  };
};

export default Ecommerce;
