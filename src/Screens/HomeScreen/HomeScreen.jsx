import React, { useContext, useMemo, useState } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { WorkspacesContext } from '../../context/WorkspacesContext'
import { useNavigate } from 'react-router'
import './HomeScreen.css'

export const HomeScreen = () => {
  const { logout, userData } = useContext(AuthContext)
  const {
    workspaces,
    loading,
    error,
    actionLoading,
    actionError,
    refetch,
    createNewWorkspace,
    deleteWorkspaceById
  } = useContext(WorkspacesContext)
  const [search, setSearch] = useState('')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  async function handleCreateWorkspace() {
    try {
      setFeedbackMessage('')
      await createNewWorkspace()
    } catch (error) {
      setFeedbackMessage(error.message)
    }
  }

  async function handleDeleteWorkspace(event, membership) {
    event.stopPropagation()

    if (membership.member_rol !== 'dueño') {
      setFeedbackMessage('No tenés permisos para eliminar esta nota.')
      return
    }

    try {
      setFeedbackMessage('')
      await deleteWorkspaceById(membership.workspace_id)
    } catch (error) {
      setFeedbackMessage(error.message)
    }
  }

  function getRoleLabel(role) {
    return role === 'dueño' || role === 'owner' ? 'Dueño' : 'Colaborador'
  }

  function formatDate(date) {
    if (!date) {
      return 'Sin fecha'
    }

    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date))
  }

  const filteredWorkspaces = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    if (!normalizedSearch) {
      return workspaces
    }

    return workspaces.filter((membership) => {
      const nombre = membership.workspace_nombre || ''
      const descripcion = membership.workspace_descripcion || ''

      return (
        nombre.toLowerCase().includes(normalizedSearch) ||
        descripcion.toLowerCase().includes(normalizedSearch)
      )
    })
  }, [search, workspaces])

  if (!userData) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Cargando perfil de usuario...</p>
      </div>
    )
  }


  return (
    <div className="home-container">
      <header className="home-header">
        <div className="user-profile">
          <span className="avatar">{userData.nombre.charAt(0).toUpperCase()}</span>
          <h2>Bienvenido, <strong>{userData.nombre}</strong></h2>
        </div>
        <button className="btn-primary" onClick={handleLogout}>Cerrar sesión</button>
      </header>

      <section className="home-search" aria-label="Buscador de notas">
        <input
          className="home-search__input"
          type="search"
          placeholder="Buscar notas por título o contenido..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </section>

      <main className="home-main">
        <div className="section-title-container">
          <h3>Mis Notas</h3>
          <button
            className="btn-create-workspace btn-primary"
            onClick={handleCreateWorkspace}
            disabled={actionLoading}
          >
            {actionLoading ? 'Creando...' : '+ Nueva nota'}
          </button>
        </div>

        {(feedbackMessage || actionError) && (
          <div className="home-feedback" role="alert">
            {feedbackMessage || actionError}
          </div>
        )}

        {/* Estado de carga */}
        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando tus notas...</p>
          </div>
        )}

        {/* Estado de error */}
        {error && (
          <div className="error-state">
            <p>⚠️ Error: {error}</p>
            <button className="btn-retry" onClick={refetch}>Reintentar</button>
          </div>
        )}

        {/* Estado de éxito */}
        {!loading && !error && (
          <>
            {workspaces.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <h4>Todavía no tenés ninguna nota.</h4>
                <p>Escribí tu primera nota para comenzar.</p>
              </div>
            ) : filteredWorkspaces.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔎</div>
                <h4>No encontramos notas con esa búsqueda.</h4>
                <p>Probá con otra palabra clave.</p>
              </div>
            ) : (
              <div className="workspaces-grid">
                {filteredWorkspaces.map((membership) => {
                  const workspaceTitle = membership.workspace_nombre || 'Nota'
                  const workspaceDescription = membership.workspace_descripcion || 'Sin descripción'

                  return (
                    <div
                      key={membership.member_id}
                      className="workspace-card"
                      onClick={() => navigate(`/workspace/${membership.workspace_id}`)}
                    >
                      <div className="workspace-card-icon">
                        {workspaceTitle.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="workspace-card-info">
                        <h4>{workspaceTitle}</h4>
                        <p>{workspaceDescription}</p>
                        <span className={`role-badge role-${membership.member_rol}`}>
                          {getRoleLabel(membership.member_rol)}
                        </span>
                        <span className="workspace-card__date">
                          Creada el {formatDate(membership.workspace_fecha_creacion)}
                        </span>
                      </div>
                      <button
                        className="workspace-card__delete-button"
                        onClick={(event) => handleDeleteWorkspace(event, membership)}
                        disabled={actionLoading}
                        type="button"
                      >
                        Eliminar
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}







/* import React, { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { WorkspacesContext } from '../../context/WorkspacesContext'
import { useNavigate } from 'react-router'
import './HomeScreen.css'

export const HomeScreen = () => {
  const { logout, userData } = useContext(AuthContext)
  const { workspaces, loading, error, refetch } = useContext(WorkspacesContext)
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  if (!userData) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Cargando perfil de usuario...</p>
      </div>
    )
  }


  return (
    <div className="home-container">
      <header className="home-header">
        <div className="user-profile">
          <span className="avatar">{userData.nombre.charAt(0).toUpperCase()}</span>
          <h2>Bienvenido, <strong>{userData.nombre}</strong></h2>
        </div>
        <button className="btn-logout" onClick={handleLogout}>Cerrar sesión</button>
      </header>

      <main className="home-main">
        <div className="section-title-container">
          <h3>Tus Espacios de Trabajo</h3>
          <button className="btn-create-workspace" onClick={() => navigate('/workspace/new')}>
            + Nuevo Espacio
          </button>
        </div> */

       // {/* Estado de carga */}
       /*  {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando tus espacios de trabajo...</p>
          </div>
        )}

        {/* Estado de error *///}
    /*     {error && (
          <div className="error-state">
            <p>⚠️ Error: {error}</p>
            <button className="btn-retry" onClick={refetch}>Reintentar</button>
          </div>
        )} */

       // {/* Estado de éxito */}
  /*       {!loading && !error && (
          <>
            {workspaces.length === 0 ? (
              // Empty State (Sin workspaces)
              <div className="empty-state">
                <div className="empty-icon">📂</div>
                <h4>No perteneces a ningún espacio de trabajo</h4>
                <p>Crea tu primer espacio para empezar a colaborar con tu equipo.</p>
                <button className="btn-primary" onClick={() => navigate('/workspace/new')}>
                  Crear un espacio de trabajo
                </button>
              </div>
            ) : ( */
              // Listado de workspaces
           /*    <div className="workspaces-grid">
                {workspaces.map((membership) => {
                  console.log({ membership })

                  return (
                    <div
                      key={membership.member_id}
                      className="workspace-card"
                      onClick={() => navigate(`/workspace/${membership.workspace_id}`)}
                    >
                      <div className="workspace-card-icon">
                        {membership.workspace_nombre ? membership.workspace_nombre.substring(0, 2).toUpperCase() : 'WS'}
                      </div>
                      <div className="workspace-card-info">
                        <h4>{membership.workspace_nombre}</h4>
                        <p>{membership.workspace_descripcion || 'Sin descripción'}</p>
                        <span className={`role-badge role-${membership.member_rol}`}>
                          {membership.member_rol}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}  */