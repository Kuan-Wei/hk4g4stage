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

function processData(data, type='TXF') {
    let newBuy = false;
    let newSale = false;
    let loopList = ["0", "1", "2", "average"];
    let tradeType = "";
    let totalBenefitPrice = {"0":0, "1":0, "2":0, "average":0, "buy":0, "sell":0};
    let rowBenefitPrice_0 = 0;
    let rowBenefitPrice_1 = 0;
    let rowBenefitPrice_2 = 0;
    let rowBenefitPrice_average = 0;
    let rowBenefitPrice_buy = 0;
    let rowBenefitPrice_sell = 0;
    let winTimes = {"0":0, "1":0, "2":0, "average":0, "buy":0, "sell":0};
    let loseTimes = {"0":0, "1":0, "2":0, "average":0, "buy":0, "sell":0};
    let winPrice = {"0":0, "1":0, "2":0, "average":0, "buy":0, "sell":0};
    let losePrice = {"0":0, "1":0, "2":0, "average":0, "buy":0, "sell":0};
    let maxBackValue = {"0":0, "1":0, "2":0, "average":0, "buy":0, "sell":0};
    let maxValue = {"0":0, "1":0, "2":0, "average":0, "buy":0, "sell":0};
    let winRatio = {"0":0, "1":0, "2":0, "average":0, "buy":0, "sell":0};
    let buyPrice = 0;
    let sellPrice = 0;
    let dayBenefitPrice = {"0":[], "1":[], "2":[], "average":[], "buy":[], "sell":[]};

    const processedData = data.map((trade, index) => {        
        if( trade.code != undefined ){
            const nextTrade = data[index + 1] || {};
            let benefit = {"0":0, "1":0, "2":0, "average":0, "buy":0, "sell":0};
            let benefitPrice = {"0":0, "1":0, "2":0, "average":0, "buy":0, "sell":0};
            let needCalculate = false;


            if (trade.code === 'A01' && !newBuy) {
                newBuy = true;
                buyPrice = trade.price;
            }

            if (trade.code === 'A02'){
                newBuy = false;
                benefit["0"] = trade.price - buyPrice;

                buyPrice = 0;
                needCalculate = true;
                tradeType = "buy";
            } 
            if (trade.code === 'A03' && !newSale) {
                newSale = true;
                sellPrice = trade.price;
            }

            if (trade.code === 'A04'){
                newSale = false;
                benefit["0"] = sellPrice - trade.price ;

                sellPrice = 0;
                needCalculate = true
                tradeType = "sell";
            }

            if (trade.code === 'A05') {
                if (newBuy) {
                    benefit["0"] = trade.price - buyPrice;
                    newBuy = false;
                    tradeType = "buy";
                }
                if (newSale) {
                    benefit["0"] = sellPrice - trade.price ;
                    newSale = false;
                    tradeType = "sell";
                }

                needCalculate = true;
            }

            if(needCalculate){
                benefit["1"] = benefit["0"]-1;
                benefit["2"] = benefit["0"]-2;
                benefit["average"] = benefit["0"]-1.5;
                benefit[tradeType] = benefit["average"];

                loopList.push(tradeType);

                for (let loop of loopList) {
                    if( type == 'TXF' ) {
                        benefitPrice[loop] = benefit[loop] * 200 - 90 - Math.round(200*benefit[loop]*2/100000)*2;
                    }else{
                        benefitPrice[loop] = benefit[loop] * 50 - 40 - Math.round(50*benefit[loop]*2/100000)*2;                    
                    }
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
                    
                    if( dayBenefitPrice[loop][trade.date] !== undefined ){
                        dayBenefitPrice[loop][trade.date] += benefitPrice[loop] ;
                    }else{
                        dayBenefitPrice[loop][trade.date] = benefitPrice[loop] ;
                    }

                }            
                loopList.pop();

                rowBenefitPrice_0 += benefitPrice["0"];
                rowBenefitPrice_1 += benefitPrice["1"];
                rowBenefitPrice_2 += benefitPrice["2"];
                rowBenefitPrice_average += benefitPrice["average"];
                rowBenefitPrice_buy += benefitPrice["buy"];
                rowBenefitPrice_sell += benefitPrice["sell"];

                needCalculate = false;
            }


            return {
                ...trade,
                benefit,
                benefitPrice,
                rowBenefitPrice_0,
                rowBenefitPrice_1,
                rowBenefitPrice_2,
                rowBenefitPrice_average,
                rowBenefitPrice_buy,
                rowBenefitPrice_sell,
                winTimes,
                winPrice,
                loseTimes,
                losePrice,
                winRatio
            };
        }
    });

    // const winRatio = winTimes / (winTimes + loseTimes);

    // remove undefined data
    const filteredData = processedData.filter(trade => trade !== undefined);
    return {
        filteredData,
        totalBenefitPrice,
        maxBackValue,
        dayBenefitPrice,
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
            {
                label: '累計收益-多單',
                data: processedData.map(t => t.rowBenefitPrice_buy),
                borderColor: 'red',
                fill: false
            },
            {
                label: '累計收益-空單',
                data: processedData.map(t => t.rowBenefitPrice_sell),
                borderColor: 'green',
                fill: false
            },
            {
                label: '累計收益-綜合',
                data: processedData.map(t => t.rowBenefitPrice_average),
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

function updateSummary(datasets, type='TXF') {
    
    $("#winPrice").text(datasets.winPrice["0"]);
    $("#losePrice").text(datasets.losePrice["0"]);
    $("#totalPrice").text(datasets.winPrice["0"] + datasets.losePrice["0"]);
    $("#totalTimes").text(datasets.winTimes["0"] + datasets.loseTimes["0"]);    

    // 新增成本變數，若type為TXF，則成本為218000，若type為MTX，則成本為61000
    let cause = ( type == 'TXF')? 218000 : 61000; 

    let loopList = ["0", "1", "2", "average"]
    for (let loop of loopList) {
        $("#totalBenefitPrice_" + loop).text(datasets.totalBenefitPrice[loop]);
        $("#winTimes_" + loop).text(datasets.winTimes[loop]);
        $("#loseTimes_" + loop).text(datasets.loseTimes[loop]);
        $("#winRatio_" + loop).text((datasets.winRatio[loop] * 100).toFixed(2) + "%").css("color", datasets.winRatio[loop] > 0.5 ? "green" : "red");
        $("#loseRatio_" + loop).text(((1 - datasets.winRatio[loop]) * 100).toFixed(2) + "%").css("color", datasets.winRatio[loop] > 0.5 ? "red" : "green");
        $("#expectedValue_" + loop).text((datasets.winRatio[loop] * datasets.winPrice[loop] + (1 - datasets.winRatio[loop]) * datasets.losePrice[loop] ).toFixed(2));
        $("#maxBackValue_" + loop).text(datasets.maxBackValue[loop] );
        $('#roi_' + loop).text((datasets.totalBenefitPrice[loop] /(2*cause) * 100).toFixed(2) + "%");
        $('#acc_roi_' + loop).text((datasets.totalBenefitPrice[loop] /(2*(cause-datasets.maxBackValue[loop])) * 100).toFixed(2) + "%");
    }

    $('#s1_1').text( $("#totalTimes").text() );
    $('#s1_2').text( datasets.winTimes["buy"] + datasets.loseTimes["buy"] );
    $('#s1_3').text( datasets.winTimes["sell"] + datasets.loseTimes["sell"] );
    $('#s1_4').text( $("#totalPrice").text() );
    $('#s1_5').text( datasets.totalBenefitPrice["buy"] );
    $('#s1_6').text( datasets.totalBenefitPrice["sell"] );
    $('#s1_7').text( $("#winRatio_average").text() );
    $('#s1_8').text( $("#loseRatio_average").text() );
    $('#s1_9').text( Math.max(...Object.values(datasets.dayBenefitPrice["buy"])) );
    $('#s1_10').text( Math.max(...Object.values(datasets.dayBenefitPrice["sell"])) );
    
    $('#s2_1').text( datasets.winTimes["buy"] + datasets.loseTimes["buy"] );
    $('#s2_2').text( datasets.totalBenefitPrice["buy"] );
    $('#s2_3').text( (datasets.winRatio["buy"] * 100).toFixed(2) + "%" );
    $('#s2_4').text( ((1-datasets.winRatio["buy"]) * 100).toFixed(2) + "%" );
    $('#s2_5').text( Math.max(...Object.values(datasets.dayBenefitPrice["buy"])) );
    $('#s2_5a').text( Object.keys(datasets.dayBenefitPrice["buy"]).reduce((a, b) => datasets.dayBenefitPrice["buy"][a] > datasets.dayBenefitPrice["buy"][b] ? a : b) );
    $('#s2_6').text( Math.min(...Object.values(datasets.dayBenefitPrice["buy"])) );
    $('#s2_6a').text( Object.keys(datasets.dayBenefitPrice["buy"]).reduce((a, b) => datasets.dayBenefitPrice["buy"][a] < datasets.dayBenefitPrice["buy"][b] ? a : b) );

    $('#s3_1').text( datasets.winTimes["sell"] + datasets.loseTimes["sell"] );
    $('#s3_2').text( datasets.totalBenefitPrice["sell"] );
    $('#s3_3').text( (datasets.winRatio["sell"] * 100).toFixed(2) + "%" );
    $('#s3_4').text( ((1-datasets.winRatio["sell"]) * 100).toFixed(2) + "%" );
    $('#s3_5').text( Math.max(...Object.values(datasets.dayBenefitPrice["sell"])) );
    $('#s3_5a').text( Object.keys(datasets.dayBenefitPrice["sell"]).reduce((a, b) => datasets.dayBenefitPrice["sell"][a] > datasets.dayBenefitPrice["sell"][b] ? a : b) );
    $('#s3_6').text( Math.min(...Object.values(datasets.dayBenefitPrice["sell"])) );
    $('#s3_6a').text( Object.keys(datasets.dayBenefitPrice["sell"]).reduce((a, b) => datasets.dayBenefitPrice["sell"][a] < datasets.dayBenefitPrice["sell"][b] ? a : b) );
}
    

// 主要執行邏輯
function initializeCharts( data ) {
    const result = processData(data);
    createCharts(result.processedData);
    updateSummary(result);
}
