import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yamljs';
import * as path from "path";

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// OpenAPI Specification
const swaggerDocument = yaml.load('./openapi.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Sample data
let items = [];
let idCounter = 1;

app.get('/openapi.yaml', (req, res) => {
    res.sendFile(path.join(__dirname, './openapi.yaml'));
});

// 1. Create an item
app.post('/api/items', (req, res) => {
    const { name, description } = req.body;
    const newItem = { id: idCounter++, name, description };
    items.push(newItem);
    res.status(201).json(newItem);
});

// 2. Get all items
app.get('/api/items', (req, res) => {
    res.json(items);
});

// 3. Get a single item by ID
app.get('/api/items/:id', (req, res) => {
    const { id } = req.params;
    const item = items.find((item) => item.id === parseInt(id));
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
});

// 4. Update an item by ID
app.put('/api/items/:id', (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    const itemIndex = items.findIndex((item) => item.id === parseInt(id));
    if (itemIndex === -1) return res.status(404).json({ message: 'Item not found' });

    items[itemIndex] = { ...items[itemIndex], name, description };
    res.json(items[itemIndex]);
});

// 5. Delete an item by ID
app.delete('/api/items/:id', (req, res) => {
    const { id } = req.params;
    const itemIndex = items.findIndex((item) => item.id === parseInt(id));
    if (itemIndex === -1) return res.status(404).json({ message: 'Item not found' });

    items.splice(itemIndex, 1);
    res.status(204).send();
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`API docs available at http://localhost:${PORT}/api-docs`);
});
