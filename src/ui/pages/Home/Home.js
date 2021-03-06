import React, { PureComponent } from 'react'
import { Query, Mutation } from 'react-apollo'
import moment from 'moment'
import gql from 'graphql-tag'
import { Container, Table, Input } from 'reactstrap'
import ReactPaginate from 'react-paginate'
import Select from 'react-select'
import { compose, withHandlers, withState } from 'recompose'
import update from 'immutability-helper'
import 'react-select/dist/react-select.css'
import { Settings } from '../../contexts'
import swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import './Home.css'

const CHANGE_ORDER_STATUS = gql `
  mutation changeOrderStatus($orderId: ID!, $status: OrderStatus!) {
    changeOrderStatus(orderId: $orderId, status: $status) {
      id
      status
      createdAt
    }
  }
`
const ORDERS = gql `
  query orders($filter: OrderFilter!, $skip: Int, $limit: Int) {
    orders(filter: $filter, skip: $skip, limit: $limit) {
      totalCount
      orders {
        id
        cartItems {
          productConfig
        }
        delivery {
          address
          district
          email
          name
          note
          phone
          ward
        }
        services
        status
        createdAt
      }
    }
  }
`  
class Home extends PureComponent {
  render() {
    const { 
      handlePageChange, 
      orderQuery, 
      handleShowDetails,
      orderKeyword,
      updateOrderKeyword,
    } = this.props
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
      <Container style={{paddingTop: 30}}>
        <Input 
          value={orderKeyword} 
          onChange={e => updateOrderKeyword(e.target.value)}
        />
        <Query 
          query={ORDERS}
          variables={
            update(orderQuery, {
              filter: {
                id_startsWith: {
                  $set: orderKeyword,
                }
              }
            })
          }
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
                        <th>Download</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        orders.map((order, index) => {
                          const { 
                            id, 
                            status, 
                            createdAt, 
                            cartItems, 
                            delivery,
                            services,
                          } = order
                          const orderCode = id.split('-')[0].toUpperCase()
                          return (
                            <tr key={id}>
                              <td>{ skip + index + 1 }</td>
                              <td>{ orderCode }</td>
                              <td>
                                <Mutation
                                  mutation={CHANGE_ORDER_STATUS}
                                  update={(cache, { data: { changeOrderStatus } }) => {
                                    const data = cache.readQuery({
                                      query: ORDERS, 
                                      variables: orderQuery, 
                                    })
                                    cache.writeQuery({
                                      query: ORDERS,
                                      variables: orderQuery,
                                      data: update(data, {
                                        orders: {
                                          orders: {
                                            $apply: orders => {
                                              const { id, status } = changeOrderStatus
                                              return orders.map((order) => {
                                                if (order.id === id) {
                                                  order.status = status
                                                }
                                                return order
                                              })
                                            }
                                          }
                                        }
                                      })
                                    })
                                  }}
                                >
                                  {
                                    (changeOrderStatus) => (
                                      <Select
                                        value={status}
                                        onChange={({ value }) => changeOrderStatus({ 
                                          variables: { 
                                            orderId: id,
                                            status: value,
                                          },
                                        })}
                                        options={statusOptions.map(value => ({ 
                                          label: value, 
                                          value, 
                                        }))}
                                        clearable={false}
                                      />
                                    )
                                  }
                                </Mutation>
                              </td>
                              <td>{ moment(createdAt).format('DD/MM/YYYY') }</td>
                              <Settings.Consumer>
                                {
                                  ({ FILE_SERVER }) => (
                                    <td>
                                      {
                                        cartItems.map(({ productConfig }, index) => (
                                          <a 
                                            target='_blank'
                                            key={index} 
                                            href={`${FILE_SERVER}/${id}_${index}.pdf`}
                                          >{ productConfig.type } | 
                                          </a>
                                        ))
                                      }
                                    </td>
                                  ) 
                                }
                              </Settings.Consumer>
                              <td>
                                <button 
                                  className='btn btn-primary btn-sm'
                                  onClick={() => handleShowDetails(cartItems, delivery, services)}
                                >
                                  Show
                                </button>
                              </td>
                            </tr>
                          )
                        })
                      }
                    </tbody>
                  </Table>
                  <div>
                    <ReactPaginate 
                      pageCount={totalCount/limit}
                      pageRangeDisplayed={limit}
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
  withState('orderKeyword', 'updateOrderKeyword', ''),
  withState('orderQuery', 'updateOrderQuery', {
    skip: 0,
    limit: 5,
    filter: {
      id_startsWith: '',
    },
  }),
  withHandlers({
    handleShowDetails: () => (cartItems, delivery, services) => {
      const cartMessage = cartItems
        .map(({ productConfig: {type, shape, size }}) => `${type} - ${shape} - ${size}`).join('\n')
      const { address, district, email, name, note, phone, ward } = delivery
      const deliveryMessage = `
        Address: ${address} - ${ward} - ${district} 
        Name: ${name}
        Phone: ${phone}
        Email: ${email}
        Note: ${note}
      ` 
      const serviceMessage = services.map(({ service, id }) => {
        if (service === 'facebook') return `http://facebook.com/${id}`
        return `http://instagram.com/${id}`  
      }).join('\n')
      swal('Info', `
        ${cartMessage}
        ${deliveryMessage}
        ${serviceMessage}
      `)
    },
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
