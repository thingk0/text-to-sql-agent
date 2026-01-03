/**
 * Application Entry Point 및 메인 로직
 */

import * as api from './api.js';
import * as ui from './ui.js';
import * as utils from './utils.js';

const queryInput = document.getElementById('queryInput');
const submitBtn = document.getElementById('submitBtn');

let schemaContext = '';

// 전역 함수 등록 (HTML onclick 등에서 사용하기 위해)
window.setExample = (text) => {
    queryInput.value = text;
    queryInput.dispatchEvent(new Event('input'));
    queryInput.focus();
};

window.showTableInfo = async (tableName) => {
    try {
        const data = await api.fetchTableDetail(tableName);
        ui.showTableModal(tableName, data.columns);
    } catch (error) {
        console.error('Failed to load table info:', error);
        alert('테이블 정보를 불러올 수 없습니다.');
    }
};

window.closeTableModal = () => {
    ui.hideTableModal();
};

// 메인 초기화
async function init() {
    try {
        // DB 정보 로드
        const dbInfo = await api.fetchDatabaseInfo();
        ui.updateDatabaseStatus(dbInfo);

        // 테이블 목록 로드
        const tablesData = await api.fetchTables();
        ui.renderTablesList(tablesData.tables, window.showTableInfo);

        // 스키마 컨텍스트 로드
        schemaContext = await api.fetchSchemaContext();

        // 사이드바 토글 초기화
        ui.initSidebarToggle();
    } catch (error) {
        console.error('Initialization failed:', error);
    }
}

// SQL 생성 및 전송
async function handleSubmit() {
    const query = queryInput.value.trim();
    if (!query) return;

    ui.addMessage(query, 'user');
    queryInput.value = '';
    queryInput.style.height = 'auto';
    submitBtn.disabled = true;

    try {
        const result = await api.generateSQL(query, schemaContext);
        const codeWrapper = ui.addSQLMessage(result.generated_sql, '요청하신 쿼리를 생성했습니다.');

        // 복사 버튼 이벤트 바인딩
        const copyBtn = codeWrapper.querySelector('.copy-btn');
        copyBtn.addEventListener('click', () => {
            utils.copyToClipboard(result.generated_sql);
            copyBtn.innerHTML = '<i data-lucide="check" class="w-3 h-3"></i> Copied!';
            lucide.createIcons();
            setTimeout(() => {
                copyBtn.innerHTML = '<i data-lucide="copy" class="w-3 h-3"></i> Copy';
                lucide.createIcons();
            }, 2000);
        });
    } catch (error) {
        ui.addMessage('SQL 생성 중 오류가 발생했습니다. 다시 시도해주세요.', 'assistant');
    } finally {
        submitBtn.disabled = false;
    }
}

// 이벤트 바인딩
submitBtn.addEventListener('click', handleSubmit);

queryInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
    }
});

// 초기 실행
document.addEventListener('DOMContentLoaded', init);
