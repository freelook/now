import _ from 'lodash';
import React from 'react';
import { Segment, List } from 'semantic-ui-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supportedLocales, getLocale } from 'hooks/locale';
import { buildUrl } from 'hooks/route';
import { IndexContext } from 'pages';

interface FooterProps {
    ctx: IndexContext;
}

const Footer = (props:FooterProps) => {
    const router = useRouter();
    const currentLocale = props.ctx.locale;
    return (
        <footer>
            <Segment textAlign='center'>
                <List horizontal>
                    {supportedLocales.map((locale) => (<List.Item key={locale}>
                        {locale !== currentLocale ? 
                        <Link href={buildUrl(router, {query: {locale} })}><a>{locale}</a></Link>
                        : <span>{locale}</span>
                    }
                    </List.Item>))}
                </List>
            </Segment>
        </footer>
    );
};

export default Footer;