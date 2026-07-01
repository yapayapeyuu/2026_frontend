import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { AuthContext } from '../../context/AuthContext'
import { WorkspacesContext } from '../../context/WorkspacesContext'
import './WorkspaceScreen.css'

const ROLE_STYLES = {
  dueño: {
    label: 'Dueño',
    className: 'role--owner'
  },
  owner: {
    label: 'Dueño',
    className: 'role--owner'
  },
  colaborador: {
    label: 'Colaborador',
    className: 'role--collaborator'
  },
  collaborator: {
    label: 'Colaborador',
    className: 'role--collaborator'
  }
}

export const WorkspaceScreen = () => {
  const { workspace_id } = useParams()
  const navigate = useNavigate()
  const { userData } = useContext(AuthContext)
  const {
    workspaces,
    loading,
    error,
    actionError,
    updateWorkspaceById,
    getWorkspaceMembersById,
    inviteWorkspaceMemberByEmail,
    refetch
  } = useContext(WorkspacesContext)

  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [initialNombre, setInitialNombre] = useState('')
  const [initialDescripcion, setInitialDescripcion] = useState('')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackType, setFeedbackType] = useState('info')
  const [saveStatus, setSaveStatus] = useState('idle')
  const [lastSavedAt, setLastSavedAt] = useState(null)
  const [isCollaboratorsModalOpen, setIsCollaboratorsModalOpen] = useState(false)
  const [collaboratorEmail, setCollaboratorEmail] = useState('')
  const [members, setMembers] = useState([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [membersError, setMembersError] = useState('')
  const [inviteFeedback, setInviteFeedback] = useState('')
  const [inviteFeedbackType, setInviteFeedbackType] = useState('info')
  const [inviteLoading, setInviteLoading] = useState(false)
  const savedFeedbackTimeout = useRef(null)

  const selectedWorkspace = useMemo(() => {
    return workspaces.find((membership) => membership.workspace_id === workspace_id)
  }, [workspaces, workspace_id])

  useEffect(() => {
    if (selectedWorkspace) {
      const currentNombre = selectedWorkspace.workspace_nombre || ''
      const currentDescripcion = selectedWorkspace.workspace_descripcion || ''

      setNombre(currentNombre)
      setDescripcion(currentDescripcion)
      setInitialNombre(currentNombre)
      setInitialDescripcion(currentDescripcion)
    }
  }, [selectedWorkspace])

  useEffect(() => {
    return () => {
      if (savedFeedbackTimeout.current) {
        clearTimeout(savedFeedbackTimeout.current)
      }
    }
  }, [])

  const hasUnsavedChanges = nombre !== initialNombre || descripcion !== initialDescripcion
  const isSaving = saveStatus === 'saving'
  const canInviteCollaborators = selectedWorkspace?.member_rol === 'dueño' || selectedWorkspace?.member_rol === 'owner'

  function getRoleInfo(role) {
    return ROLE_STYLES[role] || ROLE_STYLES.colaborador
  }

  function getUserInitial(name) {
    return (name || 'U').charAt(0).toUpperCase()
  }

  function formatDateTime(date) {
    if (!date) {
      return 'Sin fecha disponible'
    }

    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  function getSaveButtonText() {
    if (saveStatus === 'saving') {
      return 'Guardando...'
    }

    if (saveStatus === 'saved') {
      return 'Cambios guardados'
    }

    return 'Guardar cambios'
  }

  async function loadWorkspaceMembers() {
    try {
      setMembersLoading(true)
      setMembersError('')
      const response = await getWorkspaceMembersById(workspace_id)
      setMembers(response?.data?.members || [])
    } catch (error) {
      setMembersError(error.message || 'No se pudieron obtener los integrantes.')
    } finally {
      setMembersLoading(false)
    }
  }

  async function handleOpenCollaboratorsModal() {
    setIsCollaboratorsModalOpen(true)
    setInviteFeedback('')
    setMembersError('')
    await loadWorkspaceMembers()
  }

  async function handleSaveWorkspace(event) {
    event.preventDefault()

    if (!hasUnsavedChanges || isSaving) {
      return
    }

    try {
      setFeedbackMessage('')
      setFeedbackType('info')
      setSaveStatus('saving')

      const response = await updateWorkspaceById(workspace_id, {
        nombre,
        descripcion
      })

      const updatedWorkspace = response?.data?.workspace
      const savedNombre = updatedWorkspace?.nombre || 'Nota'
      const savedDescripcion = updatedWorkspace?.descripcion || ''

      setNombre(savedNombre)
      setDescripcion(savedDescripcion)
      setInitialNombre(savedNombre)
      setInitialDescripcion(savedDescripcion)
      setLastSavedAt(updatedWorkspace?.fecha_actualizacion || new Date())
      setFeedbackType('success')
      setFeedbackMessage('Nota actualizada con éxito.')
      setSaveStatus('saved')

      if (savedFeedbackTimeout.current) {
        clearTimeout(savedFeedbackTimeout.current)
      }

      savedFeedbackTimeout.current = setTimeout(() => {
        setSaveStatus('idle')
      }, 1500)
    } catch (error) {
      setFeedbackType('error')
      setFeedbackMessage(error.message || 'No se pudo guardar la nota. Revisá los datos e intentá nuevamente.')
      setSaveStatus('idle')
    }
  }

  async function handleCollaboratorSubmit(event) {
    event.preventDefault()

    const email = collaboratorEmail.trim().toLowerCase()

    if (!email) {
      setInviteFeedbackType('error')
      setInviteFeedback('Ingresá un correo electrónico para enviar la invitación.')
      return
    }

    try {
      setInviteLoading(true)
      setInviteFeedback('')
      await inviteWorkspaceMemberByEmail(workspace_id, email)
      setInviteFeedbackType('success')
      setInviteFeedback('Invitación enviada correctamente.')
      setCollaboratorEmail('')
      await loadWorkspaceMembers()
    } catch (error) {
      setInviteFeedbackType('error')
      setInviteFeedback(error.message || 'No se pudo enviar la invitación.')
    } finally {
      setInviteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="workspace-screen">
        <div className="workspace-screen__state">
          <div className="spinner"></div>
          <p>Cargando nota...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="workspace-screen">
        <div className="workspace-screen__state workspace-screen__state--error">
          <p>⚠️ Error: {error}</p>
          <button className="workspace-screen__button workspace-screen__button--primary" onClick={refetch}>
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!selectedWorkspace) {
    return (
      <div className="workspace-screen">
        <div className="workspace-screen__state">
          <p>No encontramos la nota solicitada.</p>
          <button className="workspace-screen__button workspace-screen__button--primary" onClick={() => navigate('/home')}>
            Volver al Home
          </button>
        </div>
      </div>
    )
  }

  const modificationDate = lastSavedAt || selectedWorkspace.workspace_fecha_actualizacion || selectedWorkspace.workspace_fecha_creacion

  return (
    <div className="workspace-screen">
      <header className="workspace-screen__header">
        <div className="workspace-screen__title-group">
          <button
            className="workspace-screen__button workspace-screen__button--secondary"
            onClick={() => navigate('/home')}
            type="button"
          >
            ← Volver al Home
          </button>
          <div>
            <span className="workspace-screen__eyebrow">Editor de nota</span>
            <h1 className="workspace-screen__title">{nombre.trim() || 'Nota'}</h1>
            <p className="workspace-screen__date">
              Última modificación: {formatDateTime(modificationDate)}
            </p>
          </div>
        </div>

        <button
          className="workspace-screen__collaborators-button"
          onClick={handleOpenCollaboratorsModal}
          type="button"
          aria-label="Gestionar colaboradores"
        >
          👥
        </button>
      </header>

      {(feedbackMessage || actionError) && (
        <div className={`workspace-screen__feedback workspace-screen__feedback--${feedbackType}`} role="alert">
          {feedbackMessage || actionError}
        </div>
      )}

      <form className="workspace-editor" onSubmit={handleSaveWorkspace}>
        <label className="workspace-editor__field">
          <span className="workspace-editor__label">Nombre de la nota</span>
          <input
            className="workspace-editor__input"
            type="text"
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            placeholder="Nota"
          />
        </label>

        <label className="workspace-editor__field workspace-editor__field--content">
          <span className="workspace-editor__label">Descripción</span>
          <textarea
            className="workspace-editor__textarea"
            value={descripcion}
            onChange={(event) => setDescripcion(event.target.value)}
            placeholder="Escribí el contenido de tu nota..."
          />
        </label>

        <div className="workspace-editor__actions">
          <button
            className="workspace-screen__button workspace-screen__button--secondary"
            onClick={() => navigate('/home')}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="workspace-screen__button workspace-screen__button--primary"
            disabled={!hasUnsavedChanges || isSaving || saveStatus === 'saved'}
            type="submit"
          >
            {getSaveButtonText()}
          </button>
        </div>
      </form>

      {isCollaboratorsModalOpen && (
        <div className="collaborators-modal" role="dialog" aria-modal="true" aria-labelledby="collaborators-modal-title">
          <div className="collaborators-modal__content">
            <div className="collaborators-modal__header">
              <h2 className="collaborators-modal__title" id="collaborators-modal-title">
                Colaboradores
              </h2>
              <button
                className="collaborators-modal__close-button"
                onClick={() => setIsCollaboratorsModalOpen(false)}
                type="button"
                aria-label="Cerrar modal"
              >
                ×
              </button>
            </div>

            <section className="collaborators-modal__section">
              <h3 className="collaborators-modal__subtitle">Integrantes</h3>

              {membersLoading && (
                <p className="collaborators-modal__message">Cargando integrantes...</p>
              )}

              {membersError && (
                <p className="collaborators-modal__message collaborators-modal__message--error">
                  {membersError}
                </p>
              )}

              {!membersLoading && !membersError && (
                <div className="collaborators-modal__member-list">
                  {members.length === 0 ? (
                    <p className="collaborators-modal__message">Todavía no hay integrantes para mostrar.</p>
                  ) : (
                    members.map((member) => {
                      const roleInfo = getRoleInfo(member.member_rol)

                      return (
                        <div className="collaborators-modal__member-card" key={member.member_id}>
                          <div className="collaborators-modal__avatar">
                            {getUserInitial(member.user_nombre)}
                          </div>
                          <div className="collaborators-modal__member-info">
                            <strong>{member.user_nombre}</strong>
                            <span className={`collaborators-modal__role ${roleInfo.className}`}>
                              {roleInfo.label}
                            </span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </section>

            <section className="collaborators-modal__section collaborators-modal__section--invite">
              <h3 className="collaborators-modal__subtitle">Invitar un nuevo colaborador</h3>

              {!canInviteCollaborators ? (
                <p className="collaborators-modal__message">
                  Solo el dueño de la nota puede enviar invitaciones.
                </p>
              ) : (
                <form className="collaborators-modal__form" onSubmit={handleCollaboratorSubmit}>
                  <label className="collaborators-modal__label" htmlFor="collaborator-email">
                    Correo electrónico
                  </label>
                  <input
                    className="collaborators-modal__input"
                    id="collaborator-email"
                    type="email"
                    value={collaboratorEmail}
                    onChange={(event) => setCollaboratorEmail(event.target.value)}
                    placeholder="correo@gmail.com"
                    disabled={inviteLoading}
                  />

                  {inviteFeedback && (
                    <p className={`collaborators-modal__message collaborators-modal__message--${inviteFeedbackType}`}>
                      {inviteFeedback}
                    </p>
                  )}

                  <button
                    className="workspace-screen__button workspace-screen__button--primary"
                    disabled={inviteLoading}
                    type="submit"
                  >
                    {inviteLoading ? 'Enviando...' : 'Enviar invitación'}
                  </button>
                </form>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  )
}



/* import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { AuthContext } from '../../context/AuthContext'
import { WorkspacesContext } from '../../context/WorkspacesContext'
import './WorkspaceScreen.css'

export const WorkspaceScreen = () => {
  const { workspace_id } = useParams()
  const navigate = useNavigate()
  const { userData } = useContext(AuthContext)
  const {
    workspaces,
    loading,
    error,
    actionError,
    updateWorkspaceById,
    refetch
  } = useContext(WorkspacesContext)

  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [initialNombre, setInitialNombre] = useState('')
  const [initialDescripcion, setInitialDescripcion] = useState('')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackType, setFeedbackType] = useState('info')
  const [saveStatus, setSaveStatus] = useState('idle')
  const [lastSavedAt, setLastSavedAt] = useState(null)
  const [isCollaboratorsModalOpen, setIsCollaboratorsModalOpen] = useState(false)
  const [collaboratorEmail, setCollaboratorEmail] = useState('')
  const savedFeedbackTimeout = useRef(null)

  const selectedWorkspace = useMemo(() => {
    return workspaces.find((membership) => membership.workspace_id === workspace_id)
  }, [workspaces, workspace_id])

  useEffect(() => {
    if (selectedWorkspace) {
      const currentNombre = selectedWorkspace.workspace_nombre || ''
      const currentDescripcion = selectedWorkspace.workspace_descripcion || ''

      setNombre(currentNombre)
      setDescripcion(currentDescripcion)
      setInitialNombre(currentNombre)
      setInitialDescripcion(currentDescripcion)
    }
  }, [selectedWorkspace])

  useEffect(() => {
    return () => {
      if (savedFeedbackTimeout.current) {
        clearTimeout(savedFeedbackTimeout.current)
      }
    }
  }, [])

  const hasUnsavedChanges = nombre !== initialNombre || descripcion !== initialDescripcion
  const isSaving = saveStatus === 'saving'

  function getRoleLabel(role) {
    return role === 'dueño' || role === 'owner' ? 'Dueño' : 'Colaborador'
  }

  function formatDateTime(date) {
    if (!date) {
      return 'Sin fecha disponible'
    }

    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  function getSaveButtonText() {
    if (saveStatus === 'saving') {
      return 'Guardando...'
    }

    if (saveStatus === 'saved') {
      return 'Cambios guardados'
    }

    return 'Guardar cambios'
  }

  async function handleSaveWorkspace(event) {
    event.preventDefault()

    if (!hasUnsavedChanges || isSaving) {
      return
    }

    try {
      setFeedbackMessage('')
      setFeedbackType('info')
      setSaveStatus('saving')

      const response = await updateWorkspaceById(workspace_id, {
        nombre,
        descripcion
      })

      const updatedWorkspace = response?.data?.workspace
      const savedNombre = updatedWorkspace?.nombre || 'Nota'
      const savedDescripcion = updatedWorkspace?.descripcion || ''

      setNombre(savedNombre)
      setDescripcion(savedDescripcion)
      setInitialNombre(savedNombre)
      setInitialDescripcion(savedDescripcion)
      setLastSavedAt(updatedWorkspace?.fecha_actualizacion || new Date())
      setFeedbackType('success')
      setFeedbackMessage('Nota actualizada con éxito.')
      setSaveStatus('saved')

      if (savedFeedbackTimeout.current) {
        clearTimeout(savedFeedbackTimeout.current)
      }

      savedFeedbackTimeout.current = setTimeout(() => {
        setSaveStatus('idle')
      }, 1500)
    } catch (error) {
      setFeedbackType('error')
      setFeedbackMessage(error.message || 'No se pudo guardar la nota. Revisá los datos e intentá nuevamente.')
      setSaveStatus('idle')
    }
  }

  function handleCollaboratorSubmit(event) {
    event.preventDefault()
    setFeedbackType('info')
    setFeedbackMessage('La invitación de colaboradores se implementará en la próxima etapa.')
    setCollaboratorEmail('')
    setIsCollaboratorsModalOpen(false)
  }

  if (loading) {
    return (
      <div className="workspace-screen">
        <div className="workspace-screen__state">
          <div className="spinner"></div>
          <p>Cargando nota...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="workspace-screen">
        <div className="workspace-screen__state workspace-screen__state--error">
          <p>⚠️ Error: {error}</p>
          <button className="workspace-screen__button workspace-screen__button--primary" onClick={refetch}>
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!selectedWorkspace) {
    return (
      <div className="workspace-screen">
        <div className="workspace-screen__state">
          <p>No encontramos la nota solicitada.</p>
          <button className="workspace-screen__button workspace-screen__button--primary" onClick={() => navigate('/home')}>
            Volver al Home
          </button>
        </div>
      </div>
    )
  }

  const modificationDate = lastSavedAt || selectedWorkspace.workspace_fecha_actualizacion || selectedWorkspace.workspace_fecha_creacion

  return (
    <div className="workspace-screen">
      <header className="workspace-screen__header">
        <div className="workspace-screen__title-group">
          <button
            className="workspace-screen__button workspace-screen__button--secondary"
            onClick={() => navigate('/home')}
            type="button"
          >
            ← Volver al Home
          </button>
          <div>
            <span className="workspace-screen__eyebrow">Editor de nota</span>
            <h1 className="workspace-screen__title">{nombre.trim() || 'Nota'}</h1>
            <p className="workspace-screen__date">
              Última modificación: {formatDateTime(modificationDate)}
            </p>
          </div>
        </div>

        <button
          className="workspace-screen__collaborators-button"
          onClick={() => setIsCollaboratorsModalOpen(true)}
          type="button"
          aria-label="Gestionar colaboradores"
        >
          👥
        </button>
      </header>

      {(feedbackMessage || actionError) && (
        <div className={`workspace-screen__feedback workspace-screen__feedback--${feedbackType}`} role="alert">
          {feedbackMessage || actionError}
        </div>
      )}

      <form className="workspace-editor" onSubmit={handleSaveWorkspace}>
        <label className="workspace-editor__field">
          <span className="workspace-editor__label">Nombre de la nota</span>
          <input
            className="workspace-editor__input"
            type="text"
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            placeholder="Nota"
          />
        </label>

        <label className="workspace-editor__field workspace-editor__field--content">
          <span className="workspace-editor__label">Descripción</span>
          <textarea
            className="workspace-editor__textarea"
            value={descripcion}
            onChange={(event) => setDescripcion(event.target.value)}
            placeholder="Escribí el contenido de tu nota..."
          />
        </label>

        <div className="workspace-editor__actions">
          <button
            className="workspace-screen__button workspace-screen__button--secondary"
            onClick={() => navigate('/home')}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="workspace-screen__button workspace-screen__button--primary"
            disabled={!hasUnsavedChanges || isSaving || saveStatus === 'saved'}
            type="submit"
          >
            {getSaveButtonText()}
          </button>
        </div>
      </form>

      {isCollaboratorsModalOpen && (
        <div className="collaborators-modal" role="dialog" aria-modal="true" aria-labelledby="collaborators-modal-title">
          <div className="collaborators-modal__content">
            <div className="collaborators-modal__header">
              <h2 className="collaborators-modal__title" id="collaborators-modal-title">
                Colaboradores
              </h2>
              <button
                className="collaborators-modal__close-button"
                onClick={() => setIsCollaboratorsModalOpen(false)}
                type="button"
                aria-label="Cerrar modal"
              >
                ×
              </button>
            </div>

            <section className="collaborators-modal__section">
              <h3 className="collaborators-modal__subtitle">Colaboradores actuales</h3>
              <div className="collaborators-modal__member-list">
                <div className="collaborators-modal__member-card">
                  <div className="collaborators-modal__avatar">
                    {(userData?.nombre || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <strong>{userData?.nombre || 'Usuario actual'}</strong>
                    <span>{getRoleLabel(selectedWorkspace.member_rol)}</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="collaborators-modal__section collaborators-modal__section--invite">
              <h3 className="collaborators-modal__subtitle">Invitar un nuevo colaborador</h3>
              <form className="collaborators-modal__form" onSubmit={handleCollaboratorSubmit}>
                <label className="collaborators-modal__label" htmlFor="collaborator-email">
                  Correo electrónico
                </label>
                <input
                  className="collaborators-modal__input"
                  id="collaborator-email"
                  type="email"
                  value={collaboratorEmail}
                  onChange={(event) => setCollaboratorEmail(event.target.value)}
                  placeholder="correo@ejemplo.com"
                />
                <button className="workspace-screen__button workspace-screen__button--primary" type="submit">
                  Enviar invitación
                </button>
              </form>
            </section>
          </div>
        </div>
      )}
    </div>
  )
}


/* import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { AuthContext } from '../../context/AuthContext'
import { WorkspacesContext } from '../../context/WorkspacesContext'
import './WorkspaceScreen.css'

export const WorkspaceScreen = () => {
  const { workspace_id } = useParams()
  const navigate = useNavigate()
  const { userData } = useContext(AuthContext)
  const {
    workspaces,
    loading,
    error,
    actionError,
    updateWorkspaceById,
    refetch
  } = useContext(WorkspacesContext)

  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [initialNombre, setInitialNombre] = useState('')
  const [initialDescripcion, setInitialDescripcion] = useState('')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackType, setFeedbackType] = useState('info')
  const [saveStatus, setSaveStatus] = useState('idle')
  const [lastSavedAt, setLastSavedAt] = useState(null)
  const [isCollaboratorsModalOpen, setIsCollaboratorsModalOpen] = useState(false)
  const [collaboratorEmail, setCollaboratorEmail] = useState('')
  const savedFeedbackTimeout = useRef(null)

  const selectedWorkspace = useMemo(() => {
    return workspaces.find((membership) => membership.workspace_id === workspace_id)
  }, [workspaces, workspace_id])

  useEffect(() => {
    if (selectedWorkspace) {
      const currentNombre = selectedWorkspace.workspace_nombre || ''
      const currentDescripcion = selectedWorkspace.workspace_descripcion || ''

      setNombre(currentNombre)
      setDescripcion(currentDescripcion)
      setInitialNombre(currentNombre)
      setInitialDescripcion(currentDescripcion)
    }
  }, [selectedWorkspace])

  useEffect(() => {
    return () => {
      if (savedFeedbackTimeout.current) {
        clearTimeout(savedFeedbackTimeout.current)
      }
    }
  }, [])

  const hasUnsavedChanges = nombre !== initialNombre || descripcion !== initialDescripcion
  const isSaving = saveStatus === 'saving'

  function getRoleLabel(role) {
    return role === 'dueño' || role === 'owner' ? 'Dueño' : 'Colaborador'
  }

  function formatDateTime(date) {
    if (!date) {
      return 'Sin fecha disponible'
    }

    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  function getSaveButtonText() {
    if (saveStatus === 'saving') {
      return 'Guardando...'
    }

    if (saveStatus === 'saved') {
      return 'Cambios guardados'
    }

    return 'Guardar cambios'
  }

  async function handleSaveWorkspace(event) {
    event.preventDefault()

    if (!hasUnsavedChanges || isSaving) {
      return
    }

    try {
      setFeedbackMessage('')
      setFeedbackType('info')
      setSaveStatus('saving')

      const response = await updateWorkspaceById(workspace_id, {
        nombre,
        descripcion
      })

      const updatedWorkspace = response?.data?.workspace
      const savedNombre = updatedWorkspace?.nombre || 'Nota'
      const savedDescripcion = updatedWorkspace?.descripcion || ''

      setNombre(savedNombre)
      setDescripcion(savedDescripcion)
      setInitialNombre(savedNombre)
      setInitialDescripcion(savedDescripcion)
      setLastSavedAt(new Date())
      setFeedbackType('success')
      setFeedbackMessage('Nota actualizada con éxito.')
      setSaveStatus('saved')

      if (savedFeedbackTimeout.current) {
        clearTimeout(savedFeedbackTimeout.current)
      }

      savedFeedbackTimeout.current = setTimeout(() => {
        setSaveStatus('idle')
      }, 1500)
    } catch (error) {
      setFeedbackType('error')
      setFeedbackMessage(error.message || 'No se pudo guardar la nota. Revisá los datos e intentá nuevamente.')
      setSaveStatus('idle')
    }
  }

  function handleCollaboratorSubmit(event) {
    event.preventDefault()
    setFeedbackType('info')
    setFeedbackMessage('La invitación de colaboradores se implementará en la próxima etapa.')
    setCollaboratorEmail('')
    setIsCollaboratorsModalOpen(false)
  }

  if (loading) {
    return (
      <div className="workspace-screen">
        <div className="workspace-screen__state">
          <div className="spinner"></div>
          <p>Cargando nota...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="workspace-screen">
        <div className="workspace-screen__state workspace-screen__state--error">
          <p>⚠️ Error: {error}</p>
          <button className="workspace-screen__button workspace-screen__button--primary" onClick={refetch}>
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!selectedWorkspace) {
    return (
      <div className="workspace-screen">
        <div className="workspace-screen__state">
          <p>No encontramos la nota solicitada.</p>
          <button className="workspace-screen__button workspace-screen__button--primary" onClick={() => navigate('/home')}>
            Volver al Home
          </button>
        </div>
      </div>
    )
  }

  const modificationDate = lastSavedAt || selectedWorkspace.workspace_fecha_creacion

  return (
    <div className="workspace-screen">
      <header className="workspace-screen__header">
        <div className="workspace-screen__title-group">
          <button
            className="workspace-screen__button workspace-screen__button--secondary"
            onClick={() => navigate('/home')}
            type="button"
          >
            ← Volver al Home
          </button>
          <div>
            <span className="workspace-screen__eyebrow">Editor de nota</span>
            <h1 className="workspace-screen__title">{nombre.trim() || 'Nota'}</h1>
            <p className="workspace-screen__date">
              Última modificación: {formatDateTime(modificationDate)}
            </p>
          </div>
        </div>

        <button
          className="workspace-screen__collaborators-button"
          onClick={() => setIsCollaboratorsModalOpen(true)}
          type="button"
          aria-label="Gestionar colaboradores"
        >
          👥
        </button>
      </header>

      {(feedbackMessage || actionError) && (
        <div className={`workspace-screen__feedback workspace-screen__feedback--${feedbackType}`} role="alert">
          {feedbackMessage || actionError}
        </div>
      )}

      <form className="workspace-editor" onSubmit={handleSaveWorkspace}>
        <label className="workspace-editor__field">
          <span className="workspace-editor__label">Nombre de la nota</span>
          <input
            className="workspace-editor__input"
            type="text"
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            placeholder="Nota"
          />
        </label>

        <label className="workspace-editor__field workspace-editor__field--content">
          <span className="workspace-editor__label">Descripción</span>
          <textarea
            className="workspace-editor__textarea"
            value={descripcion}
            onChange={(event) => setDescripcion(event.target.value)}
            placeholder="Escribí el contenido de tu nota..."
          />
        </label>

        <div className="workspace-editor__actions">
          <button
            className="workspace-screen__button workspace-screen__button--secondary"
            onClick={() => navigate('/home')}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="workspace-screen__button workspace-screen__button--primary"
            disabled={!hasUnsavedChanges || isSaving || saveStatus === 'saved'}
            type="submit"
          >
            {getSaveButtonText()}
          </button>
        </div>
      </form>

      {isCollaboratorsModalOpen && (
        <div className="collaborators-modal" role="dialog" aria-modal="true" aria-labelledby="collaborators-modal-title">
          <div className="collaborators-modal__content">
            <div className="collaborators-modal__header">
              <h2 className="collaborators-modal__title" id="collaborators-modal-title">
                Colaboradores
              </h2>
              <button
                className="collaborators-modal__close-button"
                onClick={() => setIsCollaboratorsModalOpen(false)}
                type="button"
                aria-label="Cerrar modal"
              >
                ×
              </button>
            </div>

            <section className="collaborators-modal__section">
              <h3 className="collaborators-modal__subtitle">Colaboradores actuales</h3>
              <div className="collaborators-modal__member-list">
                <div className="collaborators-modal__member-card">
                  <div className="collaborators-modal__avatar">
                    {(userData?.nombre || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <strong>{userData?.nombre || 'Usuario actual'}</strong>
                    <span>{getRoleLabel(selectedWorkspace.member_rol)}</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="collaborators-modal__section collaborators-modal__section--invite">
              <h3 className="collaborators-modal__subtitle">Invitar un nuevo colaborador</h3>
              <form className="collaborators-modal__form" onSubmit={handleCollaboratorSubmit}>
                <label className="collaborators-modal__label" htmlFor="collaborator-email">
                  Correo electrónico
                </label>
                <input
                  className="collaborators-modal__input"
                  id="collaborator-email"
                  type="email"
                  value={collaboratorEmail}
                  onChange={(event) => setCollaboratorEmail(event.target.value)}
                  placeholder="correo@ejemplo.com"
                />
                <button className="workspace-screen__button workspace-screen__button--primary" type="submit">
                  Enviar invitación
                </button>
              </form>
            </section>
          </div>
        </div>
      )}
    </div>
  )
}
 */ 