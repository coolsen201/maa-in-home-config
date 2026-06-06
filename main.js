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

    approvedBody.innerHTML = approved.map(k => {
        const hasUser = k.user_id && k.user_id.trim() !== '';
        return `
            <tr>
                <td style="font-family: monospace; font-weight: bold; color: var(--green);">
                    ${escapeHtml(k.home_number || 'N/A')}
                    <button class="btn-tiny" title="Change Home Number" onclick="updateKioskField('${escapeHtml(k.uuid)}', 'home_number', '${escapeHtml(k.home_number)}')">✎</button>
                </td>
                <td style="font-family: monospace; font-size: 0.85rem;">${escapeHtml(k.uuid)}</td>
                <td style="font-size: 0.85rem;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span>${escapeHtml(k.user_id || 'Unclaimed')}</span>
                        ${hasUser
                ? `<button class="btn-tiny" style="color: var(--red);" onclick="updateKioskField('${escapeHtml(k.uuid)}', 'user_id', '')">unlink</button>
                               <button class="btn-tiny" onclick="updateKioskField('${escapeHtml(k.uuid)}', 'user_id', '${escapeHtml(k.user_id)}')">edit</button>`
                : `<button class="btn-tiny" onclick="updateKioskField('${escapeHtml(k.uuid)}', 'user_id', '')">link</button>`
            }
                    </div>
                </td>
                <td><span class="status-badge approved">${escapeHtml(k.status)}</span></td>
                <td>${formatTime(k.expiresAt)}</td>
                <td>${escapeHtml(k.approvalMode || '-')}</td>
                <td>
                    <button class="btn-icon" onclick="disableKiosk('${escapeHtml(k.uuid)}')">Disable</button>
                    <button class="btn-icon" style="color: var(--red); margin-left: 10px;" onclick="removeKiosk('${escapeHtml(k.uuid)}', 'approved')">Remove</button>
                </td>
            </tr>
        `;
    }).join('');
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

async function updateKioskField(uuid, field, currentValue) {
    const fieldName = field === 'home_number' ? 'Home Number' : 'User ID';
    const newValue = prompt(`Enter new ${fieldName} for station ${uuid}:`, currentValue || '');

    if (newValue === null) return; // Cancelled

    try {
        const payload = { uuid };
        payload[field] = newValue.trim();

        const result = await fetchJson('/api/update-kiosk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (result.success) {
            alert(`✅ ${fieldName} updated successfully.`);
            renderPendingTable(); // Refresh table
        }
    } catch (e) {
        alert(`Error updating ${fieldName}: ` + e.message);
    }
}


// renderTable() removed as it depended on broken Cloudflare Tunnels API

// ── Quick Approve Modal ──────────────────────────────────────────────────────
function openQuickApprove() {
    const modal = document.getElementById('quick-approve-modal');
    modal.style.display = 'flex';
    document.getElementById('qa-uuid').value = '';
    document.getElementById('qa-pin').value = '';
    document.getElementById('qa-error').style.display = 'none';
    setTimeout(() => document.getElementById('qa-uuid').focus(), 100);
}

function closeQuickApprove() {
    document.getElementById('quick-approve-modal').style.display = 'none';
}

