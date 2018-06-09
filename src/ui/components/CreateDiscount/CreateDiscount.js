import React, { Component } from 'react'
import { compose, withState, withHandlers } from 'recompose'
import {
  Modal,
  ModalFooter,
  ModalBody,
  ModalHeader,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Col,
  Alert,
} from 'reactstrap'
import Select from 'react-select'
import DatePicker from 'react-datepicker'
import moment from 'moment'
import gql from 'graphql-tag'
import { Mutation } from 'react-apollo'
import 'react-select/dist/react-select.css'
import 'react-datepicker/dist/react-datepicker.css'

const CREATE_DISCOUNT = gql `
  mutation createDiscount($input: DiscountInput!) {
    createDiscount(input: $input) {
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
`
class CreateDiscount extends Component {
  render() {
    const { 
      modal, 
      updateModal,
      discount,
      handleDiscountChange,
      handleCreateDiscount,
    } = this.props
    return (
      <div style={{ padding: '10px 0' }}>
        <Button color='primary' onClick={() => updateModal(!modal)}>New Discount</Button>
        <Modal isOpen={modal} toggle={() => updateModal(!modal)}>
          <ModalHeader toggle={() => updateModal(!modal)}>New Discount</ModalHeader>
          <ModalBody>
            <Form>
              <FormGroup row>
                <Label sm={2}>Code</Label>
                <Col sm={10}>
                  <Input 
                    type="text" 
                    value={discount.code} 
                    onChange={e => handleDiscountChange({ code: e.target.value })}
                  />
                </Col>
              </FormGroup>
              <FormGroup row>
                <Label sm={2}>Percent</Label>
                <Col sm={10}>
                  <Input 
                    type="number"
                    value={discount.percent}
                    onChange={e => handleDiscountChange({ percent: e.target.value })}
                  />
                </Col>
              </FormGroup>
              <FormGroup row>
                <Label sm={2}>Amount</Label>
                <Col sm={10}>
                  <Input 
                    type="number"
                    value={discount.amount}
                    onChange={e => handleDiscountChange({ amount: e.target.value })}
                  />
                </Col>
              </FormGroup>
              <FormGroup row>
                <Label sm={2}>Products</Label>
                <Col sm={10}>
                  <Select
                    onChange={(v) => handleDiscountChange({ products: v.map(({ value }) => value) })}
                    options={[
                      { value: 'PHOTO_BOOK', label: 'PHOTO_BOOK' },
                      { value: 'PHOTO_CARD', label: 'PHOTO_CARD' },
                      { value: 'FRAME', label: 'FRAME' },
                      { value: 'CALENDAR', label: 'CALENDAR' },
                    ]}
                    value={discount.products}
                    multi
                  />
                </Col>
              </FormGroup>
              <FormGroup row>
                <Label sm={2}>Total Count</Label>
                <Col sm={10}>
                  <Input 
                    type="number"
                    value={discount.totalCount}
                    onChange={e => handleDiscountChange({ totalCount: e.target.value })}
                  />
                </Col>
              </FormGroup>
              <FormGroup row>
                <Label sm={2}>Begin At</Label>
                <Col sm={10}>
                  <DatePicker
                    selected={moment(discount.beginAt)}
                    onChange={v => handleDiscountChange({ beginAt: v.toDate().getTime() })}
                  />
                </Col>
              </FormGroup>
              <FormGroup row>
                <Label sm={2}>End At</Label>
                <Col sm={10}>
                  <DatePicker
                    selected={moment(discount.endAt)}
                    onChange={v => handleDiscountChange({ endAt: v.toDate().getTime() })}
                  />
                </Col>
              </FormGroup>
            </Form>
          </ModalBody>
            <Mutation
              mutation={CREATE_DISCOUNT}
              variables={{
                input: discount,
              }}
              update={(cache, result) => {
                handleCreateDiscount(cache, result)
                updateModal(!modal)
              }}
            >
              {
                (createDiscount, { error }) => {
                  return (
                    <div>
                      <ModalFooter>
                        <Button 
                          color="primary" 
                          onClick={createDiscount}>Save
                        </Button>
                        <Button 
                          color="secondary" 
                          onClick={() => updateModal(!modal)}
                        >Cancel</Button>
                      </ModalFooter>
                      {
                        error ? (
                          <Alert color={'danger'}>{ error.message }</Alert>
                        ) : null
                      }
                    </div>
                  ) 
                }
              }
            </Mutation>
        </Modal>
      </div>
    )
  }
}

export default compose(
  withState('modal', 'updateModal', false),
  withState('discount', 'updateDiscount', {
    code: 'YOUR_CODE',
    percent: 10,
    amount: 0,
    products: [],
    totalCount: 100,
    beginAt: Date.now(),
    endAt: Date.now(),
  }),
  withHandlers({
    handleDiscountChange: ({ updateDiscount, discount }) => (prop) => {
      updateDiscount(Object.assign(discount, prop))
    }
  })
)(CreateDiscount)
