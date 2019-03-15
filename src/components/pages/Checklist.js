import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
    Grid, Col, Row,
    Button, Glyphicon, Panel, Well,
    ListGroup, ListGroupItem,
    Form, FormControl, FormGroup, ControlLabel
} from 'react-bootstrap';

import { Typeahead } from 'react-bootstrap-typeahead';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';

import { NotificationContainer } from 'react-notifications';

import TabledPage from '../wrappers/TabledPageParent';
import LosName from '../segments/LosName';
import SpeciesNameModal from '../segments/SpeciesNameModal';
import AddableList from '../segments/AddableList';
import SynonymListItem from '../segments/SynonymListItem';

import axios from 'axios';
import template from 'url-template';

import helper from '../../utils/helper';
import notifications from '../../utils/notifications';
import config from '../../config/config';

import '../../styles/custom.css';

const MODAL_SPECIES_NAME = 'showModalSpecies';
const idAcceptedName = 'idAcceptedName';
const idBasionym = 'idBasionym';
const idReplaced = 'idReplaced';
const idNomenNovum = 'idNomenNovum';
const idNomenclatoricSynonyms = 'idNomenclatoricSynonyms';
const idTaxonomicSynonyms = 'idTaxonomicSynonyms';
const idInvalidDesignations = 'idInvalidDesignations';
const idBasionymFor = 'idBasionymFor';
const idReplacedFor = 'idReplacedFor';
const idNomenNovumFor = 'idNomenNovumFor';

const titleColWidth = 2;
const mainColWidth = 10;

const buildNtypesOptions = (types) => {
    const obj = {};
    Object.keys(ntypes).forEach(t => {
        obj[t] = t;
    });
    return obj;
}

const ntypeFormatter = (cell) => {
    return (
        <span style={{ color: config.mappings.losType[cell].colour }}>{cell}</span>
    );
}

const synonymFormatter = (synonym, prefix) => (
    {
        id: synonym.id,
        prefix,
        value: synonym
    }
);

const getLosById = async (id, accessToken) => {
    const getByIdUri = template.parse(config.uris.listOfSpeciesUri.getByIdWFilterUri).expand({ id, accessToken });
    const response = await axios.get(getByIdUri);
    return response.data;
}

const getAllLos = async (accessToken) => {
    const getAllUri = template.parse(config.uris.listOfSpeciesUri.getAllWOrderUri).expand({ accessToken });
    const response = await axios.get(getAllUri);
    return response.data;
}

const getSynonyms = async (id, accessToken) => {
    const getSynonymsNomenclatoricUri = template.parse(config.uris.listOfSpeciesUri.getNomenclatoricSynonymsUri).expand({ id, accessToken });
    const getSynonymsTaxonomicUri = template.parse(config.uris.listOfSpeciesUri.getTaxonomicSynonymsUri).expand({ id, accessToken });
    const getInvalidDesignationsUri = template.parse(config.uris.listOfSpeciesUri.getInvalidSynonymsUri).expand({ id, accessToken });

    let response = await axios.get(getSynonymsNomenclatoricUri);
    const nomenclatoricSynonyms = response.data;
    nomenclatoricSynonyms.sort(helper.listOfSpeciesSorterLex);

    response = await axios.get(getSynonymsTaxonomicUri);
    const taxonomicSynonyms = response.data;
    taxonomicSynonyms.sort(helper.listOfSpeciesSorterLex);

    response = await axios.get(getInvalidDesignationsUri);
    const invalidDesignations = response.data;
    invalidDesignations.sort(helper.listOfSpeciesSorterLex);

    return { nomenclatoricSynonyms, taxonomicSynonyms, invalidDesignations };
}

const getBasionymFor = async (id, accessToken) => {
    const getBasionymForUri = template.parse(config.uris.listOfSpeciesUri.getBasionymForUri).expand({ id, accessToken });
    const response = await axios.get(getBasionymForUri);
    return response.data;
}

const getReplacedFor = async (id, accessToken) => {
    const getReplacedForUri = template.parse(config.uris.listOfSpeciesUri.getReplacedForUri).expand({ id, accessToken });
    const response = await axios.get(getReplacedForUri);
    return response.data;
}

const getNomenNovumFor = async (id, accessToken) => {
    const getNomenNovumForUri = template.parse(config.uris.listOfSpeciesUri.getNomenNovumForUri).expand({ id, accessToken });
    const response = await axios.get(getNomenNovumForUri);
    return response.data;
}

