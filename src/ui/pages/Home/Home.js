import React, { PureComponent } from 'react'
import { Query } from 'react-apollo'
import moment from 'moment'
import gql from 'graphql-tag'
import { Container, Table } from 'reactstrap'
import ReactPaginate from 'react-paginate'
import { compose, withHandlers, withState } from 'recompose'
import Select from 'react-select'
import 'react-select/dist/react-select.css'
import './Home.css'

const ORDERS = gql `
  query orders($filter: OrderFilter!, $skip: Int, $limit: Int) {
    orders(filter: $filter, skip: $skip, limit: $limit) {
      totalCount
      orders {
        id
        status
        createdAt
      }
    }
  }
`  
class Home extends PureComponent {
  render() {
    const { handlePageChange, orderQuery } = this.props
    const { skip, limit } = orderQuery
    const statusOptions = [
      'NEW',
      'ORDERED',
      'PAIDED',
      'PRINTED',
      'DELIVERED',
      'DONE',
    ]
    return (
      <Container>
        <Query 
          query={ORDERS}
          variables={orderQuery}
        >
          {
            ({ loading, error, data }) => {
              if (error) return <p>{ error }</p>
              if (loading) return <p>Loading</p>
              const { orders: { orders, totalCount } } = data
              return (
                <div>
                  <Table size="sm">
                    <thead>
                      <tr>
                        <th>Index</th>
                        <th>Order Code</th>
                        <th>Status</th>
                        <th>Created At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        orders.map((order, index) => {
                          const { id, status, createdAt } = order
                          const orderCode = id.split('-')[0].toUpperCase()
                          return (
                            <tr key={id}>
                              <td>{ skip + index + 1 }</td>
                              <td>{ orderCode }</td>
                              <td>
                                <Select
                                  value={status}
                                  onChange={() => {}}
                                  options={statusOptions.map(value => ({ 
                                    label: value, 
                                    value, 
                                  }))}
                                  clearable={false}
                                />
                              </td>
                              <td>{ moment(createdAt).format('DD/MM/YYYY') }</td>
                            </tr>
                          )
                        })
                      }
                    </tbody>
                  </Table>
                  <div>
                    <ReactPaginate 
                      pageCount={totalCount/10}
                      pageRangeDisplayed={10}
                      initialPage={skip/limit}
                      marginPagesDisplayed={3}
                      containerClassName={'pagination'}
                      subContainerClassName={'pages pagination'}
                      activeClassName={'active'}
                      breakClassName={'break-me'}
                      onPageChange={handlePageChange}
                    />
                  </div>
                </div>
              )
            }
          }
        </Query>
      </Container>
    )
  }
}

export default compose(
  withState('orderQuery', 'updateOrderQuery', {
    skip: 0,
    limit: 10,
    filter: {},
  }),
  withHandlers({
    handlePageChange: ({ updateOrderQuery, orderQuery }) => 
    ({ selected: pageIndex }) => {
      const { limit, filter } = orderQuery
      const skip = pageIndex * limit 
      updateOrderQuery({
        skip,
        limit,
        filter,
      })
    }
  })
)(Home)
