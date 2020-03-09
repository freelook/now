import _ from 'lodash';
import React from 'react';
import { Segment } from 'semantic-ui-react';
import dynamic from 'next/dynamic';
import { IndexContext } from 'pages';
import * as rs from 'react-share';

const providers = {
  facebook: {component: rs.FacebookShareButton, icon: rs.FacebookIcon},
  twitter: {component: rs.TwitterShareButton, icon: rs.TwitterIcon},
  linkedin: {component: rs.LinkedinShareButton, icon: rs.LinkedinIcon},
  pinterest: {component: rs.PinterestShareButton, icon: rs.PinterestIcon},
  reddit: {component: rs.RedditShareButton, icon: rs.RedditIcon},
  telegram: {component: rs.TelegramShareButton, icon: rs.TelegramIcon},
  tumblr: {component: rs.TumblrShareButton, icon: rs.TumblrIcon},
  vk: {component: rs.VKShareButton, icon: rs.VKIcon},
  email: {component: rs.EmailShareButton, icon: rs.EmailIcon}
};

interface ShareProps {
    ctx: IndexContext;
}

const Share = (props:ShareProps) => {
    return (
        <Segment textAlign='center'>
            {_.map(providers, (v, k) => {
                const href = window.location.href;
                return <v.component key={k} 
                    url={href} 
                    media={href} 
                    title={k} 
                    style={{margin: '0 1px'}}>
                    <v.icon size={30} round />
                </v.component>;
            })}
        </Segment>
    );
};

export default dynamic(() => Promise.resolve(Share), {ssr: false});
