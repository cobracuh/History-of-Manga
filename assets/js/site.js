(function () {
  "use strict";

  const volumeSalesByYear = {
    "2010": [
      ["One Piece, vol. 59", 2593580],
      ["One Piece, vol. 57", 2578730],
      ["One Piece, vol. 58", 2557356],
      ["One Piece, vol. 60", 2492183],
      ["One Piece, vol. 56", 2480124]
    ],
    "2011": [
      ["One Piece, vol. 61", 3382588],
      ["One Piece, vol. 62", 3207568],
      ["One Piece, vol. 63", 3073175],
      ["One Piece, vol. 64", 2652700],
      ["Naruto, vol. 54", 1229170]
    ],
    "2012": [
      ["One Piece, vol. 65", 3336992],
      ["One Piece, vol. 66", 3320744],
      ["One Piece, vol. 67", 3044901],
      ["One Piece, vol. 68", 2390625],
      ["Naruto, vol. 61", 1281309]
    ],
    "2013": [
      ["One Piece, vol. 69", 3147224],
      ["One Piece, vol. 70", 3039487],
      ["One Piece, vol. 71", 2890263],
      ["One Piece, vol. 72", 2354005],
      ["Attack on Titan, vol. 9", 1950807]
    ],
    "2014": [
      ["One Piece, vol. 73", 3010801],
      ["One Piece, vol. 74", 2834558],
      ["One Piece, vol. 75", 2698071],
      ["Attack on Titan, vol. 13", 1921457],
      ["Attack on Titan, vol. 12", 1895305]
    ],
    "2015": [
      ["One Piece, vol. 76", 3185018],
      ["One Piece, vol. 77", 3020137],
      ["One Piece, vol. 78", 2977466],
      ["One Piece, vol. 79", 2810583],
      ["Attack on Titan, vol. 15", 2000137]
    ],
    "2016": [
      ["One Piece, vol. 80", 2981494],
      ["One Piece, vol. 81", 2696528],
      ["One Piece, vol. 82", 2532488],
      ["One Piece, vol. 83", 2287521],
      ["Attack on Titan, vol. 18", 1983248]
    ],
    "2017": [
      ["One Piece, vol. 84", 2730184],
      ["One Piece, vol. 85", 2688847],
      ["One Piece, vol. 86", 2496033],
      ["One Piece, vol. 87", 2040375],
      ["Attack on Titan, vol. 21", 1701237]
    ],
    "2018": [
      ["One Piece, vol. 88", 2476305],
      ["One Piece, vol. 89", 2167146],
      ["One Piece, vol. 90", 2074623],
      ["Attack on Titan, vol. 24", 1486038],
      ["Attack on Titan, vol. 25", 1358623]
    ],
    "2019": [
      ["One Piece, vol. 91", 2388243],
      ["One Piece, vol. 93", 2200000],
      ["One Piece, vol. 92", 2112734],
      ["One Piece, vol. 94", 1880146],
      ["Attack on Titan, vol. 27", 1344500]
    ],
    "2020": [
      ["Demon Slayer, vol. 18", 4393137],
      ["Demon Slayer, vol. 19", 4243312],
      ["Demon Slayer, vol. 1", 3703309],
      ["Demon Slayer, vol. 8", 3645580],
      ["Demon Slayer, vol. 7", 3636822]
    ]
  };

  let chart;
  let chartReady = false;
  let resizeTimer;

  function drawVolumeChart() {
    if (!chartReady) return;

    const selector = document.getElementById("thedropdown");
    const chartElement = document.getElementById("piechart");
    const year = selector.value;
    const rows = volumeSalesByYear[year];

    if (!rows || !chartElement) return;

    const data = new google.visualization.DataTable();
    data.addColumn("string", "Volume");
    data.addColumn("number", "Estimated copies sold");
    data.addColumn({ type: "string", role: "annotation" });
    data.addRows(rows.map(function (row) {
      return [row[0], row[1], row[1].toLocaleString("en-US")];
    }));

    const compact = window.matchMedia("(max-width: 640px)").matches;
    const options = {
      title: "Bestselling manga volumes in Japan — " + year,
      titleTextStyle: { color: "#213944", fontName: "Archivo", fontSize: compact ? 16 : 20, bold: true },
      backgroundColor: "transparent",
      colors: ["#3a9480"],
      legend: { position: "none" },
      height: compact ? 440 : 480,
      chartArea: {
        left: compact ? 132 : 210,
        top: 70,
        width: compact ? "52%" : "66%",
        height: "70%"
      },
      bar: { groupWidth: "58%" },
      hAxis: {
        minValue: 0,
        format: "short",
        textStyle: { color: "#52616b", fontName: "Roboto", fontSize: compact ? 10 : 12 },
        gridlines: { color: "#e3e8eb" },
        baselineColor: "#aeb9bf"
      },
      vAxis: {
        textStyle: { color: "#213944", fontName: "Roboto", fontSize: compact ? 10 : 13 }
      },
      annotations: {
        alwaysOutside: true,
        textStyle: { color: "#213944", fontName: "Roboto", fontSize: compact ? 9 : 12, auraColor: "none" }
      },
      tooltip: { textStyle: { fontName: "Roboto" } }
    };

    chart.draw(data, options);
  }

  function initializeChart() {
    const chartElement = document.getElementById("piechart");
    if (!chartElement || typeof google === "undefined" || !google.visualization) return;

    chart = new google.visualization.BarChart(chartElement);
    chartReady = true;
    drawVolumeChart();
  }

  function filterRankings() {
    const typeSelect = document.getElementById("ddlAge");
    const yearSelect = document.getElementById("ddlSport");
    const status = document.getElementById("rankingStatus");
    const rows = Array.from(document.querySelectorAll("#tableProjects .Row"));
    const type = typeSelect.value;
    const year = yearSelect.value;
    let visibleCount = 0;

    rows.forEach(function (row) {
      const typeMatches = type === "0" || row.dataset.classification === type;
      const yearMatches = year === "0" || row.dataset.year === year;
      const show = typeMatches && yearMatches;
      row.hidden = !show;
      if (show) visibleCount += 1;
    });

    const typeLabel = type === "0" ? "all ranking types" : type + " rankings";
    const yearLabel = year === "0" ? "all years" : year;
    status.textContent = visibleCount.toLocaleString("en-US") + " results for " + typeLabel + " in " + yearLabel + ".";
  }

  function initializeFilters() {
    const typeSelect = document.getElementById("ddlAge");
    const yearSelect = document.getElementById("ddlSport");
    if (!typeSelect || !yearSelect) return;

    typeSelect.value = "series";
    yearSelect.value = "2020";
    typeSelect.addEventListener("change", filterRankings);
    yearSelect.addEventListener("change", filterRankings);
    filterRankings();
  }

  document.addEventListener("DOMContentLoaded", function () {
    const yearSelector = document.getElementById("thedropdown");
    if (yearSelector) yearSelector.addEventListener("change", drawVolumeChart);
    initializeFilters();

    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(drawVolumeChart, 180);
    });
  });

  if (typeof google !== "undefined" && google.charts) {
    google.charts.load("current", { packages: ["corechart"] });
    google.charts.setOnLoadCallback(initializeChart);
  }
}());
