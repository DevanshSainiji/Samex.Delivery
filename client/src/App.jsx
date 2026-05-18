import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000/api/shipments';
const VALID_STATUSES = ['Pending', 'Picked Up', 'In Transit', 'Delivered', 'Cancelled'];

const getStatusColor = (status) => {
  switch(status) {
    case 'Pending': return 'var(--status-pending)';
    case 'Picked Up': return 'var(--status-picked)';
    case 'In Transit': return 'var(--status-transit)';
    case 'Delivered': return 'var(--status-delivered)';
    case 'Cancelled': return 'var(--status-cancelled)';
    default: return 'var(--text-main)';
  }
};

const getRowBackgroundColor = (index) => {
  // Start at lightness 27% (#003F88) and increase by 2% per row
  // Cap at 55% so white text remains readable. Reaches cap around row 14.
  const lightness = Math.min(27 + (index * 2), 55);
  return `hsl(212, 100%, ${lightness}%)`;
};

function App() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [formData, setFormData] = useState({
    sender: '', receiver: '', origin: '', destination: ''
  });
  
  // Filter State
  const [filterStatus, setFilterStatus] = useState('');
  const [searchDest, setSearchDest] = useState('');

  const fetchShipments = async () => {
    try {
      const response = await axios.get(API_URL);
      setShipments(response.data);
    } catch (error) {
      console.error('Error fetching shipments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(API_URL, formData);
      setShipments([...shipments, response.data]);
      setFormData({ sender: '', receiver: '', origin: '', destination: '' });
    } catch (error) {
      console.error('Error creating shipment:', error);
      alert('Failed to create shipment. Please ensure all fields are filled.');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      // Optimistic UI update
      setShipments(shipments.map(s => 
        s.id === id ? { ...s, status: newStatus } : s
      ));
      
      await axios.patch(`${API_URL}/${id}/status`, { status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
      // Revert on error by refetching
      fetchShipments();
    }
  };

  const filteredShipments = shipments.filter(s => {
    const matchStatus = filterStatus ? s.status === filterStatus : true;
    const matchDest = searchDest ? s.destination.toLowerCase().includes(searchDest.toLowerCase()) : true;
    return matchStatus && matchDest;
  });

  return (
    <div className="container">
      <header>
        <h1>📦 Samex.Delivery Tracker</h1>
        <p>Manage and track shipments seamlessly.</p>
      </header>

      <section className="card create-card">
        <h3>Create New Shipment</h3>
        <form onSubmit={handleCreate}>
          <div className="form-grid">
            <div className="form-group">
              <label>Sender</label>
              <input required value={formData.sender} onChange={e => setFormData({...formData, sender: e.target.value})} placeholder="e.g. Acme Corp" />
            </div>
            <div className="form-group">
              <label>Receiver</label>
              <input required value={formData.receiver} onChange={e => setFormData({...formData, receiver: e.target.value})} placeholder="e.g. Beta Industries" />
            </div>
            <div className="form-group">
              <label>Origin</label>
              <input required value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} placeholder="City" />
            </div>
            <div className="form-group">
              <label>Destination</label>
              <input required value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} placeholder="City" />
            </div>
          </div>
          <button type="submit">Create Shipment</button>
        </form>
      </section>

      <section>
        <div className="filters">
          <input 
            placeholder="Search by Destination..." 
            value={searchDest}
            onChange={e => setSearchDest(e.target.value)}
          />
          <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)}
            style={filterStatus ? {
              backgroundColor: getStatusColor(filterStatus),
              color: 'white',
              fontWeight: '600'
            } : {}}
          >
            <option value="" style={{backgroundColor: 'white', color: 'black'}}>All Statuses</option>
            {VALID_STATUSES.map(status => (
              <option key={status} value={status} style={{backgroundColor: 'white', color: 'black'}}>{status}</option>
            ))}
          </select>
        </div>

        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          {loading ? (
            <div className="empty-state">Loading shipments...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Sender</th>
                  <th>Receiver</th>
                  <th>Route</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredShipments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-state">No shipments found.</td>
                  </tr>
                ) : (
                  filteredShipments.map((shipment, index) => (
                    <tr key={shipment.id} style={{ backgroundColor: getRowBackgroundColor(index), color: 'white' }}>
                      <td><strong>{shipment.id}</strong></td>
                      <td>{shipment.sender}</td>
                      <td>{shipment.receiver}</td>
                      <td>{shipment.origin} → {shipment.destination}</td>
                      <td>
                        <select 
                          className="status-dropdown"
                          style={{
                            backgroundColor: getStatusColor(shipment.status),
                            color: 'white',
                            border: '2px solid white',
                            borderRadius: '4px',
                            fontWeight: '600',
                            padding: '4px 8px'
                          }}
                          value={shipment.status}
                          onChange={(e) => handleStatusChange(shipment.id, e.target.value)}
                        >
                          {VALID_STATUSES.map(status => (
                            <option key={status} value={status} style={{backgroundColor: 'white', color: 'black'}}>{status}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

export default App;
