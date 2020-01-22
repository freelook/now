import _ from 'lodash';
import React from 'react';
import { NextPageContext } from 'next';
import { Segment } from 'semantic-ui-react';
import {IndexContext, useIndexProps} from 'pages';
import Layout from 'components/layout';
import Nav from 'components/nav';
import Footer from 'components/footer';
import Input, {useInput} from 'components/input';
import * as locale from 'hooks/locale';

export const ECOM_LOCALES = [locale.EN, locale.ES];

interface EcommerceContext extends IndexContext {}

const Ecommerce = (ctx:EcommerceContext) => {
  const input = useInput(); 

  return (
    <Layout head={{title: _.get(ctx, 't.ecommerce', 'E-commerce'), description: '', url: '', ogImage: ''}}>
        <Nav {...{ctx}} />

        <Segment>
            <Input {...{ctx}} />
        </Segment>

        <Segment>
            {input}
        </Segment>

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
