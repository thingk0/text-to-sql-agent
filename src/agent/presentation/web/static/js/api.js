/**
 * Backend API 통신 모듈
 */

export async function fetchDatabaseInfo() {
    const response = await fetch('/api/database/connection');
    return await response.json();
}

export async function fetchTables() {
    const response = await fetch('/api/database/tables');
    return await response.json();
}

export async function fetchSchemaContext() {
    const response = await fetch('/api/database/schema-context');
    const data = await response.json();
    return data.context;
}

export async function fetchTableDetail(tableName) {
    const response = await fetch(`/api/database/tables/${tableName}`);
    return await response.json();
}

export async function generateSQL(userQuery, schemaContext) {
    const response = await fetch('/api/query/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user_query: userQuery,
            schema_context: schemaContext
        })
    });

    if (!response.ok) {
        throw new Error('API request failed');
    }

    return await response.json();
}

export async function createTable(tableData) {
    const response = await fetch('/api/database/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tableData)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || '테이블 생성에 실패했습니다.');
    }

    return await response.json();
}

export async function deleteTable(tableName) {
    const response = await fetch(`/api/database/tables/${tableName}`, {
        method: 'DELETE'
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || '테이블 삭제에 실패했습니다.');
    }

    return await response.json();
}

export async function renameTable(oldName, newName) {
    const response = await fetch(`/api/database/tables/${oldName}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_name: newName })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || '테이블 이름 변경에 실패했습니다.');
    }

    return await response.json();
}

export async function addColumn(tableName, columnData) {
    const response = await fetch(`/api/database/tables/${tableName}/columns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ column: columnData })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || '컬럼 추가에 실패했습니다.');
    }

    return await response.json();
}

export async function dropColumn(tableName, columnName) {
    const response = await fetch(`/api/database/tables/${tableName}/columns/${columnName}`, {
        method: 'DELETE'
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || '컬럼 삭제에 실패했습니다.');
    }

    return await response.json();
}