async function submitQuickApprove() {
    const uuid = document.getElementById('qa-uuid').value.trim().toUpperCase();
    const errEl = document.getElementById('qa-error');
    const btn   = document.getElementById('qa-submit');

    errEl.style.display = 'none';

    if (!uuid) {
        errEl.textContent = 'Device ID is required.';
        errEl.style.display = 'block';
        return;
    }

    btn.textContent = 'Approving…';
    btn.disabled = true;

    try {
        const durationDays = getSelectedApprovalDays();
        const result = await fetchJson('/api/force-approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uuid, duration_days: durationDays })
        });

        if (result.success) {
            closeQuickApprove();
            let msg;
            if (result.already_approved) {
                msg = `✅ Station was already approved!\nHome No: ${result.home_number}\nExpires: ${result.expires_at}`;
            } else if (result.reregistered) {
                msg = `✅ Device re-registered and approved for ${result.duration_days} day(s)!\nHome No: ${result.home_number}\nExpires: ${result.expires_at}\n\nThe kiosk will now automatically launch the MaainHome app.`;
            } else {
                msg = `✅ Station approved for ${result.duration_days} day(s)!\nHome No: ${result.home_number}\nExpires: ${result.expires_at}\n\nThe kiosk will now automatically launch the MaainHome app.`;
            }
            alert(msg);
            renderPendingTable();
        } else {
            errEl.textContent = '❌ ' + (result.error || 'Approval failed');
            errEl.style.display = 'block';
        }
    } catch (e) {
        errEl.textContent = '❌ ' + e.message;
        errEl.style.display = 'block';
    } finally {
        btn.textContent = '✅ Approve Now';
        btn.disabled = false;
    }
}
// ────────────────────────────────────────────────────────────────────────────


// ── UUID Validation (#15) ────────────────────────────────────────────────────
const UUID_REGEX = /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/;

function validateUUID(uuid) {
    return UUID_REGEX.test(uuid);
}

// ── Devices View (#10) ───────────────────────────────────────────────────────
async function renderDevicesView() {
    const body = document.getElementById('devices-body');
    try {
        const [pending, approved, disabled] = await Promise.all([
            fetchJson('/api/pending'),
            fetchJson('/api/approved'),
            fetchJson('/api/disabled'),
        ]);
        const all = [...(pending || []), ...(approved || []), ...(disabled || [])];
        if (all.length === 0) {
            body.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--text-dim);">No devices found</td></tr>`;
            return;
        }
        body.innerHTML = all.map(k => {
            const expired = k.expiresAt && new Date(k.expiresAt) < new Date();
            return `<tr>
                <td><input type="checkbox" class="bulk-chk" value="${escapeHtml(k.uuid)}" onchange="updateBulkToolbar()"></td>
                <td style="font-family:monospace;font-weight:bold;color:var(--gold);">${escapeHtml(k.home_number||'N/A')}</td>
                <td style="font-family:monospace;font-size:0.78rem;cursor:pointer;color:#88aaff;text-decoration:underline;" onclick='showDeviceDetail(${JSON.stringify(k)})'>${escapeHtml(k.uuid)}</td>
                <td><span class="status-badge ${k.status}">${escapeHtml(k.status)}</span>${expired ? ' <span style="color:#ff6b6b;font-size:0.7rem;">EXPIRED</span>' : ''}</td>
                <td style="font-size:0.82rem;">${escapeHtml(k.user_id||'—')}</td>
                <td style="font-size:0.82rem;${expired?'color:#ff6b6b;':''}">${formatTime(k.expiresAt)}</td>
                <td style="font-size:0.8rem;">${escapeHtml(k.approvalMode||'—')}</td>
                <td style="font-size:0.8rem;">${formatTime(k.lastSeen)}</td>
                <td>
                    <button class="btn-tiny" onclick="openExtendModal('${escapeHtml(k.uuid)}')">+Days</button>
                    <button class="btn-tiny" onclick="transferDevice('${escapeHtml(k.uuid)}','${escapeHtml(k.user_id||'')}')">Transfer</button>
                    <button class="btn-tiny" onclick="reprovisionKiosk('${escapeHtml(k.uuid)}')" style="color:var(--gold);">WiFi Reset</button>
                    <button class="btn-tiny" onclick="openRemoveChecklist('${escapeHtml(k.uuid)}')" style="color:var(--red);">Remove</button>
                </td>
            </tr>`;
        }).join('');
    } catch(e) {
        body.innerHTML = `<tr><td colspan="9" style="text-align:center;color:var(--red);">Error: ${escapeHtml(e.message)}</td></tr>`;
    }
}


