const pino = require('pino')

const loggerDesarrollo = pino({ level: 'debug' })

const loggerProduccion = pino({ level: 'warn' },pino.destination('./warn.log'),{ level: 'error' },pino.destination('./error.log'));

const logger = process.env.NODE_ENV === 'PROD' ? loggerProduccion : loggerDesarrollo;

module.exports = logger;