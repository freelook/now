import _ from 'lodash';
import Link, {LinkProps as LP} from 'next/link';

export type LinkProps = LP;

export default (props:LinkProps&any) => {
    const as = props.as || props.href || '';
    const query = as.split('?')[1];
    const prefetch = false;
    let href = props.href || '';
    if(href.split('?')[0] !== '/') {
      href = '/[...path]' + (query ? `?${query}` : '');
    }
    return <Link {...{as, href, prefetch}}>{props.children}</Link>;
};
