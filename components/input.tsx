import _ from 'lodash';
import React from 'react';
import { Input as SemanticInput, List } from 'semantic-ui-react';
import Link from 'components/link';
import { useAmp } from 'next/amp';
import { useRouter } from 'next/router';
import { IndexContext } from 'functions';
import * as route from 'hooks/route';
import * as suggest from 'hooks/suggest';

export const MAX_SUGGESTION_LTH = 101;

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
    const isAmp = useAmp();
    const router = useRouter();
    const input = useInput();
    const [value, setValue] = React.useState(input);
    const suggestion = suggest.filter(_.get(props.ctx, 'suggestion', []), MAX_SUGGESTION_LTH);

    const pushInput = () => {
        const pathname = props.as || props.pathname;
        const query = _.chain({}).assign(props.query, {input: _.trim(value as string)}).value();
        const url = route.buildUrl(router, {
            query: query,
            pathname: pathname,
            asObject: false
        }) as string;
        const urlQuery = url.split('?')[1];
        return router.push(`/[...path]${urlQuery ? `?${urlQuery}`: ''}`, url);
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
        <form { ...(!isAmp ? {onSubmit:handleInputSubmit} : {method:'GET', target:'_top', action:props.pathname || '/'}) } >
            <SemanticInput fluid
                type="text"
                name="input"
                placeholder={_.get(props.ctx, 't.Placeholder', 'Looking for...')}
                value={value}
                className="fli-input"
                onChange={handleInputChange} />

            {suggestion.length > 0 ? <List horizontal itemProp="keywords">
                {_.map(suggestion, (s) => (<List.Item key={s}>
                    <Link href={route.buildUrl(router, {query: {input:s} })} prefetch={false}><a>{s}</a></Link>
                </List.Item>))}
            </List> : null}
        </form>
    );
};

export default Input;