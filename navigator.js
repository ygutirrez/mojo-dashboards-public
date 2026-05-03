/**
 * MoJo Dashboard Navigator — Cmd+K Command Palette
 * 
 * Drop into any dashboard page:
 *   <script src="navigator.js"></script>
 * 
 * Features:
 * - Cmd+K (or Ctrl+K) opens a command palette
 * - Fuzzy search across all dashboards
 * - Shows data freshness per dashboard
 * - Keyboard navigation (arrows, enter, esc)
 * - Recent dashboards tracked in localStorage
 * - Works on desktop and mobile (hamburger menu)
 */
(function() {
    'use strict';

    const DASHBOARDS = [
        // Business Performance
        { name: 'Executive Brief', url: 'executive-brief.html', icon: '🎯', category: 'Performance', keywords: 'morning briefing summary overview alerts' },
        { name: 'Revenue Pace → $5M', url: 'revenue-pace.html', icon: '🎯', category: 'Performance', keywords: 'revenue target goal pace monthly projected' },
        { name: 'Weekly Trends', url: 'weekly-trends.html', icon: '📈', category: 'Performance', keywords: 'week over week sparklines trend comparison' },
        { name: 'Customer Lifetime Value', url: 'clv-dashboard.html', icon: '💎', category: 'Performance', keywords: 'clv customer value acquisition efficiency' },
        { name: 'Season Readiness', url: 'season-readiness.html', icon: '📋', category: 'Performance', keywords: 'capacity health risk readiness peak season' },
        { name: 'Owner\'s Dashboard', url: 'owners-dashboard.html', icon: '👑', category: 'Performance', keywords: 'owner overview business health yoel' },
        { name: 'Sales & Retention KPIs', url: 'sales-kpi-dashboard.html', icon: '💰', category: 'Performance', keywords: 'sales cancels csr retention rate net growth' },
        { name: 'Financial Performance', url: 'financial-dashboard.html', icon: '📒', category: 'Performance', keywords: 'quickbooks p&l profit margin cost revenue' },
        { name: 'Main Dashboard', url: 'dashboard.html', icon: '📈', category: 'Performance', keywords: 'combined metrics trends operational' },

        // Operations
        { name: 'Operations', url: 'operations-dashboard.html', icon: '⚙️', category: 'Operations', keywords: 'ops work orders route scheduling daily' },
        { name: 'Tech Performance & Fleet', url: 'tech-dashboard.html', icon: '🛠️', category: 'Operations', keywords: 'technician stats reviews fleet safety zubie' },
        { name: 'Fleet Dashboard', url: 'fleet-dashboard.html', icon: '🚛', category: 'Operations', keywords: 'vehicle safety mileage driver speeding' },
        { name: 'Chemical Usage', url: 'chemical-dashboard.html', icon: '🧪', category: 'Operations', keywords: 'chemical inventory usage cost treatment reorder' },
        { name: 'CSR Performance', url: 'csr-performance.html', icon: '📊', category: 'Operations', keywords: 'csr win rate sales team individual analytics norma lucy bev' },
        { name: 'ServiceMinder KPIs', url: 'sm-kpi-dashboard.html', icon: '🔧', category: 'Operations', keywords: 'serviceminder production tech productivity weekly' },

        // Retention & Cancels
        { name: 'Cancel Analysis', url: 'cancel-analysis.html', icon: '📉', category: 'Retention', keywords: 'cancel revenue impact controllable win-back lifetime' },
        { name: 'Retention Intelligence', url: 'retention-intelligence.html', icon: '🛡️', category: 'Retention', keywords: 'win-back playbook geographic hotspot controllable loss' },
        { name: 'Retention Dashboard', url: 'retention-dashboard.html', icon: '🔒', category: 'Retention', keywords: 'retention rate 90-day program tracking' },
        { name: 'Customer Growth Tracker', url: 'growth-tracker.html', icon: '📈', category: 'Retention', keywords: 'growth trajectory 4000 goal gap cancels sales scenario what would it take cohort churn' },
        { name: 'Geographic Intelligence', url: 'geo-intelligence.html', icon: '🗺️', category: 'Retention', keywords: 'geo geography zip code neighborhood heatmap north south miami cancel density risk' },
        { name: 'Weekly Scorecard', url: 'scorecard.html', icon: '📊', category: 'Business', keywords: 'scorecard weekly wow comparison trend alerts tech leaderboard cancel reasons' },

        // Marketing
        { name: 'Social Media', url: 'social-media-dashboard.html', icon: '📱', category: 'Marketing', keywords: 'youtube subscribers video social media' },
        { name: 'Marketing Performance', url: 'marketing-dashboard.html', icon: '🎯', category: 'Marketing', keywords: 'google ads budget cpa leads spend campaign' },

        // TV Displays
        { name: 'Sales KPI — TV', url: 'sales-kpi-tv.html', icon: '📺', category: 'TV', keywords: 'tv display sales kpi rotating' },
        { name: 'Operations — TV', url: 'ops-tv.html', icon: '📺', category: 'TV', keywords: 'tv display ops route' },
        { name: 'Tech Leaderboard — TV', url: 'tech-tv.html', icon: '📺', category: 'TV', keywords: 'tv display tech leaderboard gamified' },
        { name: 'Sales — TV', url: 'sales-tv.html', icon: '📺', category: 'TV', keywords: 'tv display sales gamified csr' },
        { name: 'CSR Leaderboard', url: 'sales-leaderboard.html', icon: '🏆', category: 'TV', keywords: 'leaderboard csr rankings conversion upsells' },

        // System
        { name: 'System Status', url: 'system-status.html', icon: '⚙️', category: 'System', keywords: 'pipeline health feed freshness sync status' },
        { name: 'Pipeline Monitor', url: 'pipeline-monitor.html', icon: '🔬', category: 'System', keywords: 'pipeline data freshness nightly sync sanity' },
        { name: 'Data Quality Scorecard', url: 'data-quality.html', icon: '🔍', category: 'System', keywords: 'data quality score freshness reliability' },
        { name: 'Mission Control', url: 'mission-control.html', icon: '🚀', category: 'System', keywords: 'mission control priorities tasks metrics action' },
        { name: 'Activity Log', url: 'activity-log.html', icon: '📋', category: 'System', keywords: 'activity log changelog events pipeline history' },
        { name: 'Command Center (Hub)', url: 'hub.html', icon: '🦟', category: 'System', keywords: 'hub home command center index' },
    ];

    // Track recents in localStorage
    const RECENT_KEY = 'mojo_nav_recents';
    function getRecents() {
        try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } 
        catch { return []; }
    }
    function addRecent(url) {
        let recents = getRecents().filter(r => r !== url);
        recents.unshift(url);
        if (recents.length > 5) recents = recents.slice(0, 5);
        localStorage.setItem(RECENT_KEY, JSON.stringify(recents));
    }

    // Fuzzy search
    function fuzzyMatch(query, item) {
        const q = query.toLowerCase();
        const searchable = (item.name + ' ' + item.category + ' ' + item.keywords).toLowerCase();
        
        // Exact substring match scores highest
        if (searchable.includes(q)) return 100;
        
        // All words must match somewhere
        const words = q.split(/\s+/);
        let score = 0;
        for (const word of words) {
            if (searchable.includes(word)) {
                score += 50;
            } else {
                // Try first-letter matching
                const chars = word.split('');
                let pos = 0;
                let matched = 0;
                for (const c of chars) {
                    const idx = searchable.indexOf(c, pos);
                    if (idx >= 0) { matched++; pos = idx + 1; }
                }
                if (matched / chars.length >= 0.7) score += 20;
                else return 0; // word doesn't match at all
            }
        }
        return score;
    }

    // Create DOM
    function createNavigator() {
        const overlay = document.createElement('div');
        overlay.id = 'mojo-nav-overlay';
        overlay.innerHTML = `
            <div id="mojo-nav-modal">
                <div id="mojo-nav-search-wrap">
                    <span id="mojo-nav-search-icon">⌘K</span>
                    <input type="text" id="mojo-nav-input" placeholder="Search dashboards..." autocomplete="off" spellcheck="false" />
                    <span id="mojo-nav-esc">ESC</span>
                </div>
                <div id="mojo-nav-results"></div>
                <div id="mojo-nav-footer">
                    <span>↑↓ Navigate</span>
                    <span>↵ Open</span>
                    <span>ESC Close</span>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Add the floating trigger button
        const trigger = document.createElement('div');
        trigger.id = 'mojo-nav-trigger';
        trigger.innerHTML = '⌘K';
        trigger.title = 'Dashboard Navigator (Cmd+K)';
        document.body.appendChild(trigger);

        return { overlay, trigger };
    }

    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #mojo-nav-overlay {
                display: none;
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(4px);
                z-index: 99999;
                justify-content: center;
                align-items: flex-start;
                padding-top: 15vh;
            }
            #mojo-nav-overlay.open {
                display: flex;
            }
            #mojo-nav-modal {
                background: #1a1a2e;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                width: 560px;
                max-width: 94vw;
                max-height: 70vh;
                overflow: hidden;
                box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
                display: flex;
                flex-direction: column;
                animation: mojo-nav-in 0.15s ease-out;
            }
            @keyframes mojo-nav-in {
                from { transform: scale(0.96) translateY(-10px); opacity: 0; }
                to { transform: scale(1) translateY(0); opacity: 1; }
            }
            #mojo-nav-search-wrap {
                display: flex;
                align-items: center;
                padding: 16px 20px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                gap: 12px;
            }
            #mojo-nav-search-icon {
                font-size: 0.75rem;
                font-weight: 600;
                color: #ffd700;
                background: rgba(255, 215, 0, 0.12);
                padding: 4px 8px;
                border-radius: 6px;
                white-space: nowrap;
            }
            #mojo-nav-input {
                flex: 1;
                background: none;
                border: none;
                outline: none;
                font-size: 1.1rem;
                color: #e2e8f0;
                font-family: inherit;
            }
            #mojo-nav-input::placeholder { color: #4b5563; }
            #mojo-nav-esc {
                font-size: 0.65rem;
                font-weight: 600;
                color: #64748b;
                background: rgba(255, 255, 255, 0.06);
                padding: 3px 8px;
                border-radius: 4px;
                cursor: pointer;
            }
            #mojo-nav-results {
                flex: 1;
                overflow-y: auto;
                padding: 8px;
            }
            #mojo-nav-results::-webkit-scrollbar { width: 6px; }
            #mojo-nav-results::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
            .mojo-nav-category {
                font-size: 0.65rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 1.5px;
                color: #64748b;
                padding: 8px 12px 4px;
            }
            .mojo-nav-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 10px 12px;
                border-radius: 10px;
                cursor: pointer;
                text-decoration: none;
                color: #e2e8f0;
                transition: background 0.1s;
            }
            .mojo-nav-item:hover, .mojo-nav-item.active {
                background: rgba(255, 215, 0, 0.08);
            }
            .mojo-nav-item.active {
                outline: 1px solid rgba(255, 215, 0, 0.2);
            }
            .mojo-nav-item-icon {
                font-size: 1.3rem;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                flex-shrink: 0;
            }
            .mojo-nav-item-info { flex: 1; min-width: 0; }
            .mojo-nav-item-name {
                font-size: 0.9rem;
                font-weight: 500;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .mojo-nav-item-meta {
                font-size: 0.7rem;
                color: #64748b;
                margin-top: 1px;
            }
            .mojo-nav-item-badge {
                font-size: 0.6rem;
                font-weight: 600;
                padding: 2px 8px;
                border-radius: 12px;
                flex-shrink: 0;
            }
            .mojo-nav-item-badge.current {
                background: rgba(52, 211, 153, 0.15);
                color: #34d399;
            }
            .mojo-nav-item-badge.recent {
                background: rgba(96, 165, 250, 0.15);
                color: #60a5fa;
            }
            #mojo-nav-footer {
                display: flex;
                gap: 16px;
                padding: 10px 20px;
                border-top: 1px solid rgba(255, 255, 255, 0.06);
                font-size: 0.7rem;
                color: #4b5563;
            }
            #mojo-nav-trigger {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 48px;
                height: 48px;
                border-radius: 14px;
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                border: 1px solid rgba(255, 215, 0, 0.2);
                color: #ffd700;
                font-size: 0.7rem;
                font-weight: 700;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 99998;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                transition: all 0.2s;
            }
            #mojo-nav-trigger:hover {
                transform: scale(1.08);
                border-color: rgba(255, 215, 0, 0.4);
                box-shadow: 0 6px 30px rgba(255, 215, 0, 0.15);
            }
            .mojo-nav-empty {
                padding: 40px 20px;
                text-align: center;
                color: #4b5563;
                font-size: 0.9rem;
            }
            @media (max-width: 600px) {
                #mojo-nav-modal { border-radius: 12px; }
                #mojo-nav-trigger { bottom: 16px; right: 16px; width: 44px; height: 44px; }
            }
        `;
        document.head.appendChild(style);
    }

    // Render results
    function renderResults(query) {
        const results = document.getElementById('mojo-nav-results');
        if (!results) return;

        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const recents = getRecents();

        let items;
        if (!query) {
            // Show recents first, then all by category
            const recentDashboards = recents
                .map(url => DASHBOARDS.find(d => d.url === url))
                .filter(Boolean);
            
            items = DASHBOARDS.map(d => ({
                ...d,
                isRecent: recents.includes(d.url),
                isCurrent: d.url === currentPage || (currentPage === 'index.html' && d.url === 'hub.html')
            }));

            // Group by category
            const categories = {};
            if (recentDashboards.length > 0) {
                categories['Recent'] = recentDashboards.map(d => ({
                    ...d, isRecent: true,
                    isCurrent: d.url === currentPage || (currentPage === 'index.html' && d.url === 'hub.html')
                }));
            }
            for (const item of items) {
                if (!categories[item.category]) categories[item.category] = [];
                categories[item.category].push(item);
            }

            let html = '';
            for (const [cat, catItems] of Object.entries(categories)) {
                html += `<div class="mojo-nav-category">${cat}</div>`;
                for (const item of catItems) {
                    html += renderItem(item);
                }
            }
            results.innerHTML = html;
        } else {
            // Filter by search
            items = DASHBOARDS
                .map(d => ({ ...d, score: fuzzyMatch(query, d), isCurrent: d.url === currentPage }))
                .filter(d => d.score > 0)
                .sort((a, b) => b.score - a.score);

            if (items.length === 0) {
                results.innerHTML = '<div class="mojo-nav-empty">No dashboards found</div>';
            } else {
                results.innerHTML = items.map(renderItem).join('');
            }
        }

        // Set first item active
        const firstItem = results.querySelector('.mojo-nav-item');
        if (firstItem) firstItem.classList.add('active');
    }

    function renderItem(item) {
        let badge = '';
        if (item.isCurrent) badge = '<span class="mojo-nav-item-badge current">Current</span>';
        else if (item.isRecent) badge = '<span class="mojo-nav-item-badge recent">Recent</span>';

        return `
            <a href="${item.url}" class="mojo-nav-item" data-url="${item.url}">
                <div class="mojo-nav-item-icon">${item.icon}</div>
                <div class="mojo-nav-item-info">
                    <div class="mojo-nav-item-name">${item.name}</div>
                    <div class="mojo-nav-item-meta">${item.category}</div>
                </div>
                ${badge}
            </a>
        `;
    }

    // Navigation
    let isOpen = false;

    function openNav() {
        const overlay = document.getElementById('mojo-nav-overlay');
        const input = document.getElementById('mojo-nav-input');
        if (!overlay) return;
        overlay.classList.add('open');
        input.value = '';
        renderResults('');
        setTimeout(() => input.focus(), 50);
        isOpen = true;
    }

    function closeNav() {
        const overlay = document.getElementById('mojo-nav-overlay');
        if (!overlay) return;
        overlay.classList.remove('open');
        isOpen = false;
    }

    function navigateToActive() {
        const active = document.querySelector('.mojo-nav-item.active');
        if (!active) return;
        const url = active.getAttribute('data-url');
        addRecent(url);
        window.location.href = url;
    }

    function moveActive(direction) {
        const items = Array.from(document.querySelectorAll('.mojo-nav-item'));
        const idx = items.findIndex(i => i.classList.contains('active'));
        if (idx < 0) return;

        items[idx].classList.remove('active');
        let next = idx + direction;
        if (next < 0) next = items.length - 1;
        if (next >= items.length) next = 0;
        items[next].classList.add('active');
        items[next].scrollIntoView({ block: 'nearest' });
    }

    // Init
    function init() {
        injectStyles();
        const { overlay, trigger } = createNavigator();

        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                isOpen ? closeNav() : openNav();
            }
            if (isOpen) {
                if (e.key === 'Escape') { e.preventDefault(); closeNav(); }
                if (e.key === 'ArrowDown') { e.preventDefault(); moveActive(1); }
                if (e.key === 'ArrowUp') { e.preventDefault(); moveActive(-1); }
                if (e.key === 'Enter') { e.preventDefault(); navigateToActive(); }
            }
        });

        // Click handlers
        trigger.addEventListener('click', openNav);
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) closeNav();
        });
        document.getElementById('mojo-nav-esc').addEventListener('click', closeNav);

        // Search input
        document.getElementById('mojo-nav-input').addEventListener('input', function(e) {
            renderResults(e.target.value.trim());
        });

        // Click on items
        document.getElementById('mojo-nav-results').addEventListener('click', function(e) {
            const item = e.target.closest('.mojo-nav-item');
            if (item) {
                e.preventDefault();
                const url = item.getAttribute('data-url');
                addRecent(url);
                window.location.href = url;
            }
        });

        // Hover activates
        document.getElementById('mojo-nav-results').addEventListener('mouseover', function(e) {
            const item = e.target.closest('.mojo-nav-item');
            if (item) {
                document.querySelectorAll('.mojo-nav-item.active').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            }
        });

        // Track current page as recent
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage && currentPage !== 'index.html') {
            addRecent(currentPage);
        }
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
