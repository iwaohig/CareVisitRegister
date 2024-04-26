// DOMContentLoaded イベントリスナーを追加
document.addEventListener("DOMContentLoaded", function() {
    initializeWoffApp();
});

// WOFF ID を定義
const WOFF_ID = "VjnjknGfxZDNxzU5SmNoUw";

// WOFF アプリを初期化する関数
function initializeWoffApp() {
    // WOFF_ID が未定義の場合はエラーをログに出力
    if (typeof WOFF_ID === 'undefined') {
        console.error('WOFF_ID is not defined.');
        return;
    }

    woff.init({ woffId: WOFF_ID })
        .then(() => {
            if (!woff.isInClient() && !woff.isLoggedIn()) {
                console.log("ログインを促します。");
                woff.login().catch(err => {
                    console.error("ログインプロセス中にエラーが発生しました:", err);
                });
            } else {
                getProfileAndFillForm();
                // プロファイル情報の取得後、アクセストークンも取得してフォームに設定
                getAccessTokenAndSetToForm();
            }
        })
        .catch(err => {
            console.error("WOFF SDKの初期化に失敗しました:", err);
        });
}

function getProfileAndFillForm() {
    woff.getProfile()
        .then(profile => {
            document.getElementById("displayNameInput").value = profile.displayName;
            document.getElementById("userIdInput").value = profile.userId;
        })
        .catch(err => {
            console.error("プロファイル情報の取得に失敗しました:", err);
        });
}

// 新たにアクセストークンを取得してフォームに設定する関数
// アクセストークンを取得してフォームに設定する関数の修正版
function getAccessTokenAndSetToForm() {
    // 仮定: woff.getAccessToken()が直接トークンを返す場合
    const token = woff.getAccessToken();
    if (token) {
        setAccessTokenToForm(token);
    } else {
        console.error("アクセストークンの取得に失敗しました");
    }
}

// アクセストークンをフォームに設定する処理を分離
function setAccessTokenToForm(token) {
    const tokenField = document.createElement('input');
    tokenField.setAttribute('type', 'hidden');
    tokenField.setAttribute('name', 'accessToken');
    tokenField.setAttribute('value', token);
    document.getElementById("myForm").appendChild(tokenField);
}

function submitForm() {
    const formElement = document.getElementById("myForm");
    const formData = new FormData(formElement);

    // チェックボックスで選択された介護サービスを配列として取得
    const careServices = [];
    document.querySelectorAll('input[name="careService"]:checked').forEach(checkbox => {
        careServices.push(checkbox.value);
    });

    // チェックボックスで選択された服薬関連サービスを配列として取得
    const medicationServices = [];
    document.querySelectorAll('input[name="medicationService"]:checked').forEach(checkbox => {
        medicationServices.push(checkbox.value);
    });

    // フォームデータをJSONに変換
    const jsonObject = {};
    formData.forEach((value, key) => {
        jsonObject[key] = value;
    });

    // 配列データをJSONオブジェクトに追加
    jsonObject["careServices"] = careServices;
    jsonObject["medicationServices"] = medicationServices;

    const json = JSON.stringify(jsonObject);

    fetch('https://prod-23.japaneast.logic.azure.com:443/workflows/b2bda14e9b564633baa2833f52c539f8/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=7V4Mco3uO6uaa2uZnufgzezt0sa225s1v55dbdvDyTg', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: json
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        console.log('Form data sent successfully');
        woff.closeWindow();
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });
}
