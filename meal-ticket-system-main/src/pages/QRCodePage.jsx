import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import Navbar from '../components/Navbar';
import { API_BASE_URL } from '../api';
import '../styles/qrCodePage.css';

function QRCodePage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // 입력 관련 상태
  const [uuid, setUuid] = useState('');
  
  // 스캔 관련 상태
  const [scannedData, setScannedData] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  
  // UI 관련 상태
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [error, setError] = useState(null);

  const accessToken = localStorage.getItem('accessToken');

  // 카메라 시작
  const startCamera = async () => {
    try {
      console.log('[카메라 시작] 호출');
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      console.log('[카메라 시작] getUserMedia 성공, stream:', stream);
      // 비디오 엘리먼트가 마운트된 이후에 srcObject를 할당하기 위해 스트림을 상태로 보관
      setCameraStream(stream);
      setCameraActive(true);
      setIsScanning(true);
    } catch (err) {
      setError('카메라 접근을 허용해주세요. (콘솔 확인 필요)');
      console.error('[카메라 접근 오류]:', err);
    }
  };

  // 카메라 종료
  const stopCamera = () => {
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      } else if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    } catch (e) {
      console.warn('stopCamera: 트랙 정지 중 오류', e);
    }
    if (videoRef.current) {
      try { videoRef.current.srcObject = null; } catch(e) {}
    }
    setCameraStream(null);
    setCameraActive(false);
    setIsScanning(false);
    setScannedData(null);
  };

  // cameraStream 또는 cameraActive 변경 시 비디오에 srcObject 할당 및 재생 시도
  useEffect(() => {
    const attachStream = async () => {
      if (cameraActive && cameraStream && videoRef.current) {
        videoRef.current.srcObject = cameraStream;
        console.log('[카메라] 비디오에 srcObject 할당');
        try {
          if (videoRef.current.play) {
            await videoRef.current.play();
            console.log('[카메라] video.play() 성공');
          }
        } catch (playErr) {
          console.warn('[카메라] video.play() 실패:', playErr);
        }
      }
    };

    attachStream();
    return () => {};
  }, [cameraActive, cameraStream]);

  // QR 코드 스캔
  useEffect(() => {
    const scanQRCode = () => {
      if (videoRef.current && canvasRef.current && isScanning) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          
          if (code) {
            setScannedData(code.data);
            setIsScanning(false);
            setUuid(code.data); // 스캔된 데이터를 입력 필드에 설정
          }
        }
      }

      if (isScanning) {
        requestAnimationFrame(scanQRCode);
      }
    };

    if (isScanning) {
      scanQRCode();
    }
  }, [isScanning]);

  // API를 통해 QR 사용 처리
  const handleUseQR = async () => {
    if (!uuid.trim()) {
      setMessage('UUID를 입력해주세요.');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/qr/use?uuid=${encodeURIComponent(uuid.trim())}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': accessToken || ''
        }
      });

      const responseText = await response.text();

      if (response.ok) {
        setMessage(responseText || 'QR 사용이 완료되었습니다.');
        setMessageType('success');
        setUuid(''); // 성공 시 입력 필드 초기화
        setScannedData(null);
        stopCamera(); // 성공 시 카메라 종료
      } else if (response.status === 404) {
        setMessage(responseText || '존재하지 않는 QR입니다.');
        setMessageType('error');
      } else if (response.status === 401) {
        setMessage('로그인이 필요합니다.');
        setMessageType('error');
      } else {
        setMessage(responseText || 'QR 사용 처리에 실패했습니다.');
        setMessageType('error');
      }
    } catch (err) {
      console.error('QR 사용 처리 오류:', err);
      setMessage('네트워크 오류가 발생했습니다.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleUseQR();
    }
  };

  // 다시 스캔
  const handleRescan = () => {
    setScannedData(null);
    setUuid('');
    setMessage('');
    setMessageType('');
    setIsScanning(true);
  };

  return (
    <>
      <Navbar />
      <div className="qr-code-container">
        <div className="qr-code-card">
          <h1 className="qr-code-title">QR코드 승인 페이지</h1>
          <p className="qr-code-instruction">
            QR 코드를 카메라로 스캔하거나 UUID를 직접 입력해주세요.
          </p>

          {/* 에러 메시지 */}
          {error && <div className="error-message">{error}</div>}

          {/* 카메라 영역 */}
          <div className="qr-section">
            <h2 className="section-title">카메라 스캔</h2>
            {!cameraActive ? (
              <div className="qr-code-camera-area">
                <button className="camera-start-btn" onClick={startCamera}>
                  카메라 시작
                </button>
              </div>
            ) : (
              <div className="qr-code-camera-area">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="camera-video"
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <button className="camera-stop-btn" onClick={stopCamera}>
                  카메라 종료
                </button>
              </div>
            )}

            {scannedData && (
              <div className="qr-result">
                <h3>QR 코드 인식 완료!</h3>
                <p className="result-data">{scannedData}</p>
              </div>
            )}
          </div>

          {/* 구분선 */}
          <div className="divider">또는</div>

          {/* 수동 입력 영역 */}
          <div className="qr-section">
            <h2 className="section-title">UUID 직접 입력</h2>
            <div className="qr-code-input-area">
              <input
                type="text"
                className="qr-code-input"
                placeholder="QR UUID를 입력하세요"
                value={uuid}
                onChange={(e) => setUuid(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <button
                className="qr-code-submit-btn"
                onClick={handleUseQR}
                disabled={isLoading || !uuid.trim()}
              >
                {isLoading ? '처리 중...' : 'QR 사용 처리'}
              </button>
            </div>
          </div>

          {/* 결과 메시지 */}
          {message && (
            <div className={`qr-code-message ${messageType === 'success' ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          {/* 다시 스캔 버튼 */}
          {scannedData && (
            <button className="rescan-btn" onClick={handleRescan}>
              다시 스캔
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default QRCodePage;
