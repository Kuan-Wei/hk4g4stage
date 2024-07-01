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
    let loopList = ["0", "1", "2", "average"]
    let totalBenefitPrice = {"0":0, "1":0, "2":0, "average":0};
    let rowBenefitPrice_0 = 0;
    let rowBenefitPrice_1 = 0;
    let rowBenefitPrice_2 = 0;
    let rowBenefitPrice_average = 0;
    let winTimes = {"0":0, "1":0, "2":0, "average":0};
    let loseTimes = {"0":0, "1":0, "2":0, "average":0};
    let winPrice = {"0":0, "1":0, "2":0, "average":0};
    let losePrice = {"0":0, "1":0, "2":0, "average":0};
    let maxBackValue = {"0":0, "1":0, "2":0, "average":0};
    let maxValue = {"0":0, "1":0, "2":0, "average":0};
    let winRatio = {"0":0, "1":0, "2":0, "average":0};

    const processedData = data.map((trade, index) => {
        const nextTrade = data[index + 1] || {};
        let benefit = {"0":0, "1":0, "2":0, "average":0};
        let benefitPrice = {"0":0, "1":0, "2":0, "average":0};

        if (trade.code === 'A01' && !newBuy) {
            newBuy = true;
            benefit["0"] = nextTrade.price - trade.price;
            benefit["1"] = benefit["0"]-1;
            benefit["2"] = benefit["0"]-2;
            benefit["average"] = benefit["0"]-1.5;
            
            for (let loop of loopList) {
                benefitPrice[loop] = benefit[loop] * 200 - 260;
                if (benefit[loop] > 0) {
                    winPrice[loop] += benefit[loop];
                    winTimes[loop]++;
                }
                else {
                    losePrice[loop] += benefit[loop];
                    loseTimes[loop]++;
                }
                winRatio[loop] = winTimes[loop] / (winTimes[loop] + loseTimes[loop]);
                totalBenefitPrice[loop] += benefitPrice[loop];
                if (totalBenefitPrice[loop] > maxValue[loop]) maxValue[loop] = totalBenefitPrice[loop];
                if (totalBenefitPrice[loop] < maxValue[loop]) {
                    maxBackValue[loop] = Math.min(maxBackValue[loop], totalBenefitPrice[loop] - maxValue[loop]);
                }
            }            
            rowBenefitPrice_0 += benefitPrice["0"];
            rowBenefitPrice_1 += benefitPrice["1"];
            rowBenefitPrice_2 += benefitPrice["2"];
            rowBenefitPrice_average += benefitPrice["average"];
        }

        if (trade.code === 'A02') newBuy = false;
        if (trade.code === 'A02') newBuy = false;

        if (trade.code === 'A03' && !newSale) {
            newSale = true;
            benefit["0"] = trade.price - nextTrade.price;
            benefit["1"] = benefit["0"]-1;
            benefit["2"] = benefit["0"]-2;
            benefit["average"] = benefit["0"]-1.5;
            
            for (let loop of loopList) {
                benefitPrice[loop] = benefit[loop] * 200 - 260;
                if (benefit[loop] > 0) {
                    winPrice[loop] += benefit[loop];
                    winTimes[loop]++;
                }
                else {
                    losePrice[loop] += benefit[loop];
                    loseTimes[loop]++;
                }
                winRatio[loop] = winTimes[loop] / (winTimes[loop] + loseTimes[loop]);
                totalBenefitPrice[loop] += benefitPrice[loop];
                if (totalBenefitPrice[loop] > maxValue[loop]) maxValue[loop] = totalBenefitPrice[loop];
                if (totalBenefitPrice[loop] < maxValue[loop]) {
                    maxBackValue[loop] = Math.min(maxBackValue[loop], totalBenefitPrice[loop] - maxValue[loop]);
                }
            }
            rowBenefitPrice_0 += benefitPrice["0"];
            rowBenefitPrice_1 += benefitPrice["1"];
            rowBenefitPrice_2 += benefitPrice["2"];
            rowBenefitPrice_average += benefitPrice["average"];
        }

        if (trade.code === 'A04') newSale = false;
        if (trade.code === 'A04') newSale = false;

        if (trade.code === 'A05') {
            newBuy = false;
            newSale = false;
        }
        if (trade.code === 'A05') {
            newBuy = false;
            newSale = false;
        }

        return {
            ...trade,
            benefit,
            benefitPrice,
            rowBenefitPrice_0,
            rowBenefitPrice_1,
            rowBenefitPrice_2,
            rowBenefitPrice_average,
            winTimes,
            winPrice,
            loseTimes,
            losePrice,
            winRatio
        };
    });

    // const winRatio = winTimes / (winTimes + loseTimes);

    return {
        processedData,
        totalBenefitPrice,
        maxBackValue,
        winRatio,
        winPrice,
        winTimes,
        losePrice,
        loseTimes,
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
            datasets: [
            // {
            //     label: '累計收益',
            //     data: processedData.map(t => t.rowBenefitPrice_0),
            //     borderColor: 'blue',
            //     fill: false
            // },
            // {
            //     label: '累計收益-1',
            //     data: processedData.map(t => t.rowBenefitPrice_1),
            //     borderColor: 'red',
            //     fill: false
            // },
            // {
            //     label: '累計收益-2',
            //     data: processedData.map(t => t.rowBenefitPrice_2),
            //     borderColor: 'green',
            //     fill: false
            // },
            {
                label: '累計收益-1.5',
                data: processedData.map(t => t.rowBenefitPrice_average),
                borderColor: 'blue',
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
                },
                legend: {
                    position: 'bottom'  // 將圖例移到底部
                }
            }
        }
    });
    
    /*
    // 創建勝率圖表
    winRatioChart = new Chart($("#winRatioChart"), {
        type: 'line',
        data: {
            labels: processedData.map(t => t.time),
            datasets: [{
                label: '勝率',
                data: processedData.map(t => t.winRatio["0"]),
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
    */
}

