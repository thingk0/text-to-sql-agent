/**
 * Application Entry Point 및 메인 로직
 */

import * as api from './api.js';
import * as ui from './ui.js';
import * as utils from './utils.js';

const queryInput = document.getElementById('queryInput');
const submitBtn = document.getElementById('submitBtn');

let schemaContext = '';
let isSubmitting = false;  // 중복 제출 방지 플래그
let isComposingIME = false; // IME 조합 상태 추적

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

window.openCreateTableModal = () => {
    ui.showCreateTableModal();
};

window.closeCreateTableModal = () => {
    ui.hideCreateTableModal();
};

window.addColumnRow = () => {
    ui.addColumnRow();
};

// Table modification handlers
window.showAddColumnForm = () => {
    ui.showAddColumnForm();
};

window.hideAddColumnForm = () => {
    ui.hideAddColumnForm();
};

window.handleAddColumn = async () => {
    const tableName = ui.getCurrentTableName();
    const name = document.getElementById('new-col-name').value.trim();
    const type = document.getElementById('new-col-type').value;
    const isNullable = document.getElementById('new-col-null').checked;

    const isValidIdentifier = (id) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(id);

    if (!name) {
        ui.showAddColumnError('컬럼명을 입력해주세요.');
        return;
    }
    if (!isValidIdentifier(name)) {
        ui.showAddColumnError('영문자나 언더바로 시작하며 영문, 숫자, 언더바만 가능합니다.');
        return;
    }

    try {
        await api.addColumn(tableName, { name, type, is_nullable: isNullable });
        await refreshTableModal(tableName);
        await refreshSidebar();
    } catch (error) {
        ui.showAddColumnError(error.message);
    }
};

window.handleDropColumn = async (columnName) => {
    const tableName = ui.getCurrentTableName();
    if (!confirm(`'${columnName}' 컬럼을 삭제하시겠습니까?`)) return;

    try {
        await api.dropColumn(tableName, columnName);
        await refreshTableModal(tableName);
        await refreshSidebar();
    } catch (error) {
        alert(error.message);
    }
};

