import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import useForm from '../../hooks/useForm'
import { login } from '../../services/authService'
import useRequest from '../../hooks/useRequest'

export const LoginScreen = () => {

    const navigate = useNavigate()

   /*  const [searchParams, setSearchParams] = useSearchParams()
    alert(searchParams.get('test')) */

    const {sendRequest: sendRequestLogin, 
        loading: loginRequestLoading,  
        error: loginRequestError, 
        response: loginRequestResponse
    }= useRequest()

    const initial_form_state = {
        email: '',
        password: ''
    }

    function onSubmit (formData){
        console.log("un usuario intento iniciar sesion", formData)
        sendRequestLogin(
        () => login(formData.email, formData.password)
        )
    }

    console.log(
        {
            loginRequestLoading,
            loginRequestError,
            loginRequestResponse
        }
    )

    /* El useEffect controla la ejecución de una funcionalidad. Si los estados
    controlan cuánto se recarga un componente, los efectos controlan cuántas 
    veces se recarga una función. ¿Qué función? → () => {}   */
    useEffect(
        () => {
            console.log('Se ejecutó el efecto')
            //si el login fue exitoso, 
            if(loginRequestResponse?.ok){
                console.log('Login exitoso')
                localStorage.setItem(
                    'auth_token',
                    loginRequestResponse?.data?.access_token

                )
                navigate('/home')
            }
        },
    [
        loginRequestResponse //nos interesa que el efecto se ejecute CADA VEZ que cambie nuestro estado de respuesta, ya que ahora la respuesta puede ser exitosa 
    ]
    )


    
    const {formState, handleChange, handleSubmit} = useForm(initial_form_state, onSubmit)


    return (
        <div>
            <h1>Iniciar sesion</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input id='email' name='email' type='email' value={formState.email} onChange={handleChange}/>
                </div>
                <div>
                    <label htmlFor="password">Contraseña:</label>
                    <input id='password' name='password' type='password' value={formState.password} onChange={handleChange}/>
                </div>

                <button disabled={loginRequestLoading || loginRequestResponse?.ok}>
                    {
                        loginRequestLoading
                        ? 'Iniciando sesión...'
                        : 'Iniciar sesión'
                    }
                    </button>
                    {
                        loginRequestError && !loginRequestLoading &&
                        <>
                        <br />
                        <span style={{color:'red'}}> Error: {loginRequestError}</span>
                        </>      
                    }
            </form>
            <p>Si no tienes cuenta <Link to={'/register'}>Registrate</Link></p>
        </div>
    )
}