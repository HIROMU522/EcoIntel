// ステップバーの要素を取得
let steps = document.querySelectorAll('.step-bar ul li');

// 入力チェック関数
function isInputValid(selector) {
    // 指定されたセレクタにマッチする全ての入力欄を取得
    let inputs = document.querySelectorAll(selector + ' input[required]');
    for (let input of inputs) {
      // 入力欄が空かどうかをチェック
      if (!input.value.trim()) {
        return false;
      }
    }
    return true;
  }
  
  document.addEventListener('DOMContentLoaded', function() {
    let steps = document.querySelectorAll('.step-bar ul li');

    function isInputValid(selector) {
        let inputs = document.querySelectorAll(selector + ' input[required]');
        for (let input of inputs) {
            if (!input.value.trim()) {
                return false;
            }
        }
        return true;
    }

    document.querySelector('.firstNext').addEventListener('click', () => {
        if (!isInputValid('.account-setup')) {
            alert('すべての必須項目を入力してください。');
            return;
        }
        steps[1].querySelector('.number').classList.add('active');
        steps[1].querySelector('.line').classList.add('line-active');
        document.querySelector('.account-setup').style.left = '-4000px';
        document.querySelector('.user-details').style.left = 'calc(50% - 175px)';
    });

    document.querySelector('.secondNext').addEventListener('click', () => {
        if (!isInputValid('.user-details')) {
            alert('すべての必須項目を入力してください。');
            return;
        }
        steps[2].querySelector('.number').classList.add('active');
        steps[2].querySelector('.line').classList.add('line-active');
        document.querySelector('.user-details').style.left = '-4000px';
        document.querySelector('.finish-step').style.left = 'calc(50% - 175px)';
    });

    document.querySelector('.firstPrev').addEventListener('click', () => {
        steps[1].querySelector('.number').classList.remove('active');
        steps[1].querySelector('.line').classList.remove('line-active');
        document.querySelector('.user-details').style.left = '4000px';
        document.querySelector('.account-setup').style.left = 'calc(50% - 175px)';
    });

    document.querySelector('.secondPrev').addEventListener('click', () => {
        steps[2].querySelector('.number').classList.remove('active');
        steps[2].querySelector('.line').classList.remove('line-active');
        document.querySelector('.finish-step').style.left = '4000px';
        document.querySelector('.user-details').style.left = 'calc(50% - 175px)';
    });

    // Registerボタンのイベントハンドラ
    document.querySelector('.finish-step .button[type="submit"]').addEventListener('click', function(e) {
        if (!isInputValid('.finish-step')) {
            alert('すべての必須項目を入力してください。');
            e.preventDefault(); // フォームの送信を防ぐ
            return;
        }
        // ここでフォームが送信されます
    });
});
