const fastify = require('fastify')({logger: true})
const cors = require('@fastify/cors')

const {v4: uuidv4} = require('uuid')

require('dotenv').config()

fastify.register(cors)

fastify.register(require('@fastify/postgres'), {
  connectionString: process.env.DATABASE_URL,
})

fastify.get('/todos', (req, reply) => {
  fastify.pg.query('SELECT * FROM todos', function onResult(err, result) {
    reply.send(err || result.rows)
  })
})

fastify.get('/todos/:id', (req, reply) => {
  fastify.pg.query(
    'SELECT * FROM todos WHERE id=$1',
    [req.params.id],
    function onResult(err, result) {
      const [todo] = result.rows
      reply.send(err || todo)
    },
  )
})

fastify.post('/todos', (req, reply) => {
  const id = uuidv4()
  fastify.pg.query(
    'INSERT INTO todos (id, completed, title) VALUES ($1, $2, $3) RETURNING *',
    [id, req.body.completed, req.body.title],
    function onResult(err, result) {
      const [todo] = result.rows
      reply.send(err || todo)
    },
  )
})

fastify.listen({port: 3000}, err => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  console.log(`Server listening on ${fastify.server.address().port}`)
})
