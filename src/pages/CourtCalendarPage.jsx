import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CalendarGrid from '../components/CalendarGrid';
import Navbar from '../components/Navbar';

const CourtCalendarPage = () => {
  const { id: courtId } = useParams();
  const [token, setToken] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    } else {
      alert('Token not found. Please log in.');
    }
  }, []);

  if (!token) {
    return <div className="text-white p-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen w-full bg-white text-black flex flex-col">
  
  <main className="flex-grow w-full p-25">
    <h2 className="text-2xl font-bold mb-4">Court Calendar</h2>
    <CalendarGrid courtId={courtId} token={token} />
  </main>
</div>

  );
};

export default CourtCalendarPage;
