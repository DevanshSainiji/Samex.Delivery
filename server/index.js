const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data', 'shipments.json');

// Helper to read data
const getShipments = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    return [];
  }
};

// Helper to write data
const saveShipments = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing data:', error);
  }
};

// GET /api/shipments - return a list of shipments
app.get('/api/shipments', (req, res) => {
  const shipments = getShipments();
  res.json(shipments);
});

// POST /api/shipments - create a new shipment
app.post('/api/shipments', (req, res) => {
  const { sender, receiver, origin, destination } = req.body;
  
  if (!sender || !receiver || !origin || !destination) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newShipment = {
    id: `SHP-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
    sender,
    receiver,
    origin,
    destination,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  const shipments = getShipments();
  shipments.push(newShipment);
  saveShipments(shipments);

  res.status(201).json(newShipment);
});

const VALID_STATUSES = ['Pending', 'Picked Up', 'In Transit', 'Delivered', 'Cancelled'];

// PATCH /api/shipments/:id/status - update a shipment's status
app.patch('/api/shipments/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const shipments = getShipments();
  const index = shipments.findIndex(s => s.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Shipment not found' });
  }

  shipments[index].status = status;
  saveShipments(shipments);

  res.json(shipments[index]);
});

// GET / - Root health check
app.get('/', (req, res) => {
  res.json({ message: 'Samex.Delivery API is running! Access shipments at /api/shipments' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
