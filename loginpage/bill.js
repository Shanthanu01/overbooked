import React, { useState } from 'react';
import './BillGenerator.css';

const BillGenerator = () => {

  const [eventName, setEventName] = useState('');
  const [tickets, setTickets] = useState(1);
  const [pricePerTicket, setPricePerTicket] = useState(100);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(5);
  const [totalCost, setTotalCost] = useState(null);

  
  const calculateBill = () => {
    const subtotal = tickets * pricePerTicket;
    const discountAmount = (subtotal * discount) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * taxRate) / 100;
    const finalTotal = taxableAmount + taxAmount;

    setTotalCost({
      subtotal,
      discountAmount,
      taxAmount,
      finalTotal,
    });
  };

  const resetForm = () => {
    setEventName('');
    setTickets(1);
    setPricePerTicket(100);
    setDiscount(0);
    setTaxRate(5);
    setTotalCost(null);
  };

  return (
    <div className="bill-generator">
      <h2>Event Booking Bill Generator</h2>
      <div className="form">
        <label>
          Event Name:
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="Enter event name"
          />
        </label>

        <label>
          Number of Tickets:
          <input
            type="number"
            value={tickets}
            onChange={(e) => setTickets(parseInt(e.target.value) || 0)}
            min="1"
          />
        </label>

        <label>
          Price per Ticket:
          <input
            type="number"
            value={pricePerTicket}
            onChange={(e) => setPricePerTicket(parseFloat(e.target.value) || 0)}
            min="0"
          />
        </label>

        <label>
          Discount (%):
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
            min="0"
          />
        </label>

        <label>
          Tax Rate (%):
          <input
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
            min="0"
          />
        </label>

        <button onClick={calculateBill}>Generate Bill</button>
        <button onClick={resetForm} className="reset-btn">Reset</button>
      </div>

      {totalCost && (
        <div className="bill-summary">
          <h3>Bill Summary</h3>
          <p>Event Name: {eventName}</p>
          <p>Subtotal: ${totalCost.subtotal.toFixed(2)}</p>
          <p>Discount: -${totalCost.discountAmount.toFixed(2)}</p>
          <p>Tax: +${totalCost.taxAmount.toFixed(2)}</p>
          <hr />
          <h4>Total Cost: ${totalCost.finalTotal.toFixed(2)}</h4>
        </div>
      )}
    </div>
  );
};

export default BillGenerator;
