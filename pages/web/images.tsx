import Web from 'pages/web';

const type = 'image';
const Images = (ctx:any) => Web(ctx);
Images.type = type;
Images.getInitialProps = async (ctx:any) => {
    return Web.getInitialProps({type, ...ctx});  
}

export default Images;
