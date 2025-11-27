import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import RestaurantHeader from '../components/RestaurantHeader';
import CategoryTabs from '../components/CategoryTabs';
import MenuGrid from '../components/MenuGrid';
import OrderSummary from '../components/OrderSummary';
import MenuDetailModal from '../components/MenuDetailModal';
import PopularMenuBanner from '../components/PopularMenuBanner';
import { API_BASE_URL } from '../api';
import '../styles/kioskMenuPage.css';

function KioskMenuPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { store } = location.state || {};
  
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(0);
  const [menus, setMenus] = useState([]);
  const [order, setOrder] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [popularMenus, setPopularMenus] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderSummary, setOrderSummary] = useState({ totalAmount: 0, totalQuantity: 0 });

  const categoryDisplayNames = {
    'KOREAN': '한식',
    'SPECIAL': '특식',
    'PORK': '돈가스',
    'A': 'A',
    'C1': 'C1',
    'C2': 'C2',
    'D': 'D',
    'SET': '정식'
  };

  const categoryToEnum = {
    '한식': 'KOREAN',
    '특식': 'SPECIAL',
    '스페셜': 'SPECIAL',
    '돈가스': 'PORK', 
    'A': 'A',
    'C1': 'C1',
    'C2': 'C2',
    'D': 'D',
    '정식': 'SET'
  };
  
  //정보 복원
  useEffect(() => {
    if (location.state && location.state.order) {
      setOrder(location.state.order);
    }
  }, [location.state]);

  //메뉴 조회
  useEffect(() => {
    if (store && store.restaurantId) {
      fetchCategoriesAndPopularMenus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store]);

  //카테고리 변경
  useEffect(() => {
    if (categories.length > 0 && store && store.restaurantId) {
      const currentCategory = categories[activeCategory];
      if (currentCategory) {
        fetchMenusByCategory(store.restaurantId, currentCategory);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, categories, store]);

  // 페이지 재진입 시 메뉴 갱신 (결제 완료 후 돌아왔을 때 재고 반영)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && categories.length > 0 && store && store.restaurantId) {
        const currentCategory = categories[activeCategory];
        if (currentCategory) {
          fetchMenusByCategory(store.restaurantId, currentCategory);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, activeCategory, store]);

  // 주문 변경 시 서버에서 요약 계산
  useEffect(() => {
    const fetchOrderSummary = async () => {
      if (order.length === 0) {
        setOrderSummary({ totalAmount: 0, totalQuantity: 0 });
        return;
      }

      try {
        const orderData = {
          items: order.map(item => ({
            menuId: item.id,
            quantity: item.quantity
          }))
        };

        const response = await fetch(
          `${API_BASE_URL}/api/orders/summary`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
          }
        );

        if (response.ok) {
          const data = await response.json();
          setOrderSummary({
            totalAmount: data.totalAmount,
            totalQuantity: data.totalQuantity
          });
        } else {
          // 실패 시 프론트 계산 폴백
          const totalAmount = order.reduce((sum, item) => sum + item.price * item.quantity, 0);
          const totalQuantity = order.reduce((sum, item) => sum + item.quantity, 0);
          setOrderSummary({ totalAmount, totalQuantity });
        }
      } catch (err) {
        console.error('주문 요약 조회 오류:', err);
        // 에러 시 프론트 계산 폴백
        const totalAmount = order.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const totalQuantity = order.reduce((sum, item) => sum + item.quantity, 0);
        setOrderSummary({ totalAmount, totalQuantity });
      }
    };

    fetchOrderSummary();
  }, [order]);

  // 카테고리 목록 및 인기 메뉴 조회
  const fetchCategoriesAndPopularMenus = async () => {
    setIsLoading(true);
    setError('');

    try {
      // 카테고리 목록 조회
      const categoriesResponse = await fetch(
        `${API_BASE_URL}/api/admin/menu/categories/${store.restaurantId}`
      );

      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        //한글 카테고리명을 영문 enum으로 변환
        const enumCategories = categoriesData.map(cat => categoryToEnum[cat] || cat);
        setCategories(enumCategories);
        
        if (enumCategories.length > 0) {
          await fetchMenusByCategory(store.restaurantId, enumCategories[0]);
        }
      }

      // 인기 메뉴 조회
      const popularResponse = await fetch(
        `${API_BASE_URL}/api/menus/sales-snapshots/restaurant/${store.restaurantId}/popular-menus`
      );

      if (popularResponse.ok) {
        const popularData = await popularResponse.json();
        setPopularMenus(popularData.menuNames || []);
      }

    } catch (err) {
      console.error('카테고리 조회 오류:', err);
      setError('메뉴 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  //특정 카테고리
  const fetchMenusByCategory = async (restaurantId, category) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/menus/${restaurantId}/${category}`
      );

      if (response.ok) {
        const data = await response.json();
        const formattedMenus = data.map(menu => ({
          id: menu.id,
          name: menu.name,
          imageUrl: menu.photoUrl,
          price: menu.price
        }));
        
        setMenus(formattedMenus);
      } else if (response.status === 404) {
        setMenus([]);
      } else {
        setError('메뉴를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('메뉴 조회 오류:', err);
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMenuClick = async (menu) => {
    try {
      // 1. 메뉴 상세 정보
      const detailResponse = await fetch(
        `${API_BASE_URL}/api/menus/${menu.id}`
      );

      // 2. 판매 그래프 데이터
      const salesGraphResponse = await fetch(
        `${API_BASE_URL}/api/menus/sales-snapshots/${menu.id}/today-sales-graph`
      );

      // 3. 예상 대기 시간
      const waitTimeResponse = await fetch(
        `${API_BASE_URL}/api/menus/sales-wait-time/${menu.id}`
      );

      const detailData = detailResponse.ok ? await detailResponse.json() : {};
      const salesData = salesGraphResponse.ok ? await salesGraphResponse.json() : null;
      const waitData = waitTimeResponse.ok ? await waitTimeResponse.json() : null;

      setSelectedMenu({
        ...menu,
        remainingTickets: detailData.remainingTickets || 0,
        salesGraphData: salesData?.salesDataPoints || [],
        expectedWaitTime: waitData?.expectedWaitTime || null
      });
      setIsModalOpen(true);
    } catch (err) {
      console.error('메뉴 상세 조회 오류:', err);
      setSelectedMenu(menu);
      setIsModalOpen(true);
    }
  };

  const handleAddToOrder = (menu) => {
    //메뉴 추가
    setOrder(prevOrder => {
      const existingItem = prevOrder.find(item => item.id === menu.id);
      const currentQuantity = existingItem ? existingItem.quantity : 0;
      
      // 재고 검증
      if (menu.remainingTickets !== undefined && currentQuantity >= menu.remainingTickets) {
        alert(`${menu.name}의 잔여 식권이 부족합니다. (남은 수량: ${menu.remainingTickets}장)`);
        return prevOrder;
      }
      
      const currentCategoryEnum = categories[activeCategory];
      const categoryName = categoryDisplayNames[currentCategoryEnum] || currentCategoryEnum || '일반';
      
      if (existingItem) {
        return prevOrder.map(item =>
          item.id === menu.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevOrder, { ...menu, quantity: 1, category: categoryName }];
    });
  };

  const handleBackToStores = () => {
    navigate('/ticket-purchase');
  };

  const handleCategoryClick = (index) => {
    setActiveCategory(index);
  };

  const handleCancelOrder = () => {
    setOrder([]);
  };

  const handleCheckout = async () => {
    if (order.length === 0) return;

    try {
      const orderData = {
        items: order.map(item => ({
          menuId: item.id,
          quantity: item.quantity
        }))
      };

      const response = await fetch(
        `${API_BASE_URL}/api/orders/summary`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData)
        }
      );

      if (response.ok) {
        const summary = await response.json();
        navigate('/payment', { state: { order, store, summary } });
      } else {
        alert('재고가 부족하거나 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('주문 확인 오류:', err);
      alert('네트워크 오류가 발생했습니다.');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedMenu(null);
    // 모달 닫을 때 현재 카테고리 메뉴 다시 불러와서 재고 업데이트
    if (categories.length > 0 && store && store.restaurantId) {
      const currentCategory = categories[activeCategory];
      if (currentCategory) {
        fetchMenusByCategory(store.restaurantId, currentCategory);
      }
    }
  };

  const handleModalPurchase = (menu, store) => {
    handleAddToOrder(menu);
    setIsModalOpen(false);
    setSelectedMenu(null);
    // 장바구니 추가 후 메뉴 목록 갱신
    if (categories.length > 0 && store && store.restaurantId) {
      const currentCategory = categories[activeCategory];
      if (currentCategory) {
        fetchMenusByCategory(store.restaurantId, currentCategory);
      }
    }
  };

  const handleQuantityChange = (itemId, change) => {
    setOrder(prevOrder => {
      const existingItem = prevOrder.find(item => item.id === itemId);
      if (existingItem) {
        const newQuantity = existingItem.quantity + change;
        
        // 증가 시 재고 검증
        if (change > 0 && existingItem.remainingTickets !== undefined && newQuantity > existingItem.remainingTickets) {
          alert(`${existingItem.name}의 잔여 식권이 부족합니다. (남은 수량: ${existingItem.remainingTickets}장)`);
          return prevOrder;
        }
        
        if (newQuantity <= 0) {
          //수량 0이하면 주문에서 제거
          return prevOrder.filter(item => item.id !== itemId);
        } else {
          //수량 업데이트
          return prevOrder.map(item =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          );
        }
      }
      return prevOrder;
    });
  };

  if (isLoading && menus.length === 0) {
    return (
      <>
        <Navbar />
        <div className="kiosk-menu-container">
          <RestaurantHeader 
            restaurantName={store?.name || '식당'}
            onBackClick={handleBackToStores}
          />
          <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
            로딩 중...
          </div>
        </div>
      </>
    );
  }

  //에러
  if (error) {
    return (
      <>
        <Navbar />
        <div className="kiosk-menu-container">
          <RestaurantHeader 
            restaurantName={store?.name || '식당'}
            onBackClick={handleBackToStores}
          />
          <div style={{ textAlign: 'center', padding: '50px', color: '#ff4444' }}>
            {error}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="kiosk-menu-container">
        <RestaurantHeader 
          restaurantName={store?.name || '식당'}
          onBackClick={handleBackToStores}
        />
        
        <CategoryTabs 
          categories={categories.map(cat => ({
            name: categoryDisplayNames[cat] || cat
          }))}
          activeCategory={activeCategory}
          onCategoryClick={handleCategoryClick}
        />
        
        {popularMenus.length > 0 && (
          <PopularMenuBanner menuNames={popularMenus} />
        )}

        <MenuGrid 
          menus={menus}
          onMenuClick={handleMenuClick}
        />

        <OrderSummary 
          order={order}
          onCancelOrder={handleCancelOrder}
          onCheckout={handleCheckout}
          onQuantityChange={handleQuantityChange}
          totalAmount={orderSummary.totalAmount}
          totalQuantity={orderSummary.totalQuantity}
        />
        
        <div className="kiosk-instruction">
          메뉴를 확인하고 주문할 수 있는 화면으로 터치하여 선택합니다.
        </div>
      </div>

      {/* 메뉴 상세 모달 */}
      {selectedMenu && (
        <MenuDetailModal
          menu={selectedMenu}
          store={store}
          category={categoryDisplayNames[categories[activeCategory]] || categories[activeCategory]}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onPurchase={handleModalPurchase}
        />
      )}
    </>
  );
}

export default KioskMenuPage;

