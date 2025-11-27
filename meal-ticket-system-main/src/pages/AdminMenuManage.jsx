import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MenuModal from '../components/MenuModal';
import MenuViewModal from '../components/MenuViewModal';
import { API_BASE_URL } from '../api';
import '../styles/adminMenuManage.css';

function AdminMenuManage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 전달받은 매장 정보
  const store = location.state?.store || { name: '중앙도서관' };

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  
  // 메뉴 조회 모달 상태
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingMenu, setViewingMenu] = useState(null);

  // 메뉴 목록 상태
  const [menuList, setMenuList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 관리자 메뉴 조회 API 호출
  const fetchAdminMenus = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/menu`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const menuData = await response.json();
      
      // 현재 선택된 매장의 메뉴만 필터링
      const filteredMenus = menuData.filter(menu => menu.restaurantName === store.name);
      setMenuList(filteredMenus);
    } catch (error) {
      console.error('관리자 메뉴 조회 실패:', error);
      setError('메뉴를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 메뉴 데이터 조회
  useEffect(() => {
    fetchAdminMenus();
    fetchCategories();
  }, [store.name]); // store.name이 변경될 때마다 다시 조회

  // 카테고리 조회 API 호출
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/menu/categories/${store.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const categoryData = await response.json();
      setCategories(categoryData);
    } catch (error) {
      console.error('카테고리 조회 실패:', error);
      setCategories([]);
    }
  };

  // 특정 메뉴 상세 정보 조회 API
  const fetchMenuDetail = async (menuId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/menu/${menuId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const menuDetail = await response.json();
      return menuDetail;
    } catch (error) {
      console.error('메뉴 상세 정보 조회 실패:', error);
      throw error;
    }
  };

  // 메뉴 등록/수정 핸들러
  const handleMenuSubmit = async (menuData) => {
    try {
      if (editingMenu) {
        // 메뉴 수정 - PATCH API 호출
        const formData = new FormData();
        formData.append("name", menuData.menuName);
        formData.append("price", menuData.price);
        formData.append("totalCount", menuData.tickets);
        formData.append("category", menuData.category);
        formData.append("visible", editingMenu.visible);
        if (menuData.image) {
          formData.append('image', menuData.image);
        }

        const response = await fetch(`${API_BASE_URL}/api/admin/menu/${editingMenu.id}`, {
          method: 'PATCH',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const updatedMenu = await response.json();
        
        // 현재 매장의 메뉴만 로컬 상태 업데이트
        if (updatedMenu.restaurantName === store.name) {
          setMenuList(prev => prev.map(menu => 
            menu.id === editingMenu.id ? updatedMenu : menu
          ));
        }
        setEditingMenu(null);
        alert('메뉴가 성공적으로 수정되었습니다.');
      } else {
        // 신규 등록 - API 호출
        const formData = new FormData();
        formData.append("restaurantId", store.id);
        formData.append("name", menuData.menuName);
        formData.append("price", menuData.price);
        formData.append("totalCount", menuData.tickets);
        formData.append("category", menuData.category);
        formData.append("visible", true);
        if (menuData.image) {
          formData.append('image', menuData.image);
        }

        const response = await fetch(`${API_BASE_URL}/api/admin/menu`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const newMenu = await response.json();
        
        // 현재 매장의 메뉴인 경우에만 로컬 상태 업데이트
        if (newMenu.restaurantName === store.name) {
          setMenuList(prev => [...prev, newMenu]);
        }
        alert('메뉴가 성공적으로 등록되었습니다.');
      }
    } catch (error) {
      console.error('메뉴 등록/수정 실패:', error);
      alert('메뉴 등록에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 모달 열기/닫기 핸들러
  const handleOpenModal = () => {
    setEditingMenu(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMenu(null);
  };

  // 메뉴 삭제 핸들러
  const handleDelete = async (id) => {
    if (!window.confirm('정말로 이 메뉴를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/menu/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 성공 시 로컬 상태 업데이트
      setMenuList(prev => prev.filter(menu => menu.id !== id));
      alert('메뉴가 삭제되었습니다.');
    } catch (error) {
      console.error('메뉴 삭제 실패:', error);
      alert('메뉴 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 메뉴 수정 핸들러
  const handleEdit = (menu) => {
    setEditingMenu(menu);
    setIsModalOpen(true);
  };

  // 메뉴 표시상태 토글 핸들러
  const handleToggleVisible = async (id) => {
    try {
      const menuDetail = await fetchMenuDetail(id);
      
      const formData = new FormData();
      formData.append("name", menuDetail.name);
      formData.append("price", menuDetail.price);
      formData.append("totalCount", menuDetail.totalCount);
      formData.append("category", menuDetail.category);
      formData.append("visible", !menuDetail.visible);
      
      const response = await fetch(`${API_BASE_URL}/api/admin/menu/${id}`, {
        method: 'PATCH',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // 현재 매장의 메뉴 목록만 다시 조회
      await fetchAdminMenus();
      alert('표시 상태가 변경되었습니다.');
      
    } catch (error) {
      console.error('표시상태 변경 실패:', error);
      alert('표시상태 변경에 실패했습니다.');
    }
  };

  // 메뉴 조회 핸들러
  const handleView = async (menu) => {
    try {
      const menuDetail = await fetchMenuDetail(menu.id);
      setViewingMenu(menuDetail);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error('메뉴 상세 정보 조회 실패:', error);
      alert('메뉴 정보를 불러오는데 실패했습니다.');
    }
  };

  // 메뉴 조회 모달 닫기 핸들러
  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingMenu(null);
  };

  // 뒤로가기 핸들러
  const handleBack = () => {
    navigate('/admin');
  };

  return (
    <>
      <Navbar />
      <div className="admin-menu-manage-container">
        <div className="admin-menu-manage-header">
          <h1 className="admin-menu-manage-title">{store.name} 메뉴 관리</h1>
        </div>

        <div className="admin-menu-manage-content">
          {/* 메뉴 현황 섹션 */}
          <div className="admin-menu-status-section">
            <div className="admin-menu-status-header">
              <h2 className="admin-menu-status-title">메뉴 현황</h2>
              <button className="admin-menu-add-btn" onClick={handleOpenModal}>
                등록하기
              </button>
            </div>
            
            {/* 로딩/에러 상태 */}
            {loading && <div className="admin-menu-loading">메뉴를 불러오는 중...</div>}
            {error && <div className="admin-menu-error">{error}</div>}
            
            <div className="admin-menu-table-container">
              <table className="admin-menu-table">
                <thead>
                  <tr>
                    <th>메뉴명</th>
                    <th>표시상태</th>
                    <th>가격</th>
                    <th>식권수</th>
                    <th>카테고리</th>
                    <th>수정</th>
                    <th>삭제</th>
                  </tr>
                </thead>
                <tbody>
                  {menuList.length === 0 && !loading ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                        등록된 메뉴가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    menuList.map(menu => (
                      <tr key={menu.id}>
                        <td 
                          style={{ cursor: 'pointer', color: '#6b5ace', textDecoration: 'underline' }}
                          onClick={() => handleView(menu)}
                        >
                          {menu.name}
                        </td>
                        <td>
                          <button 
                            className={`admin-menu-toggle-btn ${menu.visible ? 'visible' : 'hidden'}`}
                            onClick={() => handleToggleVisible(menu.id)}
                          >
                            {menu.visible ? '표시중' : '숨김'}
                          </button>
                        </td>
                        <td>{menu.price.toLocaleString()}</td>
                        <td>{menu.soldTicket}</td>
                        <td>{menu.category}</td>
                        <td>
                          <button 
                            className="admin-menu-edit-btn"
                            onClick={() => handleEdit(menu)}
                          >
                            ✏️ 수정
                          </button>
                        </td>
                        <td>
                          <button 
                            className="admin-menu-delete-btn"
                            onClick={() => handleDelete(menu.id)}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 버튼 그룹 */}
        <div className="admin-menu-button-group">
          <button className="admin-menu-back-btn" onClick={handleBack}>
            이전으로
          </button>
          <button className="admin-menu-confirm-btn" onClick={() => alert('변경사항이 저장되었습니다!')}>
            완료
          </button>
        </div>
      </div>

      {/* 모달 */}
      <MenuModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleMenuSubmit}
        initialData={editingMenu}
        categories={categories}
      />
      
      {/* 메뉴 조회 모달 */}
      <MenuViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        menuData={viewingMenu}
      />
    </>
  );
}

export default AdminMenuManage;