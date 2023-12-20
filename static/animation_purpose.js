const CLASSNAME = "-visible";
const DELAY_TEXT = 100;
const INITIAL_DELAY = 1000; // 1秒の遅延
const BG_START_DELAY = 1000; //背景アニメーション開始の遅延時間

const $targetBG = $(".bg");
const $targetTitle = $(".title");
const $targetSentence = $(".sentence");

// 背景のアニメーション
const animateBackground = () => {
  if (!$targetBG.hasClass(CLASSNAME)) {
    $targetBG.addClass(CLASSNAME);
  }
}

// テキストのアニメーション
const animateText = () => {
  // アニメーションが一度表示されたらそのまま維持するための処理を追加
  if (!$targetTitle.hasClass(CLASSNAME)) {
    $targetTitle.addClass(CLASSNAME);
  }
  setTimeout(() => {
    if (!$targetSentence.hasClass(CLASSNAME)) {
      $targetSentence.addClass(CLASSNAME);
    }
  }, DELAY_TEXT);
}

// 初回のテキストアニメーションを遅らせて開始
setTimeout(() => {
  animateText();
}, INITIAL_DELAY);

// スクロールイベントのハンドラ
const handleScroll = () => {
  // 背景のアニメーションが画面に表示されたら開始
  const bgOffset = $targetBG.offset().top;
  const windowHeight = $(window).height();
  if (bgOffset < $(window).scrollTop() + windowHeight) {
    setTimeout(() => {
      animateBackground();
    }, BG_START_DELAY);
  }
}

// スクロールイベントを監視
$(document).ready(() => {
  $(window).scroll(handleScroll);
});