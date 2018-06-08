import React, { Component } from 'react'
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap'


export default class MainLayout extends Component {
  constructor(props) {
    super(props)
    this.toggle = this.toggle.bind(this)
    this.state = {
      isOpen: false
    }
  }
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    })
  }
  render() {
    return (
      <div>
        <Navbar color="light" light expand="md">
          <NavbarBrand href="/">MOLLIVN</NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              <NavItem>
                <NavLink href="/orders">Orders</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="/discounts">Discounts</NavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </Navbar>
        { this.props.children }
      </div>
    )
  }
}
