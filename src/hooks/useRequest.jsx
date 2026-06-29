/* Manejar consultas al servidor */

import { useState } from "react"

function useRequest() {
    const [loading, setLoading] = useState(false)
    const [response, setResponse] = useState(null)
    const [error, setError] = useState(null)

    /*requestCallbackFn es el parámetro de la función que hace la llamada al servidor.
    Es una callback → es una función pasada por parámetro. POR EJEMPLO, login*/

    async function sendRequest(requestCallbackFn) {
        try {
            setLoading(true)
            //limpiamos errores previos
            setError(null)
            const server_response = await requestCallbackFn()
            setResponse(server_response)

        } catch (error) {
            setError(error.message)

        }
        finally {
            setLoading(false)

        }



    }
    return {
        sendRequest,
        loading,
        response,
        error
    }
}

export default useRequest
