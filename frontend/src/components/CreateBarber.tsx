import React, { useState } from 'react';
import { barberApi } from '../services/api';

interface CreateBarberProps {
  onSuccess: () => void;
}

const CreateBarber: React.FC<CreateBarberProps> = ({ onSuccess }) => {
  const [name, setName] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Name is required');
      return;
    }

    try {
      setLoading(true);
      await barberApi.create({
        name: name.trim(),
        specialties: specialties.split(',').map(s => s.trim()).filter(s => s),
        rating,
      });
      
      // Reset form
      setName('');
      setSpecialties('');
      setRating(5);
      
      onSuccess();
    } catch (err: any) {
      alert('Failed to create barber: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2>Create New Barber</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
        <div>
          <label>
            Name:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </label>
        </div>
        
        <div>
          <label>
            Specialties (comma-separated):
            <input
              type="text"
              value={specialties}
              onChange={(e) => setSpecialties(e.target.value)}
              placeholder="Haircut, Beard Trim, Shaving"
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </label>
        </div>
        
        <div>
          <label>
            Rating:
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={rating}
              onChange={(e) => setRating(parseFloat(e.target.value))}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </label>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '0.75rem',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
          }}
        >
          {loading ? 'Creating...' : 'Create Barber'}
        </button>
      </form>
    </div>
  );
};

export default CreateBarber;
