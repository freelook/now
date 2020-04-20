const notFound:any = () => 404;

notFound.getInitialProps = (ctx:any) => {
    if(ctx.res) {
        ctx.res.statusCode = 404;
        ctx.res.end('Not found');
    }
};

export default notFound;