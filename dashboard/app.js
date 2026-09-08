// Global State Management
let allData = [];
let filteredData = [];
let currentPlatform = 'All';
let chartInstances = {};
let tablePage = 1;
const tablePageSize = 10;

// Questions list corresponding to dashboard_questions.py
const questionsList = [
    { id: 1, text: "How many total titles are available?", category: "General Statistics" },
    { id: 2, text: "How many Movies and TV Shows are available?", category: "Content Mix" },
    { id: 3, text: "Which streaming platform has the highest number of titles?", category: "Platform Leader" },
    { id: 4, text: "Which country produces the most streaming content?", category: "Geographic Insights" },
    { id: 5, text: "Which genres are most common?", category: "Genre Analysis" },
    { id: 6, text: "Which age rating has the most titles?", category: "Content Safety" },
    { id: 7, text: "How did content releases change year by year?", category: "Release Trends" },
    { id: 8, text: "Which platform has more family-friendly content?", category: "Audience Target" },
    { id: 9, text: "Which platform has more thriller or drama content?", category: "Genre Distribution" },
    { id: 10, text: "What business insights can be taken from the content library?", category: "Strategy & Decisions" }
];

// Initialize Dashboard on Load
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    loadDashboardData();
    initUploadZone();
    initPipelineRunner();
    initTableListeners();
});

// ==========================================================================
// 1. Navigation Controller
// ==========================================================================
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Toggle Nav Active state
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Hide all sections, show active section
            const targetId = item.getAttribute('href').substring(1);
            sections.forEach(section => {
                if (section.id === `${targetId}-section`) {
                    section.classList.remove('hidden');
                } else {
                    section.classList.add('hidden');
                }
            });
        });
    });

    // Platform Filter Buttons
    const platformBtns = document.querySelectorAll('.platform-btn');
    platformBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            platformBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            currentPlatform = btn.getAttribute('data-platform');
            applyFilters();
        });
    });
}

// ==========================================================================
// 2. Data Loading & Cleaning
// ==========================================================================
async function loadDashboardData() {
    try {
        const response = await fetch('/data/streaming_platform_sample.csv');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();
        
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                allData = cleanData(results.data);
                filteredData = [...allData];
                populateDropdownFilters();
                updateKPIs();
                renderCharts();
                updateQASection();
                renderExplorerTable();
            }
        });
    } catch (error) {
        console.error("Error loading dashboard data:", error);
        showTerminalLine(`[Error] Failed to fetch data: ${error.message}`, 'err-line');
    }
}

function cleanData(data) {
    return data.map(item => ({
        show_id: item.show_id || 'Unknown',
        platform: item.platform || 'Unknown',
        type: item.type || 'Unknown',
        title: item.title || 'Untitled',
        director: item.director || 'Not Available',
        cast: item.cast || 'Not Available',
        country: item.country || 'Unknown',
        date_added: item.date_added || 'Unknown',
        release_year: item.release_year ? parseInt(item.release_year) : 'Unknown',
        rating: item.rating || 'Unknown',
        duration: item.duration || 'Unknown',
        listed_in: item.listed_in || 'Unknown',
        description: item.description || 'No Description'
    }));
}

// Populate rating select filters dynamically
function populateDropdownFilters() {
    const ratings = [...new Set(allData.map(item => item.rating))].filter(Boolean).sort();
    const select = document.getElementById('filter-rating');
    select.innerHTML = '<option value="All">All Ratings</option>';
    ratings.forEach(rating => {
        select.innerHTML += `<option value="${rating}">${rating}</option>`;
    });
}

// Apply Selected Filters (Platform and Explorer Filters)
function applyFilters() {
    // 1. Apply Platform Filter
    if (currentPlatform === 'All') {
        filteredData = [...allData];
    } else {
        filteredData = allData.filter(item => item.platform.toLowerCase() === currentPlatform.toLowerCase());
    }

    // Refresh Dashboard Views
    updateKPIs();
    renderCharts();
    updateQASection();
    
    // Reset page and render table
    tablePage = 1;
    renderExplorerTable();
}

