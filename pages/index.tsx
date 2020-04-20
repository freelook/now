import React from 'react';
import _ from 'lodash';
import * as route from 'hooks/route';

import Trends from 'functions';

const routes = {
    '/': Trends
};

export const config = { amp: 'hybrid' };

const All = (_ctx:any) => {
    const [func, ctx] = route.resolve(_ctx)(routes);
    return func(ctx);
};

All.getInitialProps = (_ctx:any) => {
    const [func, ctx] = route.resolve(_ctx)(routes);
    return _.isFunction(func.getInitialProps) ? func.getInitialProps(ctx) : {};
};

export default All;
