import type { NextPage } from 'next'
import { FormEvent, useState } from 'react'

import styles from './styles.module.scss'

const Home: NextPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const data = {
      email,
      password
    }

    console.log(data)
  }

  return (
    <main className={styles.container}>
      <h1>Welcome back</h1>
      <p>login to your account</p>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          placeholder="Email"
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          value={password}
          placeholder="Password"
          onChange={e => setPassword(e.target.value)}
          required
        />

        <button type="submit">
          Entrar
        </button>
      </form>
    </main>
  )
}

export default Home
