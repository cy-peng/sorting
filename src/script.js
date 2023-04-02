/**
 * 《選擇排序小遊戲》
 * 計分方式：遊戲結束時結算總分，生命值愈高、花費時間越短總分會愈高
 * 遊戲規則：選擇難度後點選任一張卡片即開始遊戲，每點選兩張卡片會自動交換數字，每次交換會扣除生命值，若生命值歸零時未將各卡片從左側開始由小至大排序則遊戲失敗，反之成功通關
 * 更新日期：2023-03-30
 * 
 * 修改紀錄：
 * V0 2023-03-30   Willie   1.註解numbers陣列，目前為隨機產生數字
 *                          2.增加多難度功能，可在setLevel()自行設定各難度的cardQty、maxHPValue
 *                          3.除錯、重構 
 * V1 2023-03-30   Willie   1.修正[重新開始]計時器未關閉問題
 *                          2.簡化swapCards(i,j)邏輯
 *                          3.增加版本控管
 */

// 定義變數
var container = document.getElementById("container"); // 容器元素
var HPText = document.getElementById("HPText"); // 生命值元素
var timer = document.getElementById("timer"); // 時間元素
var restart = document.getElementById("restart"); // 重新開始按鈕
var cards = []; // 卡片元素陣列
// var numbers = []; // 數字陣列
var selected = []; // 已選擇的卡片索引陣列
var timerValue; // 時間（秒）
var timerId;    // 計時器ID
var playStatus = 0;   // 遊戲狀態：初始0、1開始、2結束
var HPValue;    // 生命值
var maxHPValue = 10;    // 最大生命值
var cardQty = 6;        // 卡片數量
const LEVEL = {         // 遊戲難度
    low: 1,
    medium: 2,
    high: 3,
};
var currentLevel = LEVEL.low;   // 預設難度：簡單

//取得開關元素
let levelswitches = document.getElementById("switches");
let switchLow = document.getElementById("switchLow");
let switchMedium = document.getElementById("switchMedium");
let switchHigh = document.getElementById("switchHigh");


// 初始化遊戲
function init() {
    playStatus = 0;
    clearInterval(timerId);
 
    setLevel();

    // 初始化生命值值和生命值元素
    HPValue = maxHPValue;
    HPText.innerHTML = "生命值：" + HPValue;
    // 初始化時間值和時間元素
    timerValue = 0;
    timer.innerHTML = "時間：" + formatTime(timerValue);

    //畫出生命值
    drawHealth();

    // 清空容器元素
    container.innerHTML = "";
    // 清空卡片元素陣列
    cards = [];
    // 清空數字陣列
    // numbers = [];
    // 清空已選擇的卡片索引陣列
    selected = [];

    // 依難易度隨機生成n個1到100之間的數字，並存入數字陣列   
    for (var i = 0; i < cardQty; i++) {
        var num = Math.floor(Math.random() * 100) + 1;
        // numbers.push(num);
        // 建立卡片元素，並設定其內容和事件監聽器
        var card = document.createElement("div");
        card.className = "card";
        card.innerHTML = num;
        card.addEventListener("click", function () {
            selectCard(this);
        });
        // 將卡片元素加入容器元素和卡片元素陣列
        container.appendChild(card);
        cards.push(card);
    }

}

// 切換難度
function setLevel() {
    // 依currentLevel選擇難度
    switchLow.classList.remove("checked");
    switchMedium.classList.remove("checked");
    switchHigh.classList.remove("checked");
    document.querySelector("span[data-value='" + currentLevel.toString() + "']").classList.add("checked");

    var body = document.querySelector("body");

    if (currentLevel == LEVEL.low) {
        maxHPValue = 10;
        cardQty = 6;
        body.style.backgroundColor = "#f0ebe5";
    }
    else if (currentLevel == LEVEL.medium) {
        maxHPValue = 20;
        cardQty = 12;
        body.style.backgroundColor = "#dadad8";
    }
    else if (currentLevel == LEVEL.high) {
        maxHPValue = 50;
        cardQty = 18;
        body.style.backgroundColor = "#e0cdcf";
    }

    // 在控制台輸出當前的遊戲難度
    console.log("Current level is " + currentLevel);
}


// 定義一個函數來處理開關的點擊事件，更新currentLevel
function switchLevel(event) {
    if (playStatus == 1) { return };

    // 取得被點擊的開關元素
    let target = event.target;

    // 判斷被點擊的開關元素是否已經選中
    if (!target.classList.contains("checked")) {
        // 如果沒有選中，則取消其他開關的選中狀態，並將被點擊的開關元素設為選中
        switchLow.classList.remove("checked");
        switchMedium.classList.remove("checked");
        switchHigh.classList.remove("checked");
        target.classList.add("checked");

        // 與當前遊戲難度不同才更新
        if (currentLevel !== parseInt(target.getAttribute("data-value"))) {
            currentLevel = parseInt(target.getAttribute("data-value"));
            init();
        }

    }
}

