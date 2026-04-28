const AMFI_URLS = [
  "https://portal.amfiindia.com/spages/NAVAll.txt",
  "https://www.amfiindia.com/spages/NAVAll.txt"
];

const SAMPLE_NAV_TEXT = [
  "119551;INF209KA12Z1;INF209KA13Z9;Aditya Birla Sun Life Banking & PSU Debt Fund - Direct Plan - IDCW;154.7628;03-Jul-2020",
  "108273;INF209K01LV0;-;Aditya Birla Sun Life Banking & PSU Debt Fund - Regular Plan - Growth;273.2973;03-Jul-2020",
  "120503;INF200K01Z37;-;SBI Bluechip Fund - Direct Plan - Growth;89.6543;03-Jul-2020",
  "118834;INF090I01239;-;ICICI Prudential Technology Fund - Direct Plan - Growth;185.2210;03-Jul-2020"
].join("\n");

const state = {
  schemes: [],
  selectedScheme: null,
  sourceLabel: "Waiting for NAV data"
};

const elements = {
  fetchAmfiBtn: document.getElementById("fetchAmfiBtn"),
  useSampleBtn: document.getElementById("useSampleBtn"),
  clearDataBtn: document.getElementById("clearDataBtn"),
  parseTextBtn: document.getElementById("parseTextBtn"),
  navText: document.getElementById("navText"),
  feedback: document.getElementById("feedback"),
  schemeSearch: document.getElementById("schemeSearch"),
  unitsInput: document.getElementById("unitsInput"),
  schemeOptions: document.getElementById("schemeOptions"),
  portfolioValue: document.getElementById("portfolioValue"),
  selectedNav: document.getElementById("selectedNav"),
  selectedDate: document.getElementById("selectedDate"),
  schemeDetails: document.getElementById("schemeDetails"),
  sourceStatus: document.getElementById("sourceStatus"),
  schemeCount: document.getElementById("schemeCount"),
  latestNavDate: document.getElementById("latestNavDate")
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(value);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function parseNavText(rawText) {
  const schemes = [];
  const lines = rawText.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    const parts = trimmed.split(";");
    if (parts.length < 6) {
      continue;
    }

    const schemeCode = parts[0].trim();
    const nav = Number.parseFloat(parts[4].trim());
    if (!/^\d+$/.test(schemeCode) || Number.isNaN(nav)) {
      continue;
    }

    schemes.push({
      schemeCode,
      isinGrowth: parts[1].trim(),
      isinReinvestment: parts[2].trim(),
      schemeName: parts[3].trim(),
      nav,
      date: parts[5].trim()
    });
  }

  return schemes.sort((a, b) => a.schemeName.localeCompare(b.schemeName));
}

function setFeedback(message, isError = false) {
  elements.feedback.textContent = message;
  elements.feedback.style.color = isError ? "#b42318" : "";
}

function updateSummary() {
  elements.sourceStatus.textContent = state.sourceLabel;
  elements.schemeCount.textContent = state.schemes.length.toLocaleString("en-IN");
  elements.latestNavDate.textContent = getLatestNavDate(state.schemes) || "-";
}