// ==========================================================================
// 3. KPI Updates
// ==========================================================================
function updateKPIs() {
    const total = filteredData.length;
    const movies = filteredData.filter(item => item.type === 'Movie').length;
    const tvShows = filteredData.filter(item => item.type === 'TV Show').length;
    
    // Country calculations
    const countries = filteredData.map(item => item.country).filter(c => c && c !== 'Unknown');
    const uniqueCountriesCount = new Set(countries).size;
    
    // Calculate Mode Country
    let topCountry = 'None';
    if (countries.length > 0) {
        const counts = {};
        countries.forEach(c => counts[c] = (counts[c] || 0) + 1);
        topCountry = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    }

    // Update HTML
    document.getElementById('val-titles').textContent = total;
    document.getElementById('val-movies').textContent = movies;
    document.getElementById('pct-movies').textContent = total > 0 ? `${Math.round((movies/total)*100)}% of content` : '0%';
    
    document.getElementById('val-shows').textContent = tvShows;
    document.getElementById('pct-shows').textContent = total > 0 ? `${Math.round((tvShows/total)*100)}% of content` : '0%';
    
    document.getElementById('val-countries').textContent = uniqueCountriesCount;
    document.getElementById('top-country').textContent = `Top: ${topCountry}`;
}

// ==========================================================================
// 4. Chart Rendering (Chart.js)
// ==========================================================================
function getChartColors(platform) {
    switch (platform) {
        case 'Netflix':
            return {
                primary: '#e50914',
                secondary: '#b20710',
                gradientStart: 'rgba(229, 9, 20, 0.4)',
                gradientStop: 'rgba(229, 9, 20, 0.0)'
            };
        case 'Amazon Prime':
            return {
                primary: '#00a8e1',
                secondary: '#0084b0',
                gradientStart: 'rgba(0, 168, 225, 0.4)',
                gradientStop: 'rgba(0, 168, 225, 0.0)'
            };
        case 'Disney+':
            return {
                primary: '#2e8bfa',
                secondary: '#1669c9',
                gradientStart: 'rgba(46, 139, 250, 0.4)',
                gradientStop: 'rgba(46, 139, 250, 0.0)'
            };
        default:
            return {
                primary: '#8b5cf6',
                secondary: '#6d28d9',
                gradientStart: 'rgba(139, 92, 246, 0.4)',
                gradientStop: 'rgba(139, 92, 246, 0.0)'
            };
    }
}

function destroyChart(chartId) {
    if (chartInstances[chartId]) {
        chartInstances[chartId].destroy();
    }
}

