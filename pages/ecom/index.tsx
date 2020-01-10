import _ from 'lodash';
import React from 'react';
import { NextPageContext } from 'next';
import {IndexContext, getIndexProps} from 'pages';
import Layout from 'components/layout';
import Nav from 'components/nav';
import Footer from 'components/footer';

interface EcommerceContext extends IndexContext {}

const Ecommerce = (ctx:EcommerceContext) => {
  return (
    <Layout head={{title: 'E-commerce', description: '', url: '', ogImage: ''}}>
        <Nav />

        <span>Ecommerce</span>

        <Footer {...{ctx}} />
    </Layout>
  );
};

Ecommerce.getInitialProps = async (ctx:NextPageContext) => {
  return {
      name: 'Ecommerce',
      ... await getIndexProps(ctx)
  };
};

export default Ecommerce;
