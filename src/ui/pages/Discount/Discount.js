import React, { Component } from 'react'
import { compose } from 'recompose'
import { Container, Table } from 'reactstrap'
import { Query } from 'react-apollo'
import moment from 'moment'
import gql from 'graphql-tag'

const DISCOUNTS = gql `
  query discounts($filter: DiscountFilter!, $skip: Int, $limit: Int) {
    discounts(filter: $filter, skip: $skip, limit: $limit) {
      totalCount
      discounts {
        id
        code
        amount
        percent
        products
        totalCount
        beginAt
        endAt
        isValid
        createdAt
      }
    }
  }
` 
class Discount extends Component {
  render() {
    return (
      <Container style={{paddingTop: 30}}>
        <Query 
          query={DISCOUNTS}
          variables={{
            filter: {
              code_startsWith: '',
            },
            skip: 0,
            limit: 10,
          }}
        >
          {
            ({ loading, error, data }) => {
              if (loading) return <p className='text-center'>Loading</p>
              if (error) return <p className='text-center'>{ error.message }</p>
              const { discounts: { totalCount, discounts } } = data
              return (
                <Table size="sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Code</th>
                      <th>Amount</th>
                      <th>Percent</th>
                      <th>IsValid</th>
                      <th>Begin At</th>
                      <th>End At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      discounts.map(({ code, amount, percent, isValid, beginAt, endAt }, index) => (
                        <tr key={index}>
                          <th scope="row">{index + 1}</th>
                          <td>{ code.toUpperCase() }</td>
                          <td>{ amount }</td>
                          <td>{ percent }%</td>
                          <td style={{
                            backgroundColor: isValid ? 'rgba(0,123,255,.25)' : 'grey' 
                          }}>{ isValid ? 'TRUE' : 'FALSE' }</td>
                          <td style={{ 
                            backgroundColor: beginAt < Date.now() ? 'rgba(0,123,255,.25)' : 'grey' 
                          }}>{ moment(beginAt).format('DD/MM/YYYY') }</td>
                          <td style={{ 
                            backgroundColor: endAt > Date.now() ? 'rgba(0,123,255,.25)' : 'grey' 
                          }}>{ moment(endAt).format('DD/MM/YYYY') }</td>
                        </tr>
                      ))
                    }
                  </tbody>
                </Table>
              )
            }
          }
        </Query>
      </Container>
    )
  }
}

export default compose(
)(Discount)
