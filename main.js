const kiosks = [
    { id: 'KHUB-NYC-001', location: 'New York, USA', status: 'online', uptime: '14d 2h', heartbeat: 'Active Now', meeting: 'https://meet.jit.si/maainhome-VSWNNFMO' },
    { id: 'KHUB-LDN-002', location: 'London, UK', status: 'pending', uptime: '0h 0m', heartbeat: '5m ago', meeting: '-' },
    { id: 'KHUB-TKY-003', location: 'Tokyo, JP', status: 'online', uptime: '2d 18h', heartbeat: 'Active Now', meeting: 'https://meet.jit.si/maainhome-VSWNNFMO' }
];

function renderTable() {
    const body = document.getElementById('kiosk-body');
    const activeCount = document.getElementById('active-count');
    let onlineCount = 0;

    body.innerHTML = kiosks.map(k => {
        if (k.status === 'online') onlineCount++;
        return `
            <tr>
                <td style="font-weight: 600;">${k.id}</td>
                <td>${k.location}</td>
                <td><span class="status-badge ${k.status}">${k.status.toUpperCase()}</span></td>
                <td>${k.uptime}</td>
                <td>${k.heartbeat}</td>
                <td>
                    <button class="btn-icon">Manage</button>
                    <button class="btn-icon" style="color: var(--red);">Revoke</button>
                </td>
            </tr>
        `;
    }).join('');

    activeCount.innerText = onlineCount;
}

document.addEventListener('DOMContentLoaded', renderTable);
