import React from 'react';
import { connect } from 'react-redux';
import {
  Grid, Button, Panel, Well,
  ProgressBar,
} from 'react-bootstrap';

import PropTypes from 'prop-types';

import CSVReader from 'react-csv-reader';
import { Link } from 'react-router-dom';

import { NotificationContainer } from 'react-notifications';

import ImportReport from './ImportReport';

import { importUtils, notifications } from '../../../utils';
import { importFacade, crecordFacade } from '../../../facades';

import config from '../../../config';

const { import: importConfig } = config;

const initialState = {
  submitEnabled: false,
  showImportProgress: false,
  records: [],
  loadDataCount: 0,
  loadDataCountTotal: 0,
  loadDataPercent: 0,
  importDataPercent: 0,
  report: {},
};

class Import extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ...initialState,
    };
  }

  increase = (i, total) => {
    let newValue = Math.floor((i * 100) / total);
    if (newValue > 100) {
      newValue = 100;
    }
    this.setState({
      loadDataCountTotal: i,
      loadDataPercent: newValue,
    });
  };

  increaseImport = (i) => {
    const { loadDataCount } = this.state;
    let newValue = Math.floor((i * 100) / loadDataCount);
    if (newValue > 100) {
      newValue = 100;
    }
    this.setState({
      importDataPercent: newValue,
    });
  };

  handleOnFileLoad = async (data) => {
    const { accessToken } = this.props;
    const { records, total } = await importFacade.loadData(
      data,
      accessToken,
      this.increase,
    );

    // TODO: handle duplicate references found, currently taken first
    const report = importUtils.createReport(records);

    this.setState({
      submitEnabled: true,
      loadDataCount: records.length,
      loadDataCountTotal: total,
      report,
      records,
    });
  };

  importRecords = async () => {
    const { accessToken } = this.props;
    const { records } = this.state;

    try {
      await importFacade.importData(records, accessToken, this.increaseImport);
      notifications.success('Data successfully imported');

      // refreshing asynchronously
      crecordFacade.refreshAdminView(accessToken);

      this.setState({
        ...initialState,
        importDataPercent: 100,
      });
    } catch (e) {
      notifications.error('Error importing');
      throw e;
    }
  };

  handleCancel = () => this.setState({ ...initialState });

  render() {
    const {
      loadDataCount,
      loadDataCountTotal,
      loadDataPercent,
      report,
      importDataPercent,
      submitEnabled,
    } = this.state;

    const ignored = loadDataCount > 0 && loadDataCountTotal > loadDataCount
      ? loadDataCountTotal - loadDataCount
      : 0;

    return (
      <div id="import">
        <Grid>
          <h2>Chromosome data import</h2>
          <Well>
            <ol>
              <li>
                Select CSV file to import
                <ul>
                  <li>
                    <Link
                      to="/files/import_template.csv"
                      target="_blank"
                      download
                    >
                      Download template
                    </Link>
                  </li>
                  <li>The file must be in UTF-8 encoding</li>
                  <li>
                    Rows with &lsquo;
                    {importConfig.ignoredRowSign}
                    &rsquo; will be ignored
                  </li>
                  <li className="text-danger">
                    Columns &ldquo;Newest genus&rdquo;, &ldquo;Newest
                    species&rdquo;, &ldquo;Newest subsp&rdquo;, &ldquo;Newest
                    var&rdquo;, &ldquo;Newest authors&rdquo; are NOT currently
                    processed!
                  </li>
                </ul>
              </li>
              <li>Check Warnings and Info</li>
              <li>Click Import</li>
            </ol>
          </Well>
          <Panel>
            <Panel.Body>
              <CSVReader onFileLoaded={this.handleOnFileLoad} />
            </Panel.Body>
          </Panel>
          <Panel>
            <Panel.Body>
              <ProgressBar
                now={loadDataPercent}
                label={`${loadDataPercent}%`}
              />
              <h4>
                Total records:
                {loadDataCountTotal}
              </h4>
              <h4>
                Records to import:
                <span className="bg-success">{loadDataCount}</span>
              </h4>
              <h4>
                Ignored:
                <span className="bg-warning">{ignored}</span>
              </h4>
              <ImportReport report={report} />
            </Panel.Body>
          </Panel>
          <Panel>
            <Panel.Body className="text-center">
              <div>
                <h3>
                  Importing:
                  {' '}
                  {importDataPercent}
                  {' '}
                  %
                </h3>
              </div>
              <ProgressBar
                bsStyle="success"
                now={importDataPercent}
                striped
              />
            </Panel.Body>
          </Panel>
          <Panel>
            <Panel.Body sm={2}>
              <Button
                bsStyle="info"
                disabled={!submitEnabled}
                onClick={this.importRecords}
              >
                Import
              </Button>
              <Button
                className="pull-right"
                bsStyle="default"
                onClick={this.handleCancel}
              >
                Start over
              </Button>
            </Panel.Body>
          </Panel>
        </Grid>
        <NotificationContainer />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  accessToken: state.authentication.accessToken,
});

export default connect(mapStateToProps)(Import);

Import.propTypes = {
  accessToken: PropTypes.string.isRequired,
};
