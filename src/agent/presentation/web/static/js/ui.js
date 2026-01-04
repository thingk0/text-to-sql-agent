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


export function showCreateTableModal() {
    const modal = document.getElementById('create-table-modal');
    const nameInput = document.getElementById('new-table-name');
    const columnList = document.getElementById('column-definition-list');

    nameInput.value = '';
    columnList.innerHTML = '';
    addColumnRow(); // 기본 컬럼 하나 추가

    document.body.classList.add('show-create-table-modal');
    updateDDLPreview(); // Initial preview
    lucide.createIcons();
}

export function hideCreateTableModal() {
    document.body.classList.remove('show-create-table-modal');
}

export function addColumnRow() {
    const list = document.getElementById('column-definition-list');
    const row = document.createElement('div');
    row.className = 'flex flex-col gap-3 bg-slate-50 p-4 rounded-2xl border border-[#ececec] group animate-fade-in animate-scale-in';
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
            <button onclick="this.closest('.animate-fade-in').remove(); updateDDLPreview();" class="p-2 text-slate-300 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
        </div>
        <div class="flex items-center gap-4 flex-wrap">
            <div class="flex items-center gap-3">
                <label class="flex items-center gap-1.5 cursor-pointer group/pk">
                    <input type="checkbox" class="col-pk rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20">
                    <span class="text-[10px] font-bold text-slate-400 group-hover/pk:text-indigo-600 transition-colors">PK</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer group/null">
                    <input type="checkbox" class="col-null rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20" checked>
                    <span class="text-[10px] font-bold text-slate-400 group-hover/null:text-indigo-600 transition-colors">NULL</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer group/unique">
                    <input type="checkbox" class="col-unique rounded border-slate-300 text-amber-600 focus:ring-amber-500/20">
                    <span class="text-[10px] font-bold text-slate-400 group-hover/unique:text-amber-600 transition-colors">UNIQUE</span>
                </label>
            </div>
            <div class="flex items-center gap-2">
                <span class="text-[10px] font-bold text-slate-400">DEFAULT:</span>
                <input type="text" placeholder="(optional)" class="col-default bg-white border border-[#ececec] px-2 py-1 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-24">
            </div>
        </div>
        <div class="flex items-center gap-2">
            <span class="text-[10px] font-bold text-slate-400">FK:</span>
            <input type="text" placeholder="참조 테이블" class="col-fk-table bg-white border border-[#ececec] px-2 py-1.5 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-28">
            <span class="text-slate-300">.</span>
            <input type="text" placeholder="참조 컬럼" class="col-fk-column bg-white border border-[#ececec] px-2 py-1.5 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-28">
        </div>
        <div class="col-error error-message px-1 hidden"></div>
    `;
    list.appendChild(row);

    // Attach listeners to all inputs/selects in this row
    row.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('input', updateDDLPreview);
    });

    lucide.createIcons();
    updateDDLPreview();
}

export function updateDDLPreview() {
    const tableName = document.getElementById('new-table-name').value.trim() || 'table_name';
    const columnRows = document.querySelectorAll('#column-definition-list > div');

    const lines = [];
    const fkConstraints = [];

    columnRows.forEach(row => {
        const name = row.querySelector('.col-name').value.trim() || 'column_name';
        const type = row.querySelector('.col-type').value;
        const isPk = row.querySelector('.col-pk').checked;
        const isNull = row.querySelector('.col-null').checked;
        const isUnique = row.querySelector('.col-unique').checked;
        const defaultValue = row.querySelector('.col-default').value.trim();
        const fkTable = row.querySelector('.col-fk-table').value.trim();
        const fkColumn = row.querySelector('.col-fk-column').value.trim();

        let parts = [`${name} ${type}`];
        if (isPk) parts.push('PRIMARY KEY');
        if (!isNull) parts.push('NOT NULL');
        if (isUnique) parts.push('UNIQUE');
        if (defaultValue) parts.push(`DEFAULT '${defaultValue}'`);

        lines.push(parts.join(' '));

        if (fkTable && fkColumn) {
            fkConstraints.push(`FOREIGN KEY (${name}) REFERENCES ${fkTable}(${fkColumn})`);
        }
    });

    const allLines = [...lines, ...fkConstraints];
    const sql = `CREATE TABLE ${tableName} (\n  ${allLines.join(',\n  ')}\n);`;

    const previewEl = document.getElementById('create-table-ddl-preview');
    if (previewEl) {
        previewEl.textContent = sql;
        Prism.highlightElement(previewEl);
    }
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

    // Format SQL for better readability
    const formattedSQL = sqlFormatter.format(query, { language: 'sql' });
    code.textContent = formattedSQL;
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
