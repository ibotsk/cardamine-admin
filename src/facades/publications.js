import { getRequest, putRequest } from '../services/backend';
import { utils, helperUtils, whereUtils } from '../utils';

import config from '../config';

const {
  uris: { literaturesUri },
} = config;

async function getPublicationByIdCurated(id, accessToken) {
  const data = await getRequest(
    literaturesUri.getByIdUri, { id }, accessToken,
  );
  return utils.nullToEmpty(data);
}

async function getPublicationByAll(
  literatureData,
  accessToken,
  formatFound = undefined,
) {
  const whereObj = whereUtils.whereDataAll(literatureData);
  if (!whereObj) {
    return null;
  }
  const where = JSON.stringify(whereObj);
  const publication = await getRequest(
    literaturesUri.getAllWFilterUri, {
      offset: 0, limit: 2, where, order: '"id"',
    },
    accessToken,
  );

  const found = formatFound ? formatFound(publication) : publication;

  return {
    term: literatureData,
    found,
  };
}

async function savePublication(data, accessToken) {
  const response = await putRequest(
    literaturesUri.baseUri, data, undefined, accessToken,
  );
  return response.data;
}

async function savePublicationCurated(data, accessToken) {
  const toBeSaved = helperUtils.publicationCurateFields(data);
  return savePublication(toBeSaved, accessToken);
}

export default {
  getPublicationByIdCurated,
  getPublicationByAll,
  savePublication,
  savePublicationCurated,
};
