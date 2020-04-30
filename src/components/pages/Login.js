import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import PropTypes from 'prop-types';

import {
  Grid,
  Col,
  Button,
  Form,
  FormGroup,
  FormControl,
  ControlLabel,
} from 'react-bootstrap';

import userService from '../../services/user-service';
import {
  setAuthenticated as setAuthenticatedAction,
  unsetAuthenticated as unsetAuthenticatedAction,
} from '../../actions';

class Login extends Component {
  constructor(props) {
    super(props);
    const { unsetAuthenticated } = this.props;
    unsetAuthenticated();

    this.state = {
      username: '',
      password: '',
      redirectToReferrer: false,
    };
  }

  validateForm = () => {
    const { username, password } = this.state;
    return username.length > 0 && password.length > 0;
  };

  handleChange = (event) => {
    this.setState({
      [event.target.id]: event.target.value,
    });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const { setAuthenticated } = this.props;
    const { username, password } = this.state;

    // stop here if form is invalid
    if (!(username && password)) {
      return;
    }
    // call login endpoint
    const responseData = await userService.login(username, password);
    if (!responseData.id) {
      return;
    }
    setAuthenticated(responseData.id);
    this.setState({ redirectToReferrer: true });
  };

  render() {
    const { location } = this.props;

    const { redirectToReferrer, username, password } = this.state;
    const { from } = location.state || { from: { pathname: '/' } };

    if (redirectToReferrer === true) {
      return <Redirect to={from} />;
    }

    return (
      <div id="login-page">
        <Grid>
          <Col xs={12} md={4} mdOffset={4}>
            <h2>Login</h2>
            <Form onSubmit={this.handleSubmit}>
              <FormGroup controlId="username" bsSize="large">
                <ControlLabel>Username</ControlLabel>
                <FormControl
                  autoFocus
                  type="text"
                  value={username}
                  onChange={this.handleChange}
                />
              </FormGroup>
              <FormGroup controlId="password" bsSize="large">
                <ControlLabel>Password</ControlLabel>
                <FormControl
                  type="password"
                  value={password}
                  onChange={this.handleChange}
                />
              </FormGroup>
              <Button
                block
                bsSize="large"
                disabled={!this.validateForm()}
                type="submit"
                bsStyle="primary"
              >
                Login
              </Button>
            </Form>
          </Col>
        </Grid>
      </div>
    );
  }
}

export default connect(null, {
  setAuthenticated: setAuthenticatedAction,
  unsetAuthenticated: unsetAuthenticatedAction,
})(Login);

Login.propTypes = {
  setAuthenticated: PropTypes.func.isRequired,
  unsetAuthenticated: PropTypes.func.isRequired,
  location: PropTypes.shape({
    state: PropTypes.shape({
      from: PropTypes.shape({
        pathname: PropTypes.string,
      }),
    }),
  }).isRequired,
};
