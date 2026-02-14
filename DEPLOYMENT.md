# Vercel 배포 가이드

## 🚀 무료 배포 방법 (Vercel 올인원)

### 1단계: Vercel 계정 준비
1. [Vercel](https://vercel.com)에 가입 (GitHub 계정으로 로그인 권장)
2. 무료 Hobby 플랜 사용

### 2단계: GitHub 저장소 생성 (권장)
```bash
cd C:\Users\USER\.gemini\antigravity\scratch\goatgame
git init
git add .
git commit -m "Initial commit"
```

GitHub에서 새 저장소 생성 후:
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 3단계: Vercel에 배포

#### 방법 A: Vercel CLI 사용 (빠름)
```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 디렉토리에서 실행
cd C:\Users\USER\.gemini\antigravity\scratch\goatgame
vercel

# 프로덕션 배포
vercel --prod
```

#### 방법 B: Vercel 대시보드 사용
1. Vercel 대시보드에서 "New Project" 클릭
2. GitHub 저장소 연결
3. 프로젝트 설정:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. 환경 변수 설정 (중요!):
   - `VITE_SOCKET_URL` = `https://YOUR_PROJECT_NAME.vercel.app`
   
5. "Deploy" 클릭

### 4단계: 배포 후 확인
- 배포된 URL로 접속 (예: `https://your-project.vercel.app`)
- 로비에서 팀 이름 입력하여 연결 테스트
- Socket.IO 연결 확인 (브라우저 콘솔에서 "Connected to server" 메시지 확인)

## ⚠️ 중요 사항

### Socket.IO 제한사항
Vercel의 서버리스 함수는 최대 10초 실행 시간 제한이 있습니다. 하지만 WebSocket 연결은 이 제한에서 제외되므로 게임 진행에는 문제가 없습니다.

### 무료 플랜 제한
- 월 100GB 대역폭
- 월 100시간 서버리스 함수 실행 시간
- 소규모 레크리에이션 이벤트에는 충분합니다!

## 🔧 로컬 개발 환경

로컬에서 개발할 때는 기존처럼 사용:
```bash
# 터미널 1: 백엔드
npm run server

# 터미널 2: 프론트엔드
npm run dev
```

## 📝 배포 후 업데이트

코드 수정 후 재배포:
```bash
git add .
git commit -m "Update message"
git push

# 또는 Vercel CLI 사용
vercel --prod
```

GitHub에 push하면 자동으로 Vercel이 재배포합니다!
