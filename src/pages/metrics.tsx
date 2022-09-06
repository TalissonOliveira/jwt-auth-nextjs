import type { NextPage } from 'next'
import { withSSRAuth } from '../utils/withSSRAuth'

const Metrics: NextPage = () => {
  return (
    <main>
      <h1>Metrics</h1>
    </main>
  )
}

export default Metrics

export const getServerSideProps = withSSRAuth(async (ctx) => {
  return {
    props: {}
  }
}, {
  permissions: ['metrics.list'],
  roles: ['administrator']
})