function parseAmfiDate(dateText) {
  const [day, month, year] = dateText.split("-");
  if (!day || !month || !year) {
    return null;
  }

  const monthIndex = [
    "jan", "feb", "mar", "apr", "may", "jun",
    "jul", "aug", "sep", "oct", "nov", "dec"
  ].indexOf(month.toLowerCase());

  if (monthIndex === -1) {
    return null;
  }

  const parsedDate = new Date(Date.UTC(Number.parseInt(year, 10), monthIndex, Number.parseInt(day, 10)));
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

function getLatestNavDate(schemes) {
  let latestDate = null;
  let latestLabel = "";

  for (const scheme of schemes) {
    const parsedDate = parseAmfiDate(scheme.date);
    if (!parsedDate) {
      continue;
    }

    if (!latestDate || parsedDate > latestDate) {
      latestDate = parsedDate;
      latestLabel = scheme.date;
    }
  }

  return latestLabel;
}

function populateOptions() {
  elements.schemeOptions.innerHTML = "";
  const fragment = document.createDocumentFragment();

  for (const scheme of state.schemes) {
    const option = document.createElement("option");
    option.value = scheme.schemeName;
    fragment.appendChild(option);
  }

  elements.schemeOptions.appendChild(fragment);
}

function updateSelectedScheme() {
  const searchValue = elements.schemeSearch.value.trim().toLowerCase();
  state.selectedScheme = state.schemes.find((scheme) => scheme.schemeName.toLowerCase() === searchValue) || null;
  updatePortfolioValue();
}

function updatePortfolioValue() {
  const units = Number.parseFloat(elements.unitsInput.value);
  if (!state.selectedScheme) {
    elements.portfolioValue.textContent = formatCurrency(0);
    elements.selectedNav.textContent = "NAV: -";
    elements.selectedDate.textContent = "Date: -";
    elements.schemeDetails.innerHTML = "<p>Select a fund after loading data to see scheme details.</p>";
    return;
  }

  const safeUnits = Number.isFinite(units) ? units : 0;
  const portfolioValue = safeUnits * state.selectedScheme.nav;

  elements.portfolioValue.textContent = formatCurrency(portfolioValue);
  elements.selectedNav.textContent = `NAV: ${state.selectedScheme.nav.toFixed(4)}`;
  elements.selectedDate.textContent = `Date: ${state.selectedScheme.date || "-"}`;
  elements.schemeDetails.innerHTML = `
    <p><strong>Scheme name:</strong> ${escapeHtml(state.selectedScheme.schemeName)}</p>
    <p><strong>Scheme code:</strong> ${escapeHtml(state.selectedScheme.schemeCode)}</p>
    <p><strong>ISIN growth/dividend:</strong> ${escapeHtml(state.selectedScheme.isinGrowth || "-")}</p>
    <p><strong>ISIN reinvestment:</strong> ${escapeHtml(state.selectedScheme.isinReinvestment || "-")}</p>
  `;
}

function applySchemes(schemes, sourceLabel) {
  state.schemes = schemes;
  state.sourceLabel = sourceLabel;
  state.selectedScheme = null;
  elements.schemeSearch.value = "";
  elements.unitsInput.value = "";
  populateOptions();
  updateSummary();
  updatePortfolioValue();
}

function parseTextareaContent(sourceLabel) {
  const rawText = elements.navText.value.trim();
  if (!rawText) {
    setFeedback("Paste the AMFI NAV text first, then parse it.", true);
    return;
  }

  const schemes = parseNavText(rawText);
  if (!schemes.length) {
    setFeedback("No valid scheme rows were found. Check that the pasted text is semicolon-separated AMFI NAV data.", true);
    return;
  }

  applySchemes(schemes, sourceLabel);
  setFeedback(`Loaded ${schemes.length.toLocaleString("en-IN")} schemes.`);
}

async function fetchLiveAmfiData() {
  elements.fetchAmfiBtn.disabled = true;
  setFeedback("Fetching AMFI NAV data...");

  for (const url of AMFI_URLS) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const text = await response.text();
      elements.navText.value = text;
      parseTextareaContent(`Live fetch from ${new URL(url).host}`);
      return;
    } catch (error) {
      // Try the next source.
    }
  }

  setFeedback("Live fetch failed in this browser. Paste NAVAll.txt contents manually and use Parse pasted data.", true);
  elements.fetchAmfiBtn.disabled = false;
}

elements.fetchAmfiBtn.addEventListener("click", async () => {
  await fetchLiveAmfiData();
  elements.fetchAmfiBtn.disabled = false;
});

elements.useSampleBtn.addEventListener("click", () => {
  elements.navText.value = SAMPLE_NAV_TEXT;
  parseTextareaContent("Bundled sample data");
});

elements.clearDataBtn.addEventListener("click", () => {
  elements.navText.value = "";
  applySchemes([], "Waiting for NAV data");
  setFeedback("Cleared loaded data.");
});

elements.parseTextBtn.addEventListener("click", () => {
  parseTextareaContent("Pasted NAV text");
});

elements.schemeSearch.addEventListener("input", updateSelectedScheme);
elements.unitsInput.addEventListener("input", updatePortfolioValue);

updateSummary();
updatePortfolioValue();
