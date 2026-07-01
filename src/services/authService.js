import ENVIRONMENT from "../config/environment"

export async function login (email, password){
    /* try{ */
        const response_http = await fetch(
            ENVIRONMENT.URL_API + '/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': "application/json"
                },
                body: JSON.stringify(
                    {
                        email: email,
                        password: password
                    }
                )
            }
        )
        const response = await response_http.json()
        if(!response.ok){
            throw new Error(response.message)

        }
        return response
    }
    /* catch(error){
        throw new Error("Error al hacer el login")
    } 
}*/

export async function register (username, email, password){
   /*  try{ */
        const response_http = await fetch(
            ENVIRONMENT.URL_API + '/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': "application/json"
                },
                body: JSON.stringify(
                    {
                        username:username,
                        email: email,
                        password: password
                    }
                )
            }
        )
        const response = await response_http.json()
        if(!response.ok){
            throw new Error(response.message)

        }
        return response
    }

    /* catch(error){
        throw new Error("Error al hacer el registro")
    }
} */

   /*  //PARA REESTABLECIMIENTO DE PASSWORD (MODIF 30/6/26 - 20.09 HS)

    export const requestPasswordReset = async (email) => {

    const response_http = await fetch(
        'http://localhost:8080/api/auth/reset-password-request',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        }
    )

    const response = await response_http.json()

    if (!response_http.ok) {
        throw new Error(response.message)
    }

    return response
}

//ESTA FUNCION ES PARA LA PASSWORD RESET
export const resetPasswordConfirm = async (token, newPassword) => {
    const response_http = await fetch(
        'http://localhost:8080/api/auth/reset-password',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ newPassword })
        }
    )

    const response = await response_http.json()

    if (!response_http.ok) {
        throw new Error(response.message)
    }

    return response
}
 */
