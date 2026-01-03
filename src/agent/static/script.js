const messagesContainer = document.getElementById('messages');
const queryForm = document.getElementById('queryForm');
const queryInput = document.getElementById('queryInput');
const welcomeView = document.getElementById('welcome-view');

let isFirstMessage = true;

function setExample(text) {
    queryInput.value = text;
    queryInput.dispatchEvent(new Event('input'));
    queryInput.focus();
}

function createAvatar(type) {
    const div = document.createElement('div');
    div.className = `w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${type === 'user' ? 'bg-indigo-600 text-white' : 'bg-emerald-500 text-white'
        }`;

    const icon = document.createElement('i');
    icon.setAttribute('data-lucide', type === 'user' ? 'user' : 'bot');
    icon.className = 'w-5 h-5';
    div.appendChild(icon);

    return div;
}

function addMessage(content, type = 'user') {
    if (isFirstMessage) {
        welcomeView.classList.add('hidden');
        isFirstMessage = false;
    }

    const wrapper = document.createElement('div');
    wrapper.className = `w-full py-6 flex ${type === 'user' ? 'bg-white' : 'bg-slate-50'}`;

    const container = document.createElement('div');
    container.className = 'max-w-3xl mx-auto flex gap-4 px-4 w-full';

    const avatar = createAvatar(type);
    const contentDiv = document.createElement('div');
    contentDiv.className = 'flex-1 space-y-2';

    const name = document.createElement('p');
    name.className = 'text-sm font-bold text-slate-900 capitalize';
    name.textContent = type;

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

function addSQLMessage(query, explanation) {
    if (isFirstMessage) {
        welcomeView.classList.add('hidden');
        isFirstMessage = false;
    }

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
    codeHeader.innerHTML = '<span class="text-xs font-mono text-slate-400 capitalize">sql</span><button class="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"><i data-lucide="copy" class="w-3 h-3"></i> Copy</button>';

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
}

queryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = queryInput.value.trim();
    if (!query) return;

    addMessage(query, 'user');
    queryInput.value = '';
    queryInput.style.height = 'auto';

    setTimeout(() => {
        const demoSQL = `-- 요청하신 데이터 분석 쿼리입니다
SELECT 
    p.product_name, 
    SUM(s.quantity) as total_units,
    SUM(s.quantity * p.price) as total_revenue
FROM sales s
JOIN products p ON s.product_id = p.id
WHERE s.sale_date >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY p.product_name
ORDER BY total_revenue DESC
LIMIT 5;`;

        addSQLMessage(demoSQL, '데이터베이스를 분석한 결과, 이번 달 매출 성적이 가장 좋은 상위 5개 제품 리스트를 생성했습니다.');
    }, 800);
});

// 엔터 키 처리 (Shift+Enter는 줄바꿈)
queryInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        queryForm.dispatchEvent(new Event('submit'));
    }
});
