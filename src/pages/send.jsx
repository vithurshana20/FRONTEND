// import React from 'react';
// import { sendApprovalEmail } from '../utils/sendApprovalEmail';

// const ApproveButton = ({ user }) => {
//   const handleApprove = () => {
//     // update status logic here...

//     // then send email
//     sendApprovalEmail(user.email, user.name);
//   };

//   return (
//     <button onClick={handleApprove} className="bg-green-500 text-white px-4 py-2 rounded">
//       Approve
//     </button>
//   );
// };

// export default ApproveButton;

//  export const sendApprovalEmail = (userEmail, userName) => {
//             const templateParams = {
//               user_email: userEmail,
//               user_name: userName,
//             };
          
//             emailjs
//               .send(
//                 'your_service_id',     // e.g., service_xxx
//                 'your_template_id',    // e.g., template_xxx
//                 templateParams,
//                 'your_public_key'      // e.g., l2kKkOxxxxxxxx
//               )
//               .then(
//                 (response) => {
//                   console.log('SUCCESS!', response.status, response.text);
//                 },
//                 (err) => {
//                   console.error('FAILED...', err);
//                 }
//               );
//           };