const addSynonymToList = async (selected, synonyms, accessToken) => {
    if (!selected) {
        return null;
    }
    if (synonyms.find(s => s.id === selected.id)) {
        notifications.warning('The item is already in the list');
        return null;
    }
    const synonymJson = await getLosById(selected.id, accessToken);
    synonyms.push(synonymJson);
    synonyms.sort(helper.listOfSpeciesSorterLex);
    return synonyms;
}

const saveSynonyms = async (id, synonymsList, syntype, accessToken) => {
    const synonymsUri = template.parse(config.uris.synonymsUri.baseUri).expand({ accessToken });
    let i = 1;
    for (const s of synonymsList) {
        const synonymObj = {
            idParent: id,
            idSynonym: s.id,
            syntype,
            rorder: i
        };
        i++;
        await axios.post(synonymsUri, synonymObj);
    }
}

const ntypes = config.mappings.losType;
const ntypesFilterOptions = buildNtypesOptions(ntypes);

const columns = [
    {
        dataField: 'id',
        text: 'ID',
        sort: true
    },
    {
        dataField: 'ntype',
        text: 'Type',
        formatter: ntypeFormatter,
        filter: multiSelectFilter({
            options: ntypesFilterOptions
        }),
        sort: true
    },
    {
        dataField: 'speciesName',
        text: 'Name',
        filter: textFilter(),
        sort: true
    },
    {
        dataField: 'extra',
        text: '',
        headerStyle: { width: '10px' }
    }
];

class Checklist extends Component {

    constructor(props) {
        super(props);

        this.state = {
            [MODAL_SPECIES_NAME]: false,
            modalEditId: 0, //id for modal
            listOfSpecies: [], //options for autocomplete fields
            species: { // properties for synonyms
                id: undefined
            },
            tableRowsSelected: [],
            nomenclatoricSynonyms: [], // contains objects of list-of-species
            taxonomicSynonyms: [], // contains objects of list-of-species
            invalidDesignations: [],
            isNomenclatoricSynonymsChanged: false,
            isTaxonomicSynonymsChanged: false,
            isInvalidDesignationsChanged: false,

            basionymFor: [],
            replacedFor: [],
            nomenNovumFor: [],
        }
    }

    showModal = (id) => {
        this.setState({
            [MODAL_SPECIES_NAME]: true,
            modalEditId: id
        });
    }

    hideModal = () => {
        this.props.onTableChange(undefined, {});
        if (this.state.species.id) {
            this.populateDetailsForEdit(this.state.species.id);
        }
        this.setState({ [MODAL_SPECIES_NAME]: false });
    }

    selectRow = () => ({
        mode: 'radio',
        clickToSelect: true,
        hideSelectColumn: true,
        bgColor: '#ffea77',
        onSelect: (row, isSelect, rowIndex, e) => {
            this.props.history.push(`/names/${row.id}`);
            this.populateDetailsForEdit(row.id);
        },
    });

    populateDetailsForEdit = async (id) => {
        const accessToken = this.props.accessToken;
        const los = await getLosById(id, accessToken);
        const speciesListRaw = await getAllLos(accessToken);
        const listOfSpecies = speciesListRaw.map(l => ({
            id: l.id,
            label: helper.listOfSpeciesString(l)
        }));

        const { nomenclatoricSynonyms, taxonomicSynonyms, invalidDesignations } = await getSynonyms(id, accessToken);
        const basionymFor = await getBasionymFor(id, accessToken);
        const replacedFor = await getReplacedFor(id, accessToken);
        const nomenNovumFor = await getNomenNovumFor(id, accessToken);

        this.setState({
            species: {
                ...los
            },
            listOfSpecies,
            tableRowsSelected: [id],
            nomenclatoricSynonyms,
            taxonomicSynonyms,
            invalidDesignations,
            basionymFor,
            replacedFor,
            nomenNovumFor
        });
    }

    formatTableRow = (data) => {
        return data.map(n => {
            return ({
                id: n.id,
                ntype: n.ntype,
                speciesName: helper.listOfSpeciesString(n),
                extra: <Glyphicon glyph='chevron-right' style={{ color: '#cecece' }}></Glyphicon>
            })
        });
    }

    getSelectedName = (id) => {
        return this.state.listOfSpecies.filter(l => l.id === id);
    }

