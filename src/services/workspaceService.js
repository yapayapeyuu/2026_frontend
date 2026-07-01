import ENVIRONMENT from '../config/environment';
import { AUTH_TOKEN_LOCALSTORAGE_KEY } from '../context/AuthContext';

function getAuthHeaders() {
    const token = localStorage.getItem(AUTH_TOKEN_LOCALSTORAGE_KEY);

    if (!token) {
        throw new Error('No hay un token de sesión activo');
    }

    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

async function parseJsonResponse(response_http, defaultErrorMessage) {
    const contentType = response_http.headers.get('content-type') || '';

    if (!contentType.includes('application/json')) {
        throw new Error(`${defaultErrorMessage}. El servidor no devolvió una respuesta JSON válida.`);
    }

    const response = await response_http.json();

    if (!response_http.ok || !response.ok) {
        throw new Error(response.message || defaultErrorMessage);
    }

    return response;
}

/**
 * Obtiene la lista de workspaces asociados al usuario autenticado.
 * @returns {Promise<Object>} Respuesta de la API con la lista de workspaces.
 */
export async function getWorkspaces() {
    const response_http = await fetch(`${ENVIRONMENT.URL_API}/api/workspace`, {
        method: 'GET',
        headers: getAuthHeaders()
    });

    return parseJsonResponse(response_http, 'Error al obtener las notas');
}

/**
 * Crea una nueva nota reutilizando el endpoint existente de workspaces.
 * @returns {Promise<Object>} Respuesta de la API con la nota creada.
 */
export async function createWorkspace(payload = {}) {
    const response_http = await fetch(`${ENVIRONMENT.URL_API}/api/workspace`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
            nombre: payload.nombre || 'Nota',
            descripcion: payload.descripcion || ''
        })
    });

    return parseJsonResponse(response_http, 'Error al crear la nota');
}

/**
 * Actualiza una nota reutilizando el endpoint existente de workspaces.
 * La validación final del nombre vacío se mantiene en el backend.
 * @param {string} workspace_id ID de la nota/workspace.
 * @param {Object} payload Campos a actualizar.
 * @returns {Promise<Object>} Respuesta de la API con la nota actualizada.
 */
export async function updateWorkspace(workspace_id, payload = {}) {
    const response_http = await fetch(`${ENVIRONMENT.URL_API}/api/workspace/${workspace_id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
    });

    return parseJsonResponse(response_http, 'Error al actualizar la nota');
}

/**
 * Elimina una nota reutilizando el endpoint existente de workspaces.
 * La autorización final siempre la valida el backend.
 * @param {string} workspace_id ID de la nota/workspace.
 * @returns {Promise<Object>} Respuesta de la API.
 */
export async function deleteWorkspace(workspace_id) {
    const response_http = await fetch(`${ENVIRONMENT.URL_API}/api/workspace/${workspace_id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });

    return parseJsonResponse(response_http, 'Error al eliminar la nota');
}

/**
 * Obtiene integrantes aceptados de una nota.
 * @param {string} workspace_id ID de la nota/workspace.
 * @returns {Promise<Object>} Respuesta de la API con integrantes.
 */
export async function getWorkspaceMembers(workspace_id) {
    const response_http = await fetch(`${ENVIRONMENT.URL_API}/api/workspace/${workspace_id}/members`, {
        method: 'GET',
        headers: getAuthHeaders()
    });

    return parseJsonResponse(response_http, 'Error al obtener los integrantes');
}

/**
 * Envía invitación por email para colaborar en una nota.
 * @param {string} workspace_id ID de la nota/workspace.
 * @param {string} invited_email Email del usuario invitado.
 * @returns {Promise<Object>} Respuesta de la API.
 */
export async function inviteWorkspaceMember(workspace_id, invited_email) {
    const response_http = await fetch(`${ENVIRONMENT.URL_API}/api/workspace/${workspace_id}/members`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
            invited_email,
            role: 'colaborador'
        })
    });

    return parseJsonResponse(response_http, 'Error al enviar la invitación');
}
