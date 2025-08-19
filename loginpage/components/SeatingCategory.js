import React from 'react';

function SeatingCategory({ category, available, onBook }) {
  return (
    <div className="seating-category">
      <p>{category}: {available} seats available</p>
      <button 
        onClick={onBook}
        disabled={available === 0}>
        {available === 0 ? 'Sold Out' : 'Book'}
      </button>
    </div>
  );
}

export default SeatingCategory;
