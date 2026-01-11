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

  // Reusable invoice block - compact version
  const InvoiceBlock = ({ copyType }) => (
    <div
      className={`w-full border border-gray-300 rounded p-4 bg-white ${
        copyType === "Student Copy" ? "mb-0" : "mb-4"
      }`}
    >
      {/* Invoice header - Compact */}
      <div className="border-t-2 border-blue-600 pt-3">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <img
              src="/logo.png"
              alt="School Logo"
              className="h-20 w-auto mr-4"
            />
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Bright British Center
              </h1>
              <p className="text-sm text-gray-700">
                មជ្ឈមណ្ឌលប្រាយថ៍ប្រ៊ិធីស្ហ
              </p>
            </div>
          </div>

          <div className="text-right">
            <h2 className="text-lg font-bold text-blue-700 mb-1">INVOICE</h2>
            <div className="space-y-0.5">
              <p className="text-xs text-gray-600">
                <span className="font-semibold">#:</span>
                <span className="ml-1 font-mono text-gray-800">
                  {invoiceData.payment_id}
                </span>
              </p>
              <p className="text-xs text-gray-600">
                <span className="font-semibold">Date:</span>
                <span className="ml-1 text-gray-800">
                  {new Date(invoiceData.payment_date).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }
                  )}
                </span>
              </p>
              {/* <p className="text-xs text-gray-600">
                <span className="font-semibold">Status:</span>
                <span className="ml-1 px-1.5 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded">
                  PAID
                </span>
              </p> */}
            </div>
          </div>
        </div>

        {/* Student and Payment Information - Compact */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 p-2 rounded border border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">
              Bill To
            </h3>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-900">
                {invoiceData.first_name} {invoiceData.last_name}
              </p>
              <div className="text-xs text-gray-700">
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

          <div className="bg-gray-50 p-2 rounded border border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">
              Payment Details
            </h3>
            <div className="space-y-1 text-xs">
              <p className="text-gray-700">
                <span className="font-medium">Method:</span>
                <span className="ml-1 capitalize bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs font-semibold">
                  {invoiceData.payment_method || "Cash"}
                </span>
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Period:</span>{" "}
                {invoiceData.payment_period_type}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Book:</span> {invoiceData.book}
              </p>
            </div>
          </div>
        </div>

        {/* Invoice Table - Compact */}
        <div className="mb-3">
          <div className="overflow-hidden rounded border border-gray-200">
            <table className="w-full text-xs">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-1 px-2 text-left font-semibold text-gray-700 uppercase">
                    Description
                  </th>
                  <th className="py-1 px-2 text-left font-semibold text-gray-700 uppercase">
                    Period
                  </th>
                  <th className="py-1 px-2 text-left font-semibold text-gray-700 uppercase">
                    Issue Date
                  </th>
                  <th className="py-1 px-2 text-left font-semibold text-gray-700 uppercase">
                    Due Date
                  </th>
                  <th className="py-1 px-2 text-right font-semibold text-gray-700 uppercase">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-1 px-2 text-gray-800">
                    <div className="font-medium">{invoiceData.book}</div>
                    <div className="text-gray-500">Tuition Fee</div>
                  </td>
                  <td className="py-1 px-2 text-gray-800">
                    {invoiceData.payment_period_type}
                  </td>
                  <td className="py-1 px-2 text-gray-800">
                    {new Date(invoiceData.issue_date).toLocaleDateString(
                      "en-GB"
                    )}
                  </td>
                  <td className="py-1 px-2 text-gray-800">
                    {new Date(invoiceData.due_date).toLocaleDateString("en-GB")}
                  </td>
                  <td className="py-1 px-2 text-gray-800 text-right font-semibold">
                    ${formatCurrency(invoiceData.original_amount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals Section - Compact */}
          <div className="mt-3 flex justify-end">
            <div className="w-48 space-y-1 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium">
                  ${formatCurrency(invoiceData.original_amount)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Discount</span>
                <span className="font-medium text-red-600">
                  -${formatCurrency(invoiceData.discount_amount)}
                </span>
              </div>
              <div className="border-t border-gray-300 pt-1">
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Total Amount</span>
                  <span>${formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Terms and Conditions - Compact */}
        <div className="border-t border-gray-200 pt-3">
          <p className="text-xs text-gray-600 mb-2">
            <span className="font-semibold">Terms:</span> Non-refundable,
            non-transferable. (បង់ប្រាក់រួចហើយមិនអាចដកប្រាក់វិញ ឬផ្ទេរបានទេ)។
          </p>

          {/* Signatures - Compact */}
          <div className="flex justify-between mt-4 pt-3 border-t border-gray-300">
            <div className="text-center">
              <div className="h-8 border-b border-gray-400 w-32 mx-auto"></div>
              <p className="mt-1 text-xs text-gray-600">Student Signature</p>
            </div>
            <div className="text-center">
              <div className="h-8 border-b border-gray-400 w-32 mx-auto"></div>
              <p className="mt-1 text-xs text-gray-600">Accountant Signature</p>
            </div>
          </div>

          {/* Copy Type - Compact */}
          {/* <div className="mt-3 pt-2 border-t border-gray-200">
            <div className="text-center">
              <span
                className={`inline-block px-3 py-0.5 text-xs font-semibold rounded uppercase ${
                  copyType === "Student Copy"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {copyType}
              </span>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );

  return (
    <div
      ref={ref}
      className="w-[210mm] min-h-[297mm] bg-white text-gray-900 p-5 mx-auto"
      style={{
        boxShadow: "none",
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
        pageBreakAfter: "always",
        pageBreakInside: "avoid",
      }}
    >
      {/* Main title removed to save space */}

      {/* School Copy (Top) */}
      <InvoiceBlock copyType="School Copy" />

      {/* Cutting Guide */}
      <div className="relative my-1">
        <div className="text-center mb-1">
          <span className="text-xs text-gray-400 font-medium">
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          </span>
        </div>
      </div>

      {/* Student Copy (Bottom) */}
      <InvoiceBlock copyType="Student Copy" />

      {/* Footer - Compact */}
      {/* <div className="mt-3 pt-2 border-t border-gray-300 text-center text-xs text-gray-500">
        <p className="font-medium">Bright British Center</p>
        <p>Contact: (123) 456-7890 • Email: info@brightbritish.edu.kh</p>
        <p className="mt-0.5 text-gray-400">
          Computer-generated invoice • Valid without signature
        </p>
      </div> */}
    </div>
  );
});

export default Invoices;
