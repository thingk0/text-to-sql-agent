/**
 * 공통 유틸리티 함수
 */

export function copyToClipboard(text) {
    return navigator.clipboard.writeText(text);
}

export function formatTableInfo(tableName, columnsData) {
    const columns = columnsData.map(col =>
        `  ${col.primary_key ? '🔑 ' : '   '}${col.name} (${col.type})${col.nullable ? '' : ' NOT NULL'}`
    ).join('\n');

    return `테이블: ${tableName}\n\n컬럼:\n${columns}`;
}
