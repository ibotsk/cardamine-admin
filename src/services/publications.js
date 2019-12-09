import template from 'url-template';
import axios from './axios';

import config from '../config/config';

const getPublicationById = async ({ id, accessToken }) => {
    const getByIdUri = template.parse(config.uris.literaturesUri.getByIdUri).expand({ id, accessToken });
    const response = await axios.get(getByIdUri);
    return response.data;
}

const getPublicationByWhere = async ({ where, offset, limit, accessToken }) => {
    const getAllUri = template.parse(config.uris.literaturesUri.getAllWFilterUri).expand({ offset, where, limit, accessToken });
    const response = await axios.get(getAllUri);
    return response.data;
}

const putPublication = async ({ data, accessToken }) => {
    const literaturesUri = template.parse(config.uris.literaturesUri.baseUri).expand({ accessToken });
    await axios.put(literaturesUri, data);
}

export default {
    getPublicationById,
    getPublicationByWhere,
    putPublication
}