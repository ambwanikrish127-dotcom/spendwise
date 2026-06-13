/* =====================================================================
   SpendWise — app.js
   Features:
   1. Income / Expense / All type-filter pills
   2. Date range filter (From → To) on transactions page
   3. Date range analysis on reports page
   4. Savings card (income − expense)
   5. Monthly breakdown table
   6. Clear filters button
   7. Edit re-populates all fields including notes textarea
   ===================================================================== */

/* --- SAFE STORAGE --- */
const store = {
  get(key, fb) {
    try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fb; }
    catch(e) { return fb; }
  },
  set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {}
  }
};

/* --- STATE --- */
let transactions = store.get("transactions", []);
let currentPage  = 1;
let typeFilter   = "all";   // all | income | expense
const PAGE_SIZE  = 8;

/* --- HELPERS --- */
const $       = id => document.getElementById(id);
const save    = () => store.set("transactions", transactions);
const makeId  = () => Date.now().toString() + Math.floor(Math.random() * 1000);
const money   = n => "₹" + Number(n).toFixed(2);
const prettyDate = s =>
  new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

// YYYY-MM from a date string
const ym = s => s ? s.slice(0, 7) : "";

/* --- VIEW SWITCHING --- */
function showView(name) {
  document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));
  $("view-" + name).classList.remove("hidden");
  document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
  document.querySelector(`.nav-item[data-view="${name}"]`).classList.add("active");
  render();
}
document.querySelectorAll(".nav-item").forEach(btn =>
  btn.addEventListener("click", () => showView(btn.dataset.view))
);

/* --- TYPE FILTER PILLS --- */
function setTypePill(type) {
  typeFilter = type;
  ["all","income","expense"].forEach(t => {
    const el = $("pill-" + t);
    el.className = "type-pill";
    if (t === type) el.classList.add("active-" + t);
  });
  currentPage = 1;
  renderTable();
}

/* --- CLEAR FILTERS --- */
$("clear-filters-btn").addEventListener("click", () => {
  $("search").value = "";
  $("filter-category").value = "All";
  $("filter-date-from").value = "";
  $("filter-date-to").value = "";
  typeFilter = "all";
  ["all","income","expense"].forEach(t => {
    const el = $("pill-" + t);
    el.className = "type-pill";
    if (t === "all") el.classList.add("active-all");
  });
  currentPage = 1;
  renderTable();
});

/* --- MODAL --- */
function openModal(editId) {
  $("modal").classList.remove("hidden");
  if (editId) {
    const t = transactions.find(x => x.id === editId);
    $("modal-title").textContent = "Edit transaction";
    $("edit-id").value    = t.id;
    $("f-type").value     = t.type;
    $("f-title").value    = t.title;
    $("f-amount").value   = t.amount;
    $("f-category").value = t.category;
    $("f-payment").value  = t.payment || "Cash";
    $("f-date").value     = t.date;
    $("f-notes").value    = t.notes || "";
  } else {
    $("modal-title").textContent = "Add transaction";
    $("edit-id").value    = "";
    $("f-type").value     = "expense";
    $("f-title").value    = "";
    $("f-amount").value   = "";
    $("f-category").value = "Food";
    $("f-payment").value  = "Cash";
    $("f-date").value     = new Date().toISOString().split("T")[0];
    $("f-notes").value    = "";
  }
}
const closeModal = () => $("modal").classList.add("hidden");

function saveTransaction() {
  const id       = $("edit-id").value;
  const type     = $("f-type").value;
  const title    = $("f-title").value.trim();
  const amount   = parseFloat($("f-amount").value);
  const category = $("f-category").value;
  const payment  = $("f-payment").value;
  const date     = $("f-date").value;
  const notes    = $("f-notes").value.trim();

  if (!title || isNaN(amount) || amount <= 0 || !date) {
    alert("Kripya title, amount (positive), aur date zaroor bharein.");
    return;
  }
  const entry = { id: id || makeId(), type, title, amount, category, payment, date, notes };
  if (id) {
    transactions = transactions.map(t => t.id === id ? entry : t);
  } else {
    transactions.push(entry);
  }
  save();
  closeModal();
  render();
}

function deleteTransaction(id) {
  if (!confirm("Kya aap is transaction ko delete karna chahte hain?")) return;
  transactions = transactions.filter(t => t.id !== id);
  save();
  render();
}

