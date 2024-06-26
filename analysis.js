$(document).ready(function() {
    // 假設你的數據已經轉換為 JSON 格式
    const data = [
        { time: "2022-07-05 09:54", price: 14257, type: "新買", code: "A01" },
        { time: "2022-07-05 10:57", price: 14017, type: "平賣", code: "A02" },
        // ... 其他數據
    ];

    function processData(data) {
        let newBuy = false;
        let newSale = false;
        let totalBenefitPrice = 0;
        let winTimes = 0;
        let loseTimes = 0;

        const processedData = data.map((trade, index) => {
            const nextTrade = data[index + 1] || {};
            let benefit = 0;
            let benefitPrice = 0;

            if (trade.code === 'A01' && !newBuy) {
                newBuy = true;
                benefit = nextTrade.price - trade.price;
                benefitPrice = benefit * 200 - 220;

                if (benefit > 0) winTimes++;
                else loseTimes++;

                totalBenefitPrice += benefitPrice;
            }

            if (trade.code === 'A02') newBuy = false;

            if (trade.code === 'A03' && !newSale) {
                newSale = true;
                benefit = trade.price - nextTrade.price;
                benefitPrice = benefit * 200 - 220;

                if (benefit > 0) winTimes++;
                else loseTimes++;

                totalBenefitPrice += benefitPrice;
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
                totalBenefitPrice
            };
        });

        const winRatio = winTimes / (winTimes + loseTimes);

        return {
            processedData,
            totalBenefitPrice,
            winRatio
        };
    }

    function createCharts(processedData) {
        // 創建收益圖表
        new Chart($("#profitChart"), {
            type: 'line',
            data: {
                labels: processedData.map(t => t.time),
                datasets: [{
                    label: '累計收益',
                    data: processedData.map(t => t.totalBenefitPrice),
                    borderColor: 'blue',
                    fill: false
                }]
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
        new Chart($("#winRatioChart"), {
            type: 'line',
            data: {
                labels: processedData.map(t => t.time),
                datasets: [{
                    label: '勝率',
                    data: processedData.map((_, index) => {
                        const winTimes = processedData.slice(0, index + 1).filter(t => t.benefit > 0).length;
                        const totalTrades = index + 1;
                        return winTimes / totalTrades;
                    }),
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
                        max: 1
                    }
                }
            }
        });
    }

    function updateSummary(totalBenefitPrice, winRatio) {
        $("#totalBenefitPrice").text(totalBenefitPrice.toFixed(2));
        $("#winRatio").text((winRatio * 100).toFixed(2) + "%");
    }

    // 主要執行邏輯
    const { processedData, totalBenefitPrice, winRatio } = processData(data);
    createCharts(processedData);
    updateSummary(totalBenefitPrice, winRatio);
});