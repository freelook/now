import _ from 'lodash';
import React from 'react';
import { NextPageContext } from 'next';
import { useAmp } from 'next/amp';
import { useRouter } from 'next/router';
import { Segment, Icon, Table, Image, List, Button } from 'semantic-ui-react';
import {IndexContext, useIndexProps} from 'functions';
import Layout from 'components/layout';
import Nav, {PATH} from 'components/nav';
import Footer from 'components/footer';
import Input from 'components/input';
import * as locale from 'hooks/locale';
import * as route from 'hooks/route';
import * as render from 'hooks/render';
import { useWebtask, AMZN_TASK } from 'hooks/webtask';
import { IItem, ECOM_ADD_TO_CART, ECOM_CACHE, ECOM_LOCALES, ECOM_SCHEMA, ECOM_SCHEMA_OFFER, renderNodes, renderItems } from 'functions/ecom';

export const config = { amp: 'hybrid' };

interface EcommerceItemContext extends IndexContext {
    asin: string;
    deal?: string;
    slug?: string;
    item: {ItemsResult: {Items: [IItem]}};
    variations: {VariationsResult: {Items: IItem[]}};
}

const EcommerceItem = (ctx:EcommerceItemContext) => {
  const isAmp = useAmp();
  const important = render.important(isAmp);
  const router = useRouter();
  const item = _.get(ctx.item, 'ItemsResult.Items[0]', {});
  const nodes = _.get(item, 'BrowseNodeInfo.BrowseNodes', []);
  const variations = _.get(ctx.variations, 'VariationsResult.Items', []);
  const titlePrefix = _.get(ctx, 't.Ecom', 'Ecom');
  const itemTitle = _.get(item, 'ItemInfo.Title.DisplayValue', '');
  const itemPrice = _.get(item, 'Offers.Listings[0].Price.DisplayAmount', '');
  const itemFeatures = _.get(item, 'ItemInfo.Features.DisplayValues', []);
  const itemDp = _.get(item, 'DetailPageURL', '');
  const slug = ctx.slug || itemTitle;
  const title = slug? titlePrefix.concat(`: ${slug}`): titlePrefix;
  const description = slug;
  const image = _.get(item, 'Images.Primary.Large.URL', '');
  const asin = _.get(ctx, 'asin', '');
  const deal = _.get(ctx, 'deal', '');
  const tag = (itemDp.match(/tag=(.*?)&/) || [])[1];

  return (
    <Layout head={{title, description, image}}>
        <Nav {...{ctx}} />

        <Segment>
            <Input {...{ctx}} pathname={PATH.ECOM}/>
        </Segment>

        <Segment itemProp="keywords">
            {renderNodes(router, PATH.ECOM)(nodes)}
        </Segment>

        <Segment className="ecom-item" itemScope itemType={ECOM_SCHEMA}>
            <Table color={render.useRandomColor(itemTitle.length)}><Table.Body>
                <Table.Row>
                    <Table.Cell rowSpan={2} textAlign='center'>
                    <Nav.External link={itemDp}>
                    {!isAmp ? <Image itemProp="image" wrapped src={image} alt={itemTitle} /> :                                 
                    <div className='amp-container'>
                        <amp-img itemProp="image" className='contain' alt={itemTitle} src={image} layout='fill' />
                    </div>}
                    </Nav.External>
                    </Table.Cell>
                    <Table.Cell>
                        <Nav.External link={itemDp}>
                            <h3 {...{itemProp:'name'}}>
                                {itemTitle}
                                {' '}
                                <Icon color='teal' circular name="external alternate"/>
                            </h3>
                        </Nav.External>
                    </Table.Cell>
                </Table.Row>
                <Table.Row>
                    <Table.Cell textAlign='right' itemProp="offers" itemScope itemType={ECOM_SCHEMA_OFFER}>
                        <Nav.External link={`${ECOM_ADD_TO_CART}?ASIN.1=${asin}&Quantity.1=1&AssociateTag=${tag}`}><Button positive>
                            {_.get(ctx, 't.AddToCart', 'Add to Cart')}
                        </Button></Nav.External>
                        <span itemProp="price">{itemPrice} {deal && +deal > 0 ? <span className="ui red tag label" itemProp="discount">-{deal}%</span> : null}</span>
                    </Table.Cell>
                </Table.Row>
                {itemFeatures.length > 0 ?
                <Table.Row>
                    <Table.Cell colSpan={2}><List bulleted itemProp="description">
                        {_.map(itemFeatures, (f: string, i) => (
                            <List.Item key={`feature-${i}`}>{f}</List.Item>
                        ))}
                        <List.Item><sup>*</sup> The price is valid only for active Deals</List.Item>
                    </List></Table.Cell>
                </Table.Row> : null} 
            </Table.Body></Table>
        </Segment>

       {renderItems(variations)}

        <Footer {...{ctx}} media={image} url={itemDp} />

        <style jsx global>{`
            .ecom-item img {
                max-width: 100% ${important};
            }
        `}</style>
    </Layout>
  );
};

EcommerceItem.getInitialProps = async (ctx:NextPageContext) => {
  const query = route.query(ctx);
  const input = _.get(query, 'input');
  const asin = _.get(query, 'asin', '');
  const deal = _.get(query, 'deal', '');
  const slug = _.get(query, 'seo', '');
  const indexProps = await useIndexProps(ctx);
  const lang = ECOM_LOCALES[indexProps.locale] || ECOM_LOCALES[locale.EN];
  const itemTask = useWebtask(ctx)({
        taskName: AMZN_TASK,
        taskPath: 'us/paapi/v5/getItems',
        body: {
            LanguagesOfPreference: [lang],
            ItemIds: [asin],
            Resources: [
                "Images.Primary.Large", "ItemInfo.Title", "Offers.Listings.Price",
                "BrowseNodeInfo.BrowseNodes", "ItemInfo.Features"
            ]
        },
        cache: ECOM_CACHE
  });
  const variationsTask = useWebtask(ctx)({
        taskName: AMZN_TASK,
        taskPath: 'us/paapi/v5/getVariations',
        body: {
            LanguagesOfPreference: [lang],
            VariationPage: 1,
            ASIN: asin,
            Resources:["Images.Primary.Large", "ItemInfo.Title", "Offers.Listings.Price"]
        },
        cache: ECOM_CACHE
  });
  return {
      name: 'EcommerceItem',
      ...indexProps,
      asin: asin,
      deal: deal,
      slug: slug,
      item: await itemTask || {},
      variations: await variationsTask || {}
  };
};

export default EcommerceItem;
