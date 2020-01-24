import _ from 'lodash';
import React from 'react';
import { Input as SemanticInput } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import { IndexContext } from 'pages';
import * as route from 'hooks/route';

interface InputProps {
    ctx: IndexContext;
    set?: (v:any) => void;
}

export const preventDefault = (e:React.SyntheticEvent) => e && e.preventDefault();

export const useInput = () => {
    return _.get(route.query(), 'input', '');
};

const Input = (props:InputProps) => {
    const router = useRouter();
    const input = useInput();
    const [value, setValue] = React.useState(input);
    const pushInput = () => {
        router.push(route.buildUrl(router, {
            query: {input: _.trim(value as string)},
            asObject: true
        }));
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
        </form>
    );
};

export default Input;