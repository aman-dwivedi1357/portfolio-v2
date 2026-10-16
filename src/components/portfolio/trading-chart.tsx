"use client";

import { useEffect, useRef, useState } from "react";

export function TradingChart() {
  const container = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const host = container.current;
    if (!host) return;
    const media = window.matchMedia("(prefers-color-scheme: light)");
    let currentTheme = "";

    const renderChart = () => {
      const preference = document.documentElement.dataset.theme;
      const theme = preference === "light" || (!preference && media.matches) ? "light" : "dark";
      if (theme === currentTheme) return;
      currentTheme = theme;
      setFailed(false);
      host.replaceChildren();
      const widget = document.createElement("div");
      widget.className = "tradingview-widget-container__widget";
      widget.style.height = "100%";
      widget.style.width = "100%";
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;
      script.textContent = JSON.stringify({
        autosize: true,
        symbol: "BITSTAMP:BTCUSD",
        interval: "15",
        timezone: "Asia/Dubai",
        theme,
        style: "1",
        locale: "en",
        allow_symbol_change: true,
        hide_top_toolbar: false,
        hide_side_toolbar: false,
        withdateranges: true,
        save_image: true,
        calendar: false,
        support_host: "https://www.tradingview.com",
      });
      script.onerror = () => setFailed(true);
      host.append(widget, script);
    };

    renderChart();
    const observer = new MutationObserver(renderChart);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    media.addEventListener("change", renderChart);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", renderChart);
      host.querySelectorAll("script").forEach((script) => { script.onerror = null; });
      host.replaceChildren();
    };
  }, []);

  return (
    <div className="market-terminal" data-lenis-prevent>
      <div className="market-terminal-heading">
        <span className="m">MARKET EXPLORER</span>
        <span>Change symbols · Explore timeframes · Add indicators</span>
      </div>
      <div className="market-chart-area">
        <div ref={container} className="tradingview-widget-container market-chart" aria-label="Interactive market chart powered by TradingView" />
        {failed && (
          <p className="market-chart-error" role="status">
            The chart could not load. <a href="https://www.tradingview.com/chart/?symbol=BITSTAMP%3ABTCUSD" target="_blank" rel="noopener noreferrer">Open it on TradingView ↗</a>
          </p>
        )}
      </div>
      <div className="market-terminal-footer">
        <a href="https://www.tradingview.com/" target="_blank" rel="noopener noreferrer">Charts by TradingView ↗</a>
        <span>
          This chart is for demonstration purposes only. Explore the full product on the{" "}
          <a href="https://terminal.globalapexmarkets.com/" target="_blank" rel="noopener noreferrer">
            Global Apex Markets terminal ↗
          </a>
        </span>
      </div>
    </div>
  );
}