function predictImage() {
    document.getElementById('predict-btn').style.display = 'none';
    document.getElementById('loading').style.display = 'block';
    document.getElementById('result').style.display = 'none';

    let formData = new FormData();
    formData.append('image', document.getElementById('imageUpload').files[0]);

    // ゴミの種類と対応するリンクのマップ
    const disposalLinks = {
        'ペットボトル': 'https://www4.city.kanazawa.lg.jp/soshikikarasagasu/gomigenryosuishinka/gyomuannai/1/3/3/5537.html',
        'ガラス類': 'https://www4.city.kanazawa.lg.jp/soshikikarasagasu/gomigenryosuishinka/gyomuannai/1/3/3/5544.html',
        '衣類': 'https://www4.city.kanazawa.lg.jp/soshikikarasagasu/gomigenryosuishinka/gyomuannai/1/3/kosi/7602.html',
        '乾電池': 'https://www4.city.kanazawa.lg.jp/soshikikarasagasu/gomigenryosuishinka/gyomuannai/1/3/3/5543.html',
        '空き缶': 'https://www4.city.kanazawa.lg.jp/soshikikarasagasu/gomigenryosuishinka/gyomuannai/1/3/3/5536.html',
        '燃えるゴミ': 'https://www4.city.kanazawa.lg.jp/soshikikarasagasu/gomigenryosuishinka/gyomuannai/1/3/3/7591.html',
        '生ゴミ': 'https://www4.city.kanazawa.lg.jp/soshikikarasagasu/gomigenryosuishinka/gyomuannai/1/3/3/7591.html',
        '空き瓶': 'https://www4.city.kanazawa.lg.jp/soshikikarasagasu/gomigenryosuishinka/gyomuannai/1/3/3/5535.html'
    };
    
    fetch('/predict', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.error || '未知のエラーが発生しました。');
            });
        }
        return response.json();
    })
    .then(data => {
        setTimeout(function() {
            let additionalInfo = '';
            if (disposalLinks[data.class]) {
                additionalInfo = `<p>${data.class}の処理方法について詳しくは<a href="${disposalLinks[data.class]}" target="_blank" rel="noopener noreferrer">こちら</a>を確認してください。</p>`;
            }

            document.getElementById('modalResult').innerHTML = `
                <strong>結果:</strong> ${data.class} <br> 
                <strong>判別精度:</strong> ${data.confidence_score}% <br>
                <strong>説明:</strong> ${data.explanation}
                ${additionalInfo}
            `;
            document.getElementById('resultModal').classList.add('show');
            document.getElementById('showResultButton').style.display = 'block';
            document.getElementById('loading').style.display = 'none';
        }, 2500);
    })
    .catch(err => {
        console.error(err);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').innerHTML = err.message;
        document.getElementById('error').style.display = 'block';
    });
}

function clearErrorMessage() {
    document.getElementById('error').innerHTML = '';
    document.getElementById('error').style.display = 'none';
}

document.querySelector('.close-button').addEventListener('click', function() {
    document.getElementById('resultModal').classList.remove('show');
});

window.addEventListener('click', function(event) {
    const modal = document.getElementById('resultModal');
    if (event.target == modal) {
        modal.classList.remove('show');
    }
});

document.getElementById('showResultButton').addEventListener('click', function() {
    document.getElementById('resultModal').classList.add('show');
});

function previewImage(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            const imagePreview = document.getElementById('imagePreview');
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';

            document.getElementById('predict-btn').style.display = 'block';
            document.querySelector('.image-upload-label').textContent = '別の画像をアップロード';

            document.getElementById('showResultButton').style.display = 'none';
            clearErrorMessage();
        };

        reader.readAsDataURL(input.files[0]);
    }
}



