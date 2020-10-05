import React from 'react';
import { Switch } from 'react-router-dom';

import CNavbar from '../segments/Navbar';
import Footer from '../segments/Footer';

import Cdata from './Cdata';
import Record from './CRecord';
import Publications from './Publications';
import Persons from './Persons';
import Checklist from './Checklist';
import PrivateRoute from '../wrappers/PrivateRoute';
import Logout from '../segments/Logout';
import Import from './chromdata/Import';
import Coordinates from './chromdata/Coordinates';

const Routing = () => (
  <Switch>
    <PrivateRoute exact path="/chromosome-data" component={Cdata} />
    <PrivateRoute exact path="/chromosome-data/new" component={Record} />
    <PrivateRoute path="/chromosome-data/edit/:recordId" component={Record} />
    <PrivateRoute exact path="/chromosome-data/import" component={Import} />
    <PrivateRoute exact path="/publications" component={Publications} />
    <PrivateRoute exact path="/persons" component={Persons} />
    <PrivateRoute exact path="/coordinates" component={Coordinates} />
    <PrivateRoute path="/names/:id?" component={Checklist} />
    <PrivateRoute exact path="/logout" component={Logout} />
  </Switch>
);

const HomePage = () => (
  <>
    <CNavbar />
    <Routing />
    <Footer />
  </>
);

export default HomePage;
