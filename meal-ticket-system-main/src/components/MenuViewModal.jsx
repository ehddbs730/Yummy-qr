import React from 'react';
import '../styles/menuViewModal.css';

function MenuViewModal({ isOpen, onClose, menuData }) {
  const CATEGORY_DISPLAY_MAP = {
    "PORK": "돈가스",
    "SPECIAL": "스페셜",
    "KOREAN": "한식",
    "A": "A",
    "C1": "C1",
    "C2": "C2",
    "D": "D",
    "SET": "정식"
  };

  // 오버레이 클릭 핸들러
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !menuData) return null;

  return (
    <div className="menu-view-modal-overlay" onClick={handleOverlayClick}>
      <div className="menu-view-modal" onClick={(e) => e.stopPropagation()}>
        <div className="menu-view-modal-header">
          <h2 className="menu-view-modal-title">메뉴 상세 정보</h2>
          <button className="menu-view-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="menu-view-modal-content">
          <div className="menu-view-modal-form-group">
            <label className="menu-view-modal-form-label">메뉴명</label>
            <div className="menu-view-modal-form-value">
              {menuData.name}
            </div>
          </div>

          <div className="menu-view-modal-form-group">
            <label className="menu-view-modal-form-label">가격</label>
            <div className="menu-view-modal-form-value">
              {menuData.price?.toLocaleString()}원
            </div>
          </div>

          <div className="menu-view-modal-form-group">
            <label className="menu-view-modal-form-label">총 식권 수</label>
            <div className="menu-view-modal-form-value">
              {menuData.totalCount}매
            </div>
          </div>

          <div className="menu-view-modal-form-group">
            <label className="menu-view-modal-form-label">판매된 식권 수</label>
            <div className="menu-view-modal-form-value">
              {menuData.soldTicket}매
            </div>
          </div>

          <div className="menu-view-modal-form-group">
            <label className="menu-view-modal-form-label">남은 식권 수</label>
            <div className="menu-view-modal-form-value">
              {(menuData.totalCount || 0) - (menuData.soldTicket || 0)}매
            </div>
          </div>

          <div className="menu-view-modal-form-group">
            <label className="menu-view-modal-form-label">카테고리</label>
            <div className="menu-view-modal-form-value">
              {CATEGORY_DISPLAY_MAP[menuData.category] || menuData.category}
            </div>
          </div>

          <div className="menu-view-modal-form-group">
            <label className="menu-view-modal-form-label">표시 상태</label>
            <div className="menu-view-modal-form-value">
              <span className={`menu-view-status-badge ${menuData.visible ? 'visible' : 'hidden'}`}>
                {menuData.visible ? '표시중' : '숨김'}
              </span>
            </div>
          </div>

          {menuData.imageUrl && (
            <div className="menu-view-modal-form-group">
              <label className="menu-view-modal-form-label">메뉴 이미지</label>
              <div className="menu-view-modal-image-container">
                <img 
                  src={menuData.imageUrl} 
                  alt={menuData.name} 
                  className="menu-view-modal-image"
                />
              </div>
            </div>
          )}

          <div className="menu-view-modal-buttons">
            <button 
              type="button" 
              className="menu-view-modal-close-btn" 
              onClick={onClose}
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MenuViewModal;