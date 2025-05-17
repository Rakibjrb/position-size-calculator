function calculatePosition() {
  const balance = parseFloat(document.getElementById("balance").value);
  const riskPercent = parseFloat(document.getElementById("risk").value);
  const stopLoss = parseFloat(document.getElementById("stopLoss").value);
  const entryPrice = parseFloat(document.getElementById("entry").value);
  const tradeType = document.getElementById("tradeType").value;
  const resultBox = document.getElementById("result");

  if (
    isNaN(balance) ||
    isNaN(riskPercent) ||
    isNaN(stopLoss) ||
    stopLoss <= 0 ||
    isNaN(entryPrice)
  ) {
    resultBox.style.display = "block";
    resultBox.className = "result";
    resultBox.innerText = "Please fill in all fields correctly.";
    return;
  }

  const riskAmount = (balance * riskPercent) / 100;
  const pipValuePerLot = 10; // EUR/USD standard pip value
  const positionSize = riskAmount / (stopLoss * pipValuePerLot);

  const slPrice =
    tradeType === "buy"
      ? entryPrice - stopLoss * 0.0001
      : entryPrice + stopLoss * 0.0001;

  const resultText = `${tradeType.toUpperCase()} - Lot Size: ${positionSize.toFixed(
    2
  )} lots\nSL Price: ${slPrice.toFixed(4)}`;

  resultBox.style.display = "block";
  resultBox.className = `result ${tradeType}`;
  resultBox.innerText = resultText;

  // Save to local storage
  const trade = {
    date: new Date().toLocaleString(),
    type: tradeType,
    balance,
    riskPercent,
    stopLoss,
    lotSize: positionSize.toFixed(2),
    entryPrice: entryPrice.toFixed(4),
    slPrice: slPrice.toFixed(4),
  };

  if (trade.type === "buy") {
    let buyTrades = JSON.parse(localStorage.getItem("buy-trades")) || [];
    buyTrades.unshift(trade);
    localStorage.setItem("buy-trades", JSON.stringify(buyTrades));
  } else {
    let sellTrades = JSON.parse(localStorage.getItem("sell-trades")) || [];
    sellTrades.unshift(trade);
    localStorage.setItem("sell-trades", JSON.stringify(sellTrades));
  }

  window.location.reload();
}

function showHistory() {
  const tradeHistoryBuy = document.getElementById("tradeHistory-buy");
  const tradeHistorySell = document.getElementById("tradeHistory-sell");

  const buyTrades = JSON.parse(localStorage.getItem("buy-trades")) || [];
  const sellTrades = JSON.parse(localStorage.getItem("sell-trades")) || [];

  if (buyTrades.length === 0) {
    tradeHistoryBuy.innerHTML = "<p>No buy trades yet.</p>";
  }

  if (sellTrades.length === 0) {
    tradeHistorySell.innerHTML = "<p>No sell trades saved yet.</p>";
  }

  if (!buyTrades && !sellTrades) {
    return;
  }

  buyTrades.forEach((t) => {
    const div = document.createElement("div");
    div.className = "trade-item-buy";
    div.innerHTML = `
            <strong>${t.type.toUpperCase()}</strong> | Lot: ${
      t.lotSize
    } | Risk: ${t.riskPercent}% | SL: ${t.stopLoss} pips<br>
            Entry: ${t.entryPrice} | SL Price: ${t.slPrice}<br>
            Balance: $${t.balance} | ${t.date}
          `;
    tradeHistoryBuy.appendChild(div);
  });

  sellTrades.forEach((t) => {
    const div = document.createElement("div");
    div.className = "trade-item-sell";
    div.innerHTML = `
            <strong>${t.type.toUpperCase()}</strong> | Lot: ${
      t.lotSize
    } | Risk: ${t.riskPercent}% | SL: ${t.stopLoss} pips<br>
            Entry: ${t.entryPrice} | SL Price: ${t.slPrice}<br>
            Balance: $${t.balance} | ${t.date}
          `;
    tradeHistorySell.appendChild(div);
  });
}

function ExportCSV() {
  const buyTrades = JSON.parse(localStorage.getItem("buy-trades")) || [];
  const sellTrades = JSON.parse(localStorage.getItem("sell-trades")) || [];
  const trades = [...buyTrades, ...sellTrades];

  if (trades.length === 0) {
    alert("No trades to export.");
    return;
  }

  // Convert trades to CSV
  const csvHeader = [
    "Date",
    "Trade",
    "Balance",
    "Risk %",
    "SL (pips)",
    "Entry Price",
    "Stop Loss Price",
    "Lot Size",
    "P&L",
  ];
  const csvRows = trades.map((t) =>
    [
      `"${t.date}"`,
      t.type.toUpperCase(),
      t.balance,
      t.riskPercent,
      t.stopLoss,
      t.entryPrice,
      t.slPrice,
      t.lotSize,
    ].join(",")
  );

  const csvContent = [csvHeader.join(","), ...csvRows].join("\n");

  // Trigger download
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const now = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  a.download = `EURUSD_Trade_History_${now}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  window.location.reload();
}

function clearHistory() {
  // Clear after download
  localStorage.removeItem("buy-trades");
  localStorage.removeItem("sell-trades");
  // On page load
  window.location.reload();
}

// On page load
window.onload = showHistory;
