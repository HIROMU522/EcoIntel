// script.js

function fetchAddress() {
    const zipcode = document.getElementsByName('postcode')[0].value;
    fetch(`/get_address?zipcode=${zipcode}`)
        .then(response => response.json())
        .then(data => {
            document.getElementsByName('address')[0].value = data.address; // 全住所を表示
            fetchSchoolDistrict(data.town_name); // 町名を使って校区情報を取得
        })
        .catch(error => console.error('Error:', error));
}

function extractTownName(address) {
    // 住所を空白で分割
    var parts = address.split(' ');
    // 町名を正しく抽出するためのロジックを追加する
    // 例えば、住所が「東京都墨田区押上」という形式の場合、3番目の要素が町名になる
    var townNameIndex = parts.length >= 3 ? 2 : parts.length - 1; // 「市区町村」の次が町名
    var townName = parts[townNameIndex];
    return townName;
}

function fetchSchoolDistrict(townName) {
    fetch(`/get_school_districts?town=${encodeURIComponent(townName)}`)
        .then(response => response.json())
        .then(data => {
            const schoolSelect = document.getElementsByName('school_district')[0];
            schoolSelect.innerHTML = ''; // 既存の選択肢をクリア
            data.school_districts.forEach(school => {
                schoolSelect.innerHTML += `<option>${school}</option>`; // 選択肢を追加
            });
        })
        .catch(error => console.error('Error fetching school district:', error));
}



