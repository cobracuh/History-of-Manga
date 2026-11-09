(function () {
  "use strict";

  const DATA_URL = "assets/data/manga-sales.json";
  const COLORS = ["#775376", "#2f7f6e", "#d18b55", "#567f9b", "#b35f6f", "#7a9361", "#9473a5", "#c2a34d", "#4b8f8f", "#9a6b52"];
  const state = {
    records: [],
    type: "series",
    year: 2020,
    topCount: 5,
    search: "",
    sortKey: "rank",
    sortDirection: "asc",
    charts: {}
  };

  const elements = {};
  const numberFormatter = new Intl.NumberFormat("en-US");
  const compactFormatter = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
  const percentFormatter = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 });

  function cacheElements() {
    [
      "rankingType", "rankingYear", "topCount", "resetFilters", "downloadCsv", "dashboardStatus",
      "leaderTitle", "leaderContext", "leaderSales", "leaderGap", "leaderGapNote", "shareLabel", "leaderShare",
      "trendTitle", "trendSummary", "rankingChartTitle", "rankingSummary", "shareChartTitle",
      "insightTitle", "insightBody", "titleSearch", "rankingTableBody", "tableCaption", "emptyState"
    ].forEach(function (id) {
      elements[id] = document.getElementById(id);
    });
  }

  function humanType(type) {
    return type === "series" ? "series" : "individual volumes";
  }

  function titleType(type) {
    return type === "series" ? "Series" : "Individual volumes";
  }

  function filteredYearRecords() {
    return state.records
      .filter(function (record) { return record.classification === state.type && record.year === state.year; })
      .sort(function (a, b) { return a.rank - b.rank; });
  }

  function displayedRecords() {
    return filteredYearRecords().slice(0, state.topCount);
  }

  function populateYears() {
    const years = Array.from(new Set(state.records.map(function (record) { return record.year; }))).sort(function (a, b) { return b - a; });
    elements.rankingYear.innerHTML = years.map(function (year) {
      return '<option value="' + year + '">' + year + "</option>";
    }).join("");
    elements.rankingYear.value = String(state.year);
  }

  function chartDefaults() {
    Chart.defaults.global.defaultFontFamily = "Roboto, sans-serif";
    Chart.defaults.global.defaultFontColor = "#52616b";
    Chart.defaults.global.animation.duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 450;
  }

  function axisMillions(value) {
    if (value === 0) return "0";
    return (value / 1000000).toLocaleString("en-US", { maximumFractionDigits: 1 }) + "M";
  }

  function destroyChart(name) {
    if (state.charts[name]) state.charts[name].destroy();
  }

  function renderTrendChart() {
    const leaders = state.records
      .filter(function (record) { return record.classification === state.type && record.rank === 1; })
      .sort(function (a, b) { return a.year - b.year; });
    const selectedIndex = leaders.findIndex(function (record) { return record.year === state.year; });
    const pointColors = leaders.map(function (_, index) { return index === selectedIndex ? "#775376" : "#2f7f6e"; });
    const pointRadii = leaders.map(function (_, index) { return index === selectedIndex ? 6 : 4; });

    destroyChart("trend");
    state.charts.trend = new Chart(document.getElementById("trendChart").getContext("2d"), {
      type: "line",
      data: {
        labels: leaders.map(function (record) { return String(record.year); }),
        datasets: [{
          label: "#1 estimated sales",
          data: leaders.map(function (record) { return record.estimatedCopiesSold; }),
          borderColor: "#2f7f6e",
          backgroundColor: "rgba(47, 127, 110, 0.10)",
          pointBackgroundColor: pointColors,
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: pointRadii,
          pointHoverRadius: 7,
          borderWidth: 3,
          lineTension: 0.18,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: { display: false },
        tooltips: {
          callbacks: {
            title: function (items) { return leaders[items[0].index].title + " · " + leaders[items[0].index].year; },
            label: function (item) { return numberFormatter.format(item.yLabel) + " estimated copies"; }
          }
        },
        scales: {
          xAxes: [{ gridLines: { display: false }, ticks: { maxRotation: 0 } }],
          yAxes: [{
            ticks: { beginAtZero: true, callback: axisMillions },
            scaleLabel: { display: true, labelString: "Estimated copies sold" },
            gridLines: { color: "#e4ebec", zeroLineColor: "#cbd7d9" }
          }]
        }
      }
    });

    elements.trendTitle.textContent = "Annual #1 " + humanType(state.type) + " sales";
    const minimum = leaders.reduce(function (a, b) { return a.estimatedCopiesSold < b.estimatedCopiesSold ? a : b; });
    const maximum = leaders.reduce(function (a, b) { return a.estimatedCopiesSold > b.estimatedCopiesSold ? a : b; });
    elements.trendSummary.textContent = "The annual leader ranges from " + compactFormatter.format(minimum.estimatedCopiesSold) + " copies in " + minimum.year + " (" + minimum.title + ") to " + compactFormatter.format(maximum.estimatedCopiesSold) + " in " + maximum.year + " (" + maximum.title + ").";
  }

  function renderRankingChart(records) {
    destroyChart("ranking");
    state.charts.ranking = new Chart(document.getElementById("rankingChart").getContext("2d"), {
      type: "horizontalBar",
      data: {
        labels: records.map(function (record) { return record.title; }),
        datasets: [{
          label: "Estimated copies sold",
          data: records.map(function (record) { return record.estimatedCopiesSold; }),
          backgroundColor: records.map(function (_, index) { return index === 0 ? "#775376" : "#3a9480"; }),
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: { display: false },
        tooltips: { callbacks: { label: function (item) { return numberFormatter.format(item.xLabel) + " estimated copies"; } } },
        scales: {
          xAxes: [{
            ticks: { beginAtZero: true, callback: axisMillions },
            scaleLabel: { display: true, labelString: "Estimated copies sold" },
            gridLines: { color: "#e4ebec", zeroLineColor: "#cbd7d9" }
          }],
          yAxes: [{ gridLines: { display: false }, ticks: { fontColor: "#213944" } }]
        }
      }
    });

    elements.rankingChartTitle.textContent = "Top " + records.length + " " + humanType(state.type) + " in " + state.year;
    elements.rankingSummary.textContent = "Bars begin at zero and compare estimated copies sold within the selected annual ranking.";
  }

  function renderShareChart(records) {
    destroyChart("share");
    state.charts.share = new Chart(document.getElementById("shareChart").getContext("2d"), {
      type: "doughnut",
      data: {
        labels: records.map(function (record) { return record.title; }),
        datasets: [{
          data: records.map(function (record) { return record.estimatedCopiesSold; }),
          backgroundColor: COLORS.slice(0, records.length),
          borderColor: "#ffffff",
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutoutPercentage: 64,
        legend: { position: "bottom", labels: { boxWidth: 12, usePointStyle: true, padding: 14 } },
        tooltips: {
          callbacks: {
            label: function (item, data) {
              const total = data.datasets[0].data.reduce(function (sum, value) { return sum + value; }, 0);
              const value = data.datasets[0].data[item.index];
              return data.labels[item.index] + ": " + percentFormatter.format(value / total);
            }
          }
        }
      }
    });
    elements.shareChartTitle.textContent = "Share of the top " + records.length;
  }

  function renderKpis(records) {
    const leader = records[0];
    const runnerUp = records[1];
    const total = records.reduce(function (sum, record) { return sum + record.estimatedCopiesSold; }, 0);
    const gap = runnerUp ? leader.estimatedCopiesSold - runnerUp.estimatedCopiesSold : 0;

    elements.leaderTitle.textContent = leader.title;
    elements.leaderContext.textContent = titleType(state.type) + " ranking · " + state.year;
    elements.leaderSales.textContent = compactFormatter.format(leader.estimatedCopiesSold);
    elements.leaderGap.textContent = runnerUp ? compactFormatter.format(gap) : "—";
    elements.leaderGapNote.textContent = runnerUp ? percentFormatter.format(gap / runnerUp.estimatedCopiesSold) + " more than " + runnerUp.title : "No runner-up is available";
    elements.shareLabel.textContent = "Leader share of top " + records.length;
    elements.leaderShare.textContent = percentFormatter.format(leader.estimatedCopiesSold / total);

    const gapMultiple = runnerUp ? leader.estimatedCopiesSold / runnerUp.estimatedCopiesSold : 1;
    if (gapMultiple >= 2) {
      elements.insightTitle.textContent = "A runaway leader";
      elements.insightBody.textContent = leader.title + " sold an estimated " + gapMultiple.toLocaleString("en-US", { maximumFractionDigits: 1 }) + "× as many copies as #2 " + runnerUp.title + " in this ranking.";
    } else if (gapMultiple >= 1.2) {
      elements.insightTitle.textContent = "A meaningful lead";
      elements.insightBody.textContent = leader.title + " led #2 " + runnerUp.title + " by about " + percentFormatter.format(gap / runnerUp.estimatedCopiesSold) + ".";
    } else {
      elements.insightTitle.textContent = "A close contest";
      elements.insightBody.textContent = leader.title + " and #2 " + runnerUp.title + " were separated by only " + percentFormatter.format(gap / runnerUp.estimatedCopiesSold) + ".";
    }
  }

  function renderTable() {
    const query = state.search.trim().toLowerCase();
    const rows = filteredYearRecords().filter(function (record) {
      return record.title.toLowerCase().indexOf(query) !== -1;
    });
    const direction = state.sortDirection === "asc" ? 1 : -1;
    rows.sort(function (a, b) {
      if (state.sortKey === "title") return a.title.localeCompare(b.title) * direction;
      return (a[state.sortKey] - b[state.sortKey]) * direction;
    });

    elements.rankingTableBody.innerHTML = rows.map(function (record) {
      return "<tr><td><span class=\"rank-badge\">" + record.rank + "</span></td><td>" + escapeHtml(record.title) + "</td><td class=\"numeric\">" + numberFormatter.format(record.estimatedCopiesSold) + "</td></tr>";
    }).join("");
    elements.emptyState.hidden = rows.length !== 0;
    elements.tableCaption.textContent = titleType(state.type) + " rankings for " + state.year + (query ? " matching “" + state.search.trim() + "”" : "");
  }

  function escapeHtml(value) {
    return value.replace(/[&<>'"]/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character];
    });
  }

  function render() {
    const available = filteredYearRecords();
    const records = displayedRecords();
    if (!records.length) {
      elements.dashboardStatus.textContent = "No records are available for this selection.";
      return;
    }

    const requestedCount = Number(elements.topCount.value);
    const actualCount = Math.min(requestedCount, available.length);
    elements.dashboardStatus.textContent = "Showing the top " + actualCount + " of " + available.length + " available " + humanType(state.type) + " records for " + state.year + ".";
    renderKpis(records);
    renderTrendChart();
    renderRankingChart(records);
    renderShareChart(records);
    renderTable();
  }

  function updateStateFromControls() {
    state.type = elements.rankingType.value;
    state.year = Number(elements.rankingYear.value);
    state.topCount = Number(elements.topCount.value);
    state.search = "";
    state.sortKey = "rank";
    state.sortDirection = "asc";
    elements.titleSearch.value = "";
    render();
  }

  function resetFilters() {
    state.type = "series";
    state.year = 2020;
    state.topCount = 5;
    state.search = "";
    state.sortKey = "rank";
    state.sortDirection = "asc";
    elements.rankingType.value = state.type;
    elements.rankingYear.value = String(state.year);
    elements.topCount.value = String(state.topCount);
    elements.titleSearch.value = "";
    render();
  }

  function downloadCurrentView() {
    const rows = displayedRecords();
    const csvRows = [["year", "ranking_type", "rank", "title", "estimated_copies_sold"]].concat(rows.map(function (record) {
      return [record.year, record.classification, record.rank, record.title, record.estimatedCopiesSold];
    }));
    const csv = csvRows.map(function (row) {
      return row.map(function (value) { return '"' + String(value).replace(/"/g, '""') + '"'; }).join(",");
    }).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "manga-" + state.type + "-rankings-" + state.year + "-top-" + rows.length + ".csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function bindEvents() {
    elements.rankingType.addEventListener("change", updateStateFromControls);
    elements.rankingYear.addEventListener("change", updateStateFromControls);
    elements.topCount.addEventListener("change", updateStateFromControls);
    elements.resetFilters.addEventListener("click", resetFilters);
    elements.downloadCsv.addEventListener("click", downloadCurrentView);
    elements.titleSearch.addEventListener("input", function () {
      state.search = elements.titleSearch.value;
      renderTable();
    });
    document.querySelectorAll(".sort-button").forEach(function (button) {
      button.addEventListener("click", function () {
        const key = button.dataset.sort;
        state.sortDirection = state.sortKey === key && state.sortDirection === "asc" ? "desc" : "asc";
        state.sortKey = key;
        renderTable();
      });
    });
  }

  function showLoadError() {
    elements.dashboardStatus.textContent = "The rankings could not be loaded. Please refresh the page and try again.";
    document.querySelectorAll(".chart-wrap").forEach(function (chart) { chart.hidden = true; });
  }

  document.addEventListener("DOMContentLoaded", function () {
    cacheElements();
    chartDefaults();
    fetch(DATA_URL)
      .then(function (response) {
        if (!response.ok) throw new Error("Data request failed");
        return response.json();
      })
      .then(function (records) {
        state.records = records;
        populateYears();
        bindEvents();
        render();
      })
      .catch(showLoadError);
  });
}());