// ── Transfer Device (#11) ────────────────────────────────────────────────────
async function transferDevice(uuid, currentUserId) {
    const newUserId = prompt(`Transfer device ${uuid}\nCurrent user: ${currentUserId||'none'}\n\nEnter new User ID:`, '');
    if (newUserId === null) return;
    if (!newUserId.trim()) { alert('User ID cannot be empty.'); return; }
    try {
        const result = await fetchJson('/api/transfer-device', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uuid, new_user_id: newUserId.trim() })
        });
        if (result.success) {
            alert(`✅ Device transferred!\nFrom: ${result.old_user_id||'none'}\nTo: ${result.new_user_id}`);
            renderDevicesView();
        } else {
            alert('❌ Transfer failed: ' + (result.error || 'Unknown error'));
        }
    } catch(e) {
        alert('Error: ' + e.message);
    }
}

// ── WiFi Reprovision (#14) ───────────────────────────────────────────────────
async function reprovisionKiosk(uuid) {
    if (!confirm(`Reset kiosk ${uuid} for WiFi re-provisioning?\n\nThis will set it back to "pending" — it will need re-approval on next boot.`)) return;
    try {
        const result = await fetchJson('/api/reprovision', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uuid })
        });
        if (result.success) {
            alert(`✅ Kiosk reset to pending.\n${result.message}`);
            renderDevicesView();
            renderPendingTable();
        } else {
            alert('❌ Reprovision failed: ' + (result.error || 'Unknown'));
        }
    } catch(e) {
        alert('Error: ' + e.message);
    }
}

// ── Expiry Auto-Disable (#13) ────────────────────────────────────────────────
async function runExpireCheck() {
    const btn = document.getElementById('expire-check-btn');
    if (btn) { btn.textContent = 'Checking…'; btn.disabled = true; }
    try {
        const result = await fetchJson('/api/expire-check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
        const disabled = result.expired_disabled || [];
        if (disabled.length > 0) {
            alert(`⏱ Expiry check done.\n${disabled.length} device(s) auto-disabled:\n${disabled.join('\n')}`);
        } else {
            alert(`✅ Expiry check done. No expired devices found (${result.checked} checked).`);
        }
        renderDevicesView();
        renderPendingTable();
    } catch(e) {
        alert('Error running expiry check: ' + e.message);
    } finally {
        if (btn) { btn.textContent = '⏱ Check Expirations'; btn.disabled = false; }
    }
}

// ── Admin Users Panel (#12) ──────────────────────────────────────────────────
async function renderUsersView() {
    const body = document.getElementById('users-body');
    try {
        const users = await fetchJson('/api/users');
        if (!users || users.length === 0) {
            body.innerHTML = `<tr><td colspan="9" style="text-align:center;color:var(--text-dim);">No users found</td></tr>`;
            return;
        }
        body.innerHTML = users.map(u => `<tr>
            <td style="font-family:monospace;font-size:0.78rem;">${escapeHtml(u.user_id)}</td>
            <td>${escapeHtml(u.name||'—')}</td>
            <td style="font-size:0.82rem;">${escapeHtml(u.email||'—')}</td>
            <td style="color:var(--green);font-weight:bold;">₹${escapeHtml(u.balance||'0')}</td>
            <td>₹${escapeHtml(u.credited||'0')}</td>
            <td style="font-size:0.82rem;">${escapeHtml(u.received_from||'—')}</td>
            <td style="font-size:0.82rem;${u.expiry_date && new Date(u.expiry_date)<new Date()?'color:#ff6b6b;':''}">${escapeHtml(u.expiry_date||'—')}</td>
            <td style="font-size:0.78rem;color:var(--text-dim);">${formatTime(u.updated_at)}</td>
            <td><button class="btn-tiny" onclick="openEditUser(${JSON.stringify(u).split('"').join('&quot;')})">Edit</button></td>
        </tr>`).join('');
    } catch(e) {
        body.innerHTML = `<tr><td colspan="9" style="text-align:center;color:var(--red);">Error: ${escapeHtml(e.message)}</td></tr>`;
    }
}

function openAddUser() {
    ['au-userid','au-name','au-email','au-balance','au-credited','au-from','au-expiry'].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = '';
    });
    document.getElementById('au-error').style.display = 'none';
    document.getElementById('add-user-modal').style.display = 'flex';
    setTimeout(() => document.getElementById('au-userid').focus(), 100);
}