function updateSummary(datasets) {
    $("#winPrice").text(datasets.winPrice["0"]);
    $("#losePrice").text(datasets.losePrice["0"]);
    $("#totalPrice").text(datasets.winPrice["0"] + datasets.losePrice["0"]);
    $("#totalTimes").text(datasets.winTimes["0"] + datasets.loseTimes["0"]);    

    let loopList = ["0", "1", "2", "average"]
    for (let loop of loopList) {
        $("#totalBenefitPrice_" + loop).text(datasets.totalBenefitPrice[loop]);
        $("#winTimes_" + loop).text(datasets.winTimes[loop]);
        $("#loseTimes_" + loop).text(datasets.loseTimes[loop]);
        $("#winRatio_" + loop).text((datasets.winRatio[loop] * 100).toFixed(2) + "%").css("color", datasets.winRatio[loop] > 0.5 ? "green" : "red");
        $("#loseRatio_" + loop).text(((1 - datasets.winRatio[loop]) * 100).toFixed(2) + "%").css("color", datasets.winRatio[loop] > 0.5 ? "red" : "green");
        $("#expectedValue_" + loop).text((datasets.winRatio[loop] * datasets.winPrice[loop] + (1 - datasets.winRatio[loop]) * datasets.losePrice[loop] ).toFixed(2));
        $("#maxBackValue_" + loop).text(datasets.maxBackValue[loop] );
        $('#roi_' + loop).text((datasets.totalBenefitPrice[loop] /(2*218000) * 100).toFixed(2) + "%");
        $('#acc_roi_' + loop).text((datasets.totalBenefitPrice[loop] /(2*(218000-datasets.maxBackValue[loop])) * 100).toFixed(2) + "%");
    }
}
    

// 主要執行邏輯
function initializeCharts( data ) {
    const result = processData(data);
    createCharts(result.processedData);
    updateSummary(result);
}
