import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { Button, Grid, Glyphicon } from 'react-bootstrap';

import filterFactory from 'react-bootstrap-table2-filter';

import RemotePagination from '../segments/RemotePagination';
import PersonModal from '../segments/modals/PersonModal';

import config from '../../config';

import commonHooks from '../segments/hooks';

const columns = [
  {
    dataField: 'id',
    text: 'ID',
  },
  {
    dataField: 'action',
    text: 'Actions',
  },
  {
    dataField: 'person',
    text: 'Person(s) Name',
  },
];

const formatResult = (data, onEdit) => data.map((p) => ({
  id: p.id,
  action: (
    <Button
      bsSize="xsmall"
      bsStyle="warning"
      onClick={() => onEdit(p.id)}
    >
      Edit
    </Button>
  ),
  person: p.persName,
}));

const getAllUri = config.uris.personsUri.getAllWFilterUri;
const getCountUri = config.uris.personsUri.countUri;

const Persons = () => {
  const [showModalPerson, setShowModalPerson] = useState(false);
  const [editId, setEditId] = useState(undefined);

  const accessToken = useSelector((state) => state.authentication.accessToken);

  const {
    page, sizePerPage, where, order, setValues,
  } = commonHooks.useTableChange();

  const { data, totalSize } = commonHooks.useTableData(
    getCountUri, getAllUri, accessToken, where, page,
    sizePerPage, order, showModalPerson,
  );

  const handleShowModal = (id) => {
    setEditId(id);
    setShowModalPerson(true);
  };

  const handleHideModal = async () => {
    setShowModalPerson(false);
    setEditId(undefined);
  };

  const onTableChange = (type, {
    page: pageTable,
    sizePerPage: sizePerPageTable,
    filters,
    sortField,
    sortOrder,
  }) => (
    setValues({
      page: pageTable,
      sizePerPage: sizePerPageTable,
      filters,
      sortField,
      sortOrder,
    })
  );

  return (
    <div id="persons">
      <Grid id="functions">
        <div id="functions">
          <Button bsStyle="success" onClick={() => handleShowModal()}>
            <Glyphicon glyph="plus" />
            {' '}
            Add new
          </Button>
        </div>
        <h2>Persons</h2>
      </Grid>
      <Grid fluid>
        <RemotePagination
          remote
          hover
          striped
          condesed
          keyField="id"
          columns={columns}
          data={formatResult(data, handleShowModal)}
          onTableChange={onTableChange}
          defaultSorted={[{ dataField: 'id', order: 'asc' }]}
          filter={filterFactory()}
          page={page}
          sizePerPage={sizePerPage}
          totalSize={totalSize}
        />
      </Grid>
      <PersonModal
        id={editId}
        show={showModalPerson}
        onHide={handleHideModal}
      />
    </div>
  );
};

export default Persons;
