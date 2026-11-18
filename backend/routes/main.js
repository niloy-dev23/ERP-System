const express = require('express')
const router = express.Router()
const apiURL = process.env.API_URL || '/api/v1'
const authRoute = require('./api/authRoute')
const taskRoute = require('./api/taskRoute')
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('../swagger-output.json')

router.use(apiURL, authRoute)
router.use(apiURL, taskRoute)

swaggerDocument.basePath = apiURL
swaggerDocument.securityDefinitions = {
    bearerAuth: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description: 'Enter your bearer token in the format **Bearer &lt;token>**'
    }
}

Object.entries(swaggerDocument.paths).forEach(([path, operations]) => {
    const requiredAuth = path.startsWith('/login') || path.startsWith('/registration') || path.startsWith('/getAll') ? true : false;
    if(requiredAuth) {
        Object.values(operations).forEach((operation) => {
            operation.security = [{ bearerAuth: [] }];
        });
    }
});

router.use('/api-docs', swaggerUi.serve)
router.get('/api-docs', swaggerUi.setup(swaggerDocument))

module.exports = router