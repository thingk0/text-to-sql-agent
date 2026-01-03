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
    div.className = `w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${type === 'user' ? 'bg-black text-white' : 'bg-slate-100 text-slate-900 border border-slate-200'
        }`;

    const icon = document.createElement('i');
    icon.setAttribute('data-lucide', type === 'user' ? 'user' : 'bot');
    icon.className = 'w-4 h-4';
    div.appendChild(icon);

    return div;
}

export function addMessage(content, type = 'user') {
    hideWelcome();

    const wrapper = document.createElement('div');
    wrapper.className = `w-full flex ${type === 'user' ? 'justify-end' : 'justify-start'} mb-6 px-4`;

    const container = document.createElement('div');
    container.className = `flex gap-3 max-w-[85%] ${type === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-fade-in`;

    const avatar = createAvatar(type);

    const contentWrapper = document.createElement('div');
    contentWrapper.className = `flex flex-col ${type === 'user' ? 'items-end' : 'items-start'}`;

    const bubble = document.createElement('div');
    bubble.className = `px-4 py-3 rounded-2xl text-[14.5px] leading-relaxed ${type === 'user'
        ? 'bg-black text-white rounded-tr-none shadow-sm'
        : 'bg-white border border-[#ececec] text-slate-800 rounded-tl-none shadow-sm prose prose-slate max-w-none'
        }`;

    if (type === 'user') {
        bubble.textContent = content;
    } else {
        bubble.innerHTML = marked.parse(content);
    }

    contentWrapper.appendChild(bubble);
    container.appendChild(avatar);
    container.appendChild(contentWrapper);
    wrapper.appendChild(container);
    messagesContainer.appendChild(wrapper);

    lucide.createIcons();
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

let currentTableName = ''; // Store current table name for modal actions

export function showTableModal(tableName, columns) {
    currentTableName = tableName;
    const modal = document.getElementById('table-modal');
    const nameEl = document.getElementById('modal-table-name');
    const listEl = document.getElementById('modal-columns-list');

    nameEl.textContent = tableName;
    listEl.innerHTML = columns.map(col => `
        <tr class="hover:bg-indigo-50/30 transition-colors group">
            <td class="px-6 py-3 text-center">
                ${col.primary_key ? '<i data-lucide="key" class="w-4 h-4 text-amber-500 fill-amber-500/20 mx-auto"></i>' : '<div class="w-1.5 h-1.5 bg-slate-200 rounded-full mx-auto"></div>'}
            </td>
            <td class="px-6 py-3">
                <span class="text-sm font-semibold text-slate-700">${col.name}</span>
            </td>
            <td class="px-6 py-3">
                <span class="text-[12px] font-mono text-slate-400 bg-slate-50 border border-[#ececec] px-2 py-0.5 rounded-lg group-hover:text-indigo-500 group-hover:border-indigo-100 transition-all">${col.type}</span>
            </td>
            <td class="px-6 py-3">
                ${col.nullable ? '<span class="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">NULL</span>' : '<span class="text-[10px] text-red-400 font-bold uppercase tracking-tighter">NOT NULL</span>'}
            </td>
            <td class="px-6 py-3 text-right">
                <button onclick="handleDropColumn('${col.name}')" class="p-1.5 text-slate-300 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg ${col.primary_key ? 'opacity-30 pointer-events-none' : ''}" title="${col.primary_key ? 'PK는 삭제할 수 없습니다' : '컬럼 삭제'}">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
            </td>
        </tr>
    `).join('');

    // Reset add column form
    hideAddColumnForm();

    document.body.classList.add('show-table-modal');
    lucide.createIcons();
}

export function getCurrentTableName() {
    return currentTableName;
}

export function hideTableModal() {
    document.body.classList.remove('show-table-modal');
    currentTableName = '';
}

export function showAddColumnForm() {
    const form = document.getElementById('add-column-form');
    form.classList.remove('hidden');
    document.getElementById('new-col-name').value = '';
    document.getElementById('new-col-type').value = 'TEXT';
    document.getElementById('new-col-null').checked = true;
    document.getElementById('add-column-error').classList.add('hidden');
    lucide.createIcons();
}

export function hideAddColumnForm() {
    const form = document.getElementById('add-column-form');
    if (form) form.classList.add('hidden');
}

export function showAddColumnError(message) {
    const errorEl = document.getElementById('add-column-error');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
    }
}

export function showCreateTableModal() {
    const modal = document.getElementById('create-table-modal');
    const nameInput = document.getElementById('new-table-name');
    const columnList = document.getElementById('column-definition-list');

    nameInput.value = '';
    columnList.innerHTML = '';
    addColumnRow(); // 기본 컬럼 하나 추가

    document.body.classList.add('show-create-table-modal');
    lucide.createIcons();
}

export function hideCreateTableModal() {
    document.body.classList.remove('show-create-table-modal');
}