    handleChangeTypeahead = (selected, prop) => {
        const id = selected[0] ? selected[0].id : undefined;
        this.handleChange(prop, id);
    }

    handleChangeInput = (e) => {
        this.handleChange(e.target.id, e.target.value);
    }

    handleChange = (prop, val) => {
        const species = { ...this.state.species };
        species[prop] = val;
        this.setState({
            species
        });
    }

    handleAddNomenclatoricSynonym = async (selected) => {
        const accessToken = this.props.accessToken;
        const nomenclatoricSynonyms = await addSynonymToList(selected, [...this.state.nomenclatoricSynonyms], accessToken);
        this.setState({
            nomenclatoricSynonyms,
            isNomenclatoricSynonymsChanged: true
        });
    }

    handleAddTaxonomicSynonym = async (selected) => {
        const accessToken = this.props.accessToken;
        const taxonomicSynonyms = await addSynonymToList(selected, [...this.state.taxonomicSynonyms], accessToken);
        this.setState({
            taxonomicSynonyms,
            isTaxonomicSynonymsChanged: true
        });
    }

    handleAddInvalidDesignation = async (selected) => {
        const accessToken = this.props.accessToken;
        const invalidDesignations = await addSynonymToList(selected, [...this.state.invalidDesignations], accessToken);
        this.setState({
            invalidDesignations,
            isInvalidDesignationsChanged: true
        });
    }

    handleRemoveNomenclatoricSynonym = (id) => {
        const nomenclatoricSynonyms = this.state.nomenclatoricSynonyms.filter(s => s.id !== id);
        this.setState({
            nomenclatoricSynonyms,
            isNomenclatoricSynonymsChanged: true
        });
    }

    handleRemoveTaxonomicSynonym = (id) => {
        const taxonomicSynonyms = this.state.taxonomicSynonyms.filter(s => s.id !== id);
        this.setState({
            taxonomicSynonyms,
            isTaxonomicSynonymsChanged: true
        });
    }

    handleRemoveInvalidDesignation = (id) => {
        const invalidDesignations = this.state.invalidDesignations.filter(s => s.id !== id);
        this.setState({
            invalidDesignations,
            isInvalidDesignationsChanged: true
        });
    }

    handleChangeToTaxonomic = async (id, fromList) => {
        // const selected = this.state.nomenclatoricSynonyms.find(s => s.id === id);
        const selected = fromList.find(s => s.id === id);
        await this.handleAddTaxonomicSynonym(selected);
        // remove from all others
        await this.handleRemoveNomenclatoricSynonym(id);
        await this.handleRemoveInvalidDesignation(id);
    }

    handleChangeToNomenclatoric = async (id, fromList) => {
        const selected = fromList.find(s => s.id === id);
        await this.handleAddNomenclatoricSynonym(selected);
        // remove from all others
        await this.handleRemoveTaxonomicSynonym(id);
        await this.handleRemoveInvalidDesignation(id);
    }

    handleChangeToInvalid = async (id, fromList) => {
        const selected = fromList.find(s => s.id === id);
        await this.handleAddInvalidDesignation(selected);
        //remove from all others
        await this.handleRemoveNomenclatoricSynonym(id);
        await this.handleRemoveTaxonomicSynonym(id);
    }

    submitSynonyms = async (id, accessToken) => {
        // get synonyms to be deleted
        const losIsParentOfSynonyms = template.parse(config.uris.listOfSpeciesUri.getSynonymsOfParent).expand({ id, accessToken });
        const getOriginalSynonymsResponse = await axios.get(losIsParentOfSynonyms);
        const originalSynonyms = getOriginalSynonymsResponse.data;

        const toBeDeleted = [];

        // save new
        if (this.state.isNomenclatoricSynonymsChanged) {
            toBeDeleted.push(...originalSynonyms.filter(s => s.syntype === config.mappings.synonym.nomenclatoric.numType));
            await saveSynonyms(id, this.state.nomenclatoricSynonyms, config.mappings.synonym.nomenclatoric.numType, accessToken);
        }
        if (this.state.isTaxonomicSynonymsChanged) {
            toBeDeleted.push(...originalSynonyms.filter(s => s.syntype === config.mappings.synonym.taxonomic.numType));
            await saveSynonyms(id, this.state.taxonomicSynonyms, config.mappings.synonym.taxonomic.numType, accessToken);
        }
        if (this.state.isInvalidDesignationsChanged) {
            toBeDeleted.push(...originalSynonyms.filter(s => s.syntype === config.mappings.synonym.invalid.numType));
            await saveSynonyms(id, this.state.invalidDesignations, config.mappings.synonym.invalid.numType, accessToken);
        }

        // delete originals
        const synonymsByIdUri = template.parse(config.uris.synonymsUri.synonymsByIdUri);
        for (const syn of toBeDeleted) {
            await axios.delete(synonymsByIdUri.expand({ id: syn.id, accessToken }));
        }
    }

