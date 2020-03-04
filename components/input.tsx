import _ from 'lodash';
import React from 'react';
import { Input as SemanticInput, List } from 'semantic-ui-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { IndexContext } from 'pages';
import * as route from 'hooks/route';

interface InputContext extends IndexContext {
    suggestion?: string[];
}

interface InputProps {
    ctx: InputContext;
    set?: (v:any) => void;
    query?: Object;
    pathname?: string;
    as?: string;
}

export const preventDefault = (e:React.SyntheticEvent) => e && e.preventDefault();

export const useInput = () => {
    return _.get(route.query(), 'input', '');
};

const Input = (props:InputProps) => {
    const router = useRouter();
    const input = useInput();
    const [value, setValue] = React.useState(input);
    const suggestion = _.get(props.ctx, 'suggestion', []).filter(s => !/\/\//.test(s));

    const pushInput = () => {
        const pathname = props.as || props.pathname;
        const url = route.buildUrl(router, {
            query: _.chain({}).assign(props.query, {input: _.trim(value as string)}).value(),
            pathname: pathname,
            asObject: true
        });
        if(props.as && props.pathname) {
            return router.push(props.pathname, url);
        }
        return router.push(url);
    };
    const handleInputChange = (e:React.SyntheticEvent) => {
        preventDefault(e);
        setValue(_.get(e, 'target.value', ''));
    };
    const handleInputSubmit = (e:React.SyntheticEvent) => {
        preventDefault(e);
        pushInput();
    };
    React.useEffect(() => {
        if (_.isFunction(props.set)) { 
            props.set(input);
        }
        setValue(input);
    }, [input]);
    return (
        <form onSubmit={handleInputSubmit}>
            <SemanticInput fluid
                type="text"
                name="input"
                placeholder={_.get(props.ctx, 't.Placeholder', 'Looking for...')}
                value={value} 
                onChange={handleInputChange} />

            {suggestion.length > 0 ? <List horizontal>
                {_.map(suggestion, (s) => (<List.Item key={s}>
                    <Link href={route.buildUrl(router, {query: {input:s} })} prefetch={false}><a>{s}</a></Link>
                </List.Item>))}
            </List> : null}
        </form>
    );
};

export default Input;