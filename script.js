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

  const resultText = `${tradeType.toUpperCase()} - Lot: ${positionSize.toFixed(
    2
  )} | Entry: ${entryPrice} | SL: ${slPrice.toFixed(4)}`;

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

  showHistory();
}

function showHistory() {
  const tradeHistoryBuy = document.getElementById("tradeHistory-buy");
  const tradeHistorySell = document.getElementById("tradeHistory-sell");

  tradeHistoryBuy.innerHTML = "";
  tradeHistorySell.innerHTML = "";

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

  function createTradeItems(
    tradeHistoryParent,
    className,
    type,
    lotSize,
    entryPrice,
    stopLoss,
    slPrice,
    balance,
    riskPercent,
    date
  ) {
    const div = document.createElement("div");
    (div.className = className),
      (div.innerHTML = `
            <b>${type.toUpperCase()}</b> | Lot <b> ${lotSize}</b> | Entry: <b>${entryPrice}</b> | SL: <b>${stopLoss}</b> pips <br> SL: <b>${slPrice}</b> | Balance: <b>${balance}$</b> | Risk: ${riskPercent}% <br> Date & TIme: <b>${date}</b>`);
    tradeHistoryParent.appendChild(div);
  }

  buyTrades.forEach((t) => {
    createTradeItems(
      tradeHistoryBuy,
      "trade-item-buy",
      t.type,
      t.lotSize,
      t.entryPrice,
      t.stopLoss,
      t.slPrice,
      t.balance,
      t.riskPercent,
      t.date
    );
  });

  sellTrades.forEach((t) => {
    createTradeItems(
      tradeHistorySell,
      "trade-item-sell",
      t.type,
      t.lotSize,
      t.entryPrice,
      t.stopLoss,
      t.slPrice,
      t.balance,
      t.riskPercent,
      t.date
    );
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
    "Entry",
    "Stop Loss",
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
}

function clearHistory() {
  // Clear after download
  localStorage.removeItem("buy-trades");
  localStorage.removeItem("sell-trades");
  // On page load
  showHistory();
}

// On page load
window.onload = showHistory;