    submitForm = async (e) => {
        e.preventDefault();
        const accessToken = this.props.accessToken;
        const id = this.state.species.id;
        const losUri = template.parse(config.uris.listOfSpeciesUri.baseUri).expand({ accessToken });
        try {
            await axios.put(losUri, this.state.species);

            await this.submitSynonyms(id, accessToken);
            
            notifications.success('Saved');
            this.props.onTableChange(undefined, {});
            
            this.setState({
                isNomenclatoricSynonymsChanged: false,
                isTaxonomicSynonymsChanged: false,
                isInvalidDesignationsChanged: false
            });
        } catch (error) {
            notifications.error('Error saving');
            throw error;
        }
    }

    componentDidMount() {
        const selectedId = this.props.match.params.id;
        if (selectedId) {
            const selectedIdInt = parseInt(selectedId);
            this.populateDetailsForEdit(selectedIdInt);
            this.setState({
                tableRowsSelected: [selectedIdInt]
            });
        }
    }

    renderPlainListOfSpeciesNames = (list) => {
        if (!list || list.length === 0) {
            return <ListGroupItem />
        }
        return (
            <ListGroup>
                {list.map(b =>
                    <ListGroupItem key={b.id}>
                        <LosName data={b} />
                    </ListGroupItem>)}
            </ListGroup>
        )
    }

    NomenclatoricSynonymListItem = ({ rowId, ...props }) => {
        const fromList = this.state.nomenclatoricSynonyms;
        const Additions = p => (
            <React.Fragment>
                <Button bsStyle="primary" bsSize="xsmall" onClick={() => this.handleChangeToTaxonomic(rowId, fromList)} title="Change to taxonomic synonym"><Glyphicon glyph="share-alt" /> {config.mappings.synonym.taxonomic.prefix}</Button>
                &nbsp;
                <Button bsStyle="primary" bsSize="xsmall" onClick={() => this.handleChangeToInvalid(rowId, fromList)} title="Change to invalid designation"><Glyphicon glyph="share-alt" /> {config.mappings.synonym.invalid.prefix}</Button>
            </React.Fragment>
        );
        return (
            <SynonymListItem {...props} additions={Additions} />
        );
    }

    TaxonomicSynonymListItem = ({ rowId, ...props }) => {
        const fromList = this.state.taxonomicSynonyms;
        const Additions = p => (
            <React.Fragment>
                <Button bsStyle="primary" bsSize="xsmall" onClick={() => this.handleChangeToNomenclatoric(rowId, fromList)} title="Change to nomenclatoric synonym"><Glyphicon glyph="share-alt" /> {config.mappings.synonym.nomenclatoric.prefix}</Button>
                &nbsp;
                <Button bsStyle="primary" bsSize="xsmall" onClick={() => this.handleChangeToInvalid(rowId, fromList)} title="Change to invalid designation"><Glyphicon glyph="share-alt" /> {config.mappings.synonym.invalid.prefix}</Button>
            </React.Fragment>
        );
        return (
            <SynonymListItem {...props} additions={Additions} />
        );
    }

    InvalidSynonymListItem = ({ rowId, ...props }) => {
        const fromList = this.state.invalidDesignations;
        const Additions = p => (
            <React.Fragment>
                <Button bsStyle="primary" bsSize="xsmall" onClick={() => this.handleChangeToNomenclatoric(rowId, fromList)} title="Change to nomenclatoric synonym"><Glyphicon glyph="share-alt" /> {config.mappings.synonym.nomenclatoric.prefix}</Button>
                &nbsp;
                <Button bsStyle="primary" bsSize="xsmall" onClick={() => this.handleChangeToTaxonomic(rowId, fromList)} title="Change to taxonomic synonym"><Glyphicon glyph="share-alt" /> {config.mappings.synonym.taxonomic.prefix}</Button>
            </React.Fragment>
        );
        return (
            <SynonymListItem {...props} additions={Additions} />
        );
    }

