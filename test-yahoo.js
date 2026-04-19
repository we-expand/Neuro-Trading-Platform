const url = "https://api.allorigins.win/raw?url=" + encodeURIComponent("https://query1.finance.yahoo.com/v8/finance/chart/^GSPC?interval=1d&range=1d");
fetch(url).then(r => r.json()).then(data => console.log(data.chart.result[0].meta)).catch(console.error);