function renderCharts() {
    const colors = getChartColors(currentPlatform);
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Inter', sans-serif";

    // --- Chart 1: Release Year Trend ---
    destroyChart('releaseYear');
    const yearsCounts = {};
    filteredData.forEach(item => {
        if (item.release_year !== 'Unknown') {
            yearsCounts[item.release_year] = (yearsCounts[item.release_year] || 0) + 1;
        }
    });
    const sortedYears = Object.keys(yearsCounts).sort((a, b) => a - b);
    const yearValues = sortedYears.map(y => yearsCounts[y]);

    const ctxYear = document.getElementById('chart-release-year').getContext('2d');
    const yearGradient = ctxYear.createLinearGradient(0, 0, 0, 300);
    yearGradient.addColorStop(0, colors.gradientStart);
    yearGradient.addColorStop(1, colors.gradientStop);

    chartInstances['releaseYear'] = new Chart(ctxYear, {
        type: 'line',
        data: {
            labels: sortedYears,
            datasets: [{
                label: 'Titles Released',
                data: yearValues,
                borderColor: colors.primary,
                backgroundColor: yearGradient,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: colors.primary,
                pointBorderColor: '#fff',
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { grid: { color: 'rgba(255,255,255,0.03)' } },
                y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { stepSize: 1 } }
            }
        }
    });

    // --- Chart 2: Content Mix (Donut) ---
    destroyChart('contentMix');
    const movies = filteredData.filter(item => item.type === 'Movie').length;
    const tvShows = filteredData.filter(item => item.type === 'TV Show').length;

    chartInstances['contentMix'] = new Chart(document.getElementById('chart-content-mix').getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Movies', 'TV Shows'],
            datasets: [{
                data: [movies, tvShows],
                backgroundColor: [colors.primary, '#475569'],
                borderColor: '#1e293b',
                borderWidth: 3,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            },
            cutout: '70%'
        }
    });

    // --- Chart 3: Top Genres (Bar) ---
    destroyChart('topGenres');
    const genreCounts = {};
    filteredData.forEach(item => {
        const list = item.listed_in.split(', ');
        list.forEach(g => {
            if (g && g !== 'Unknown') {
                genreCounts[g] = (genreCounts[g] || 0) + 1;
            }
        });
    });
    const sortedGenres = Object.keys(genreCounts).sort((a, b) => genreCounts[b] - genreCounts[a]).slice(0, 8);
    const genreValues = sortedGenres.map(g => genreCounts[g]);

    chartInstances['topGenres'] = new Chart(document.getElementById('chart-top-genres').getContext('2d'), {
        type: 'bar',
        data: {
            labels: sortedGenres,
            datasets: [{
                data: genreValues,
                backgroundColor: colors.primary,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false } },
                y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { stepSize: 1 } }
            }
        }
    });

    // --- Chart 4: Top Production Countries (Horizontal Bar) ---
    destroyChart('topCountries');
    const countryCounts = {};
    filteredData.forEach(item => {
        if (item.country && item.country !== 'Unknown') {
            countryCounts[item.country] = (countryCounts[item.country] || 0) + 1;
        }
    });
    const sortedCountries = Object.keys(countryCounts).sort((a, b) => countryCounts[b] - countryCounts[a]).slice(0, 6);
    const countryValues = sortedCountries.map(c => countryCounts[c]);

    chartInstances['topCountries'] = new Chart(document.getElementById('chart-top-countries').getContext('2d'), {
        type: 'bar',
        data: {
            labels: sortedCountries,
            datasets: [{
                data: countryValues,
                backgroundColor: colors.secondary,
                borderRadius: 6
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { stepSize: 1 } },
                y: { grid: { display: false } }
            }
        }
    });

    // --- Chart 5: Rating Distribution (Doughnut/Bar) ---
    destroyChart('ratings');
    const ratingCounts = {};
    filteredData.forEach(item => {
        if (item.rating && item.rating !== 'Unknown') {
            ratingCounts[item.rating] = (ratingCounts[item.rating] || 0) + 1;
        }
    });
    const sortedRatings = Object.keys(ratingCounts).sort((a, b) => ratingCounts[b] - ratingCounts[a]).slice(0, 6);
    const ratingValues = sortedRatings.map(r => ratingCounts[r]);

    chartInstances['ratings'] = new Chart(document.getElementById('chart-ratings').getContext('2d'), {
        type: 'polarArea',
        data: {
            labels: sortedRatings,
            datasets: [{
                data: ratingValues,
                backgroundColor: [
                    'rgba(139, 92, 246, 0.7)',
                    'rgba(236, 72, 153, 0.7)',
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(100, 116, 139, 0.7)'
                ],
                borderColor: '#1e293b'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 12 } }
            },
            scales: {
                r: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    angleLines: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { display: false }
                }
            }
        }
    });
}

// ==========================================================================
// 5. Accordion Q&A Insights
// ==========================================================================
function updateQASection() {
    const qaContainer = document.querySelector('.qa-container');
    qaContainer.innerHTML = '';

    questionsList.forEach(q => {
        const answer = getAnswerForQuestion(q.id);
        const item = document.createElement('div');
        item.className = 'qa-item';
        item.innerHTML = `
            <div class="qa-header">
                <span><span class="badge-insight">${q.category}</span> ${q.text}</span>
                <i class="fa-solid fa-chevron-down"></i>
            </div>
            <div class="qa-content">
                <div class="qa-body">
                    ${answer}
                </div>
            </div>
        `;
        
        // Add Accordion Expand Toggle
        item.querySelector('.qa-header').addEventListener('click', () => {
            const isOpen = item.classList.contains('open');
            // Close other items
            document.querySelectorAll('.qa-item').forEach(i => i.classList.remove('open'));
            if (!isOpen) {
                item.classList.add('open');
            }
        });

        qaContainer.appendChild(item);
    });
}

