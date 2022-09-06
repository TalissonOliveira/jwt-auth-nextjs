import type { NextPage } from 'next'
import { useContext } from 'react'
import { Can } from '../components/Can'
import { AuthContext } from '../contexts/AuthContext'
import { useCan } from '../hooks/useCan'
import { setupAPIClient } from '../services/api'
import { withSSRAuth } from '../utils/withSSRAuth'

const Dashboard: NextPage = () => {
  const { user } = useContext(AuthContext)

  const userCanSeeMetrics = useCan({
    permissions: ['metrics.list'],
    roles: ['administrator', 'editor']
  })

  return (
    <main>
      <h1>Dashboard</h1>
      <p>{user?.email}</p>

      {userCanSeeMetrics && <div>Métricas</div>}

      <Can
        permissions={['users.list']}
        roles={['editor']}
      >
        <div>Usuários</div>
      </Can>
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
