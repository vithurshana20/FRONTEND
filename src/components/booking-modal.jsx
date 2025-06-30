// const BookingModal = ({ isOpen, onClose, slots, court, onConfirm }) => {
//   if (!isOpen || !court) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white p-6 rounded w-full max-w-md text-[#063434]">
//         <h3 className="text-xl font-bold mb-4">Select Slot for {court.name}</h3>
//         <ul>
//           {slots.map((slot, i) => (
//             <li key={i} className="flex justify-between items-center mb-2">
//               <span>{slot.start} - {slot.end}</span>
//               <button
//                 onClick={() => onConfirm(slot)}
//                 className="px-3 py-1 bg-[#063434] text-white rounded"
//               >
//                 Book
//               </button>
//             </li>
//           ))}
//         </ul>
//         <button onClick={onClose} className="mt-4 text-sm underline">Close</button>
//       </div>
//     </div>
//   );
// };

// export default BookingModal;