function openEditUser(u) {
    document.getElementById('au-userid').value = u.user_id || '';
    document.getElementById('au-name').value = u.name || '';
    document.getElementById('au-email').value = u.email || '';
    document.getElementById('au-balance').value = u.balance || '';
    document.getElementById('au-credited').value = u.credited || '';
    document.getElementById('au-from').value = u.received_from || '';
    document.getElementById('au-expiry').value = u.expiry_date || '';
    document.getElementById('au-error').style.display = 'none';
    document.getElementById('add-user-modal').style.display = 'flex';
}

function closeAddUser() {
    document.getElementById('add-user-modal').style.display = 'none';
}

async function submitAddUser() {
    const userId = document.getElementById('au-userid').value.trim();
    const errEl = document.getElementById('au-error');
    const btn = document.getElementById('au-submit');
    if (!userId) { errEl.textContent = 'User ID is required.'; errEl.style.display = 'block'; return; }
    errEl.style.display = 'none';
    btn.textContent = 'Saving…'; btn.disabled = true;
    try {
        const result = await fetchJson('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userId,
                name: document.getElementById('au-name').value.trim(),
                email: document.getElementById('au-email').value.trim(),
                balance: document.getElementById('au-balance').value.trim(),
                credited: document.getElementById('au-credited').value.trim(),
                received_from: document.getElementById('au-from').value.trim(),
                expiry_date: document.getElementById('au-expiry').value,
            })
        });
        if (result.success) {
            closeAddUser();
            renderUsersView();
        } else {
            errEl.textContent = result.error || 'Save failed.'; errEl.style.display = 'block';
        }
    } catch(e) {
        errEl.textContent = e.message; errEl.style.display = 'block';
    } finally {
        btn.textContent = '💾 Save User'; btn.disabled = false;
    }
}

// ── Remove Checklist Safeguard (#15) ─────────────────────────────────────────
let _removeUUID = null;

function openRemoveChecklist(uuid) {
    if (!validateUUID(uuid)) {
        alert(`❌ UUID format invalid: ${uuid}\nExpected: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`);
        return;
    }
    _removeUUID = uuid;
    document.getElementById('rm-uuid-label').textContent = 'UUID: ' + uuid;
    ['rm-chk1','rm-chk2','rm-chk3'].forEach(id => { document.getElementById(id).checked = false; });
    const btn = document.getElementById('rm-confirm-btn');
    btn.disabled = true; btn.style.opacity = '0.4';
    document.getElementById('remove-checklist-modal').style.display = 'flex';
}

function checkRemoveReady() {
    const all = ['rm-chk1','rm-chk2','rm-chk3'].every(id => document.getElementById(id).checked);
    const btn = document.getElementById('rm-confirm-btn');
    btn.disabled = !all; btn.style.opacity = all ? '1' : '0.4';
}

function closeRemoveChecklist() {
    document.getElementById('remove-checklist-modal').style.display = 'none';
    _removeUUID = null;
}

async function confirmRemove() {
    if (!_removeUUID) return;
    const uuid = _removeUUID;
    closeRemoveChecklist();
    try {
        const result = await fetchJson('/api/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uuid })
        });
        if (result.success) {
            alert(`✅ Device ${uuid} removed.`);
            renderDevicesView();
            renderPendingTable();
        } else {
            alert('❌ Remove failed: ' + (result.error || 'Unknown'));
        }
    } catch(e) {
        alert('Error: ' + e.message);
    }
}

