import React from 'react';

/**
 * 식당 헤더 컴포넌트
 * @param {Object} props
 * @param {string} props.restaurantName - 식당명
 * @param {Function} props.onBackClick - 뒤로가기 버튼 클릭 핸들러
 */
function RestaurantHeader({ restaurantName, onBackClick }) {
  return (
    <div className="kiosk-header">
      <button className="kiosk-back-btn" onClick={onBackClick}>
        <span className="kiosk-back-icon">←</span>
        이전으로
      </button>
      <div className="restaurant-name">
        <h1>{restaurantName}</h1>
      </div>
    </div>
  );
}

export default RestaurantHeader;
