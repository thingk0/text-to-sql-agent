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
