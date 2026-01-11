// // Invoices.jsx
// import React, { forwardRef, useEffect, useState } from "react";

// const Invoices = forwardRef(({ paymentId, token }, ref) => {
//   const [invoiceData, setInvoiceData] = useState(null);

//   useEffect(() => {
//     if (paymentId && token) {
//       fetch(`${import.meta.env.VITE_API_BASE_URL}/payments/${paymentId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       })
//         .then((res) => res.json())
//         .then((data) => setInvoiceData(data?.data))
//         .catch(() => setInvoiceData(null));
//     }
//   }, [paymentId, token]);

//   if (!invoiceData) return <p>Loading...</p>;

//   // reusable invoice block
//   const InvoiceBlock = ({ copyType }) => (
//     <div className="w-full border-b border-gray-400 pb-6 mb-6 last:mb-0 last:border-b-0">
//       {/* Header with Logo + Title */}
//       <div className="flex items-center justify-between mb-4">
//         <div className="flex items-center">
//           {/* Replace with your actual logo file */}
//           <img src="/logo.png" alt="School Logo" className="h-16 w-auto mr-4" />
//           <div>
//             <h1 className="text-2xl font-bold">Bright British Center</h1>
//             <p className="text-xl text-gray-700">មជ្ឈមណ្ឌលប្រាយថ៍ប្រ៊ិធីស្ហ</p>
//             {/* <p className="text-sm text-gray-700">{copyType}</p> */}
//           </div>
//         </div>
//         <div className="text-right">
//           <p>
//             <strong>Invoice #:</strong> {invoiceData.payment_id}
//           </p>
//           <p>
//             <strong>Date:</strong>{" "}
//             {new Date(invoiceData.payment_date).toLocaleDateString()}
//           </p>
//         </div>
//       </div>

//       {/* Student Info */}
//       <div className="flex justify-between mb-4">
//         <div>
//           <p>
//             <strong>Student:</strong> {invoiceData.first_name}{" "}
//             {invoiceData.last_name}
//           </p>
//           <p>
//             <strong>Class:</strong> {invoiceData.room_number}
//           </p>
//           <p>
//             <strong>Branch:</strong> {invoiceData.branch_name}
//           </p>
//         </div>
//         <div>
//           <p>
//             <strong>Payment Method:</strong>{" "}
//             {invoiceData.payment_method || "Cash"}
//           </p>
//         </div>
//       </div>

//       {/* Table */}
//       <table className="w-full border border-black border-collapse">
//         <thead>
//           <tr>
//             <th className="border border-black p-2 text-left">Book</th>
//             <th className="border border-black p-2 text-left">
//               Payment Period
//             </th>
//             <th className="border border-black p-2 text-left">Issue Date</th>
//             <th className="border border-black p-2 text-left">Due Date</th>
//             <th className="border border-black p-2 text-right">Amount</th>
//             {/* <th className="border border-black p-2 text-right">Discount</th>
//             <th className="border border-black p-2 text-right">Final</th> */}
//           </tr>
//         </thead>
//         <tbody>
//           <tr>
//             <td className="border border-black p-2">{invoiceData.book}</td>
//             <td className="border border-black p-2 text-left">
//               {invoiceData.payment_period_type}
//             </td>
//             <td className="border border-black p-2 text-left">
//               {new Date(invoiceData.issue_date).toLocaleDateString("en-GB")}
//             </td>
//             <td className="border border-black p-2 text-left">
//               {new Date(invoiceData.due_date).toLocaleDateString("en-GB")}
//             </td>
//             <td className="border border-black p-2 text-right">
//               ${invoiceData.original_amount}
//             </td>
//             {/* <td className="border border-black p-2 text-right">
//               ${invoiceData.discount_amount}
//             </td>
//             <td className="border border-black p-2 text-right">
//               ${invoiceData.original_amount - invoiceData.discount_amount}
//             </td> */}
//           </tr>
//         </tbody>
//       </table>

