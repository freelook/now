import _ from 'lodash';
import React from 'react';
import { NextPageContext } from 'next';
import Layout from '../../components/layout';
import Nav from '../../components/nav';

interface EcommerceContext extends NextPageContext {}

const Ecommerce = (ctx:EcommerceContext) => {
  return (
    <Layout head={{title: 'E-commerce', description: '', url: '', ogImage: ''}}>
        <Nav />

        <span>Ecommerce</span>

    </Layout>
  );
};

Ecommerce.getInitialProps = (ctx:NextPageContext) => {
  return {
      query: _.get(ctx, 'query', {})
  };
};

export default Ecommerce;
