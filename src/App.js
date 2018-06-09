import React, { Component } from 'react'
import { HashRouter as Router, Route } from 'react-router-dom'
import ApolloClient from 'apollo-boost'
import { ApolloProvider } from 'react-apollo'
import { Settings } from './ui/contexts'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Home, Discount } from './ui/pages'
import { MainLayout } from '../src/layouts'

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
            {
              ['/', '/orders'].map(p => (
                <Route key={p} exact path={p} component={
                  (props) => <MainLayout>
                    <Home {...props}/>
                  </MainLayout>
                }/>
              ))
            }
            <Route exact path='/discounts' component={
              (props) => <MainLayout>
                <Discount {...props}/>
              </MainLayout>
            }/>
          </Settings.Provider>
        </ApolloProvider>
      </Router>
    )
  }
}

export default App
