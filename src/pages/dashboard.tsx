import type { NextPage } from 'next'
import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'

import styles from './styles.module.scss'

const Dashboard: NextPage = () => {
  const { user } = useContext(AuthContext)
  return (
    <main>
      <h1>Dashboard</h1>
      <p>{user?.email}</p>
    </main>
  )
}

export default Dashboard
