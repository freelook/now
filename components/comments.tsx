import _ from 'lodash';
import React from 'react';
import { Segment } from 'semantic-ui-react';
import dynamic from 'next/dynamic';
import { IndexContext } from 'functions';

interface CommentsProps {
    ctx: IndexContext;
}

const Comments = (props:CommentsProps) => {

    React.useEffect(() => {
        const w = window as any;
        if(w.FB) {
            try {
                w.FB.XFBML.parse();
            } finally{}
        }
    }, []);

    return (
        <Segment textAlign='center'>
            <div className="fb-comments" data-href={window.location.href} data-numposts="7" data-width="100%" style={{minWidth: '100%'}} />   
        </Segment>
    );
};

export default dynamic(() => Promise.resolve(Comments), {ssr: false});
