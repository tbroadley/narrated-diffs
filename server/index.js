import Hapi from '@hapi/hapi';
import fetch from 'node-fetch'
import pg from 'pg'; 
import { v4 as uuidv4 } from 'uuid';

const pool = new pg.Pool()

const init = async () => {
    const server = Hapi.server({
        port: 3500,
        host: 'localhost',
        routes: { cors: true },
    });

    server.route({
      method: 'GET',
      path: '/github-diff',
      handler: async (request, h) => {
          // FIXME add validation to only fetch diffs, e.g. it has to end with .diff
          const response = await fetch(request.query.url);
          return h.response(await response.text()).type('text/plain');
      }
    });

    server.route({
        method: 'GET',
        path: '/diffs/{id}',
        handler: async (request, h) => {
            const { id } = request.params;

            const response = await pool.query(
                'SELECT * FROM diffs WHERE id = $1',
                [id]
            )
            if (response.rowCount === 0) {
                return h.response().code(404);
            }

            const { diff } = response.rows[0];
            return { id, diff: JSON.parse(diff) };
        }
    })

    server.route({
        method: 'POST',
        path: '/diffs',
        handler: async (request, h) => {
            const diff = request.payload.diff;
            const id = uuidv4();

            await pool.query(
                'INSERT INTO diffs (id, diff) VALUES ($1, $2)',
                [id, JSON.stringify(diff)]
            )
            return { id, diff };
        }
    })

    server.route({
        method: 'PATCH',
        path: '/diffs/{id}',
        handler: async (request, h) => {
            const { id, diff } = request.payload;

            const response = await pool.query(
                'UPDATE diffs SET diff = $1 WHERE id = $2',
                [JSON.stringify(diff), id]
            )
            return { id, diff };
        }
    })

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();