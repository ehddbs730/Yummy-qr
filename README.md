## 브랜치 전략

```
main (배포 브랜치)
├── develop (개발 통합 브랜치)
├── feature/컴포넌트명-기능명 (개별 기능 브랜치)
├── hotfix/버그명 (긴급 수정)
└── refactor/리팩토링명 (코드 개선)
```

### **브랜치 설명**

- `main`: **배포용 브랜치**.
- `develop`: **개발용 메인 브랜치**. 완성되는 기능 브랜치가 여기로 통합됨.
- `feature/{기능-이름}`: **기능 개발 브랜치**. 새로운 기능 개발용. `develop` 브랜치에서 생성하며, 기능이 완성되면 다시 `develop`으로 합침. (예: `feature/login-ui`, `feature/refactor-header`)
    
    **절대 `main`이나 `develop` 브랜치에 직접 커밋 X**

    

## 커밋 메시지 규칙

```
feat: 새로운 기능 추가
fix: 버그 수정
refactor: 코드 리팩토링
style: 코드 스타일 변경 (로직 변경 없음)
docs: 문서 수정
etc: 그 외의 알림

예시:
feat: 로그인 컴포넌트 추가
fix: 헤더 반응형 레이아웃 수정
refactor: 버튼 컴포넌트 props 구조 개선
```

## Pull Request 규칙

1. **작업 단위**: 하나의 기능/컴포넌트당 하나의 PR
2. **리뷰어**: 최소 1명 이상의 리뷰 필수
3. **머지 조건**: 모든 리뷰 승인 + 충돌 해결
4. **PR 템플릿**:

```markdown
## 변경 사항
- 구현한 기능 설명

## 테스트 방법
- 확인 방법 설명

## 스크린샷 (UI 관련시)
- Before/After 이미지

## 체크리스트
- [ ] 코드 리뷰 완료
- [ ] 테스트 확인
- [ ] 문서 업데이트
```

---

## **작업 프로세스**

1. **이슈 확인 및 브랜치 생성**:
    - `git switch develop`
    - `git pull origin develop` (항상 최신 `develop` 상태에서 시작)
    - `git switch -c feature/login-ui` (본인이 맡은 기능 브랜치 생성)
2. **기능 개발 및 커밋**:
    - 개별 컴포넌트 단위로 커밋 (`git commit -m "feat: 로그인 UI 레이아웃 구현"`)
3. **Pull Request (PR) 생성**:
    - 기능 개발이 완료되면, GitHub에 브랜치를 푸시. (`git push origin feature/login-ui`)
    - GitHub에서 `feature/login-ui` -> `develop` 브랜치로 **Pull Request**를 생성.
4. **코드 리뷰**:
    - PR은 최소 1명 이상, 가능하면 2명 다 확인 후 승인.
5. **머지(Merge)**:
    - 모든 변경사항이 승인(Approve)되면 PR을 `develop` 브랜치에 머지.
    - 머지 후에는 기능 브랜치를 삭제하여 저장소를 깔끔하게 유지하는 걸 권장.
