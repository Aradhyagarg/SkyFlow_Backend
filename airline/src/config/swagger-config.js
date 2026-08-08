const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'BookMyFlight API',
            version: '1.0.0',
            description: 'API documentation for the Airline Booking System',
        },
        servers: [
            {
                url: 'http://localhost:3000/api/v1',
                description: 'Development server',
            },
        ],
        components: {
            schemas: {
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'Successfully completed the request' },
                        data: { type: 'object' },
                        error: { type: 'object' }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Something went wrong' },
                        data: { type: 'object' },
                        error: { type: 'object' }
                    }
                }
            }
        }
    },
    apis: [
        path.join(__dirname, '../routes/v1/*.js'),
        path.join(__dirname, '../controllers/*.js')
    ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
