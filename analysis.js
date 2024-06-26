$(document).ready(function() {
    // 假設你的數據已經轉換為 JSON 格式
    const data = [
        { time: "2022-07-05 09:54", price: 14257, type: "新買", code: "A01" },
        { time: "2022-07-05 10:57", price: 14017, type: "平賣", code: "A02" },
        // ... 其他數據
    ];

    // initializeCharts( data );
});

let profitChart, winRatioChart;  // 宣告圖表變數

function processData(data) {
    let newBuy = false;
    let newSale = false;
    let totalBenefitPrice = 0;
    let totalBenefitPrice_1 = 0;
    let totalBenefitPrice_12_average = 0;
    let totalBenefitPrice_2 = 0;
    let winTimes = 0;
    let loseTimes = 0;

    const processedData = data.map((trade, index) => {
        const nextTrade = data[index + 1] || {};
        let benefit = 0;
        let benefitPrice = 0;
        let benefitPrice_1 = 0;
        let benefitPrice_12_average = 0;
        let benefitPrice_2 = 0;

        if (trade.code === 'A01' && !newBuy) {
            newBuy = true;
            benefit = nextTrade.price - trade.price;
            benefitPrice = benefit * 200 - 220;
            benefitPrice_1 = (benefit-1) * 200 - 220;
            benefitPrice_2 = (benefit-2) * 200 - 220;
            benefitPrice_12_average = ( benefitPrice_1 + benefitPrice_2 ) /2 ;

            if (benefit > 0) winTimes++;
            else loseTimes++;

            totalBenefitPrice += benefitPrice;
            totalBenefitPrice_1 += benefitPrice_1;
            totalBenefitPrice_2 += benefitPrice_2;
            totalBenefitPrice_12_average += benefitPrice_12_average;
        }

        if (trade.code === 'A02') newBuy = false;

        if (trade.code === 'A03' && !newSale) {
            newSale = true;
            benefit = trade.price - nextTrade.price;
            benefitPrice = benefit * 200 - 220;
            benefitPrice_1 = (benefit-1) * 200 - 220;
            benefitPrice_2 = (benefit-2) * 200 - 220;
            benefitPrice_12_average = ( benefitPrice_1 + benefitPrice_2 ) /2 ;

            if (benefit > 0) winTimes++;
            else loseTimes++;

            totalBenefitPrice += benefitPrice;
            totalBenefitPrice_1 += benefitPrice_1;
            totalBenefitPrice_2 += benefitPrice_2;
            totalBenefitPrice_12_average += benefitPrice_12_average;
        }

        if (trade.code === 'A04') newSale = false;

        if (trade.code === 'A05') {
            newBuy = false;
            newSale = false;
        }

        return {
            ...trade,
            benefit,
            benefitPrice,
            benefitPrice_1,
            benefitPrice_12_average,
            benefitPrice_2,
            totalBenefitPrice,
            totalBenefitPrice_1,
            totalBenefitPrice_2,
            totalBenefitPrice_12_average,
            winTimes,
            loseTimes,
            winRatio: winTimes / (winTimes + loseTimes) * 100
        };
    });

    const winRatio = winTimes / (winTimes + loseTimes);

    return {
        processedData,
        totalBenefitPrice,
        totalBenefitPrice_1,
        totalBenefitPrice_2,
        totalBenefitPrice_12_average,
        winRatio
    };
}

function createCharts(processedData) {
    // 如果圖表已存在，先銷毀它們
    if (profitChart) profitChart.destroy();
    if (winRatioChart) winRatioChart.destroy();

    // 創建收益圖表
    profitChart = new Chart($("#profitChart"), {
        type: 'line',
        data: {
            labels: processedData.map(t => t.time),
            datasets: [{
                label: '累計收益',
                data: processedData.map(t => t.totalBenefitPrice),
                borderColor: 'blue',
                fill: false
            },
            {
                label: '累計收益-1',
                data: processedData.map(t => t.totalBenefitPrice_1),
                borderColor: 'red',
                fill: false
            },
            {
                label: '累計收益-2',
                data: processedData.map(t => t.totalBenefitPrice_2),
                borderColor: 'green',
                fill: false
            },
            {
                label: '累計收益-1-2平均',
                data: processedData.map(t => t.totalBenefitPrice_12_average),
                borderColor: 'yellow',
                fill: false
            }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '累計收益趨勢'
                }
            }
        }
    });
    
    // 創建勝率圖表
    winRatioChart = new Chart($("#winRatioChart"), {
        type: 'line',
        data: {
            labels: processedData.map(t => t.time),
            datasets: [{
                label: '勝率',
                data: processedData.map(t => t.winRatio),
                borderColor: 'green',
                fill: false
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '勝率變化'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

function updateSummary(totalBenefitPrice, totalBenefitPrice_1, totalBenefitPrice_2, totalBenefitPrice_12_average, winRatio) {
    $("#totalBenefitPrice").text(totalBenefitPrice.toFixed(2));
    $("#totalBenefitPrice_1").text(totalBenefitPrice_1.toFixed(2));
    $("#totalBenefitPrice_2").text(totalBenefitPrice_2.toFixed(2));
    $("#totalBenefitPrice_12_average").text(totalBenefitPrice_12_average.toFixed(2));
    
    $("#winRatio").text((winRatio * 100).toFixed(2) + "%");
}

// 主要執行邏輯
function initializeCharts( data ) {
    const { processedData, totalBenefitPrice, totalBenefitPrice_1, totalBenefitPrice_2, totalBenefitPrice_12_average, winRatio } = processData(data);
    createCharts(processedData);
    updateSummary(totalBenefitPrice, totalBenefitPrice_1, totalBenefitPrice_2, totalBenefitPrice_12_average, winRatio);
}
