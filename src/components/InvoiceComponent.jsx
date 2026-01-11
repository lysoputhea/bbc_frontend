import React, { forwardRef } from "react";

const InvoiceComponent = forwardRef((props, ref) => {
  const { invoiceNumber, date, customer, items } = props;

  const total = items.reduce((acc, item) => acc + item.price * item.qty, 0);

  return (
    <div ref={ref} className="p-6 w-[800px] bg-white text-black">
      {/* Header */}
      <h1 className="text-2xl font-bold text-center mb-6">Invoice</h1>
      <div className="flex justify-between mb-4">
        <div>
          <p>
            <strong>Invoice #:</strong> {invoiceNumber}
          </p>
          <p>
            <strong>Date:</strong> {date}
          </p>
        </div>
        <div>
          <p>
            <strong>Customer:</strong> {customer.name}
          </p>
          <p>{customer.address}</p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full border border-gray-400">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Item</th>
            <th className="border p-2">Qty</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <td className="border p-2">{item.name}</td>
              <td className="border p-2">{item.qty}</td>
              <td className="border p-2">${item.price.toFixed(2)}</td>
              <td className="border p-2">
                ${(item.price * item.qty).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total */}
      <div className="flex justify-end mt-4">
        <h2 className="text-xl font-bold">Total: ${total.toFixed(2)}</h2>
      </div>
    </div>
  );
});

export default InvoiceComponent;