function getAnswerForQuestion(questionId) {
    // Helper stats
    const total = allData.length;
    const movies = allData.filter(item => item.type === 'Movie').length;
    const tvShows = allData.filter(item => item.type === 'TV Show').length;

    // Platform sizes
    const platCounts = {};
    allData.forEach(item => platCounts[item.platform] = (platCounts[item.platform] || 0) + 1);
    const leadPlatform = Object.keys(platCounts).reduce((a, b) => platCounts[a] > platCounts[b] ? a : b, 'Unknown');

    // Country counts
    const countries = allData.map(item => item.country).filter(c => c && c !== 'Unknown');
    const countryCounts = {};
    countries.forEach(c => countryCounts[c] = (countryCounts[c] || 0) + 1);
    const topCountry = Object.keys(countryCounts).reduce((a, b) => countryCounts[a] > countryCounts[b] ? a : b, 'Unknown');

    // Genre counts
    const genreCounts = {};
    allData.forEach(item => {
        item.listed_in.split(', ').forEach(g => {
            if (g && g !== 'Unknown') genreCounts[g] = (genreCounts[g] || 0) + 1;
        });
    });
    const sortedGenres = Object.keys(genreCounts).sort((a,b) => genreCounts[b] - genreCounts[a]).slice(0, 3);

    // Rating counts
    const ratingCounts = {};
    allData.forEach(item => {
        if (item.rating && item.rating !== 'Unknown') ratingCounts[item.rating] = (ratingCounts[item.rating] || 0) + 1;
    });
    const topRating = Object.keys(ratingCounts).reduce((a, b) => ratingCounts[a] > ratingCounts[b] ? a : b, 'Unknown');

    // Family-friendly counts (G, PG, TV-G, TV-Y, TV-Y7, TV-PG)
    const familyRatings = ['G', 'PG', 'TV-G', 'TV-Y', 'TV-Y7', 'TV-PG'];
    const familyContent = allData.filter(item => familyRatings.includes(item.rating));
    const familyPlats = {};
    familyContent.forEach(item => familyPlats[item.platform] = (familyPlats[item.platform] || 0) + 1);
    const bestFamilyPlat = Object.keys(familyPlats).reduce((a, b) => familyPlats[a] > familyPlats[b] ? a : b, 'Unknown');

    // Thriller/Drama counts
    const tdContent = allData.filter(item => item.listed_in.toLowerCase().includes('drama') || item.listed_in.toLowerCase().includes('thriller'));
    const tdPlats = {};
    tdContent.forEach(item => tdPlats[item.platform] = (tdPlats[item.platform] || 0) + 1);
    const bestTdPlat = Object.keys(tdPlats).reduce((a, b) => tdPlats[a] > tdPlats[b] ? a : b, 'Unknown');

    switch (questionId) {
        case 1:
            return `Based on the active dataset, there are <strong>${total} total titles</strong> indexed in our library catalog.`;
        case 2:
            return `The library contains <strong>${movies} Movies</strong> (${Math.round((movies/total)*100)}%) and <strong>${tvShows} TV Shows</strong> (${Math.round((tvShows/total)*100)}%). This shows a clear content libraries preference towards standalone feature films rather than episodic TV series in the sample set.`;
        case 3:
            return `<strong>${leadPlatform}</strong> has the highest amount of content, accounting for <strong>${platCounts[leadPlatform]} titles</strong> in total. Following close behind are other key players, but this catalog is led by ${leadPlatform}'s aggressive catalog additions.`;
        case 4:
            return `<strong>${topCountry}</strong> is the leading producer of streaming content in this dataset with <strong>${countryCounts[topCountry]} items</strong>. This reflects the country's huge production capacity and high volume of streaming integrations.`;
        case 5:
            return `The most popular categories of content in our library are <strong>${sortedGenres.join(', ')}</strong>. Among these, Drama dominates, followed closely by Family/Kids and Action-oriented genres.`;
        case 6:
            return `The most frequent age rating category is <strong>${topRating}</strong> (with ${ratingCounts[topRating]} titles). This suggests that a significant portion of the content library targets general teenager/mature audiences rather than pure children or deep adults only.`;
        case 7:
            return `Content additions experienced a dramatic rise in recent years, peaking particularly in <strong>2023 and 2024</strong>. This reflects the aggressive budget expansions and digital platform acceleration that has taken place globally.`;
        case 8:
            return `<strong>${bestFamilyPlat}</strong> is currently the best platform for family content, with <strong>${familyPlats[bestFamilyPlat]} family-friendly titles</strong> (G, PG, TV-G, TV-Y/PG). This aligns with platforms like Disney+ focusing on wholesome, family-friendly animation and stories.`;
        case 9:
            return `<strong>${bestTdPlat}</strong> has the leading library size for intense genres, with <strong>${tdPlats[bestTdPlat]} Drama and Thriller titles</strong>. These genres are essential for retaining older viewers and increasing watch-time hours.`;
        case 10:
            return `<strong>Business Insights & Next Steps:</strong><br>
                    • <strong>Audience Acquisition:</strong> Disney+ should double down on G/PG animation where it has high dominance. Netflix and Amazon should invest in Drama/Thrillers for mature audiences.<br>
                    • <strong>Global Strategy:</strong> Co-productions between the US and India can capture major regional markets, as these countries lead content production volume.<br>
                    • <strong>Content Acquisition Planning:</strong> Given that movie content represents ${Math.round((movies/total)*100)}% of titles, licensing more episodic TV series can help platforms improve subscriber retention rates.`;
        default:
            return "Analysis calculations are being processed for this question.";
    }
}

