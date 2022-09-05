import axios, { AxiosError } from 'axios'
import { GetServerSidePropsContext } from 'next'
import { parseCookies, setCookie } from 'nookies'
import { signOut } from '../contexts/AuthContext'

interface AxiosErrorResponse {
  code?: string;
}

interface failedRequestsQueueData {
  onSuccess: (token: string) => void
  onFailure: (err: AxiosError) => void
}

let isRefreshing = false
let failedRequestsQueue: failedRequestsQueueData[] = []

// cria função para poder receber o contexto e conseguir ser utilizada no server-side (os cookies precisam do ctx no server-side)
export function setupAPIClient(ctx: GetServerSidePropsContext | undefined  = undefined) {
  let cookies = parseCookies(ctx)

  const api = axios.create({
    baseURL: 'http://localhost:3333/',
    headers: {
      Authorization: `Bearer ${cookies['nextauth.token']}`
    }
  })

  api.interceptors.response.use(response => {
    return response
  }, (error: AxiosError<AxiosErrorResponse>) => {
    if (error.response?.status === 401) {
      if (error.response?.data?.code === 'token.expired') { // verifica se é erro de autorização e se a mensagem do erro é de token expirado
        cookies = parseCookies(ctx) // pega as informações dos cookies mais atualizadas

        const { 'nextauth.refreshToken': refreshToken } = cookies
        const originalConfig = error.config // toda configuração da requisição que foi feita (tudo que é preciso para repetir a req)

        // verifica se já está realizando refresh do token para impedir que faça um refresh para cada requisição
        if (!isRefreshing) {
          isRefreshing = true

          api.post('/refresh', {
            refreshToken
          }).then(response => {
            const { token } = response.data

            // salva nos cookies os novos tokens
            setCookie(ctx, 'nextauth.token', token, {
              maxAge: 60 * 60 * 24 * 30, // 30 days
              path: '/'
            })

            setCookie(ctx, 'nextauth.refreshToken', response.data.refreshToken, {
              maxAge: 60 * 60 * 24 * 30, // 30 days
              path: '/'
            })

            // define nos headers padrões do axios o novo token
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`

            // após ter feito o refresh do token, refaz todas as requisições que estavam na fila
            failedRequestsQueue.forEach(request => request.onSuccess(token))
            // limpa a fila de requisições
            failedRequestsQueue = []
          }).catch(err => {
            // se der erro no refresh do token, refaz todas as requisições que estavam na fila, passando o erro
            failedRequestsQueue.forEach(request => request.onFailure(err))
            failedRequestsQueue = []

            if (typeof window !== 'undefined') {
              signOut()
            }
          }).finally(() => {
            isRefreshing = false // ao finalizar o refresh do token, muda a variável para false
          })
        }

        //cria uma nova promise, pois o axios não suporta async/await no interceptor
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            // o que vai acontecer quando o processo de refresh token finalizar
            onSuccess: (token: string) => { // recebe o token atualizado
              if (!originalConfig.headers) return
              // atualiza o token da requisição
              originalConfig.headers['Authorization'] = `Bearer ${token}`
              // refaz a requisição, já com o token atualizado
              resolve(api(originalConfig)) // utiliza o resolve para aguardar finalizar, pois o axios não permite utilizar async/await no interceptor
            },
            // o que acontece com a requisição caso o processo de refresh token falhar
            onFailure: (err: AxiosError) => {
              reject(err)
            }
          })
        })
      } else {
        if (typeof window !== 'undefined') {
          signOut()
        }
      }
    }

    return Promise.reject(error)
  })

  return api
}