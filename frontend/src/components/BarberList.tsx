import React, { useEffect, useState } from 'react';
import { barberApi, Barber } from '../services/api';

const BarberList: React.FC = () => {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBarbers();
  }, []);

  const loadBarbers = async () => {
    try {
      setLoading(true);
      const data = await barberApi.getAll();
      setBarbers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load barbers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (barberId: string) => {
    if (window.confirm('Are you sure you want to delete this barber?')) {
      try {
        await barberApi.delete(barberId);
        loadBarbers();
      } catch (err: any) {
        alert('Failed to delete barber: ' + err.message);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div>
      <h2>Barbers</h2>
      {barbers.length === 0 ? (
        <p>No barbers found. Create one to get started!</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {barbers.map((barber) => (
            <div
              key={barber.barberId}
              style={{
                border: '1px solid #ddd',
                padding: '1rem',
                borderRadius: '8px',
              }}
            >
              <h3>{barber.name}</h3>
              <p>Rating: {barber.rating} ⭐</p>
              <p>Specialties: {barber.specialties.join(', ')}</p>
              <button
                onClick={() => handleDelete(barber.barberId)}
                style={{
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BarberList;
