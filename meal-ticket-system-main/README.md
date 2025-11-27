# meal-ticket-system

<h3>실행 방법</h3>
React 기반으로 만들어져 있습니다.</br>
실행 전 node.js를 설치 및 환경 변수 설정을 완료해주세요.

visual studio code(다른 프로그램도 괜찮습니다.) 에서 터미널을 여시고 package.json이 있는 폴더 위치로 이동하신 후</br>

<b>
npm install</br>
npm start</br>
</b>
라고 입력해주세요.

<h3>주의 사항</br></h3>
npm install 입력 시 package.json을 기반으로 필요한 패키지를 다운로드합니다. 그러니 반드시 package.json이 있는 위치에서 입력해주세요.</br>
다운로드 완료 후 경고가 뜰 수 있습니다. 리액트 고유의 의존성에서 오는 경고로 원래 흔하게 뜨는 것이니 신경쓰지 않으셔도 됩니다.</br>
powershell에서 오류가 난다면 cmd에서 실행해보세요.</br>
만약 오류가 난다면 말해주세요.</br>

자동으로 창이 열리지 않는다면 http://localhost:3000/ 접속해주세요.</br>
현재 UI 구현을 위해 임의의 정적인 데이터만 들어가 있습니다.</br>
연결 미구현 버튼들이 존재합니다.

현 UI 시스템 구현된 버튼 (0916)

- 로그인 화면(NewLogin)</br>
로그인 -> 식권 구매 화면</br>
회원가입 -> 회원가입 화면

- 회원가입 화면(SignUp)</br>
SIGN UP -> 로그인 화면

- 식권 구매 화면(TicketPurchase)</br>
학생회관 식당 -> 키오스크 화면</br>

- 키오스크 화면(KioskMenuPage)</br>
결제하기 -> 메뉴 세부사항 화면</br>
이전으로 -> 식권 구매 화면

- 메뉴 세부사항 화면(MenuDetail)</br>
구매하기 -> 결제 화면</br>
이전으로 -> 키오스크 화면

- 결제 화면(Payment)</br>
구매하기 -> 결제 완료 화면</br>
이전으로 -> 메뉴 세부사항 화면

- 결제 완료 화면(PaymentComplete)</br>
메인으로 -> 식권 구매 화면</br>
My 식권 -> My식권 화면

- My식권 화면(MyTicket)</br>
별도의 버튼 없음

- 관리자 페이지(Admin)</br>
아무 식당 -> 학식메뉴 메뉴 관리 화면

- 학식메뉴 관리 화면(AdminMenuManage)</br>
폼 데이터 입력 후 등록하기
이전으로 -> 관리자 페이지

- QR 페이지(qr-code)</br>
별도의 버튼 없음

- 상단 네비게이션 바</br>
Site Name -> 식권 구매 화면</br>
식권 구매 -> 식권 구매 화면</br>
My식권 -> My식권 화면</br>
관리자 페이지 -> 관리자 페이지 화면</br>
OR처리 -> OR 화면</br>
로그아웃 -> 초기 로그인 화면
