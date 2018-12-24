import React from 'react';

import TabledPage from './TabledPageParent';
import LosName from '../segments/LosName';

import { textFilter } from 'react-bootstrap-table2-filter';

import config from '../../config/config';

const PAGE_DETAIL = "/checklist/detail/";
const EDIT_RECORD = "/chromosome-data/edit/"

const columns = [
    {
        dataField: 'id',
        text: 'ID',
        filter: textFilter()
    }, {
        dataField: 'action',
        text: 'Action'
    }, {
        dataField: 'originalIdentification',
        text: 'Orig. identification'
    },
    {
        dataField: "lastRevision",
        text: "Last revision"
    },
    {
        dataField: "publicationAuthor",
        text: "Publ. author"
    },
    {
        dataField: "year",
        text: "Year"
    },
    {
        dataField: "n",
        text: "n"
    },
    {
        dataField: "dn",
        text: "2n"
    },
    {
        dataField: "ploidy",
        text: "Ploidy"
    },
    {
        dataField: "ploidyRevised",
        text: "Ploidy revised"
    },
    {
        dataField: "xRevised",
        text: "x revised"
    },
    {
        dataField: "countedBy",
        text: "Counted by"
    },
    {
        dataField: "countedDate",
        text: "Counted date"
    },
    {
        dataField: "nOfPlants",
        text: "N. of plants"
    },
    {
        dataField: "note",
        text: "Note"
    },
    {
        dataField: "eda",
        text: "E/D/A"
    },
    {
        dataField: "duplicate",
        text: "Duplicate"
    },
    {
        dataField: "depositedIn",
        text: "Deposited in"
    },
    {
        dataField: "w4",
        text: "W4"
    },
    {
        dataField: "country",
        text: "Country"
    },
    {
        dataField: "latitude",
        text: "Latitude"
    },
    {
        dataField: "longitude",
        text: "Longitude"
    },
    {
        dataField: "localityDescription",
        text: "Loc. description"
    }
];

const formatResult = (result) => {
    return result.data.map(d => {
        const origIdentification = d.material.reference["original-identification"];
        const latestRevision = d["latest-revision"];
        return {
            id: d.id,
            action: <a className="btn btn-default btn-sm" href={`${EDIT_RECORD}${d.id}`} >Edit</a>,
            originalIdentification: origIdentification ? <a href={`${PAGE_DETAIL}${origIdentification.id}`} ><LosName key={origIdentification.id} nomen={origIdentification} format='plain' /></a> : "",
            lastRevision: latestRevision ? <a href={`${PAGE_DETAIL}${latestRevision["list-of-species"].id}`} ><LosName key={latestRevision["list-of-species"].id} nomen={latestRevision["list-of-species"]} format='plain' /></a> : "",
            publicationAuthor: d.material.reference.literature ? d.material.reference.literature.paperAuthor : "",
            year: d.material.reference.literature ? d.material.reference.literature.year : "",
            n: d.n,
            dn: d.dn,
            ploidy: d.ploidyLevel,
            ploidyRevised: d.ploidyLevelRevised,
            xRevised: d.xRevised,
            countedBy: d["counted-by"] ? d["counted-by"].persName : "",
            countedDate: d.countedDate,
            nOfPlants: d.numberOfAnalysedPlants,
            note: d.note,
            eda: '',
            duplicate: d.duplicateData,
            depositedIn: d.depositedIn,
            w4: d.material["world-l4"] ? d.material["world-l4"].name : "",
            country: d.material.country,
            latitude: d.material.coordinatesGeorefLat ? `${d.material.coordinatesGeorefLat} (gr)` : (d.material.coordinatesLat ? `${d.material.coordinatesLat} (orig)` : ""),
            longitude: d.material.coordinatesGeorefLon ? `${d.material.coordinatesGeorefLon} (gr)` : (d.material.coordinatesLon ? `${d.material.coordinatesLon} (orig)` : ""),
            localityDescription: d.material.description
        }
    });
}

const Cdata = (props) => {

    return (
        <div id='chromosome-data'>
            <h2>Chromosome data</h2>
            {props.children}
        </div>
    )

}

export default TabledPage({
    getAll: config.uris.chromosomeDataUri.getAll,
    getCount: config.uris.chromosomeDataUri.count,
    columns,
    formatResult
})(Cdata);