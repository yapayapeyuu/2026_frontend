import React, { createContext, useEffect, useState } from 'react';
import { Outlet } from 'react-router';
import useRequest from '../hooks/useRequest';
import {
    createWorkspace,
    deleteWorkspace,
    getWorkspaceMembers,
    getWorkspaces,
    inviteWorkspaceMember,
    updateWorkspace
} from '../services/workspaceService';

export const WorkspacesContext = createContext({
    workspaces: [],
    loading: false,
    error: null,
    actionLoading: false,
    actionError: null,
    refetch: () => {},
    createNewWorkspace: async () => {},
    deleteWorkspaceById: async () => {},
    updateWorkspaceById: async () => {},
    getWorkspaceMembersById: async () => {},
    inviteWorkspaceMemberByEmail: async () => {}
});

export const WorkspacesContextProvider = () => {
    const { sendRequest, loading, response, error } = useRequest();
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState(null);

    const fetchWorkspaces = () => {
        sendRequest(getWorkspaces);
    };

    const createNewWorkspace = async () => {
        try {
            setActionLoading(true);
            setActionError(null);
            await createWorkspace({ nombre: 'Nota', descripcion: '' });
            fetchWorkspaces();
        } catch (error) {
            setActionError(error.message);
            throw error;
        } finally {
            setActionLoading(false);
        }
    };

    const deleteWorkspaceById = async (workspace_id) => {
        try {
            setActionLoading(true);
            setActionError(null);
            await deleteWorkspace(workspace_id);
            fetchWorkspaces();
        } catch (error) {
            setActionError(error.message);
            throw error;
        } finally {
            setActionLoading(false);
        }
    };

    const updateWorkspaceById = async (workspace_id, payload) => {
        try {
            setActionLoading(true);
            setActionError(null);
            const response = await updateWorkspace(workspace_id, payload);
            fetchWorkspaces();
            return response;
        } catch (error) {
            setActionError(error.message);
            throw error;
        } finally {
            setActionLoading(false);
        }
    };

    const getWorkspaceMembersById = async (workspace_id) => {
        try {
            setActionLoading(true);
            setActionError(null);
            const response = await getWorkspaceMembers(workspace_id);
            return response;
        } catch (error) {
            setActionError(error.message);
            throw error;
        } finally {
            setActionLoading(false);
        }
    };

    const inviteWorkspaceMemberByEmail = async (workspace_id, invited_email) => {
        try {
            setActionLoading(true);
            setActionError(null);
            const response = await inviteWorkspaceMember(workspace_id, invited_email);
            return response;
        } catch (error) {
            setActionError(error.message);
            throw error;
        } finally {
            setActionLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    const providerValue = {
        workspaces: response?.data?.workspaces || [],
        loading,
        error,
        actionLoading,
        actionError,
        refetch: fetchWorkspaces,
        createNewWorkspace,
        deleteWorkspaceById,
        updateWorkspaceById,
        getWorkspaceMembersById,
        inviteWorkspaceMemberByEmail
    };

    return (
        <WorkspacesContext.Provider value={providerValue}>
            <Outlet />
        </WorkspacesContext.Provider>
    );
};


/* import React, { createContext, useEffect, useState } from 'react';
import { Outlet } from 'react-router';
import useRequest from '../hooks/useRequest';
import { createWorkspace, deleteWorkspace, getWorkspaces, updateWorkspace } from '../services/workspaceService';

export const WorkspacesContext = createContext({
    workspaces: [],
    loading: false,
    error: null,
    actionLoading: false,
    actionError: null,
    refetch: () => {},
    createNewWorkspace: async () => {},
    deleteWorkspaceById: async () => {},
    updateWorkspaceById: async () => {}
});

export const WorkspacesContextProvider = () => {
    const { sendRequest, loading, response, error } = useRequest();
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState(null);

    const fetchWorkspaces = () => {
        sendRequest(getWorkspaces);
    };

    const createNewWorkspace = async () => {
        try {
            setActionLoading(true);
            setActionError(null);
            await createWorkspace({ nombre: 'Nota', descripcion: '' });
            fetchWorkspaces();
        } catch (error) {
            setActionError(error.message);
            throw error;
        } finally {
            setActionLoading(false);
        }
    };

    const deleteWorkspaceById = async (workspace_id) => {
        try {
            setActionLoading(true);
            setActionError(null);
            await deleteWorkspace(workspace_id);
            fetchWorkspaces();
        } catch (error) {
            setActionError(error.message);
            throw error;
        } finally {
            setActionLoading(false);
        }
    };

    const updateWorkspaceById = async (workspace_id, payload) => {
        try {
            setActionLoading(true);
            setActionError(null);
            const response = await updateWorkspace(workspace_id, payload);
            fetchWorkspaces();
            return response;
        } catch (error) {
            setActionError(error.message);
            throw error;
        } finally {
            setActionLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    const providerValue = {
        workspaces: response?.data?.workspaces || [],
        loading,
        error,
        actionLoading,
        actionError,
        refetch: fetchWorkspaces,
        createNewWorkspace,
        deleteWorkspaceById,
        updateWorkspaceById
    };

    return (
        <WorkspacesContext.Provider value={providerValue}>
            <Outlet />
        </WorkspacesContext.Provider>
    );
};

/* import React, { createContext, useEffect } from 'react';
import { Outlet } from 'react-router';
import useRequest from '../hooks/useRequest';
import { getWorkspaces } from '../services/workspaceService';

export const WorkspacesContext = createContext({
    workspaces: [],
    loading: false,
    error: null,
    refetch: () => {}
});

export const WorkspacesContextProvider = () => {
    const { sendRequest, loading, response, error } = useRequest();

    const fetchWorkspaces = () => {
        sendRequest(getWorkspaces);
    };

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    const providerValue = {
        workspaces: response?.data?.workspaces || [],
        loading,
        error,
        refetch: fetchWorkspaces
    };

    return (
        <WorkspacesContext.Provider value={providerValue}>
            <Outlet />
        </WorkspacesContext.Provider>
    );
}; */ 