import React, { Component } from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { Home } from './ui/pages'
import ApolloClient from 'apollo-boost'
import { ApolloProvider } from 'react-apollo'
import 'bootstrap/dist/css/bootstrap.min.css'

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
})
class App extends Component {
  render() {
    return (
      <Router>
        <ApolloProvider client={client}>
          <Route exact path='/' component={Home}/>
        </ApolloProvider>
      </Router>
    )
  }
}

export default App