window.confirmDeleteTable = async () => {
    const tableName = ui.getCurrentTableName();
    if (!confirm(`'${tableName}' 테이블을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return;

    try {
        await api.deleteTable(tableName);
        ui.hideTableModal();
        await refreshSidebar();
        alert(`'${tableName}' 테이블이 삭제되었습니다.`);
    } catch (error) {
        alert(error.message);
    }
};

window.showRenameTablePrompt = async () => {
    const oldName = ui.getCurrentTableName();
    const newName = prompt('새 테이블 이름을 입력하세요:', oldName);

    if (!newName || newName === oldName) return;

    const isValidIdentifier = (id) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(id);
    if (!isValidIdentifier(newName)) {
        alert('테이블명은 영문자나 언더바(_)로 시작해야 하며, 영문자, 숫자, 언더바만 포함할 수 있습니다.');
        return;
    }

    try {
        await api.renameTable(oldName, newName);
        await refreshTableModal(newName);
        await refreshSidebar();
    } catch (error) {
        alert(error.message);
    }
};

async function refreshTableModal(tableName) {
    const data = await api.fetchTableDetail(tableName);
    ui.showTableModal(tableName, data.columns);
}

async function refreshSidebar() {
    const [dbInfo, tablesData] = await Promise.all([
        api.fetchDatabaseInfo(),
        api.fetchTables()
    ]);
    ui.updateDatabaseStatus(dbInfo);
    ui.renderTablesList(tablesData.tables, window.showTableInfo);
    schemaContext = await api.fetchSchemaContext();
}


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
    // 중복 제출 방지
    if (isSubmitting) return;

    const query = queryInput.value.trim();
    if (!query) return;

    isSubmitting = true;
    ui.addMessage(query, 'user');
    queryInput.value = '';
    queryInput.style.height = 'auto';
    submitBtn.disabled = true;

    // Show loading indicator
    ui.showLoading();

    try {
        const result = await api.generateSQL(query, schemaContext);
        // addSQLMessage internal logic calls removeLoading()
        const codeWrapper = ui.addSQLMessage(result.generated_sql, '요청하신 쿼리를 생성했습니다.');

        // 복사 버튼 이벤트 바인딩
        const copyBtn = codeWrapper.querySelector('.copy-btn');
        const copyBtnText = copyBtn.querySelector('span');

        copyBtn.addEventListener('click', () => {
            utils.copyToClipboard(result.generated_sql);
            copyBtnText.textContent = 'COPIED!';
            const icon = copyBtn.querySelector('i');
            icon.setAttribute('data-lucide', 'check');
            lucide.createIcons();

            setTimeout(() => {
                copyBtnText.textContent = 'COPY';
                icon.setAttribute('data-lucide', 'copy');
                lucide.createIcons();
            }, 2000);
        });
    } catch (error) {
        ui.removeLoading();
        ui.addMessage('SQL 생성 중 오류가 발생했습니다. 다시 시도해주세요.', 'assistant');
    } finally {
        submitBtn.disabled = false;
        isSubmitting = false;
    }
}

// 테이블 생성 처리
async function handleCreateTable() {
    ui.clearInputErrors(); // 기존 에러 초기화

    const nameInput = document.getElementById('new-table-name');
    const tableName = nameInput.value.trim();

    // Identifier 유효성 검사 함수
    const isValidIdentifier = (id) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(id);

    let hasError = false;

    if (!tableName) {
        ui.showInputError('new-table-name', '테이블 이름을 입력해주세요.');
        hasError = true;
    } else if (!isValidIdentifier(tableName)) {
        ui.showInputError('new-table-name', '영문자나 언더바(_)로 시작하며 영문, 숫자, 언더바만 가능합니다.');
        hasError = true;
    }

    const columnRows = document.querySelectorAll('#column-definition-list > div');
    const columns = Array.from(columnRows).map(row => {
        const input = row.querySelector('.col-name');
        return {
            input: input,
            name: input.value.trim(),
            type: row.querySelector('.col-type').value,
            is_primary_key: row.querySelector('.col-pk').checked,
            is_nullable: row.querySelector('.col-null').checked
        };
    });

    if (columns.length === 0) {
        alert('최소 하나 이상의 컬럼을 추가해주세요.'); // 이건 구조적 오류라 alert 유지
        return;
    }

    columns.forEach(col => {
        if (!col.name) {
            ui.showInputError(col.input, '컬럼 이름을 입력해주세요.');
            hasError = true;
        } else if (!isValidIdentifier(col.name)) {
            ui.showInputError(col.input, '유효하지 않은 이름입니다.');
            hasError = true;
        }
    });

    if (hasError) return;

    const createBtn = document.getElementById('confirm-create-table-btn');
    const originalText = createBtn.innerHTML;
    createBtn.disabled = true;
    createBtn.innerHTML = '<span class="animate-spin mr-2">◌</span> 생성 중...';

    try {
        await api.createTable({
            table_name: tableName,
            columns: columns
        });

        // 성공 처리
        ui.hideCreateTableModal();

        // 테이블 목록 및 상태 갱신
        const [dbInfo, tablesData] = await Promise.all([
            api.fetchDatabaseInfo(),
            api.fetchTables()
        ]);
        ui.updateDatabaseStatus(dbInfo);
        ui.renderTablesList(tablesData.tables, window.showTableInfo);

        // 스키마 컨텍스트 갱신
        schemaContext = await api.fetchSchemaContext();

        alert(`'${tableName}' 테이블이 생성되었습니다.`);
    } catch (error) {
        console.error('Table creation failed:', error);
        alert(error.message);
    } finally {
        createBtn.disabled = false;
        createBtn.innerHTML = originalText;
    }
}


// 이벤트 바인딩
submitBtn.addEventListener('click', handleSubmit);

// IME 조합 상태 추적 (한글 입력 등)
queryInput.addEventListener('compositionstart', () => {
    isComposingIME = true;
});

queryInput.addEventListener('compositionend', () => {
    isComposingIME = false;
});

// Enter 키 이벤트 (한글 IME 호환)
queryInput.addEventListener('keydown', (e) => {
    // IME 조합 중이거나 keyCode 229(IME 처리중)일 때는 무시
    if (e.isComposing || isComposingIME || e.keyCode === 229) return;

    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
    }
});

// 테이블 생성 버튼 이벤트
const confirmCreateBtn = document.getElementById('confirm-create-table-btn');
if (confirmCreateBtn) {
    confirmCreateBtn.addEventListener('click', handleCreateTable);
}


// 초기 실행
document.addEventListener('DOMContentLoaded', init);

