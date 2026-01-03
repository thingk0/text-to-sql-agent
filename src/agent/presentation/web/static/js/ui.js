/**
 * UI 렌더링 및 DOM 제어 모듈
 */

const messagesContainer = document.getElementById('messages');
const welcomeView = document.getElementById('welcome-view');

export function hideWelcome() {
    if (welcomeView && !welcomeView.classList.contains('hidden')) {
        welcomeView.classList.add('hidden');
    }
}

export function createAvatar(type) {
    const div = document.createElement('div');
    div.className = `w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${type === 'user' ? 'bg-indigo-600 text-white' : 'bg-emerald-500 text-white'
        }`;

    const icon = document.createElement('i');
    icon.setAttribute('data-lucide', type === 'user' ? 'user' : 'bot');
    icon.className = 'w-5 h-5';
    div.appendChild(icon);

    return div;
}

export function addMessage(content, type = 'user') {
    hideWelcome();

    const wrapper = document.createElement('div');
    wrapper.className = `w-full py-6 flex ${type === 'user' ? 'bg-white' : 'bg-slate-50'}`;

    const container = document.createElement('div');
    container.className = 'max-w-3xl mx-auto flex gap-4 px-4 w-full';

    const avatar = createAvatar(type);
    const contentDiv = document.createElement('div');
    contentDiv.className = 'flex-1 space-y-2';

    const name = document.createElement('p');
    name.className = 'text-sm font-bold text-slate-900 capitalize';
    name.textContent = type === 'user' ? 'User' : 'Agent';

    const message = document.createElement('div');
    message.className = 'text-[15px] leading-relaxed text-slate-800 whitespace-pre-wrap';
    message.textContent = content;

    contentDiv.appendChild(name);
    contentDiv.appendChild(message);
    container.appendChild(avatar);
    container.appendChild(contentDiv);
    wrapper.appendChild(container);
    messagesContainer.appendChild(wrapper);

    lucide.createIcons();
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

export function showTableModal(tableName, columns) {
    const modal = document.getElementById('table-modal');
    const nameEl = document.getElementById('modal-table-name');
    const listEl = document.getElementById('modal-columns-list');

    nameEl.textContent = tableName;
    listEl.innerHTML = columns.map(col => `
        <div class="flex items-center justify-between p-3 bg-slate-50 border border-[#ececec] rounded-2xl hover:border-indigo-200 transition-colors group">
            <div class="flex items-center gap-4">
                <div class="w-8 flex justify-center">
                    ${col.primary_key ? '<i data-lucide="key" class="w-4 h-4 text-amber-500 fill-amber-500/20"></i>' : '<div class="w-2 h-2 bg-slate-300 rounded-full"></div>'}
                </div>
                <div>
                    <span class="block text-sm font-semibold text-slate-700">${col.name}</span>
                    ${col.nullable ? '' : '<span class="text-[10px] text-red-400 font-bold tracking-tighter uppercase">Required</span>'}
                </div>
            </div>
            <span class="text-[13px] font-mono text-slate-400 bg-white border border-[#ececec] px-2 py-0.5 rounded-lg group-hover:text-indigo-500 group-hover:border-indigo-100 transition-all">${col.type}</span>
        </div>
    `).join('');

    document.body.classList.add('modal-show');
    lucide.createIcons();
}

export function hideTableModal() {
    document.body.classList.remove('modal-show');
}

export function initSidebarToggle() {
    const sidebar = document.querySelector('aside');
    const closeBtn = document.getElementById('sidebar-close-btn');
    const openBtn = document.getElementById('sidebar-open-btn');

    if (!sidebar || !closeBtn || !openBtn) return;

    closeBtn.addEventListener('click', () => {
        sidebar.classList.add('sidebar-collapsed');
        openBtn.classList.remove('hidden');
    });

    openBtn.addEventListener('click', () => {
        sidebar.classList.remove('sidebar-collapsed');
        openBtn.classList.add('hidden');
    });
}

export function addSQLMessage(query, explanation) {
    hideWelcome();

    const wrapper = document.createElement('div');
    wrapper.className = 'w-full py-6 flex bg-slate-50';

    const container = document.createElement('div');
    container.className = 'max-w-3xl mx-auto flex gap-4 px-4 w-full';

    const avatar = createAvatar('assistant');
    const contentDiv = document.createElement('div');
    contentDiv.className = 'flex-1 space-y-4';

    const name = document.createElement('p');
    name.className = 'text-sm font-bold text-slate-900';
    name.textContent = 'Agent';

    const explanationP = document.createElement('p');
    explanationP.className = 'text-[15px] leading-relaxed text-slate-800';
    explanationP.textContent = explanation;

    const codeWrapper = document.createElement('div');
    codeWrapper.className = 'bg-[#1e1e1e] rounded-xl overflow-hidden shadow-sm border border-slate-800';

    const codeHeader = document.createElement('div');
    codeHeader.className = 'bg-black/20 px-4 py-2 flex justify-between items-center border-b border-white/5';
    codeHeader.innerHTML = `
        <span class="text-xs font-mono text-slate-400 capitalize">sql</span>
        <button class="copy-btn text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1">
            <i data-lucide="copy" class="w-3 h-3"></i> Copy
        </button>
    `;

    const pre = document.createElement('pre');
    pre.className = 'p-4 overflow-x-auto text-[13px] font-mono text-[#4ec9b0] leading-relaxed scrollbar-hide';
    const code = document.createElement('code');
    code.textContent = query;
    pre.appendChild(code);

    codeWrapper.appendChild(codeHeader);
    codeWrapper.appendChild(pre);
    contentDiv.appendChild(name);
    contentDiv.appendChild(explanationP);
    contentDiv.appendChild(codeWrapper);
    container.appendChild(avatar);
    container.appendChild(contentDiv);
    wrapper.appendChild(container);
    messagesContainer.appendChild(wrapper);

    lucide.createIcons();
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    return codeWrapper; // 복사 이벤트 바인딩을 위해 반환
}

export function updateDatabaseStatus(data) {
    const statusEl = document.getElementById('db-status');
    const typeEl = document.getElementById('db-type');

    if (data.connected) {
        statusEl.innerHTML = `
            <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            Connected (${data.tables_count} tables)
        `;
        statusEl.className = 'flex items-center gap-1.5 text-emerald-600 font-medium';
    } else {
        statusEl.innerHTML = `
            <span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            Disconnected
        `;
        statusEl.className = 'flex items-center gap-1.5 text-red-600 font-medium';
    }
    typeEl.textContent = data.database_type || '-';
}

export function renderTablesList(tables, onTableClick) {
    const tablesListEl = document.getElementById('tables-list');

    if (tables.length === 0) {
        tablesListEl.innerHTML = '<div class="px-3 py-2 text-xs text-slate-400">테이블 없음</div>';
        return;
    }

    tablesListEl.innerHTML = '';
    tables.forEach(table => {
        const btn = document.createElement('button');
        btn.className = 'w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:bg-[#ececec] rounded-lg truncate transition-colors flex items-center gap-2';
        btn.innerHTML = `<i data-lucide="table-2" class="w-3 h-3 text-slate-400"></i> ${table}`;
        btn.onclick = () => onTableClick(table);
        tablesListEl.appendChild(btn);
    });

    lucide.createIcons();
}
