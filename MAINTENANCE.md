# OFFLOOP 웹사이트 유지보수 가이드

이 문서는 개발 지식이 없어도 웹사이트의 콘텐츠(작품, 전시, 소개 글 등)를 추가, 수정, 삭제하고 관리할 수 있도록 안내하는 가이드라인입니다.

현재 OFFLOOP 웹사이트는 데이터베이스나 복잡한 서버 없이, GitHub에 저장된 텍스트 파일(`index.json`, `.json`, `.md`)과 이미지 파일들을 직접 읽어서 방문자에게 보여주는 방식으로 작동합니다.

이 문서의 안내를 보며 구글 안티그래비티(Antigravity) AI 비서에게 자연어로 요청하거나, 필요시 직접 파일을 수정하여 관리할 수 있습니다.

---

## 목차
1. [AI(Antigravity)에게 명령어 요청하기 (추천)](#1-aiantigravity에게-명령어-요청하기-추천)
2. [아카이브 작품 관리 방법](#2-아카이브-작품-관리-방법)
3. [전시 관리 방법](#3-전시-관리-방법)
4. ["눈자리나게" 및 카테고리 관리 방법](#4-눈자리나게-및-카테고리-관리-방법)
5. [소개(ABOUT) 페이지 수정 방법](#5-소개about-페이지-수정-방법)
6. [배포 및 변경사항 반영 과정](#6-배포-및-변경사항-반영-과정)
7. [문제가 발생했을 때 확인해야 할 사항](#7-문제가-발생했을-때-확인해야-할-사항)

---

## 1. AI(Antigravity)에게 명령어 요청하기 (추천)

사용자는 코드를 직접 만질 필요 없이, 안티그래비티 AI 채팅창에 다음 예시처럼 한국어 자연어로 요청하여 사이트 콘텐츠를 관리할 수 있습니다. AI가 이미지 위치 조정, JSON 파일 생성/수정, `content/index.json` 업데이트를 모두 자동으로 처리해 드립니다.

### 아카이브 작품 추가 요청 예시
> "아카이브에 새 작품을 추가해줘.
> 제목: 가볍고 두꺼운
> 사진파일: work-04.jpg
> 내용: 종이 구조물을 이용한 설치 작업이다."

### 전시 추가 요청 예시
> "전시에 새 전시를 추가해줘.
> 전시제목: 공간의 흔적들
> 년도: 2026
> 장소: 인천아트플랫폼
> 사진: exhibition-04.jpg
> 내용: 지역과 공간을 연구한 기획 전시이다."

---

## 2. 아카이브 작품 관리 방법

작품 데이터는 `content/archive/` 폴더에 `.json` 파일로 관리되며, 모든 목록은 `content/index.json`에 기록됩니다.

### 1) 새로운 아카이브 작품 추가
* **이미지 등록**: 이미지 파일을 `assets/images/archive/` 폴더에 업로드합니다 (예: `work-04.jpg`).
* **데이터 파일 생성**: `content/archive/` 폴더 아래에 고유한 이름으로 JSON 파일을 만듭니다 (예: `work-04.json`).
  ```json
  {
    "title": "작품 제목",
    "image": "assets/images/archive/work-04.jpg",
    "description": "작품에 대한 설명입니다. (생략 가능)"
  }
  ```
  *(참고: category는 적지 않으면 자동으로 "눈자리나게"로 인식됩니다.)*
* **인덱스 파일 업데이트**: `content/index.json` 파일의 `"archive"` 목록에 방금 만든 파일의 정보를 추가합니다.
  ```json
  {
    "slug": "work-04",
    "filename": "work-04.json",
    "data": {
      "title": "작품 제목",
      "category": "눈자리나게",
      "image": "assets/images/archive/work-04.jpg",
      "description": "작품에 대한 설명입니다. (생략 가능)"
    }
  }
  ```

### 2) 작품 제목/내용 수정 및 사진 교체
* **수정하려는 작품 파일 열기**: `content/archive/` 안의 해당 파일(예: `work-04.json`)을 엽니다.
* **필드 수정**:
  * 제목을 바꿀 때: `"title"` 값을 변경합니다.
  * 내용을 바꿀 때: `"description"` 값을 변경합니다.
  * 사진을 바꿀 때: 새로운 이미지 파일을 `assets/images/archive/`에 올리고, `"image"` 경로를 바꿉니다.
* **인덱스 파일 동기화**: `content/index.json` 파일에서도 똑같이 해당 작품의 `"title"`, `"description"`, `"image"` 값을 동일하게 수정해 줍니다.

### 3) 작품 삭제
* **파일 삭제**: `content/archive/` 폴더에서 해당 작품의 JSON 파일을 삭제합니다.
* **인덱스에서 제외**: `content/index.json` 파일의 `"archive"` 항목 안에서 해당 작품 오브젝트를 삭제합니다.

---

## 3. 전시 관리 방법

전시 데이터는 `content/exhibitions/` 폴더에 `.json` 파일로 관리됩니다.

### 1) 새로운 전시 추가
* **이미지 등록**: 전시 대표 사진을 `assets/images/exhibitions/` 폴더에 업로드합니다 (예: `exhibition-04.jpg`).
* **데이터 파일 생성**: `content/exhibitions/` 폴더 아래에 고유한 이름으로 JSON 파일을 생성합니다 (예: `exhibition-04.json`).
  ```json
  {
    "title": "전시 제목",
    "year": 2026,
    "venue": "전시 장소",
    "image": "assets/images/exhibitions/exhibition-04.jpg",
    "description": "전시 내용 설명글입니다. (생략 가능)"
  }
  ```
* **인덱스 파일 업데이트**: `content/index.json` 파일의 `"exhibitions"` 목록에 추가합니다.
  ```json
  {
    "slug": "exhibition-04",
    "filename": "exhibition-04.json",
    "data": {
      "title": "전시 제목",
      "year": 2026,
      "venue": "전시 장소",
      "image": "assets/images/exhibitions/exhibition-04.jpg",
      "description": "전시 내용 설명글입니다. (생략 가능)"
    }
  }
  ```

### 2) 전시 제목/내용/장소/연도 수정 및 사진 교체
* **수정하려는 전시 파일 열기**: `content/exhibitions/` 안의 해당 파일(예: `exhibition-04.json`)을 엽니다.
* **필드 수정**: `"title"`, `"year"`, `"venue"`, `"image"`, `"description"` 등 필요한 부분을 수정합니다.
* **인덱스 파일 동기화**: `content/index.json` 파일에서도 해당 전시 항목을 똑같이 찾아 수정해 줍니다.

### 3) 전시 삭제
* **파일 삭제**: `content/exhibitions/` 폴더 내 해당 파일을 삭제합니다.
* **인덱스에서 제외**: `content/index.json` 파일의 `"exhibitions"` 목록에서 해당 항목을 삭제합니다.

---

## 4. "눈자리나게" 및 카테고리 관리 방법

현재 기본 설정상 아카이브의 기본 카테고리는 `"눈자리나게"`로 고정되어 있습니다.

### 1) 카테고리 지정 원리
* 새로 등록하는 작품의 JSON 파일 안에 `"category"` 필드를 명시하지 않으면 시스템에서 기본적으로 `"눈자리나게"` 카테고리로 지정합니다.

### 2) 새로운 카테고리 추가 방법
새로운 전시 주제나 작품 카테고리(예: `"일상의 조각"`)를 만들고 싶다면 다음과 같이 진행합니다.
1. **작품 데이터 수정**: 새로운 카테고리에 속할 작품의 JSON 파일(예: `work-05.json`) 안에 `"category": "일상의 조각"` 필드를 작성합니다.
   * `content/index.json` 내의 해당 작품 data 객체에도 `"category": "일상의 조각"`으로 넣어 줍니다.
2. **웹 필터 메뉴에 추가**: `assets/js/app.js` 파일의 약 180번째 줄에 위치한 `renderArchive` 함수 내 버튼 필터 목록(HTML 태그 부분)에 새로운 필터 버튼을 한 줄 추가합니다.
   ```html
   <!-- assets/js/app.js 내의 filters 부분 수정 예시 -->
   <div class="filters">
     <button class="filter ${category==="all"?"active":""}" data-cat="all">전체</button>
     <button class="filter ${category==="눈자리나게"?"active":""}" data-cat="눈자리나게">눈자리나게</button>
     <button class="filter ${category==="일상의 조각"?"active":""}" data-cat="일상의 조각">일상의 조각</button> <!-- 추가된 카테고리 -->
   </div>
   ```
3. **버튼 해시 라우팅 링크 등록**: `assets/js/app.js` 내 아래 이벤트 리스너 부분을 수정하여 새 카테고리 주소를 지정합니다.
   ```javascript
   // 수정 전
   location.hash = cat === "눈자리나게" ? "#/archive/눈자리나게" : "#/archive";
   
   // 수정 후 (새로운 카테고리가 들어갈 때 삼항 연산자를 활용하거나 조건문으로 매칭)
   if (cat === "all") {
     location.hash = "#/archive";
   } else {
     location.hash = `#/archive/${cat}`;
   }
   ```

---

## 5. 소개(ABOUT) 페이지 수정 방법

소개 글은 아카이브 데이터나 전시와 완전히 분리되어 관리하기 쉽습니다.

* **수정할 파일**: `content/about.json`
* **파일의 구조**:
  ```json
  {
    "title": "ABOUT",
    "name": "OFFLOOP",
    "paragraphs": [
      "첫 번째 문단 내용입니다.",
      "두 번째 문단 내용입니다.",
      "이메일 혹은 연락처 연락처 정보"
    ]
  }
  ```
* **수정 방법**:
  * 작가명이나 제목을 바꾸려면 `"name"`이나 `"title"` 값을 변경합니다.
  * 소개 본문 내용을 고치려면 `"paragraphs"` 대괄호 `[ ]` 안의 문장들을 수정하거나 줄을 추가/삭제합니다.
  * 변경 완료 후 저장하면 즉시 소개 화면에 반영됩니다.

---

## 6. 배포 및 변경사항 반영 과정

웹사이트는 **GitHub Pages**를 통해 호스팅되고 있습니다.

1. **파일 변경**: AI 비서에게 지시하거나 직접 파일을 편집하여 변경합니다.
2. **Git Commit & Push**: 변경된 코드 및 이미지 파일들을 로컬 저장소에서 GitHub 원격 저장소(`main` 브랜치)로 커밋하고 푸시(Push)합니다.
3. **자동 배포**: GitHub 저장소에 코드가 커밋되면 GitHub Action 혹은 Pages 빌드 서비스가 실행되어 약 30초 ~ 1분 이내에 자동으로 https://offloop2026.github.io/ 웹사이트로 최신 내용이 반영되어 발행됩니다.

---

## 7. 문제가 발생했을 때 확인해야 할 사항

1. **콘텐츠를 추가했는데 화면에 보이지 않을 때**:
   * `content/index.json` 파일에 추가한 작품/전시의 정보가 정확하게 오타 없이 들어가 있는지 확인하십시오.
   * `content/archive/` 또는 `content/exhibitions/` 폴더 안의 파일명과 `content/index.json`에 써 놓은 `"filename"`이 완벽하게 일치하는지 체크해 주세요 (대소문자 구분 포함).
2. **이미지가 엑박으로 뜨거나 안 보일 때**:
   * 이미지 파일이 실제로 `assets/images/archive/` 또는 `assets/images/exhibitions/` 안에 존재해야 합니다.
   * JSON 파일 안의 `"image"` 경로가 정확히 `assets/images/...`로 지정되어 있는지 확인하세요. 이미지 확장자(`.jpg`, `.png`, `.jpeg` 등)가 다른지 대조해 봅니다.
   * 파일명에 공백이나 한글, 특수문자가 포함되면 웹 브라우저가 링크를 읽지 못할 수 있으므로 가급적 영어와 대시(`-`), 숫자만 사용하는 것을 적극 추천합니다.
3. **소개 글 수정 도중 에러가 날 때**:
   * `content/about.json` 파일 수정 도중 따옴표(`, ")의 짝이 맞지 않거나, 쉼표(`,`)의 규칙이 깨졌는지(마지막 줄에는 쉼표 생략) JSON 문법 오류를 검사해 보세요.
