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

/**
 * Obtiene la lista de workspaces asociados al usuario autenticado.
 * @returns {Promise<Object>} Respuesta de la API con la lista de workspaces.
 */

export async function getWorkspaces() {
    const response_http = await fetch(`${ENVIRONMENT.URL_API}/api/workspace`, {
        method: 'GET',
        headers: getAuthHeaders()
    });

    const response = await response_http.json();

    if (!response.ok) {
        throw new Error(response.message || 'Error al obtener las notas');
    }

    return response;
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

    const response = await response_http.json();

    if (!response.ok) {
        throw new Error(response.message || 'Error al crear la nota');
    }

    return response;
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

    const response = await response_http.json();

    if (!response.ok) {
        throw new Error(response.message || 'Error al eliminar la nota');
    }

    return response;
}




/* export async function getWorkspaces() {
    const token = localStorage.getItem(AUTH_TOKEN_LOCALSTORAGE_KEY);
    
    if (!token) {
        throw new Error("No hay un token de sesión activo");
    }

    const response_http = await fetch(`${ENVIRONMENT.URL_API}/api/workspace`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    const response = await response_http.json();

    if (!response.ok) {
        throw new Error(response.message || "Error al obtener los espacios de trabajo");
    }

    return response;
} */