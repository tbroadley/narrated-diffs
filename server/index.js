import Hapi from '@hapi/hapi';
import fetch from 'node-fetch'

const init = async () => {
    const server = Hapi.server({
        port: 3500,
        host: 'localhost'
    });

    server.route({
      method: 'GET',
      path: '/diff',
      handler: async (request, h) => {
          // FIXME add validation to only fetch diffs, e.g. it has to end with .diff
          const response = await fetch(request.query.url);
          return h.response(await response.text()).type('text/plain');
      }
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();