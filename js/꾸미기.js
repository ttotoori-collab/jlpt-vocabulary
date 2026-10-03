/*
 * 화면 장식과 잔재미를 맡는 모듈.
 *   · 쪽지 말풍선 띄우기
 *   · 제목 표시줄의 최소화·닫기 버튼 (옛날 창 흉내)
 *   · 화면 모드(기본·밤·베이직) 갈아끼우기
 *   · 공부시간 보기 좋게 바꾸기
 */

let 쪽지시계 = null;

/*
 * 글 사이에 섞인 꾸밈 글자(이모지)를 담는 조각.
 *
 * 베이직 모드가 .글자장식 을 display: none 으로 감춘다. 그래서 이모지를 글에 바로
 * 붙이지 않고 이 조각에 싸서 넣는다. 화면에 띄워 둔 채 모드를 바꿔도 같이 사라진다.
 * 화면 낭독기에는 읽히지 않아도 되는 장식이라 aria-hidden 을 붙인다.
 */
export function 장식조각(글자) {
  const 조각 = document.createElement("span");
  조각.className = "글자장식";
  조각.setAttribute("aria-hidden", "true");
  조각.textContent = ` ${글자}`;
  return 조각;
}

/**
 * 노란 쪽지 말풍선을 잠깐 띄운다.
 * 장식 은 문구 뒤에 붙일 이모지다. 베이직 모드에서는 저절로 감춰진다.
 */
export function 쪽지보이기(쪽지, 문구, 장식 = "", 머무는시간 = 2600) {
  쪽지.replaceChildren(document.createTextNode(문구));
  if (장식) 쪽지.append(장식조각(장식));
  쪽지.hidden = false;

  clearTimeout(쪽지시계);
  쪽지시계 = setTimeout(() => { 쪽지.hidden = true; }, 머무는시간);
}

export function 쪽지감추기(쪽지) {
  clearTimeout(쪽지시계);
  쪽지.hidden = true;
}

/** 최소화 버튼: 제목 표시줄만 남기고 창을 접는다. */
export function 창접기달기(창, 최소화버튼) {
  최소화버튼.addEventListener("click", () => {
    const 접힘 = 창.classList.toggle("접힘");
    최소화버튼.textContent = 접힘 ? "□" : "─";
    최소화버튼.setAttribute("aria-label", 접힘 ? "창 펴기" : "창 접기");
    최소화버튼.title = 접힘 ? "펴기" : "접기";
  });
}

/** 닫기 버튼: 정말 닫지는 않고 귀여운 핀잔만 준다. */
export function 닫기장난달기(닫기버튼, 쪽지) {
  // 이모지는 문구에서 떼어 둔다. 베이직 모드에서 감춰야 하기 때문이다.
  const 핀잔들 = [
    { 문구: "못 닫아요~ 단어 더 외워야 해요!", 장식: "♡" },
    { 문구: "아직 안 돼요! 한 장만 더 봐요", 장식: "🎀" },
    { 문구: "닫기는 장식이에요 ㅎㅎ", 장식: "⭐" },
  ];
  let 차례 = 0;

  닫기버튼.addEventListener("click", () => {
    const 핀잔 = 핀잔들[차례 % 핀잔들.length];
    쪽지보이기(쪽지, 핀잔.문구, 핀잔.장식);
    차례 += 1;
  });
}

/*
 * 화면 모드 세 가지.
 *
 * <html> 에 클래스를 붙였다 뗐다 하는 것이 전부다.
 *   기본   클래스 없음        스타일.css 의 :root
 *   밤     "밤모드"           :root.밤모드
 *   베이직 "베이직"           :root.베이직
 * 스타일.css 가 색 변수를 통째로 갈아끼우므로 여기서 색을 직접 건드릴 일은 없다.
 *
 * 테마 버튼은 누를 때마다 테마순서 를 따라 한 칸씩 돈다.
 * 버튼에 적히는 글자는 "다음에 될 모드" 가 아니라 "지금 모드" 다.
 */
export const 테마순서 = ["낮", "밤", "베이직"];

const 테마모양 = {
  낮: {
    아이콘: "☀️", 이름: "기본", 주소창색: "#dc6b9f",
    쪽지: "기본 모드로 돌아왔어요", 쪽지장식: "☀️",
  },
  밤: {
    아이콘: "🌙", 이름: "밤", 주소창색: "#1a1740",
    쪽지: "밤 모드예요. 잘 자요", 쪽지장식: "🌙",
  },
  베이직: {
    // 베이직 모드는 툴바 아이콘까지 감추므로 이 글자는 모드가 바뀌는 순간만 보인다.
    아이콘: "□", 이름: "베이직", 주소창색: "#ffffff",
    쪽지: "베이직 모드예요. 색과 그림을 모두 껐어요", 쪽지장식: "",
  },
};

/** 모르는 이름(옛 기록이나 손으로 고친 값)이 와도 기본 모드로 돌려놓는다. */
export function 테마고르기(이름) {
  return 테마순서.includes(이름) ? 이름 : "낮";
}

/** 테마 버튼을 눌렀을 때 다음에 올 모드. 기본 → 밤 → 베이직 → 기본 순서다. */
export function 다음테마(이름) {
  const 자리 = 테마순서.indexOf(테마고르기(이름));
  return 테마순서[(자리 + 1) % 테마순서.length];
}

/** 모드를 바꿨을 때 띄울 쪽지. { 문구, 장식 } 을 돌려준다. */
export function 테마쪽지(이름) {
  const 모양 = 테마모양[테마고르기(이름)];
  return { 문구: 모양.쪽지, 장식: 모양.쪽지장식 };
}

export function 테마입히기(이름, 버튼, 아이콘, 글) {
  const 고른것 = 테마고르기(이름);
  const 모양 = 테마모양[고른것];
  const 뿌리 = document.documentElement;

  뿌리.classList.toggle("밤모드", 고른것 === "밤");
  뿌리.classList.toggle("베이직", 고른것 === "베이직");

  아이콘.textContent = 모양.아이콘;
  글.textContent = 모양.이름;

  // 모드가 셋이라 눌림(aria-pressed) 으로는 못 담는다. 지금 모드와 다음 모드를 글로 적는다.
  const 설명 = `${모양.이름} 모드 · 누르면 ${테마모양[다음테마(고른것)].이름} 모드`;
  버튼.title = 설명;
  버튼.setAttribute("aria-label", 설명);

  // 주소창·상태바 색도 맞춰 준다. 휴대폰에서 창 둘레만 하얗게 뜨는 것을 막는다.
  const 테마색 = document.querySelector('meta[name="theme-color"]');
  if (테마색) 테마색.setAttribute("content", 모양.주소창색);
}

/** 초를 05:53 처럼, 한 시간이 넘으면 1:05:53 처럼 바꾼다. */
export function 시간글(총초) {
  const 초 = Math.max(0, Math.floor(총초));
  const 시 = Math.floor(초 / 3600);
  const 분 = Math.floor((초 % 3600) / 60);
  const 남은초 = 초 % 60;
  const 두자리 = (숫자) => String(숫자).padStart(2, "0");

  return 시 > 0 ? `${시}:${두자리(분)}:${두자리(남은초)}` : `${두자리(분)}:${두자리(남은초)}`;
}