// 為每個開關元素添加點擊事件監聽器
switchLow.addEventListener("click", switchLevel);
switchMedium.addEventListener("click", switchLevel);
switchHigh.addEventListener("click", switchLevel);

// 定義一個函數來畫出生命值
function drawHealth() {
    //取得畫布元素
    var HP = document.getElementById("HP");

    //取得畫布的繪圖環境
    var ctx = HP.getContext("2d");

    //清除畫布
    ctx.clearRect(0, 0, HP.width, HP.height);

    //設定繪圖樣式
    ctx.fillStyle = "#F08080";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;

    //繪製生命值的矩形
    for (var i = 0; i < HPValue; i++) {
        //計算每個矩形的位置
        var x = i * (HP.width / maxHPValue);
        var y = 0;

        //繪製填充的矩形
        ctx.fillRect(x, y, HP.width / maxHPValue, HP.height);
    }
}

// 格式化時間的函數，將秒轉換為分:秒的格式
function formatTime(seconds) {
    // 計算分鐘數和秒數
    var minutes = Math.floor(seconds / 60);
    var seconds = seconds % 60;
    // 如果分鐘數或秒數小於10，則在前面加上0
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    // 返回分:秒的格式
    return minutes + ":" + seconds;
}

// 選擇卡片的函數
function selectCard(card) {
    // 遊戲結束不允許點卡片
    if (playStatus == 2) { return }

    // 第一次點卡片
    else if (playStatus == 0) {

        // 遊戲開始
        playStatus = 1;

        // 關閉難度選項
        levelswitches.disabled = true;

        // 啟動計時器
        timerId = setInterval(function () {
            timerValue++;
            timer.innerHTML = "時間：" + formatTime(timerValue);
        }, 1000);
    }

    // 獲取卡片的索引
    var index = cards.indexOf(card);
    // 如果卡片已經被選擇，則取消選擇，並從已選擇的卡片索引陣列中移除
    if (selected.includes(index)) {
        card.classList.remove("selected");
        selected.splice(selected.indexOf(index), 1);
    }
    else {
        // 如果卡片沒有被選擇，則選擇卡片，並加入已選擇的卡片索引陣列
        card.classList.add("selected");
        selected.push(index);

        // 如果已選擇的卡片索引陣列長度為2，則交換兩個卡片的位置和數字，並取消選擇
        if (selected.length == 2) {
            //console.debug(selected);

            swapCards(selected[0], selected[1]);
            cards[selected[0]].classList.remove("selected");
            cards[selected[1]].classList.remove("selected");
            selected = [];

            // 扣除一分，並更新生命值元素
            HPValue--;
            HPText.innerHTML = "生命值：" + HPValue;
            //重新畫生命值
            drawHealth();

            // 檢查是否完成排序或者生命值歸零，如果是，則結束遊戲
            if (isSorted(cards) || HPValue == 0) {
                endGame();
            }
        }
    }
}

// 交換兩個卡片的位置和數字的函數
function swapCards(i, j) {
    // // 交換兩個數字在卡片元素陣列中的位置
    var temp = cards[i].innerHTML;
    cards[i].innerHTML=cards[j].innerHTML;
    cards[j].innerHTML = temp;
}

// 檢查一個陣列是否已經排序的函式
function isSorted(array) {
    for (var i = 0; i < array.length - 1; i++) {

        if (Number(array[i].innerHTML) > Number(array[i + 1].innerHTML)) {
            return false;
        }
    }
    return true;
}

// 結束遊戲的函數
function endGame() {
    // 停止計時器
    clearInterval(timerId);
    // 計算分數，根據交換次數和時間的比例，生命值越高越好
    //var finalHP = Math.round(HPValue * 1200 / (100 + timerValue));
    var finalHP = Math.round ((HPValue/maxHPValue)* 120);
    // 顯示提示訊息，告訴玩家遊戲結束和分數
    alert("遊戲結束！你的分數是：" + finalHP);

    // 開放難度選項
    levelswitches.disabled = false;

    playStatus = 2;
}

// 為重新開始按鈕添加事件監聽器，當點擊時，重新初始化遊戲
restart.addEventListener("click", function () {
    init();
});

// 遊戲開始時，初始化遊戲
init();