    renderDetailHeader = () => {
        if (!this.state.species.id) {
            return (
                <Panel>
                    <Panel.Body>Click row to edit details</Panel.Body>
                </Panel>
            )
        }
        return (
            <Panel>
                <Panel.Heading>
                    <Button bsStyle='warning' bsSize='xsmall' onClick={() => this.showModal(this.state.species.id)}>
                        <Glyphicon glyph='edit' /> Edit Name
                    </Button>
                </Panel.Heading>
                <Panel.Body>
                    <h4><LosName data={this.state.species} /></h4>
                    <h5>{this.state.species.publication || '-'}</h5>
                    <FormGroup controlId='ntype' bsSize='sm'>
                        <Col xs={3}>
                            <FormControl
                                componentClass="select"
                                placeholder="select"
                                value={this.state.species.ntype}
                                onChange={this.handleChangeInput} >
                                {
                                    Object.keys(ntypes).map(t => <option value={t} key={t}>{ntypes[t].text}</option>)
                                }
                            </FormControl>
                        </Col>
                    </FormGroup>
                </Panel.Body>
            </Panel>
        )
    }

    renderEditDetails = () => {
        if (this.state.species.id) {
            return (
                <Well>
                    <FormGroup controlId={idAcceptedName} bsSize='sm'>
                        <Col componentClass={ControlLabel} sm={titleColWidth}>
                            Accepted name
                        </Col>
                        <Col xs={mainColWidth}>
                            <Typeahead
                                options={this.state.listOfSpecies}
                                selected={this.getSelectedName(this.state.species[idAcceptedName])}
                                onChange={(selected) => this.handleChangeTypeahead(selected, idAcceptedName)}
                                placeholder="Start by typing a species present in the database" />
                        </Col>
                    </FormGroup>
                    <FormGroup controlId={idBasionym} bsSize='sm'>
                        <Col componentClass={ControlLabel} sm={titleColWidth}>
                            Basionym
                        </Col>
                        <Col xs={mainColWidth}>
                            <Typeahead
                                options={this.state.listOfSpecies}
                                selected={this.getSelectedName(this.state.species[idBasionym])}
                                onChange={(selected) => this.handleChangeTypeahead(selected, idBasionym)}
                                placeholder="Start by typing a species present in the database" />
                        </Col>
                    </FormGroup>
                    <FormGroup controlId={idReplaced} bsSize='sm'>
                        <Col componentClass={ControlLabel} sm={titleColWidth}>
                            Replaced Name
                        </Col>
                        <Col xs={mainColWidth}>
                            <Typeahead
                                options={this.state.listOfSpecies}
                                selected={this.getSelectedName(this.state.species[idReplaced])}
                                onChange={(selected) => this.handleChangeTypeahead(selected, idReplaced)}
                                placeholder="Start by typing a species present in the database" />
                        </Col>
                    </FormGroup>
                    <FormGroup controlId={idNomenNovum} bsSize='sm'>
                        <Col componentClass={ControlLabel} sm={titleColWidth}>
                            Nomen Novum
                        </Col>
                        <Col xs={mainColWidth}>
                            <Typeahead
                                options={this.state.listOfSpecies}
                                selected={this.getSelectedName(this.state.species[idNomenNovum])}
                                onChange={(selected) => this.handleChangeTypeahead(selected, idNomenNovum)}
                                placeholder="Start by typing a species present in the database" />
                        </Col>
                    </FormGroup>
                    <hr />
                    <FormGroup controlId={idNomenclatoricSynonyms} bsSize='sm'>
                        <Col componentClass={ControlLabel} sm={titleColWidth}>
                            Nomenclatoric Synonyms
                        </Col>
                        <Col xs={mainColWidth}>
                            <AddableList
                                data={this.state.nomenclatoricSynonyms.map(s => synonymFormatter(s, config.mappings.synonym.nomenclatoric.prefix))}
                                options={this.state.listOfSpecies}
                                changeToTypeSymbol={config.mappings.synonym.taxonomic.prefix}
                                onAddItemToList={this.handleAddNomenclatoricSynonym}
                                onRowDelete={this.handleRemoveNomenclatoricSynonym}
                                onChangeType={this.handleChangeToTaxonomic}
                                itemComponent={this.NomenclatoricSynonymListItem}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup controlId={idTaxonomicSynonyms} bsSize='sm'>
                        <Col componentClass={ControlLabel} sm={titleColWidth}>
                            Taxonomic Synonyms
                        </Col>
                        <Col xs={mainColWidth}>
                            <AddableList
                                data={this.state.taxonomicSynonyms.map(s => synonymFormatter(s, config.mappings.synonym.taxonomic.prefix))}
                                options={this.state.listOfSpecies}
                                changeToTypeSymbol={config.mappings.synonym.nomenclatoric.prefix}
                                onAddItemToList={this.handleAddTaxonomicSynonym}
                                onRowDelete={this.handleRemoveTaxonomicSynonym}
                                onChangeType={this.handleChangeToNomenclatoric}
                                itemComponent={this.TaxonomicSynonymListItem}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup controlId={idInvalidDesignations} bsSize='sm'>
                        <Col componentClass={ControlLabel} sm={titleColWidth}>
                            Invalid Designations
                        </Col>
                        <Col xs={mainColWidth}>
                            <AddableList
                                data={this.state.invalidDesignations.map(s => synonymFormatter(s, config.mappings.synonym.invalid.prefix))}
                                options={this.state.listOfSpecies}
                                changeToTypeSymbol={config.mappings.synonym.nomenclatoric.prefix}
                                onAddItemToList={this.handleAddInvalidDesignation}
                                onRowDelete={this.handleRemoveInvalidDesignation}
                                onChangeType={this.handleChangeToNomenclatoric}
                                itemComponent={this.NomenclatoricSynonymListItem}
                            />
                        </Col>
                    </FormGroup>
                    <hr />
                    <FormGroup controlId={idBasionymFor}>
                        <Col componentClass={ControlLabel} sm={titleColWidth}>
                            Basionym For
                        </Col>
                        <Col xs={mainColWidth}>
                            {this.renderPlainListOfSpeciesNames(this.state.basionymFor)}
                        </Col>
                    </FormGroup>
                    <FormGroup controlId={idReplacedFor}>
                        <Col componentClass={ControlLabel} sm={titleColWidth}>
                            Replaced For
                        </Col>
                        <Col xs={mainColWidth}>
                            {this.renderPlainListOfSpeciesNames(this.state.replacedFor)}
                        </Col>
                    </FormGroup>
                    <FormGroup controlId={idNomenNovumFor}>
                        <Col componentClass={ControlLabel} sm={titleColWidth}>
                            Nomen Novum For
                        </Col>
                        <Col xs={mainColWidth}>
                            {this.renderPlainListOfSpeciesNames(this.state.nomenNovumFor)}
                        </Col>
                    </FormGroup>
                    <hr />
                    <Button bsStyle="primary" type='submit' >Save</Button>
                </Well>
            );
        }
        return undefined;
    }

