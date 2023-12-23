function predictImage() {
    document.getElementById('predict-btn').style.display = 'none';
    document.getElementById('loading').style.display = 'block';
    document.getElementById('result').style.display = 'none';

    let formData = new FormData();
    formData.append('image', document.getElementById('imageUpload').files[0]);
    
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
        fetch('/check_login_status')
        .then(response => response.json())
        .then(loginStatus => {
            setTimeout(function() {
                let additionalInfo = '';
                let collectionDayInfo = '';
    
                if (loginStatus.is_logged_in) {
                    // FlaskからのURLを使用する
                    if (data.how_url) {
                        additionalInfo = `<p>${data.class}の処理方法について詳しくは<a href="${data.how_url}" target="_blank" rel="noopener noreferrer">こちら</a>を確認してください。</p>`;
                    } else {
                        additionalInfo = '<p>あなたの街の情報はまだ更新されていません。</p>';
                    }
                    
                    // ゴミの処理日のリンクを追加
                    if (data.day_url) {
                        collectionDayInfo = `<p>${data.class}の処理日は<a href="${data.day_url}" target="_blank" rel="noopener noreferrer">こちら</a>です。</p>`;
                    } else {
                        collectionDayInfo = '';
                    }
                } else {
                    additionalInfo = '<p>会員登録してログインするとあなたの街のゴミの処理日や分別方法を知ることができます。</p>';
                    collectionDayInfo = '<p><a href="/login">ログインはこちら</a></p>';
                }
                
                document.getElementById('modalResult').innerHTML = `
                    <div class="result-content">
                        <strong>結果:</strong> ${data.class} <br>
                        <strong>判別精度:</strong> ${data.confidence_score}% <br>
                        <strong>説明:</strong> ${data.explanation}
                        ${additionalInfo}
                        ${collectionDayInfo}
                    </div>
`;              

                
                document.getElementById('resultModal').classList.add('show');
                document.getElementById('showResultButton').style.display = 'block';
                document.getElementById('loading').style.display = 'none';
            }, 2500);
        });
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



