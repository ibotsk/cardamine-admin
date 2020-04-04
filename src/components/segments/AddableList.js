import React, { Component } from 'react';

import {
    Col,
    Button, Glyphicon,
    FormGroup, InputGroup,
    ListGroup, ListGroupItem
} from 'react-bootstrap';

import { Typeahead } from 'react-bootstrap-typeahead';

class AddableList extends Component {

    constructor(props) {
        super(props);

        this.state = {
            selected: undefined
        }
    }

    onChange = selected => {
        this.setState({
            selected
        });
    }

    onAddItem = () => {
        if (this.state.selected) {
            this.props.onAddItemToList(this.state.selected[0])

            this.typeahead.getInstance().clear();
            this.setState({
                selected: undefined
            });
        }
    }

    render() {
        // rowId = (data) => return "id"; default is array index
        const { data = [], itemComponent: ListRow, rowId, onRowDelete, ...props } = this.props;
        return (
            <div className="addable-list compact-list">
                <ListGroup>
                    {
                        // ListRow is an injected component that will be rendered as item
                        data.map((d, index) => {
                            const id = rowId ? rowId(d) : index;
                            return (
                                <ListRow
                                    rowId={id}
                                    key={id}
                                    data={d}
                                    onRowDelete={() => onRowDelete(id)}
                                    {...props}
                                />)
                        })
                    }
                    <ListGroupItem>
                        <FormGroup>
                            <Col sm={12}>
                                <InputGroup bsSize='sm'>
                                    <Typeahead
                                        id={this.props.id}
                                        bsSize='sm'
                                        ref={(typeahead) => this.typeahead = typeahead}
                                        options={this.props.options}
                                        onChange={this.onChange}
                                        selected={this.state.selected}
                                        placeholder="Start by typing"
                                    />
                                    <InputGroup.Button>
                                        <Button
                                            bsStyle='success'
                                            onClick={this.onAddItem}
                                            disabled={!(!!this.state.selected && this.state.selected.length > 0) /* disabled when selected is undefined or empty array */}
                                            title="Add to this list" >
                                            <Glyphicon glyph='plus' /> Add
                                        </Button>
                                    </InputGroup.Button>
                                </InputGroup>
                            </Col>
                        </FormGroup>
                    </ListGroupItem>
                </ListGroup>
            </div>
        );
    }
}

export default AddableList;