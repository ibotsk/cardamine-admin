import React, { Component } from 'react';

import {
    Button, Checkbox,
    Modal,
    Form, FormGroup, FormControl, Panel
} from 'react-bootstrap';

import axios from 'axios';
import template from 'url-template';

import config from '../../config/config';

class NewSpeciesNameModal extends Component {

    ntypes = config.mappings.losType;

    constructor(props) {
        super(props);

        this.state = {
            ntype: 'A',
            hybrid: false,
            genus: '',
            species: '',
            subsp: '',
            var: '',
            subvar: '',
            forma: '',
            authors: '',
            genusH: '',
            speciesH: '',
            subspH: '',
            varH: '',
            subvarH: '',
            formaH: '',
            authorsH: '',
            publication: '',
            tribus: ''
        }
    }

    // at least one field must be non-empty - prevent accidental saving of all-empty
    getValidationState = () => {
        const { ntype, ...state } = this.state;
        for (const key in state) {  //without ntype
            if (state[key].length > 0) {
                return true;
            }
        }
        return false;
    }

    handleChange = (e) => {
        this.setState({ [e.target.id]: e.target.value });
    }

    handleChangeCheckbox = (e) => {
        this.setState({ [e.target.id]: e.target.checked });
    }

    handleHide = () => {
        this.setState({
            ntype: 'A',
            hybrid: false,
            genus: '',
            species: '',
            subsp: '',
            var: '',
            subvar: '',
            forma: '',
            authors: '',
            genusH: '',
            speciesH: '',
            subspH: '',
            varH: '',
            subvarH: '',
            formaH: '',
            authorsH: '',
            publication: '',
            tribus: ''
        });
        this.props.onHide();
    }

    handleSave = () => {
        if (this.getValidationState()) {
            const listOfSpeciesUri = template.parse(config.uris.listOfSpeciesUri.baseUri).expand();
            axios.post(listOfSpeciesUri, {
                ...this.state
            }).then(() => this.handleHide());
        } else {
            alert('At least one field must not be empty!');
        }
    }

    renderHybridFields = (is) => {
        if (is) {
            return (
                <Panel>
                    <Panel.Body>
                        <FormGroup controlId="genusH" bsSize='sm'>
                            <FormControl
                                type="text"
                                value={this.state.genusH}
                                placeholder="Hybrid Genus"
                                onChange={(e) => this.handleChange(e)}
                            />
                        </FormGroup>
                        <FormGroup controlId="speciesH" bsSize='sm'>
                            <FormControl
                                type="text"
                                value={this.state.speciesH}
                                placeholder="Hybrid Species"
                                onChange={(e) => this.handleChange(e)}
                            />
                        </FormGroup>
                        <FormGroup controlId="subspH" bsSize='sm'>
                            <FormControl
                                type="text"
                                value={this.state.subspH}
                                placeholder="Hybrid Subsp"
                                onChange={(e) => this.handleChange(e)}
                            />
                        </FormGroup>
                        <FormGroup controlId="varH" bsSize='sm'>
                            <FormControl
                                type="text"
                                value={this.state.varH}
                                placeholder="Hybrid Var"
                                onChange={(e) => this.handleChange(e)}
                            />
                        </FormGroup>
                        <FormGroup controlId="subvarH" bsSize='sm'>
                            <FormControl
                                type="text"
                                value={this.state.subvarH}
                                placeholder="Hybrid Subvar"
                                onChange={(e) => this.handleChange(e)}
                            />
                        </FormGroup>
                        <FormGroup controlId="formaH" bsSize='sm'>
                            <FormControl
                                type="text"
                                value={this.state.formaH}
                                placeholder="Hybrid Forma"
                                onChange={(e) => this.handleChange(e)}
                            />
                        </FormGroup>
                        <FormGroup controlId="authorsH" bsSize='sm'>
                            <FormControl
                                type="text"
                                value={this.state.authorsH}
                                placeholder="Hybrid Authors"
                                onChange={(e) => this.handleChange(e)}
                            />
                        </FormGroup>
                    </Panel.Body>
                </Panel>
            )
        }
    }

    render() {
        console.log(this.state);
        return (
            <Modal show={this.props.show} onHide={() => this.handleHide()}>
                <Modal.Header closeButton>
                    <Modal.Title>Create new name</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <FormGroup controlId="ntype" bsSize='sm'>
                            <FormControl
                                componentClass="select"
                                placeholder="select"
                                onChange={(e) => this.handleChange(e)} >
                                {
                                    Object.keys(this.ntypes).map(t => <option value={t} key={t}>{this.ntypes[t]}</option>)
                                }
                            </FormControl>
                        </FormGroup>
                        <FormGroup controlId="genus" bsSize='sm'>
                            <FormControl
                                type="text"
                                value={this.state.genus}
                                placeholder="Genus"
                                onChange={(e) => this.handleChange(e)}
                            />
                        </FormGroup>
                        <FormGroup controlId="species" bsSize='sm'>
                            <FormControl
                                type="text"
                                value={this.state.species}
                                placeholder="Species"
                                onChange={(e) => this.handleChange(e)}
                            />
                        </FormGroup>
                        <FormGroup controlId="subsp" bsSize='sm'>
                            <FormControl
                                type="text"
                                value={this.state.subsp}
                                placeholder="Subsp"
                                onChange={(e) => this.handleChange(e)}
                            />
                        </FormGroup>
                        <FormGroup controlId="var" bsSize='sm'>
                            <FormControl
                                type="text"
                                value={this.state.var}
                                placeholder="Var"
                                onChange={(e) => this.handleChange(e)}
                            />
                        </FormGroup>
                        <FormGroup controlId="subvar" bsSize='sm'>
                            <FormControl
                                type="text"
                                value={this.state.subvar}
                                placeholder="Subvar"
                                onChange={(e) => this.handleChange(e)}
                            />
                        </FormGroup>
                        <FormGroup controlId="forma" bsSize='sm'>
                            <FormControl
                                type="text"
                                value={this.state.forma}
                                placeholder="Forma"
                                onChange={(e) => this.handleChange(e)}
                            />
                        </FormGroup>
                        <FormGroup controlId="authors" bsSize='sm'>
                            <FormControl
                                type="text"
                                value={this.state.authors}
                                placeholder="Authors"
                                onChange={(e) => this.handleChange(e)}
                            />
                        </FormGroup>
                        <FormGroup controlId="hybrid">
                            <Checkbox inline
                                id="hybrid"
                                value={this.state.hybrid}
                                onChange={e => this.handleChangeCheckbox(e)}>Hybrid</Checkbox>
                        </FormGroup>
                        {
                            this.renderHybridFields(this.state.hybrid)
                        }
                        <FormGroup controlId="publication" bsSize='sm'>
                            <FormControl
                                type="text"
                                value={this.state.publication}
                                placeholder="Publication"
                                onChange={(e) => this.handleChange(e)}
                            />
                        </FormGroup>
                        <FormGroup controlId="tribus" bsSize='sm'>
                            <FormControl
                                type="text"
                                value={this.state.tribus}
                                placeholder="Tribus"
                                onChange={(e) => this.handleChange(e)}
                            />
                        </FormGroup>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => this.handleHide()}>Close</Button>
                    <Button bsStyle="primary" onClick={() => this.handleSave()}>Save changes</Button>
                </Modal.Footer>
            </Modal>
        )
    }
}

export default NewSpeciesNameModal;