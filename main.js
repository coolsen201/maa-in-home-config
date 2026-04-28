// MaainHome CCC Console - Logic for Pending and Approved Registrations

function formatTime(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString();
}

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

async function fetchJson(url, options) {
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Request failed');
    }
    return data;
}

function updateStats(pending, approved) {
    document.getElementById('stat-pending').innerText = pending.length;
    document.getElementById('stat-approved').innerText = approved.length;
    document.getElementById('stat-total').innerText = pending.length + approved.length;
    document.getElementById('active-count').innerText = approved.length;
}

function setView(view) {
    document.querySelectorAll('nav a[data-view]').forEach((link) => {
        link.classList.toggle('active', link.dataset.view === view);
    });
    document.querySelectorAll('.view-section').forEach((section) => {
        section.classList.toggle('active', section.id === `view-${view}`);
    });
}

function maskKey(key) {
    if (!key) return '-';
    if (key.length <= 12) return key;
    return `${key.slice(0, 8)}...${key.slice(-4)}`;
}

function getSelectedApprovalDays() {
    const select = document.getElementById('approval-duration');
    const selected = Number.parseInt(select?.value || '30', 10);
    return Number.isNaN(selected) ? 30 : selected;
}

function saveApprovalDuration(days) {
    localStorage.setItem('ccc_approval_duration_days', String(days));
}

function restoreApprovalDuration(defaultDays) {
    const select = document.getElementById('approval-duration');
    const stored = localStorage.getItem('ccc_approval_duration_days');
    const value = stored || String(defaultDays || 30);
    if (select) {
        select.value = value;
    }
}

function updateHealthView(health) {
    document.getElementById('health-ok').innerText = health.ok ? 'Healthy' : 'Issue';
    document.getElementById('health-db').innerText = health.db || '-';
    document.getElementById('health-latency').innerText = health.latency != null ? `${health.latency} ms` : '-';
    document.getElementById('health-approval-mode').innerText = health.approval_mode || '-';
    document.getElementById('settings-approval-mode').innerText = health.approval_mode || '-';
    restoreApprovalDuration(health.default_approval_days || 30);
}

function updateAnalyticsView(pending, approved, disabled) {
    document.getElementById('analytics-total').innerText = pending.length + approved.length + disabled;
    document.getElementById('analytics-approved').innerText = approved.length;
    document.getElementById('analytics-pending').innerText = pending.length;
    document.getElementById('analytics-disabled').innerText = disabled;
}

function updateKeysView(approved) {
    const keysBody = document.getElementById('keys-body');
    if (!approved || approved.length === 0) {
        keysBody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:var(--text-dim);">No approved keys</td></tr>`;
        return;
    }

    keysBody.innerHTML = approved.map((k) => `
        <tr>
            <td style="font-family: monospace; font-weight: bold; color: var(--gold);">${escapeHtml(k.home_number || 'N/A')}</td>
            <td style="font-family: monospace; font-size: 0.85rem;">${escapeHtml(k.uuid)}</td>
            <td style="font-family: monospace;">${escapeHtml(maskKey(k.secure_key))}</td>
            <td>${formatTime(k.approvedAt)}</td>
        </tr>
    `).join('');
}

async function renderPendingTable() {
    const pendingBody = document.getElementById('pending-body');
    
    try {
        const [pending, approved, disabled, health] = await Promise.all([
            fetchJson('/api/pending'),
            fetchJson('/api/approved'),
            fetchJson('/api/disabled'),
            fetchJson('/api/health')
        ]);

        updateStats(pending || [], approved || []);
        updateHealthView(health || {});
        updateAnalyticsView(pending || [], approved || [], (disabled || []).length);
        updateKeysView(approved || []);

        if (!pending || pending.length === 0) {
            pendingBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-dim);">No pending requests</td></tr>`;
        } else {
            pendingBody.innerHTML = pending.map(k => `
                <tr>
                    <td style="font-family: monospace; font-weight: bold; color: var(--gold);">${escapeHtml(k.home_number || 'N/A')}</td>
                    <td style="font-family: monospace; font-size: 0.85rem;">${escapeHtml(k.uuid)}</td>
                    <td>
                      <span class="pin-display">${escapeHtml(k.pin)}</span>
                    </td>
                    <td>${formatTime(k.lastSeen)}</td>
                    <td>
                        <button class="btn-primary btn-sm" onclick="approveKiosk('${escapeHtml(k.uuid)}', '${escapeHtml(k.pin)}')">Approve</button>
                        <button class="btn-icon" style="color: var(--red); margin-left: 10px;" onclick="removeKiosk('${escapeHtml(k.uuid)}', 'pending')">Remove</button>
                    </td>
                </tr>
            `).join('');
        }

        renderApprovedTable(approved || []);
        renderDisabledTable(disabled || []);
    } catch (e) {
        console.error('Error loading pending registrations:', e);
        pendingBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--red);">Error loading registrations</td></tr>`;
        document.getElementById('approved-body').innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--red);">Error loading approved devices</td></tr>`;
    }
}

