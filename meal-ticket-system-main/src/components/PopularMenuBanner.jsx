import React from 'react';
import '../styles/popularMenuBanner.css';

/**
 * 인기 메뉴 정보 배너 컴포넌트
 * @param {Object} props
 * @param {Array<string>} props.menuNames - 인기 메뉴 이름 배열
 * @param {string} props.message - 표시할 메시지
 */
function PopularMenuBanner({ menuNames = [], message }) {
  // menuNames가 있으면 그것을 표시, 없으면 기본 메시지
  const displayMessage = menuNames.length > 0 
    ? `🔥 현재 인기 메뉴: ${menuNames.join(', ')}`
    : message || "현재 인기있는 메뉴 정보";

  return (
    <div className="popular-menu-banner">
      <div className="popular-menu-text">
        {displayMessage}
      </div>
    </div>
  );
}

export default PopularMenuBanner;