// ── DOMContentLoaded ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('nav a[data-view]').forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const view = link.dataset.view;
            setView(view);
            if (view === 'devices') renderDevicesView();
            if (view === 'users') renderUsersView();
            if (view === 'auditlog') renderAuditLog();
        });
    });

    document.getElementById('stat-total').innerText = '-';
    document.getElementById('stat-approved').innerText = '-';
    document.getElementById('approval-duration').addEventListener('change', (event) => {
        saveApprovalDuration(event.target.value);
    });

    setView('overview');
    renderPendingTable();
    setInterval(renderPendingTable, 10000);

    // Auto expiry check on load (#13)
    fetchJson('/api/expire-check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
        .then(r => { if (r.expired_disabled?.length) console.log('[CCC] Auto-disabled expired:', r.expired_disabled); })
        .catch(() => {});
});

// ── Extend Expiry (#9) ───────────────────────────────────────────────────────
let _extendUUID = null;

function openExtendModal(uuid) {
    _extendUUID = uuid;
    document.getElementById('extend-uuid-label').textContent = uuid;
    document.getElementById('extend-days').value = '30';
    document.getElementById('extend-error').style.display = 'none';
    document.getElementById('extend-modal').style.display = 'flex';
    setTimeout(() => document.getElementById('extend-days').focus(), 100);
}

function closeExtendModal() {
    document.getElementById('extend-modal').style.display = 'none';
    _extendUUID = null;
}

async function submitExtend() {
    const days = parseInt(document.getElementById('extend-days').value);
    const errEl = document.getElementById('extend-error');
    const btn = document.getElementById('extend-submit');
    if (!_extendUUID || isNaN(days) || days <= 0) {
        errEl.textContent = 'Enter a valid number of days.'; errEl.style.display = 'block'; return;
    }
    errEl.style.display = 'none';
    btn.textContent = 'Extending…'; btn.disabled = true;
    try {
        const result = await fetchJson('/api/extend-device', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uuid: _extendUUID, days })
        });
        if (result.success) {
            closeExtendModal();
            alert(`✅ Expiry extended +${days} days\nNew expiry: ${result.new_expiry}`);
            renderDevicesView();
        } else {
            errEl.textContent = result.error || 'Failed.'; errEl.style.display = 'block';
        }
    } catch(e) {
        errEl.textContent = e.message; errEl.style.display = 'block';
    } finally {
        btn.textContent = '✅ Extend'; btn.disabled = false;
    }
}

// ── Device Detail Modal (#8) ──────────────────────────────────────────────────
function showDeviceDetail(k) {
    const fields = [
        ['UUID', k.uuid], ['Home Number', k.home_number], ['Status', k.status],
        ['User ID', k.user_id], ['Expires At', k.expiresAt], ['Approval Mode', k.approvalMode],
        ['PIN', k.pin], ['Secure Key', k.secure_key], ['Last Seen', k.lastSeen],
        ['Created At', k.createdAt], ['Source IP', k.sourceIP],
    ];
    const html = `<table style="width:100%;border-collapse:collapse;">${fields.map(([label, val]) =>
        `<tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
            <td style="padding:8px 12px;color:rgba(255,255,255,0.4);font-size:0.78rem;width:40%;">${escapeHtml(label)}</td>
            <td style="padding:8px 12px;font-family:monospace;font-size:0.82rem;word-break:break-all;">${escapeHtml(val||'—')}</td>
        </tr>`
    ).join('')}</table>`;
    document.getElementById('device-detail-body').innerHTML = html;
    document.getElementById('device-detail-modal').style.display = 'flex';
}

function closeDeviceDetail() {
    document.getElementById('device-detail-modal').style.display = 'none';
}

