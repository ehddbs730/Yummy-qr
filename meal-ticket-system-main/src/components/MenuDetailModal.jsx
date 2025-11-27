import React from 'react';
import MenuInfoCards from './MenuInfoCards';
import MenuChartSection from './MenuChartSection';
import MenuDetailActions from './MenuDetailActions';
import '../styles/menuDetailModal.css';

function MenuDetailModal({ menu, store, category, isOpen, onClose, onPurchase }) {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePurchase = () => {
    onPurchase(menu, store);
    onClose();
  };

  return (
    <div className="menu-detail-modal-overlay" onClick={handleBackdropClick}>
      <div className="menu-detail-modal-container">
        <div className="menu-detail-modal-header">
          <h1 className="menu-detail-modal-title">
            {store.name} / {category}
          </h1>
          <button className="menu-detail-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="menu-detail-modal-content">
          <h2 className="menu-detail-modal-name">{menu.name}</h2>
          
          <div className="menu-detail-modal-main">
            <MenuChartSection
              salesGraphData={menu.salesGraphData || []}
              expectedWaitTime={menu.expectedWaitTime}
            />
            
            <MenuInfoCards 
              remainingTickets={menu.remainingTickets || 0}
              price={menu.price}
            />
          </div>
          
          <MenuDetailActions 
            onBack={onClose}
            onPurchase={handlePurchase}
          />
        </div>
      </div>
    </div>
  );
}

export default MenuDetailModal;
