# 🚀 Beginner's Guide to Swagger Implementation

This guide explains how API documentation (Swagger/OpenAPI) is implemented in this project.

## 1. Core Packages
We use two main packages:
- **`swagger-ui-express`**: Serves the Swagger UI (the web page you see at `/api-docs`).
- **`swagger-jsdoc`**: Automatically generates the API specification by reading specific comments (JSDoc) in your code.

---

## 2. The Configuration File
The base setup is located in [swagger-config.js](file:///Users/aradhyagarg/Downloads/airline/src/config/swagger-config.js).

### Key Sections:
- **`definition`**: Contains general info about your API (title, version, servers).
- **`components/schemas`**: This is where we define reusable "blueprints" for your data (like what a `SuccessResponse` looks like).
- **`apis`**: An array of paths where the library should look for documentation comments.
    > [!TIP]
    > We use `path.join(__dirname, ...)` to ensure the paths always work correctly, even if you start the server from different folders.

---

## 3. Documenting Your Routes
To add a route to Swagger, you add a special comment starting with `/** @swagger` in your route file.

### Example: Documenting a GET Route
In [airplane-routes.js](file:///Users/aradhyagarg/Downloads/airline/src/routes/v1/airplane-routes.js):

```javascript
/**
 * @swagger
 * /airplanes:
 *   get:
 *     summary: Returns the list of all airplanes
 *     tags: [Airplanes]
 *     responses:
 *       200:
 *         description: Successfully fetched all airplanes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.get("/", AirplaneController.getAirplanes);
```

### Breakdown:
- **`/airplanes`**: The URL path.
- **`get`**: The HTTP method.
- **`summary`**: A short description.
- **`tags`**: Groups routes together in the UI.
- **`responses`**: What the user should expect back.
- **`$ref`**: Points to a reusable schema defined in the configuration or elsewhere.

---

## 4. Defining Data Schemas
You can define what an object (like a City or Airplane) looks like so you don't have to repeat the same details everywhere.

```yaml
/**
 * @swagger
 * components:
 *   schemas:
 *     City:
 *       type: object
 *       required: [name]
 *       properties:
 *         id: { type: integer }
 *         name: { type: string }
 *       example:
 *         id: 1
 *         name: Bengaluru
 */
```

---

## 5. Serving the UI
Finally, we tell Express to serve this documentation in [src/index.js](file:///Users/aradhyagarg/Downloads/airline/src/index.js):

```javascript
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger-config');

// Accessible at http://localhost:3000/api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

---

## How to add a new route?
1. Create your route in the route file.
2. Add the `/** @swagger ... */` block above the route.
3. Refresh `http://localhost:3000/api-docs` to see the changes immediately!
