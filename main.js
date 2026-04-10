// MaainHome CCC Console - Logic for Pending and Approved Registrations

function formatTime(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleTimeString();
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

async function renderPendingTable() {
    const pendingBody = document.getElementById('pending-body');
    
    try {
        const [pending, approved] = await Promise.all([
            fetchJson('/api/pending'),
            fetchJson('/api/approved')
        ]);

        updateStats(pending || [], approved || []);

        if (!pending || pending.length === 0) {
            pendingBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-dim);">No pending requests</td></tr>`;
        } else {
            pendingBody.innerHTML = pending.map(k => `
                <tr>
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
            <td style="font-family: monospace; font-size: 0.85rem;">${escapeHtml(k.uuid)}</td>
            <td><span class="status-badge approved">${escapeHtml(k.status)}</span></td>
            <td>${formatTime(k.approvedAt)}</td>
            <td>${escapeHtml(k.approvalMode || '-')}</td>
            <td>
                <button class="btn-icon" onclick="disableKiosk('${escapeHtml(k.uuid)}')">Disable</button>
                <button class="btn-icon" style="color: var(--red); margin-left: 10px;" onclick="removeKiosk('${escapeHtml(k.uuid)}', 'approved')">Remove</button>
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
        const result = await fetchJson('/api/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uuid, pin: enteredPin.trim() })
        });

        if (result.success) {
            alert(`✅ Station approved!\nSecure Key: ${result.secure_key}\n\nThe kiosk will now automatically launch the MaainHome app.`);
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
    document.getElementById('stat-total').innerText = '-';
    document.getElementById('stat-approved').innerText = '-';
    
    renderPendingTable();
    setInterval(renderPendingTable, 10000);
});
