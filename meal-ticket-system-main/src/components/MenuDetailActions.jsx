import React from 'react';

function MenuDetailActions({ onBack, onPurchase }) {
  return (
    <div className="menu-detail-actions">
      <button className="menu-detail-back-btn" onClick={onBack}>
        이전으로
      </button>
      <button className="menu-detail-purchase-btn" onClick={onPurchase}>
        구매하기
      </button>
    </div>
  );
}

export default MenuDetailActions;
