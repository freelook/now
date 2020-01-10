import { NextPageContext } from 'next';

export const isSSR = (ctx: NextPageContext) => {
    return ctx && ctx.req;
};