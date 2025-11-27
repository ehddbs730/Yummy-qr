import React, { useState, useEffect } from 'react';
import '../styles/menuModal.css';

function MenuModal({ isOpen, onClose, onSubmit, initialData = null, categories = [] }) {
  const CATEGORY_MAP = {
    "돈가스": "PORK",
    "스페셜": "SPECIAL",
    "한식": "KOREAN",
    "A": "A",
    "C1": "C1",
    "C2": "C2",
    "D": "D",
    "정식": "SET"
  };

  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    menuName: '',
    price: '',
    tickets: '',
    category: '',
    image: null
  });

  // 이미지 미리보기 상태
  const [imagePreview, setImagePreview] = useState(null);

  // 모달이 열릴 때 초기 데이터 설정
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          menuName: initialData.name || '',
          price: initialData.price || '',
          tickets: initialData.tickets || '',
          category: initialData.category || '',
          image: initialData.image || null
        });
        setImagePreview(initialData.imageUrl || null);
      } else {
        setFormData({
          menuName: '',
          price: '',
          tickets: '',
          category: '',
          image: null
        });
        setImagePreview(null);
      }
    }
  }, [isOpen, initialData]);

  // 폼 입력 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 이미지 파일 핸들러
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 파일 타입 검증
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }
      
      // 파일 크기 검증 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다.');
        return;
      }

      setFormData(prev => ({
        ...prev,
        image: file
      }));

      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 이미지 제거 핸들러
  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null
    }));
    setImagePreview(null);
  };

  // 폼 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.menuName && formData.price && formData.tickets && formData.category) {
      const menuData = {
        menuName: formData.menuName,
        visible: true, // 기본값으로 true 설정
        price: parseInt(formData.price),
        tickets: parseInt(formData.tickets),
        category: formData.category,
        image: formData.image,
        imageUrl: imagePreview
      };
      onSubmit(menuData);
      handleClose();
    }
  };

  // 모달 닫기 핸들러
  const handleClose = () => {
    setFormData({
      menuName: '',
      price: '',
      tickets: '',
      category: '',
      image: null
    });
    setImagePreview(null);
    onClose();
  };

  // 오버레이 클릭 핸들러
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="menu-modal-overlay" onClick={handleOverlayClick}>
      <div className="menu-modal" onClick={(e) => e.stopPropagation()}>
        <div className="menu-modal-header">
          <h2 className="menu-modal-title">
            {initialData ? '메뉴 수정' : '메뉴 등록'}
          </h2>
          <button className="menu-modal-close" onClick={handleClose}>
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="menu-modal-form">
          <div className="menu-modal-form-group">
            <label className="menu-modal-form-label">추가할 메뉴</label>
            <input
              type="text"
              name="menuName"
              value={formData.menuName}
              onChange={handleInputChange}
              placeholder="메뉴 이름을 입력하세요."
              className="menu-modal-form-input"
              required
            />
          </div>

          <div className="menu-modal-form-group">
            <label className="menu-modal-form-label">가격</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="가격을 입력하세요."
              className="menu-modal-form-input"
              required
            />
          </div>

          <div className="menu-modal-form-group">
            <label className="menu-modal-form-label">식권 매수</label>
            <input
              type="number"
              name="tickets"
              value={formData.tickets}
              onChange={handleInputChange}
              placeholder="식권 매수를 입력하세요."
              className="menu-modal-form-input"
              required
            />
          </div>

          <div className="menu-modal-form-group">
            <label className="menu-modal-form-label">카테고리</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="menu-modal-form-select"
              required
            >
              <option value="">카테고리를 선택하세요</option>
              {categories.map(category => (
                <option key={category} value={CATEGORY_MAP[category]}>{category}</option>
              ))}
            </select>
          </div>

          <div className="menu-modal-form-group">
            <label className="menu-modal-form-label">메뉴 이미지</label>
            <div className="menu-modal-image-upload">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="menu-modal-file-input"
                id="menu-image-upload"
              />
              <label htmlFor="menu-image-upload" className="menu-modal-file-label">
                이미지 선택
              </label>
              {imagePreview && (
                <div className="menu-modal-image-preview">
                  <img src={imagePreview} alt="메뉴 미리보기" />
                  <button
                    type="button"
                    className="menu-modal-remove-image"
                    onClick={handleRemoveImage}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>


          <div className="menu-modal-buttons">
            <button type="button" className="menu-modal-cancel-btn" onClick={handleClose}>
              취소
            </button>
            <button type="submit" className="menu-modal-submit-btn">
              {initialData ? '수정하기' : '등록하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MenuModal;
