import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import InvoiceComponent from "../components/InvoiceComponent";

const PrintInvoice = () => {
  const componentRef = useRef();

  // useReactToPrint now expects "contentRef"
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "Invoice",
  });

  const invoiceData = {
    invoiceNumber: "INV-001",
    date: "2025-08-25",
    customer: { name: "John Doe", address: "123 Main St, City" },
    items: [
      { name: "Product A", qty: 2, price: 50 },
      { name: "Product B", qty: 1, price: 30 },
      { name: "Service C", qty: 3, price: 20 },
    ],
  };

  return (
    <div className="p-6">
      <button
        onClick={handlePrint}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Print Invoice
      </button>

      {/* Attach ref directly to the component */}
      <InvoiceComponent
        ref={componentRef}
        invoiceNumber={invoiceData.invoiceNumber}
        date={invoiceData.date}
        customer={invoiceData.customer}
        items={invoiceData.items}
      />
    </div>
  );
};

export default PrintInvoice;
