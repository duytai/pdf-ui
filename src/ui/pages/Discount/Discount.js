import React, { Component } from 'react'
import { compose, withState, withHandlers } from 'recompose'
import { Container, Table, Input } from 'reactstrap'
import { Query } from 'react-apollo'
import moment from 'moment'
import gql from 'graphql-tag'
import update from 'immutability-helper'
import ReactPaginate from 'react-paginate'

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
    const {
      discountKeyword,
      updateDiscountKeyword,
      discountQuery,
      handlePageChange,
    } = this.props
    const { skip, limit } = discountQuery
    return (
      <Container style={{paddingTop: 30}}>
        <Input 
          value={discountKeyword} 
          onChange={e => updateDiscountKeyword(e.target.value)}
        />
        <Query 
          query={DISCOUNTS}
          variables={update(discountQuery, {
            filter: {
              code_startsWith: {
                $set: discountKeyword,
              },
            },
          })}
        >
          {
            ({ loading, error, data }) => {
              if (loading) return <p className='text-center'>Loading</p>
              if (error) return <p className='text-center'>{ error.message }</p>
              const { discounts: { totalCount, discounts } } = data
              return (
                <div>
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
              )
            }
          }
        </Query>
      </Container>
    )
  }
}

export default compose(
  withState('discountKeyword', 'updateDiscountKeyword', ''),
  withState('discountQuery', 'updateDiscountQuery', {
    skip: 0,
    limit: 2,
    filter: {
      code_startsWith: '',
    },
  }),
  withHandlers({
    handlePageChange: ({ discountQuery, updateDiscountQuery }) => ({ selected: pageIndex }) => {
      const { limit, filter } = discountQuery 
      const skip = pageIndex * limit 
      updateDiscountQuery({
        skip,
        limit,
        filter,
      })
    }
  })
)(Discount)
