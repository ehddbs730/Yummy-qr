import React from 'react';

/**
 * 메뉴 그리드 컴포넌트
 * @param {Object} props
 * @param {Array} props.menus - 메뉴 배열
 * @param {Function} props.onMenuClick - 메뉴 클릭 핸들러
 */
function MenuGrid({ menus, onMenuClick }) {
  return (
    <div className="kiosk-menu-content">
      <div className="kiosk-menu-grid">
        {menus.map((menu) => (
          <div key={menu.id} className="kiosk-menu-item" onClick={() => onMenuClick(menu)}>
            <div className="kiosk-menu-image">
              {menu.imageUrl ? (
                <img src={menu.imageUrl} alt={menu.name} className="kiosk-menu-image-img" />
              ) : (
                <div className="kiosk-menu-image-placeholder">이미지</div>
              )}
            </div>
            <h3 className="kiosk-menu-name">{menu.name}</h3>
            <div className="kiosk-menu-price">{menu.price.toLocaleString()}원</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MenuGrid;
