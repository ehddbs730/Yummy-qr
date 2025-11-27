import React from 'react';

/**
 * 카테고리 탭 컴포넌트
 * @param {Object} props
 * @param {Array} props.categories - 카테고리 배열
 * @param {number} props.activeCategory - 현재 활성화된 카테고리 인덱스
 * @param {Function} props.onCategoryClick - 카테고리 클릭 핸들러
 */
function CategoryTabs({ categories, activeCategory, onCategoryClick }) {
  return (
    <div className="kiosk-category-tabs">
      {categories.map((category, index) => (
        <button
          key={index}
          className={`kiosk-category-tab ${activeCategory === index ? 'active' : ''}`}
          onClick={() => onCategoryClick(index)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}

export default CategoryTabs;
