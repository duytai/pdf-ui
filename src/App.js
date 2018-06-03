import React, { Component } from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { Home } from './ui/pages'
import ApolloClient from 'apollo-boost'
import { ApolloProvider } from 'react-apollo'
import { Settings } from './ui/contexts'
import 'bootstrap/dist/css/bootstrap.min.css'

const URI = 'http://mobile.molli.vn:4000/graphql'
const FILE_SERVER = 'http://mobile.molli.vn:4000/products' 
const client = new ApolloClient({
  uri: URI,
})
class App extends Component {
  render() {
    return (
      <Router>
        <ApolloProvider client={client}>
          <Settings.Provider value={{ FILE_SERVER }}>
            <Route exact path='/' component={Home}/>
          </Settings.Provider>
        </ApolloProvider>
      </Router>
    )
  }
}

export default App
