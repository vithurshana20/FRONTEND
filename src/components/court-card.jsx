import React from 'react';
import { useNavigate } from 'react-router-dom';

const CourtCard = ({ court }) => {
  const navigate = useNavigate();

  const handleViewAndBook = () => {
    navigate(`/court/${court._id}`);
  };

  const mapLink = court?.contact?.mapLink
    ? court.contact.mapLink
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        court.location
      )}`;

  return (
    <div className="bg-[#063434] p-4 rounded shadow text-white">
      <img
        src={court.images?.[0]}
        alt={court.name}
        className="w-full h-40 object-cover rounded mb-2"
      />
      <h4 className="text-lg font-bold">{court.name}</h4>

      {/* Location with map link */}
      <p className="text-sm">
        <a
          href={mapLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800"
        >
          📍 {court.location}
        </a>
      </p>

      <p className="text-sm">Rs {court.pricePerHour}/hr</p>

      <button
        onClick={handleViewAndBook}
        className="mt-3 px-4 py-2 bg-[#B6FD1F] text-[#063434] rounded font-semibold"
      >
        View & Book
      </button>
    </div>
  );
};

export default CourtCard;