function renderApprovedTable(approved) {
    const approvedBody = document.getElementById('approved-body');

    if (!approved || approved.length === 0) {
        approvedBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-dim);">No approved devices</td></tr>`;
        return;
    }

    approvedBody.innerHTML = approved.map(k => `
        <tr>
            <td style="font-family: monospace; font-weight: bold; color: var(--green);">${escapeHtml(k.home_number || 'N/A')}</td>
            <td style="font-family: monospace; font-size: 0.85rem;">${escapeHtml(k.uuid)}</td>
            <td style="font-size: 0.85rem;">${escapeHtml(k.user_id || 'Unclaimed')}</td>
            <td><span class="status-badge approved">${escapeHtml(k.status)}</span></td>
            <td>${formatTime(k.expiresAt)}</td>
            <td>${escapeHtml(k.approvalMode || '-')}</td>
            <td>
                <button class="btn-icon" onclick="disableKiosk('${escapeHtml(k.uuid)}')">Disable</button>
                <button class="btn-icon" style="color: var(--red); margin-left: 10px;" onclick="removeKiosk('${escapeHtml(k.uuid)}', 'approved')">Remove</button>
            </td>
        </tr>
    `).join('');
}

function renderDisabledTable(disabled) {
    const disabledBody = document.getElementById('disabled-body');

    if (!disabled || disabled.length === 0) {
        disabledBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-dim);">No disabled devices</td></tr>`;
        return;
    }

    disabledBody.innerHTML = disabled.map((k) => `
        <tr>
            <td style="font-family: monospace; font-weight: bold; color: var(--red);">${escapeHtml(k.home_number || 'N/A')}</td>
            <td style="font-family: monospace; font-size: 0.85rem;">${escapeHtml(k.uuid)}</td>
            <td><span class="status-badge disabled">${escapeHtml(k.disabledReason || 'disabled')}</span></td>
            <td>${formatTime(k.disabledAt)}</td>
            <td>
                <button class="btn-icon" style="color: var(--red);" onclick="removeKiosk('${escapeHtml(k.uuid)}', 'disabled')">Remove</button>
            </td>
        </tr>
    `).join('');
}

async function approveKiosk(uuid, expectedPin) {
    const enteredPin = prompt(
        `🔐 Enter the 6-digit code shown on the kiosk screen to approve station:\n\n${uuid}`
    );

    if (!enteredPin) return;

    if (enteredPin.trim() !== expectedPin.trim()) {
        alert('❌ Incorrect PIN. Please check the code on the kiosk screen and try again.');
        return;
    }

    try {
        const durationDays = getSelectedApprovalDays();
        const result = await fetchJson('/api/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uuid, pin: enteredPin.trim(), duration_days: durationDays })
        });

        if (result.success) {
            alert(`✅ Station approved for ${result.duration_days} day(s)!\nSecure Key: ${result.secure_key}\nExpires: ${result.expires_at}\n\nThe kiosk will now automatically launch the MaainHome app.`);
            renderPendingTable();
        } else {
            alert('❌ Approval failed: ' + (result.error || 'Unknown error'));
        }
    } catch (e) {
        alert('Error approving station: ' + e.message);
    }
}

async function disableKiosk(uuid) {
    if (!confirm(`Disable station ${uuid}?`)) return;

    try {
        const result = await fetchJson('/api/disable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uuid })
        });

        if (result.success) {
            alert(`Station ${uuid} disabled.`);
            renderPendingTable();
        }
    } catch (e) {
        alert('Error disabling station: ' + e.message);
    }
}

async function removeKiosk(uuid, source) {
    if (!confirm(`Remove station ${uuid} from ${source} records?`)) return;

    try {
        const result = await fetchJson('/api/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uuid })
        });

        if (result.success) {
            alert(`Station ${uuid} removed.`);
            renderPendingTable();
        }
    } catch (e) {
        alert('Error removing station: ' + e.message);
    }
}


// renderTable() removed as it depended on broken Cloudflare Tunnels API

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('nav a[data-view]').forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            setView(link.dataset.view);
        });
    });

    document.getElementById('stat-total').innerText = '-';
    document.getElementById('stat-approved').innerText = '-';
    document.getElementById('approval-duration').addEventListener('change', (event) => {
        saveApprovalDuration(event.target.value);
    });
    document.getElementById('add-kiosk').addEventListener('click', () => {
        alert('Stations appear here automatically after first boot and Wi-Fi connection.');
    });
    
    setView('overview');
    renderPendingTable();
    setInterval(renderPendingTable, 10000);
});
