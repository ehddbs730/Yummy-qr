import React from 'react';

function MenuInfoCards({ remainingTickets, price }) {
  return (
    <div className="menu-info-cards-container">
      <div className="menu-info-card tickets-card">
        <span className="menu-info-label">잔여식권 수</span>
        <span className="menu-info-value">{remainingTickets}장</span>
      </div>
      <div className="menu-info-card price-card">
        <span className="menu-info-label">음식가격</span>
        <span className="menu-info-value">{price.toLocaleString()}원</span>
      </div>
    </div>
  );
}

export default MenuInfoCards;
