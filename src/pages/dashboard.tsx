import type { NextPage } from 'next'
import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { setupAPIClient } from '../services/api'
import { withSSRAuth } from '../utils/withSSRAuth'

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

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx)
  const response = await apiClient.get('/me')
  console.log(response.data)

  return {
    props: {}
  }
})
