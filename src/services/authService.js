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