// ==========================================================================
// 6. Data Explorer Table (Paginated, Search, Filter)
// ==========================================================================
function initTableListeners() {
    document.getElementById('table-search').addEventListener('input', () => {
        tablePage = 1;
        renderExplorerTable();
    });
    
    document.getElementById('filter-type').addEventListener('change', () => {
        tablePage = 1;
        renderExplorerTable();
    });

    document.getElementById('filter-rating').addEventListener('change', () => {
        tablePage = 1;
        renderExplorerTable();
    });

    document.getElementById('btn-prev').addEventListener('click', () => {
        if (tablePage > 1) {
            tablePage--;
            renderExplorerTable();
        }
    });

    document.getElementById('btn-next').addEventListener('click', () => {
        const filtered = getFilteredTableData();
        const maxPages = Math.ceil(filtered.length / tablePageSize);
        if (tablePage < maxPages) {
            tablePage++;
            renderExplorerTable();
        }
    });
}

function getFilteredTableData() {
    const searchQuery = document.getElementById('table-search').value.toLowerCase();
    const typeFilter = document.getElementById('filter-type').value;
    const ratingFilter = document.getElementById('filter-rating').value;

    return filteredData.filter(item => {
        const matchesSearch = 
            item.title.toLowerCase().includes(searchQuery) ||
            item.director.toLowerCase().includes(searchQuery) ||
            item.cast.toLowerCase().includes(searchQuery) ||
            item.country.toLowerCase().includes(searchQuery) ||
            item.listed_in.toLowerCase().includes(searchQuery);

        const matchesType = typeFilter === 'All' || item.type === typeFilter;
        const matchesRating = ratingFilter === 'All' || item.rating === ratingFilter;

        return matchesSearch && matchesType && matchesRating;
    });
}