//       {/* Total */}
//       <div className="flex justify-end mt-4">
//         <h2 className="text-lg font-bold">
//           Subtotal: ${invoiceData.original_amount}
//         </h2>
//       </div>
//       <div className="flex justify-end mt-2">
//         <h2 className="text-lg font-bold">
//           Discount: -${invoiceData.discount_amount}
//         </h2>
//       </div>
//       <div className="flex justify-end mt-2">
//         <h2 className="text-lg font-bold">
//           Total: ${invoiceData.original_amount - invoiceData.discount_amount}
//         </h2>
//       </div>

//       {/* Signatures */}
//       <div className="flex justify-between mt-12">
//         <div>
//           <p className="border-t border-black w-40 text-center pt-2 text-sm">
//             Student Signature
//           </p>
//         </div>
//         <div>
//           <p className="border-t border-black w-40 text-center pt-2 text-sm">
//             Accountant Signature
//           </p>
//         </div>
//       </div>
//       <p className="text-sm text-gray-600 mt-4">
//         Money received is non-refundable and non-transferable.
//         (បង់ប្រាក់រួចហើយមិនអាចដកប្រាក់វិញ ឬផ្ទេរបានទេ)។
//       </p>
//     </div>
//   );

//   return (
//     <div
//       ref={ref}
//       className="w-[800px] bg-white text-black p-8"
//       style={{
//         boxShadow: "none",
//         WebkitPrintColorAdjust: "exact",
//         printColorAdjust: "exact",
//       }}
//     >
//       <InvoiceBlock copyType="Student Copy" />
//       <InvoiceBlock copyType="Accountant Copy" />
//     </div>
//   );
// });

// export default Invoices;

// Invoices.jsx
import React, { forwardRef, useEffect, useState } from "react";

