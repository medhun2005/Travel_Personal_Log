import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API = 'http://127.0.0.1:5000';

function App() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ email: '', password: '' });
  const [trips, setTrips] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [tripForm, setTripForm] = useState({
    destination: '',
    date: '',
    notes: '',
    image_url: '',
    rating: 3
  });

  const handleLoginChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTripChange = (e) => {
    setTripForm({ ...tripForm, [e.target.name]: e.target.value });
  };

  const login = () => {
    axios.post(`${API}/login`, form)
      .then(res => {
        alert(res.data.message);
        setUser({ id: res.data.user_id, name: res.data.name });
        fetchTrips(res.data.user_id);
      })
      .catch(err => {
        alert(`Login failed: ${err.response?.data?.message || 'Network error'}`);
      });
  };

  const fetchTrips = (userId) => {
    axios.get(`${API}/trips/${userId}`).then(res => setTrips(res.data));
  };

  const submitTrip = () => {
    axios.post(`${API}/trip`, { ...tripForm, user_id: user.id })
      .then(() => {
        fetchTrips(user.id);
        setShowModal(false);
      })
      .catch(() => alert("Failed to add trip: Network Error"));
  };

  const deleteTrip = (tripId) => {
    axios.delete(`${API}/trip/${tripId}`)
      .then(() => fetchTrips(user.id))
      .catch(() => alert("Failed to delete trip"));
  };

  if (!user) {
    return (
      <>
        <div className="hero">
          <div>
            <h1>Track Your Adventures</h1>
            <p>Log travels, rate destinations, and relive memories.</p>
            <button onClick={login}>Start Your Journey</button>
          </div>
        </div>
        <div className="login-container">
          <h2>Login</h2>
          <input name="email" placeholder="Email" onChange={handleLoginChange} />
          <input name="password" type="password" placeholder="Password" onChange={handleLoginChange} />
          <button onClick={login}>Login</button>
        </div>
      </>
    );
  }

  return (
    <div className="dashboard">
      <div className="header">
        <h2>Welcome, {user.name}!</h2>
        <button className="logout" onClick={() => setUser(null)}>Logout</button>
      </div>

      <div className="stats">
        <div className="stat-card"><div>📍</div><h3>{trips.length}</h3><p>Places Visited</p></div>
        <div className="stat-card"><div>📸</div><h3>0</h3><p>Memories Captured</p></div>
        <div className="stat-card"><div>🌍</div><h3>1</h3><p>Countries Explored</p></div>
      </div>

      <div className="section-header">
        <h3>Your Adventures</h3>
        <button onClick={() => setShowModal(true)}>+ Add Trip</button>
      </div>

      <div className="trip-gallery">
        {trips.map((trip) => (
          <div key={trip.id} className="trip-card">
            <button className="delete-btn" onClick={() => deleteTrip(trip.id)}>🗑️</button>
            <img src={trip.image_url} alt={trip.destination} />
            <h3>{trip.destination}</h3>
            <p>{trip.date}</p>
            <p>{trip.notes}</p>
            <p>Rating: ⭐ {trip.rating}</p>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Trip</h2>
              <button onClick={() => setShowModal(false)}>✖</button>
            </div>
            <input name="destination" placeholder="Destination" onChange={handleTripChange} />
            <input name="date" type="date" onChange={handleTripChange} />
            <input name="rating" type="number" min="1" max="5" placeholder="Rating" onChange={handleTripChange} />
            <textarea name="notes" placeholder="Share your experience..." onChange={handleTripChange}></textarea>
            <input name="image_url" placeholder="Image URL" onChange={handleTripChange} />
            <button onClick={submitTrip}>Add Trip</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
