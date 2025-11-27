import React from "react";

/**
 * 주문 요약 컴포넌트
 * @param {Object} props
 * @param {Array} props.order - 주문 목록
 * @param {Function} props.onCancelOrder - 전체 취소 핸들러
 * @param {Function} props.onCheckout - 결제하기 핸들러
 * @param {Function} props.onQuantityChange - 수량 변경 핸들러
 * @param {number} props.totalAmount - 총 금액 (서버 계산)
 * @param {number} props.totalQuantity - 총 수량 (서버 계산)
 */
function OrderSummary({ order, onCancelOrder, onCheckout, onQuantityChange, totalAmount = 0, totalQuantity = 0 }) {

  // 수량 증가 핸들러
  const handleIncreaseQuantity = (itemId) => {
    if (onQuantityChange) {
      onQuantityChange(itemId, 1);
    }
  };

  // 수량 감소 핸들러
  const handleDecreaseQuantity = (itemId) => {
    if (onQuantityChange) {
      onQuantityChange(itemId, -1);
    }
  };

  return (
    <>
      {/* 주문 요약 */}
      <div className='kiosk-order-summary'>
        <div className='order-summary-header'>
          <h2 className='summary-title'>주문메뉴</h2>
          <div className='summary-stats'>
            <span className='summary-quantity'>수량 {totalQuantity}개</span>
            <span className='summary-amount'>
              금액 {totalAmount.toLocaleString()}원
            </span>
          </div>
        </div>

        <div className='summary-list'>
          {order.length === 0 ? (
            <div className='empty-order'>메뉴를 선택해주세요</div>
          ) : (
            order.map((item) => (
              <div key={item.id} className='summary-item'>
                <span className='item-name'>{item.name}</span>
                <div className='item-quantity-controls'>
                  <button
                    className='quantity-btn decrease-btn'
                    onClick={() => handleDecreaseQuantity(item.id)}
                    aria-label='수량 감소'
                  >
                    -
                  </button>
                  <span className='item-quantity'>{item.quantity}</span>
                  <button
                    className='quantity-btn increase-btn'
                    onClick={() => handleIncreaseQuantity(item.id)}
                    aria-label='수량 증가'
                  >
                    +
                  </button>
                </div>
                <span className='item-price'>
                  {(item.price * item.quantity).toLocaleString()}원
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 액션 바 */}
      <div className='kiosk-action-bar'>
        <button className='kiosk-cancel-btn' onClick={onCancelOrder}>
          전체취소
        </button>
        <button
          className='kiosk-checkout-btn'
          onClick={onCheckout}
          disabled={order.length === 0}
        >
          결제하기
        </button>
      </div>
    </>
  );
}

export default OrderSummary;