// ── Bulk Actions (#10) ────────────────────────────────────────────────────────
function getSelectedUUIDs() {
    return [...document.querySelectorAll('.bulk-chk:checked')].map(c => c.value);
}

function updateBulkToolbar() {
    const selected = getSelectedUUIDs();
    const toolbar = document.getElementById('bulk-toolbar');
    const count = document.getElementById('bulk-count');
    if (selected.length > 0) {
        toolbar.classList.add('visible');
        count.textContent = `${selected.length} selected`;
    } else {
        toolbar.classList.remove('visible');
    }
}

function toggleSelectAll(chk) {
    document.querySelectorAll('.bulk-chk').forEach(c => { c.checked = chk.checked; });
    updateBulkToolbar();
}

function clearBulkSelection() {
    document.querySelectorAll('.bulk-chk').forEach(c => { c.checked = false; });
    const sa = document.getElementById('bulk-select-all'); if (sa) sa.checked = false;
    updateBulkToolbar();
}

async function bulkExtend() {
    const uuids = getSelectedUUIDs();
    if (!uuids.length) return;
    const days = parseInt(prompt(`Extend ${uuids.length} device(s) by how many days?`, '30'));
    if (isNaN(days) || days <= 0) return;
    let ok = 0, fail = 0;
    for (const uuid of uuids) {
        try {
            const r = await fetchJson('/api/extend-device', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({uuid, days}) });
            if (r.success) ok++; else fail++;
        } catch { fail++; }
    }
    clearBulkSelection();
    alert(`✅ Bulk extend done: ${ok} extended, ${fail} failed.`);
    renderDevicesView();
}

async function bulkDisable() {
    const uuids = getSelectedUUIDs();
    if (!uuids.length) return;
    if (!confirm(`Disable ${uuids.length} device(s)?`)) return;
    let ok = 0, fail = 0;
    for (const uuid of uuids) {
        try {
            const r = await fetchJson('/api/disable', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({uuid, reason:'bulk_disable'}) });
            if (r.success) ok++; else fail++;
        } catch { fail++; }
    }
    clearBulkSelection();
    alert(`🚫 Bulk disable done: ${ok} disabled, ${fail} failed.`);
    renderDevicesView();
    renderPendingTable();
}

// ── Audit Log (#7) ────────────────────────────────────────────────────────────
async function renderAuditLog() {
    const body = document.getElementById('audit-body');
    try {
        const entries = await fetchJson('/api/audit-log');
        if (!entries || entries.length === 0) {
            body.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-dim);">No audit entries yet</td></tr>`;
            return;
        }
        body.innerHTML = entries.map(e => {
            const actionColor = {
                approve: 'var(--green)', disable: 'var(--red)', remove: '#ff4444',
                transfer: 'var(--gold)', extend_expiry: '#88aaff', reprovision: 'var(--gold)'
            }[e.action] || 'rgba(255,255,255,0.6)';
            return `<tr>
                <td style="font-size:0.78rem;color:var(--text-dim);white-space:nowrap;">${formatTime(e.timestamp)}</td>
                <td><span style="color:${actionColor};font-weight:bold;font-size:0.82rem;">${escapeHtml(e.action)}</span></td>
                <td style="font-family:monospace;font-size:0.75rem;">${escapeHtml(e.uuid||'—')}</td>
                <td style="font-size:0.8rem;">${escapeHtml(e.admin_user||'—')}</td>
                <td style="font-size:0.78rem;color:var(--text-dim);">${escapeHtml(e.before||'—')}</td>
                <td style="font-size:0.78rem;">${escapeHtml(e.after||'—')}</td>
                <td style="font-size:0.78rem;color:var(--text-dim);">${escapeHtml(e.note||'—')}</td>
            </tr>`;
        }).join('');
    } catch(e) {
        body.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--red);">Error: ${escapeHtml(e.message)}</td></tr>`;
    }
}

