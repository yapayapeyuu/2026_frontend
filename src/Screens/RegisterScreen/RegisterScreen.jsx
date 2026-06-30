import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import useForm from '../../hooks/useForm'
import { register } from '../../services/authService'
import useRequest from '../../hooks/useRequest'
//import { AuthContext } from '../../context/AuthContext'

export const RegisterScreen = () => {
   // const { register: syncroRegister } = useContext(AuthContext)
    const navigate = useNavigate()

   /*  const [searchParams, setSearchParams] = useSearchParams()
    alert(searchParams.get('test')) */

    const {
        sendRequest: sendRequestRegister, 
        loading: registerRequestLoading,
        error: registerRequestError, 
        response: registerRequestResponse
    } = useRequest()
    
    const initial_form_state = {
        username: '',
        email: '',
        password: ''
    }

    function onSubmit (formData){
        console.log("un usuario intentó registrarse", formData)
        sendRequestRegister(
            () => register(formData.username, formData.email, formData.password)
        )

    }

    console.log(
        {
            registerRequestLoading,
            registerRequestError,
            registerRequestResponse
        }
    )

    /* El useEffect controla la ejecución de una funcionalidad. Si los estados
    controlan cuánto se recarga un componente, los efectos controlan cuántas 
    veces se recarga una función. ¿Qué función? → () => {}   */
    useEffect(
        () => {
            if (registerRequestResponse?.ok) {
                setTimeout(() => {
                    navigate('/login')
                }, 2500)
            }
        },
        [registerRequestResponse, navigate]
    )
 
    const {formState, handleChange, handleSubmit} = useForm(initial_form_state, onSubmit)

    return (
        <div>
            <h1>Registrarse</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username">Nombre de usuario:</label>
                    <input id='username' type='text' name='username' value={formState.username} onChange={handleChange}/>
                </div>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input id='email' name='email' type='email' value={formState.email} onChange={handleChange}/>
                </div>
                <div>
                    <label htmlFor="password">Contraseña:</label>
                    <input id='password' name='password' type='password' value={formState.password} onChange={handleChange}/>
                </div>

                <button disabled={registerRequestLoading || registerRequestResponse?.ok}>
                    {
                        registerRequestLoading 
                        ? 'Registrando usuario...'
                        : 'Registrarme'
                    }
                </button>
                {
                   registerRequestError && !registerRequestLoading &&
                    <>
                        <br/>
                        <span style={{color: 'red'}}>Error: {registerRequestError}</span>
                    </>
                }
                {
                    registerRequestResponse?.ok &&
                    <>
                        <br />
                        <span style={{ color: 'green' }}>
                            Revisá tu email para verificar la cuenta.
                        </span>
                    </>
                }

                <p>Si ya tienes cuenta <Link to={'/login'}>Iniciar sesión</Link></p>
            </form>
        </div>
    )
}