/* --- FILTER (shared) --- */
function getVisible() {
  const search = ($("search").value || "").toLowerCase();
  const cat    = $("filter-category").value;
  const from   = $("filter-date-from").value;
  const to     = $("filter-date-to").value;

  return transactions
    .filter(t => {
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (cat !== "All" && t.category !== cat) return false;
      if (from && t.date < from) return false;
      if (to   && t.date > to)   return false;
      const text = (t.title + " " + t.category + " " + (t.notes||"") + " " + (t.payment||"")).toLowerCase();
      if (search && !text.includes(search)) return false;
      return true;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

/* --- RENDER ALL --- */
function render() {
  renderSummary();
  renderTable();
  renderRecent();
  renderReports();
}

function renderSummary() {
  const inc  = transactions.filter(t => t.type === "income");
  const exp  = transactions.filter(t => t.type === "expense");
  const iSum = inc.reduce((s, t) => s + t.amount, 0);
  const eSum = exp.reduce((s, t) => s + t.amount, 0);
  $("sum-income").textContent        = money(iSum);
  $("sum-income-count").textContent  = inc.length + " transactions";
  $("sum-expense").textContent       = money(eSum);
  $("sum-expense-count").textContent = exp.length + " transactions";
  const bal = $("sum-balance");
  bal.textContent = money(iSum - eSum);
  bal.style.color = (iSum - eSum) >= 0 ? "var(--green)" : "var(--red)";
}

function renderTable() {
  const rows       = getVisible();
  const total      = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;

  const start    = (currentPage - 1) * PAGE_SIZE;
  const pageRows = rows.slice(start, start + PAGE_SIZE);
  const body     = $("table-body");

  if (total === 0) {
    body.innerHTML = `<tr><td colspan="8" class="empty">Koi transaction nahi mila. Filter check karein ya naya add karein.</td></tr>`;
    $("pagination").innerHTML = "";
    $("table-summary").textContent = "";
    return;
  }

  body.innerHTML = pageRows.map(t => `
    <tr>
      <td><span class="pill pill-${t.type}">${t.type === "income" ? "Income" : "Expense"}</span></td>
      <td><strong>${escHtml(t.title)}</strong></td>
      <td class="amt-${t.type}">${t.type === "expense" ? "−" : "+"}${money(t.amount)}</td>
      <td>${t.category}</td>
      <td>${t.payment || "−"}</td>
      <td class="notes-cell" title="${escHtml(t.notes||'')}">${escHtml(t.notes)||"−"}</td>
      <td>${prettyDate(t.date)}</td>
      <td class="row-actions">
        <button class="icon-btn icon-edit"   onclick="openModal('${t.id}')">✏ Edit</button>
        <button class="icon-btn icon-delete" onclick="deleteTransaction('${t.id}')">🗑 Delete</button>
      </td>
    </tr>`).join("");

  // summary line below table
  const iTotal = rows.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const eTotal = rows.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  $("table-summary").innerHTML =
    `Showing ${start+1}–${Math.min(start+PAGE_SIZE, total)} of ${total} &nbsp;|&nbsp; ` +
    `<span class="amt-income">+${money(iTotal)}</span> income &nbsp; ` +
    `<span class="amt-expense">−${money(eTotal)}</span> expense`;

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const el = $("pagination");
  if (totalPages <= 1) { el.innerHTML = ""; return; }
  let h = `<button class="page-btn" ${currentPage===1?"disabled":""} onclick="goPage(${currentPage-1})">‹</button>`;
  for (let i = 1; i <= totalPages; i++)
    h += `<button class="page-btn ${i===currentPage?"active":""}" onclick="goPage(${i})">${i}</button>`;
  h += `<button class="page-btn" ${currentPage===totalPages?"disabled":""} onclick="goPage(${currentPage+1})">›</button>`;
  el.innerHTML = h;
}
function goPage(p) { currentPage = p; renderTable(); }

function renderRecent() {
  const recent = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  const el = $("recent-list");
  if (!recent.length) { el.innerHTML = `<p class="empty">Abhi koi transaction nahi hai.</p>`; return; }
  el.innerHTML = recent.map(t => `
    <div class="recent-item">
      <div>
        <div class="recent-title">${escHtml(t.title)}</div>
        <div class="recent-meta">${t.category} · ${t.payment||""} · ${prettyDate(t.date)}</div>
      </div>
      <div class="amt-${t.type}">${t.type==="expense"?"−":"+"}${money(t.amount)}</div>
    </div>`).join("");
}

/* --- REPORTS --- */
function clearRptRange() {
  $("rpt-from").value = "";
  $("rpt-to").value   = "";
  renderReports();
}

function renderReports() {
  const from = $("rpt-from").value;
  const to   = $("rpt-to").value;

  const filtered = transactions.filter(t => {
    if (from && t.date < from) return false;
    if (to   && t.date > to)   return false;
    return true;
  });

  // Range summary
  const rInc = filtered.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const rExp = filtered.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const rSav = rInc - rExp;
  $("rpt-income").textContent  = money(rInc);
  $("rpt-expense").textContent = money(rExp);
  const savEl = $("rpt-savings");
  savEl.textContent = money(rSav);
  savEl.className   = "rb-val " + (rSav >= 0 ? "savings-positive" : "savings-negative");

  // Monthly breakdown
  const months = {};
  filtered.forEach(t => {
    const m = ym(t.date);
    if (!months[m]) months[m] = { income: 0, expense: 0 };
    months[m][t.type] += t.amount;
  });
  const sortedMonths = Object.keys(months).sort().reverse();
  const wrap = $("monthly-table-wrap");
  if (!sortedMonths.length) {
    wrap.innerHTML = `<p class="empty">Is range mein koi data nahi.</p>`;
  } else {
    wrap.innerHTML = `
      <table class="month-table">
        <thead><tr>
          <th>Month</th>
          <th>Income</th>
          <th>Expense</th>
          <th>Savings</th>
        </tr></thead>
        <tbody>
          ${sortedMonths.map(m => {
            const { income = 0, expense = 0 } = months[m];
            const sav = income - expense;
            const [yr, mo] = m.split("-");
            const label = new Date(yr, mo - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
            return `<tr>
              <td><strong>${label}</strong></td>
              <td class="amt-income">+${money(income)}</td>
              <td class="amt-expense">−${money(expense)}</td>
              <td class="${sav >= 0 ? "savings-positive" : "savings-negative"}">${sav >= 0 ? "+" : ""}${money(sav)}</td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>`;
  }

  // Category bars (expense only)
  const totals = {};
  filtered.filter(t => t.type === "expense").forEach(t => {
    totals[t.category] = (totals[t.category] || 0) + t.amount;
  });
  const cats = Object.keys(totals).sort((a, b) => totals[b] - totals[a]);
  const el   = $("report-bars");
  if (!cats.length) {
    el.innerHTML = `<p class="empty">Is range mein koi expense nahi.</p>`;
  } else {
    const max = Math.max(...Object.values(totals));
    el.innerHTML = cats.map(c => {
      const pct = (totals[c] / max) * 100;
      return `
        <div class="bar-row">
          <div class="bar-label">${c}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
          <div class="bar-value">${money(totals[c])}</div>
        </div>`;
    }).join("");
  }
}

/* --- CSV EXPORT --- */
function exportCSV() {
  const rows = getVisible();
  if (!rows.length) { alert("Export ke liye koi transaction nahi mila."); return; }
  const header = ["Type","Title","Amount","Category","Payment","Notes","Date"];
  const lines  = rows.map(t =>
    [t.type, `"${t.title}"`, t.amount, t.category, t.payment||"",
     `"${(t.notes||"").replace(/"/g,'""')}"`, t.date].join(",")
  );
  const csv  = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a    = document.createElement("a");
  a.href     = URL.createObjectURL(blob);
  a.download = "spendwise-transactions.csv";
  a.click();
}

/* --- XSS ESCAPE --- */
function escHtml(s) {
  return String(s||"")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* --- WIRING --- */
$("open-add").addEventListener("click", () => openModal());
$("open-add-from-dash").addEventListener("click", () => openModal());
$("cancel-btn").addEventListener("click", closeModal);
$("save-btn").addEventListener("click", saveTransaction);
$("export-btn").addEventListener("click", exportCSV);
$("search").addEventListener("input", () => { currentPage = 1; renderTable(); });
$("filter-category").addEventListener("change", () => { currentPage = 1; renderTable(); });
$("filter-date-from").addEventListener("change", () => { currentPage = 1; renderTable(); });
$("filter-date-to").addEventListener("change",   () => { currentPage = 1; renderTable(); });
$("modal").addEventListener("click", e => { if (e.target.id === "modal") closeModal(); });

/* --- BOOT --- */
render();