const Invoices = forwardRef(({ paymentId, token }, ref) => {
  const [invoiceData, setInvoiceData] = useState(null);

  useEffect(() => {
    if (paymentId && token) {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setInvoiceData(data?.data))
        .catch(() => setInvoiceData(null));
    }
  }, [paymentId, token]);

  if (!invoiceData) return <p>Loading...</p>;

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate total
  const totalAmount = invoiceData.original_amount - invoiceData.discount_amount;

  return (
    <div
      ref={ref}
      className="w-[210mm] min-h-[297mm] bg-white text-gray-900 p-8 mx-auto"
      style={{
        boxShadow: "none",
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
        pageBreakAfter: "always",
        pageBreakInside: "avoid",
      }}
    >
      {/* Header with Logo and Invoice Title */}
      <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-blue-600">
        <div className="flex items-center">
          {/* Logo placeholder - replace with actual logo */}
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-4">
            BBC
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Bright British Center
            </h1>
            <p className="text-lg text-gray-700 font-medium">
              មជ្ឈមណ្ឌលប្រាយថ៍ប្រ៊ិធីស្ហ
            </p>
            <p className="text-sm text-gray-500">Education Excellence</p>
          </div>
        </div>

        <div className="text-right">
          <h2 className="text-3xl font-bold text-blue-700 mb-2">INVOICE</h2>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="font-semibold">Invoice #:</span>
              <span className="ml-2 font-mono">{invoiceData.payment_id}</span>
            </p>
            <p className="text-sm">
              <span className="font-semibold">Date:</span>
              <span className="ml-2">
                {new Date(invoiceData.payment_date).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }
                )}
              </span>
            </p>
            <p className="text-sm">
              <span className="font-semibold">Status:</span>
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                PAID
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Student and Payment Information in two columns */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Bill To
          </h3>
          <div className="p-3 bg-gray-50 rounded border border-gray-200">
            <p className="text-lg font-semibold text-gray-900 mb-1">
              {invoiceData.first_name} {invoiceData.last_name}
            </p>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Class:</span>{" "}
                {invoiceData.room_number}
              </p>
              <p>
                <span className="font-medium">Branch:</span>{" "}
                {invoiceData.branch_name}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Payment Details
          </h3>
          <div className="p-3 bg-gray-50 rounded border border-gray-200">
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Method:</span>
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-semibold capitalize">
                  {invoiceData.payment_method || "Cash"}
                </span>
              </p>
              <p>
                <span className="font-medium">Period:</span>{" "}
                {invoiceData.payment_period_type}
              </p>
              <p>
                <span className="font-medium">Book:</span> {invoiceData.book}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Items Table */}
      <div className="mb-6">
        <div className="overflow-hidden rounded border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-200">
                  Description
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-200">
                  Payment Period
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-200">
                  Issue Date
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-r border-gray-200">
                  Due Date
                </th>
                <th className="py-3 px-4 text-right font-semibold text-gray-700">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-200">
                <td className="py-3 px-4 border-r border-gray-200">
                  <div className="font-medium">{invoiceData.book}</div>
                  <div className="text-xs text-gray-500">Tuition Fee</div>
                </td>
                <td className="py-3 px-4 border-r border-gray-200">
                  {invoiceData.payment_period_type}
                </td>
                <td className="py-3 px-4 border-r border-gray-200">
                  {new Date(invoiceData.issue_date).toLocaleDateString("en-GB")}
                </td>
                <td className="py-3 px-4 border-r border-gray-200">
                  {new Date(invoiceData.due_date).toLocaleDateString("en-GB")}
                </td>
                <td className="py-3 px-4 text-right font-semibold">
                  ${formatCurrency(invoiceData.original_amount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals Section */}
      <div className="flex justify-end mb-8">
        <div className="w-80">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">
                ${formatCurrency(invoiceData.original_amount)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Discount</span>
              <span className="font-medium text-red-600">
                -${formatCurrency(invoiceData.discount_amount)}
              </span>
            </div>
            <div className="border-t border-gray-300 pt-2 mt-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount</span>
                <span>${formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="mb-6">
        <div className="p-3 bg-yellow-50 border border-yellow-100 rounded text-xs">
          <p className="font-semibold mb-1 text-gray-700">
            Terms & Conditions:
          </p>
          <p className="text-gray-600">
            Money received is non-refundable and non-transferable.
            (បង់ប្រាក់រួចហើយមិនអាចដកប្រាក់វិញ ឬផ្ទេរបានទេ)។
          </p>
        </div>
      </div>

      {/* Signatures and Copies Section */}
      <div className="grid grid-cols-2 gap-6 mt-8 pt-6 border-t border-gray-200">
        {/* Student Copy */}
        <div className="space-y-4">
          <div className="text-center">
            <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded border border-blue-200">
              STUDENT COPY
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <div className="h-10 border-b border-gray-400 mb-1"></div>
              <p className="text-xs text-center text-gray-600">
                Student Signature
              </p>
            </div>
            <div className="text-xs text-gray-500">
              <p>Please keep this copy for your records.</p>
              <p className="mt-1">
                Payment confirmation will be provided upon request.
              </p>
            </div>
          </div>
        </div>

        {/* School Copy */}
        <div className="space-y-4">
          <div className="text-center">
            <div className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded border border-gray-300">
              SCHOOL COPY
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <div className="h-10 border-b border-gray-400 mb-1"></div>
              <p className="text-xs text-center text-gray-600">
                Accountant Signature
              </p>
            </div>
            <div className="text-xs text-gray-500">
              <p>Official receipt for school records.</p>
              <p className="mt-1">Payment received and recorded.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
        <p className="font-medium mb-1">Bright British Center</p>
        <p>
          Phnom Penh, Cambodia • Tel: (012) 345-6789 • Email:
          info@brightbritish.edu.kh
        </p>
        <p className="mt-1">
          This is a computer-generated invoice. No signature required for
          validity.
        </p>
      </div>
    </div>
  );
});

export default Invoices;
