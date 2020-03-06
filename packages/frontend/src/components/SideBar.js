import React, {Component} from 'react';

import {withRouter} from 'react-router-dom';
import {Accordion, Form, Input, Menu} from "semantic-ui-react";


const SizeForm = (
    <Form>
        <Form.Group grouped>
            <Form.Checkbox label='Food' name='size' value='small' />
            <Form.Checkbox label='Camera' name='size' value='medium' />
            <Form.Checkbox label='Home Goods' name='size' value='large' />
            <Form.Checkbox label='Book' name='size' value='x-large' />
        </Form.Group>
    </Form>
)


class SideBarContent extends Component {
    constructor(props) {
        super(props);

    }

    state = { activeIndex: 0 };

    handleClick = (e, titleProps) => {
        const { index } = titleProps;
        const { activeIndex } = this.state;
        const newIndex = activeIndex === index ? -1 : index;

        this.setState({ activeIndex: newIndex })
    }

    render() {

        const {activeIndex} = this.state;

        return (
            <div className="stickySideBar">
                <Accordion as={Menu} vertical size="large">
                    <Menu.Item>
                        <Input fluid action={{icon: 'search'}} placeholder='Search Item'/>
                    </Menu.Item>
                    <Menu.Item>
                        <Accordion.Title
                            active={activeIndex === 0}
                            content='Filter'
                            index={0}
                            onClick={this.handleClick}
                        />
                        <Accordion.Content active={activeIndex === 0} content={SizeForm} />
                    </Menu.Item>
                </Accordion>
            </div>
        )
    }
}

export default withRouter(SideBarContent);
