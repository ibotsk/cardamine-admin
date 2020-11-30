import Mustache from 'mustache';

import config from '../../config';

const { constants } = config;

Mustache.tags = constants.mustacheTags.uri;

export default Mustache;
