import _ from 'lodash';
import React from 'react';
import { NextPageContext } from 'next';
import { useAmp } from 'next/amp';
import { useRouter } from 'next/router';
import { Segment, Icon, Table, Image, List } from 'semantic-ui-react';
import {IndexContext, useIndexProps} from 'pages';
import Layout from 'components/layout';
import Nav, {PATH} from 'components/nav';
import Footer from 'components/footer';
import Input from 'components/input';
import * as locale from 'hooks/locale';
import * as route from 'hooks/route';
import * as render from 'hooks/render';
import { useWebtask, AMZN_TASK } from 'hooks/webtask';
import { IItem, ECOM_CACHE, ECOM_LOCALES, ECOM_SCHEMA, renderNodes, renderItems } from 'pages/ecom';

export const config = { amp: 'hybrid' };

interface EcommerceItemContext extends IndexContext {
    asin: string;
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
  const slug = _.get(ctx, 'slug', itemTitle);
  const title = slug? titlePrefix.concat(`: ${slug}`): titlePrefix;
  const description = slug;
  const image = _.get(item, 'Images.Primary.Large.URL', '');

  return (
    <Layout head={{title, description, image}}>
        <Nav {...{ctx}} />

        <Segment>
            <Input {...{ctx}} pathname={PATH.ECOM}/>
        </Segment>

        <Segment itemProp="keywords">
            {renderNodes(router)(nodes)}
        </Segment>

        <Segment className="ecom-item" itemScope itemType={ECOM_SCHEMA}>
            <Table color={render.useRandomColor(itemTitle.length)}><Table.Body>
                <Table.Row>
                    <Table.Cell rowSpan={2} textAlign='center'>
                    {!isAmp ? <Image itemProp="image" wrapped src={image} alt={itemTitle} /> :                                 
                    <div className='amp-container'>
                        <amp-img itemProp="image" className='contain' alt={itemTitle} src={image} layout='fill' />
                    </div>}
                    </Table.Cell>
                    <Table.Cell><h3 {...{itemProp:'name'}}>{itemTitle}</h3></Table.Cell>
                </Table.Row>
                <Table.Row>
                    <Table.Cell textAlign='right' itemProp="offers">{!isAmp ? itemPrice : <a href={itemDp}>{itemPrice}</a>} <Nav.External link={itemDp}><Icon color='teal' circular name="external alternate"/></Nav.External></Table.Cell>
                </Table.Row>
                {itemFeatures.length > 0 ?
                <Table.Row>
                    <Table.Cell colSpan={2}><List bulleted itemProp="description">
                        {_.map(itemFeatures, (f: string, i) => (
                            <List.Item key={`feature-${i}`}>{f}</List.Item>
                        ))}
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
      slug: slug,
      item: await itemTask || {},
      variations: await variationsTask || {}
  };
};

export default EcommerceItem;