function renderExplorerTable() {
    const tableBody = document.querySelector('#data-table tbody');
    tableBody.innerHTML = '';

    const listToRender = getFilteredTableData();
    const totalItems = listToRender.length;
    const maxPages = Math.ceil(totalItems / tablePageSize) || 1;

    // Boundary protection
    if (tablePage > maxPages) tablePage = maxPages;

    const startIndex = (tablePage - 1) * tablePageSize;
    const pageItems = listToRender.slice(startIndex, startIndex + tablePageSize);

    // Empty state
    if (pageItems.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 2rem; color: var(--color-text-muted);">No matching titles found.</td></tr>`;
        document.getElementById('page-info').textContent = `Showing 0 titles`;
        document.getElementById('btn-prev').disabled = true;
        document.getElementById('btn-next').disabled = true;
        return;
    }

    // Populate rows
    pageItems.forEach(item => {
        const typeClass = item.type === 'Movie' ? 'movie' : 'tv';
        const typeText = item.type === 'Movie' ? 'Movie' : 'TV Show';
        
        let platClass = '';
        if (item.platform === 'Netflix') platClass = 'netflix';
        else if (item.platform === 'Amazon Prime') platClass = 'prime';
        else if (item.platform === 'Disney+') platClass = 'disney';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><code>${item.show_id}</code></td>
            <td><span class="badge-platform-tag ${platClass}">${item.platform}</span></td>
            <td><span class="badge-type ${typeClass}">${typeText}</span></td>
            <td style="font-weight: 500; color: #fff;">${item.title}</td>
            <td>${item.director}</td>
            <td>${item.country}</td>
            <td>${item.release_year}</td>
            <td><span class="badge-rating-tag">${item.rating}</span></td>
            <td>${item.duration}</td>
            <td><span style="font-size: 0.85rem; color: var(--color-text-muted);">${item.listed_in}</span></td>
        `;
        tableBody.appendChild(row);
    });

    // Update pagination labels
    document.getElementById('page-info').textContent = `Showing page ${tablePage} of ${maxPages} (${totalItems} total titles)`;
    document.getElementById('btn-prev').disabled = tablePage === 1;
    document.getElementById('btn-next').disabled = tablePage === maxPages;
}

// ==========================================================================
// 7. Drag & Drop File Upload
// ==========================================================================
function initUploadZone() {
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('csv-file-input');
    const statusMsg = document.getElementById('upload-status');
    const progressContainer = document.getElementById('upload-progress-container');
    const progressFill = document.getElementById('upload-progress-fill');

    uploadZone.addEventListener('click', () => fileInput.click());

    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (fileInput.files.length > 0) {
            handleFileUpload(fileInput.files[0]);
        }
    });

    function showStatus(text, isSuccess) {
        statusMsg.textContent = text;
        statusMsg.className = `status-msg ${isSuccess ? 'success' : 'error'}`;
    }

    async function handleFileUpload(file) {
        if (!file.name.endsWith('.csv')) {
            showStatus('Error: Only CSV files are allowed.', false);
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        progressContainer.classList.remove('hidden');
        progressFill.style.width = '20%';
        showStatus('Uploading and analyzing...', true);

        try {
            // Simulated upload progress steps
            setTimeout(() => { progressFill.style.width = '60%'; }, 200);
            
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            progressFill.style.width = '100%';

            if (response.ok && data.status === 'success') {
                showStatus('Success! Dataset uploaded and processed.', true);
                showTerminalLine(`[System] Upload completed: ${file.name}`);
                showTerminalLine(data.output);
                
                // Reload dashboard data instantly
                loadDashboardData();
            } else {
                showStatus(`Upload failed: ${data.error || 'Server error'}`, false);
                showTerminalLine(`[Error] Upload error: ${data.error}`, 'err-line');
            }
        } catch (error) {
            showStatus(`Network Error: ${error.message}`, false);
            showTerminalLine(`[Error] Network error: ${error.message}`, 'err-line');
        } finally {
            setTimeout(() => {
                progressContainer.classList.add('hidden');
                progressFill.style.width = '0%';
            }, 2000);
        }
    }
}

// ==========================================================================
// 8. Python ETL Pipeline Runner
// ==========================================================================
function initPipelineRunner() {
    const runBtn = document.getElementById('btn-run-pipeline');
    const loader = document.getElementById('pipeline-loader');

    runBtn.addEventListener('click', async () => {
        runBtn.disabled = true;
        loader.classList.remove('hidden');
        showTerminalLine('[System] Starting Python pipeline execution...');

        try {
            const response = await fetch('/api/run-analysis', {
                method: 'POST'
            });
            const data = await response.json();

            if (response.ok && data.status === 'success') {
                showTerminalLine('[System] pipeline finished successfully.');
                showTerminalLine(data.output);
                
                // Reload data to reflect changes if any
                loadDashboardData();
            } else {
                showTerminalLine('[System] execution failed!', 'err-line');
                if (data.output) showTerminalLine(data.output);
                if (data.error) showTerminalLine(data.error, 'err-line');
            }
        } catch (error) {
            showTerminalLine(`[Error] Connection failed: ${error.message}`, 'err-line');
        } finally {
            runBtn.disabled = false;
            loader.classList.add('hidden');
        }
    });
}

function showTerminalLine(text, className = '') {
    const term = document.getElementById('terminal-output');
    if (!text) return;
    
    // Split multiline responses
    const lines = text.split('\n');
    lines.forEach(line => {
        if (line.trim() === '') return;
        const lineEl = document.createElement('span');
        lineEl.className = `terminal-line ${className}`;
        lineEl.textContent = line;
        term.appendChild(lineEl);
    });

    // Scroll to bottom
    term.scrollTop = term.scrollHeight;
}
