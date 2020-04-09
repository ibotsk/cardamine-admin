import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
  Col,
  Button, Modal,
  Form, FormGroup, FormControl, ControlLabel
} from 'react-bootstrap';

import publicationsFacade from '../../../facades/publications';

import config from '../../../config/config';

const titleColWidth = 2;
const mainColWidth = 10;

const intCols = ['displayType'];

const initialValues = {
  id: undefined,
  displayType: 1,
  paperAuthor: '',
  paperTitle: '',
  seriesSource: '',
  volume: '',
  issue: '',
  publisher: '',
  editor: '',
  year: '',
  pages: '',
  journalName: '',
  inputDate: '',
  note: ''
};

const displayTypes = config.mappings.displayType;

class PublicationModal extends Component {

  constructor(props) {
    super(props);

    this.state = {
      ...initialValues
    };
  }

  onEnter = async () => {
    if (this.props.id) {
      const accessToken = this.props.accessToken;
      const data = await publicationsFacade.getPublicationByIdCurated({ id: this.props.id, accessToken });
      this.setState({ ...data });
    }
  }

  // at least one field must be non-empty - prevent accidental saving of all-empty
  getValidationState = () => {
    const { id, displayType, ...state } = this.state;
    for (const key in state) { // without id, displayType
      if (state[key].length > 0) {
        return true; //'success'
      }
    }
    return false; // 'error'
  }

  handleChange = e => {
    let val = e.target.value;
    if (intCols.includes(e.target.id)) {
      val = parseInt(e.target.value);
    }
    this.setState({ [e.target.id]: val });
  }

  handleHide = () => {
    this.setState({
      ...initialValues
    });
    this.props.onHide();
  }

  handleSave = async () => {
    if (this.getValidationState()) {
      const accessToken = this.props.accessToken;
      const data = { ...this.state };
      await publicationsFacade.savePublicationCurated({ data, accessToken });
      this.handleHide();
    } else {
      alert('At least one field must not be empty!');
    }
  }

  render() {
    const displayType = this.state.displayType;
    return (
      <Modal show={this.props.show} onHide={this.handleHide} onEnter={this.onEnter}>
        <Modal.Header closeButton>
          <Modal.Title>{this.props.id ? 'Edit publication' : 'Create new publication'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form horizontal>
            <FormGroup controlId="displayType" bsSize='sm'>
              <Col componentClass={ControlLabel} sm={titleColWidth}>
                Type
                            </Col>
              <Col xs={mainColWidth}>
                <FormControl
                  componentClass="select"
                  placeholder="select"
                  onChange={this.handleChange}
                  value={this.state.displayType}
                >
                  {
                    Object.keys(displayTypes).map(k => <option value={k} key={k}>{displayTypes[k].name}</option>)
                  }
                </FormControl>
              </Col>
            </FormGroup>
            <FormGroup controlId="paperAuthor" bsSize='sm'>
              <Col componentClass={ControlLabel} sm={titleColWidth}>
                Paper Authors
                            </Col>
              <Col sm={mainColWidth}>
                <FormControl
                  type="text"
                  value={this.state.paperAuthor}
                  placeholder="Paper Authors"
                  onChange={this.handleChange}
                />
              </Col>
            </FormGroup>
            <FormGroup controlId="paperTitle" bsSize='sm'>
              <Col componentClass={ControlLabel} sm={titleColWidth}>
                Paper Title
                            </Col>
              <Col sm={mainColWidth}>
                <FormControl
                  type="text"
                  value={this.state.paperTitle}
                  placeholder="Paper Title"
                  onChange={this.handleChange}
                />
              </Col>
            </FormGroup>
            <FormGroup controlId="year" bsSize='sm'>
              <Col componentClass={ControlLabel} sm={titleColWidth}>
                Year
                            </Col>
              <Col sm={mainColWidth}>
                <FormControl
                  type="text"
                  value={this.state.year}
                  placeholder="Year"
                  onChange={this.handleChange}
                />
              </Col>
            </FormGroup>
            {
              ([3, 4, 5].includes(displayType)) &&
              <FormGroup controlId="seriesSource" bsSize='sm'>
                <Col componentClass={ControlLabel} sm={titleColWidth}>
                  Series Source
                                </Col>
                <Col sm={mainColWidth}>
                  <FormControl
                    type="text"
                    value={this.state.seriesSource}
                    placeholder="Series Source"
                    onChange={this.handleChange}
                  />
                </Col>

              </FormGroup>
            }
            {
              ([2, 3, 4].includes(displayType)) &&
              <FormGroup controlId="publisher" bsSize='sm'>
                <Col componentClass={ControlLabel} sm={titleColWidth}>
                  Publisher
                                </Col>
                <Col sm={mainColWidth}>
                  <FormControl
                    type="text"
                    value={this.state.publisher}
                    placeholder="Publisher"
                    onChange={this.handleChange}
                  />
                </Col>
              </FormGroup>
            }
            {
              ([1, 5].includes(displayType)) &&
              <FormGroup controlId="volume" bsSize='sm'>
                <Col componentClass={ControlLabel} sm={titleColWidth}>
                  Volume
                                </Col>
                <Col sm={mainColWidth}>
                  <FormControl
                    type="text"
                    value={this.state.volume}
                    placeholder="Volume"
                    onChange={this.handleChange}
                  />
                </Col>
              </FormGroup>
            }
            {
              ([1, 5].includes(displayType)) &&
              <FormGroup controlId="issue" bsSize='sm'>
                <Col componentClass={ControlLabel} sm={titleColWidth}>
                  Issue
                                </Col>
                <Col sm={mainColWidth}>
                  <FormControl
                    type="text"
                    value={this.state.issue}
                    placeholder="Issue"
                    onChange={this.handleChange}
                  />
                </Col>
              </FormGroup>
            }
            {
              ([3, 4, 5].includes(displayType)) &&
              <FormGroup controlId="editor" bsSize='sm'>
                <Col componentClass={ControlLabel} sm={titleColWidth}>
                  Editors
                                </Col>
                <Col sm={mainColWidth}>
                  <FormControl
                    type="text"
                    value={this.state.editor}
                    placeholder="Editors"
                    onChange={this.handleChange}
                  />
                </Col>
              </FormGroup>
            }
            <FormGroup controlId="pages" bsSize='sm'>
              <Col componentClass={ControlLabel} sm={titleColWidth}>
                Pages
                            </Col>
              <Col sm={mainColWidth}>
                <FormControl
                  type="text"
                  value={this.state.pages}
                  placeholder="Pages"
                  onChange={this.handleChange}
                />
              </Col>
            </FormGroup>
            <FormGroup controlId="journalName" bsSize='sm'>
              <Col componentClass={ControlLabel} sm={titleColWidth}>
                Journal Name
                            </Col>
              <Col sm={mainColWidth}>
                <FormControl
                  type="text"
                  value={this.state.journalName}
                  placeholder="Journal"
                  onChange={this.handleChange}
                />
              </Col>
            </FormGroup>
            <FormGroup controlId="note" bsSize='sm'>
              <Col componentClass={ControlLabel} sm={titleColWidth}>
                Note
                            </Col>
              <Col sm={mainColWidth}>
                <FormControl
                  componentClass="textarea"
                  value={this.state.note}
                  placeholder="Note"
                  onChange={this.handleChange}
                />
              </Col>
            </FormGroup>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.handleHide}>Close</Button>
          <Button bsStyle="primary" onClick={this.handleSave}>Save</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}

const mapStateToProps = state => ({
  accessToken: state.authentication.accessToken
});

export default connect(mapStateToProps)(PublicationModal);