export function addColumnRow() {
    const list = document.getElementById('column-definition-list');
    const row = document.createElement('div');
    row.className = 'flex flex-col gap-2 bg-slate-50 p-3 rounded-2xl border border-[#ececec] group animate-fade-in animate-scale-in';
    row.innerHTML = `
        <div class="flex items-center gap-2">
            <input type="text" placeholder="Column Name" class="col-name flex-1 bg-white border border-[#ececec] px-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
            <select class="col-type bg-white border border-[#ececec] px-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
                <option value="INTEGER">INTEGER</option>
                <option value="TEXT">TEXT</option>
                <option value="VARCHAR(255)">VARCHAR</option>
                <option value="BOOLEAN">BOOLEAN</option>
                <option value="DATETIME">DATETIME</option>
                <option value="REAL">REAL</option>
            </select>
            <div class="flex items-center gap-3 px-2">
                <label class="flex items-center gap-1 cursor-pointer group/pk">
                    <input type="checkbox" class="col-pk rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20">
                    <span class="text-[10px] font-bold text-slate-400 group-hover/pk:text-indigo-600 transition-colors">PK</span>
                </label>
                <label class="flex items-center gap-1 cursor-pointer group/null">
                    <input type="checkbox" class="col-null rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20" checked>
                    <span class="text-[10px] font-bold text-slate-400 group-hover/null:text-indigo-600 transition-colors">NULL</span>
                </label>
            </div>
            <button onclick="this.closest('.animate-fade-in').remove()" class="p-2 text-slate-300 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
        </div>
        <div class="col-error error-message px-1 hidden"></div>
    `;
    list.appendChild(row);
    lucide.createIcons();
}

export function showInputError(inputElement, message) {
    let errorEl;
    if (typeof inputElement === 'string') {
        errorEl = document.getElementById(inputElement + '-error');
    } else {
        // Find the nearest error div within the same container
        errorEl = inputElement.closest('div').parentElement.querySelector('.error-message');
    }

    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
    }

    // Highlight input
    const input = typeof inputElement === 'string' ? document.getElementById(inputElement) : inputElement;
    if (input) {
        input.classList.add('border-red-400', 'bg-red-50/10');
    }
}

export function clearInputErrors() {
    const errors = document.querySelectorAll('.error-message');
    errors.forEach(el => {
        el.textContent = '';
        el.classList.add('hidden');
    });

    const inputs = document.querySelectorAll('#create-table-modal-content input, #create-table-modal-content select');
    inputs.forEach(el => {
        el.classList.remove('border-red-400', 'bg-red-50/10');
    });
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

export function showLoading() {
    hideWelcome();
    const wrapper = document.createElement('div');
    wrapper.className = 'w-full flex justify-start mb-6 px-4 loading-indicator';

    const container = document.createElement('div');
    container.className = 'flex gap-3 max-w-[85%] flex-row animate-fade-in';

    const avatar = createAvatar('assistant');
    const bubble = document.createElement('div');
    bubble.className = 'px-5 py-4 bg-white border border-[#ececec] text-slate-800 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5';
    bubble.innerHTML = `
        <div class="dot-flashing"></div>
        <div class="dot-flashing"></div>
        <div class="dot-flashing"></div>
    `;

    container.appendChild(avatar);
    container.appendChild(bubble);
    wrapper.appendChild(container);
    messagesContainer.appendChild(wrapper);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

export function removeLoading() {
    const loader = document.querySelector('.loading-indicator');
    if (loader) loader.remove();
}

export function addSQLMessage(query, explanation) {
    hideWelcome();
    removeLoading();

    const wrapper = document.createElement('div');
    wrapper.className = 'w-full flex justify-start mb-6 px-4';

    const container = document.createElement('div');
    container.className = 'flex gap-3 max-w-[90%] flex-row animate-fade-in';

    const avatar = createAvatar('assistant');
    const contentDiv = document.createElement('div');
    contentDiv.className = 'flex-1 space-y-3';

    const explanationBubble = document.createElement('div');
    explanationBubble.className = 'px-4 py-3 bg-white border border-[#ececec] text-slate-800 rounded-2xl rounded-tl-none shadow-sm prose prose-slate max-w-none text-[14.5px] leading-relaxed';
    explanationBubble.innerHTML = marked.parse(explanation);

    const codeWrapper = document.createElement('div');
    codeWrapper.className = 'bg-[#1e1e1e] rounded-2xl overflow-hidden shadow-md border border-slate-800 animate-fade-in';

    const codeHeader = document.createElement('div');
    codeHeader.className = 'bg-black/40 px-4 py-2 flex justify-between items-center border-b border-white/5';
    codeHeader.innerHTML = `
        <span class="text-[11px] font-bold tracking-wider text-slate-500 uppercase">sql</span>
        <button class="copy-btn text-[11px] font-bold text-slate-400 hover:text-white transition-all flex items-center gap-1.5">
            <i data-lucide="copy" class="w-3.5 h-3.5"></i> <span>COPY</span>
        </button>
    `;

    const pre = document.createElement('pre');
    pre.className = 'language-sql'; // Prism class
    const code = document.createElement('code');
    code.className = 'language-sql';
    code.textContent = query;
    pre.appendChild(code);

    codeWrapper.appendChild(codeHeader);
    codeWrapper.appendChild(pre);
    contentDiv.appendChild(explanationBubble);
    contentDiv.appendChild(codeWrapper);
    container.appendChild(avatar);
    container.appendChild(contentDiv);
    wrapper.appendChild(container);
    messagesContainer.appendChild(wrapper);

    // Apply Prism highlighting
    Prism.highlightElement(code);

    lucide.createIcons();
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    return codeWrapper;
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
