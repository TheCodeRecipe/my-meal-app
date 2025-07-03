# My Meal App

하루 섭취 식단을 기록하고, 날짜별로 조회할 수 있는 간단한 식단 기록 웹 애플리케이션입니다.  
핵심 기능 중심으로 MVP 형태로 구현하였습니다.

## 기술 스택

- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- DB: SQLite (Prisma ORM 사용)

## 주요 기능

### 1. 메인 화면

- 급식 API (샘플 데이터 기반) 호출 및 식단 표시
- 하루 섭취 칼로리 합산 표시

### 2. 식단 기록

- 음식명 검색 및 선택
- 중복 등록 방지
- 용량 조절, 삭제 기능
- 기록된 음식은 LocalStorage에 저장

### 3. 날짜별 식단 조회

- 날짜별 총 칼로리 확인
- 섭취 음식 리스트 조회 가능

## 실행 방법

1. 패키지 설치
   npm install

2. Prisma 초기화 (SQLite 사용)
   npx prisma generate
   npx prisma db push

3. 개발 서버 실행
   npm run dev