    render() {
        const tableRowSelectedProps = { ...this.selectRow(), selected: this.state.tableRowsSelected };
        return (
            <div id='names'>
                <Grid>
                    <div id="functions">
                        <Button bsStyle="success" onClick={() => this.showModal('')}><Glyphicon glyph="plus"></Glyphicon> Add new</Button>
                    </div>
                    <h2>Names</h2>
                </Grid>
                <Grid fluid={true} >
                    <Row>
                        <Col sm={6}>
                            <div className="scrollable">
                                <BootstrapTable hover striped condensed
                                    keyField='id'
                                    data={this.formatTableRow(this.props.data)}
                                    columns={columns}
                                    filter={filterFactory()}
                                    // selectRow={this.selectRow()}
                                    selectRow={tableRowSelectedProps}
                                    onTableChange={this.props.onTableChange}
                                />
                            </div>
                        </Col>
                        <Col sm={6}>
                            <Form onSubmit={this.submitForm} horizontal>
                                {this.renderDetailHeader()}
                                {this.renderEditDetails()}
                            </Form>
                        </Col>
                    </Row>
                </Grid>
                <SpeciesNameModal id={this.state.modalEditId} show={this.state[MODAL_SPECIES_NAME]} onHide={this.hideModal} />
                <NotificationContainer />
            </div>
        );
    }

}

const mapStateToProps = state => ({
    accessToken: state.authentication.accessToken
});

export default connect(mapStateToProps)(
    TabledPage({
        getAll: config.uris.listOfSpeciesUri.getAllWOrderUri,
        getCount: config.uris.listOfSpeciesUri.countUri
    })(Checklist)
);