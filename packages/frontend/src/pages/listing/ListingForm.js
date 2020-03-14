import React, {useEffect, useRef, useState} from 'react';
import axios from 'axios';
import {withRouter} from 'react-router-dom';
import config from '../../config';
import {Button, Card, Divider, Form, Icon, Image, Message, Modal, Segment} from "semantic-ui-react";
import jwt from "jsonwebtoken";

const ListingForm = props => {


    const {
        data: {code},
    } = jwt.decode(localStorage.getItem(config.accessTokenKey));


    const [listing, setListing] = useState(props.listing);

    const [value1, setValue1] = useState(null);
    const [value2, setValue2] = useState(null);
    const [value3, setValue3] = useState(null);
    const [value4, setValue4] = useState(null);
    const [value5, setValue5] = useState(null);

    const options = [
        {key: 'good', text: 'Good', value: 'Good'},
        {key: 'mediocre', text: 'Mediocre', value: 'Mediocre'},
        {key: 'bad', text: 'Bad', value: 'Bad'},
    ];

    const [error, setError] = useState(null);

    const [updated, setUpdated] = useState(false);

    const [loading, setLoading] = useState(null);

    const onChange1 = event => {
        setValue1(event.target.value);
    };
    const onChange2 = event => {
        setValue2(event.target.value);
    };
    const onChange3 = event => {
        setValue3(event.target.value);
    };
    const onChange4 = event => {
        setValue4(event.target.value);
    };
    const onChange5 = event => {
        setValue5(event.target.value);
    };

    const listingUpdate = async () => {
        try {

            const res = await axios({
                method: "put",
                url: `${config.apiDomain}/listing/${code}`,
                data: {
                    name: value1,
                    email: value2,
                    password: value3,
                    city: value4,
                    oldPassword: value5,
                },
                headers: {
                    authorization: localStorage.getItem(config.accessTokenKey),
                }
            });

            if (res.status === 200) {

                setUpdated(true);
                setLoading(false);

                setTimeout(() => {
                    setUpdated(false);
                    window.location.reload();
                }, 1000);
            }

        } catch (e) {
            setLoading(false);
            setError(true);

            setTimeout(() => {
                setError(false);
            }, 2500);
        }
    };

    const isInvalid = !value5;

    return (<Card fluid>
        <Card.Content>
            {updated ?
                (<Message positive icon>
                    <Icon name='check'/>
                    <Message.Content>
                        <Message.Header>Success</Message.Header>
                        Your information is updated.
                    </Message.Content>
                </Message>)
                :
                (<Form autoComplete="off" loading={loading} onSubmit={() => {
                    setLoading(true);
                    setError(false);
                    listingUpdate();

                }}>
                    {error && (
                        <Message negative icon>
                            <Icon name='warning sign'/>
                            <Message.Content>
                                <Message.Header>Error</Message.Header>
                                Try again later.
                            </Message.Content>
                        </Message>
                    )}
                    <Form.Input
                        label="Listing Name"
                        iconPosition="left"
                        icon="tasks"
                        type="text"
                        placeholder="Enter Listing Name"
                        onChange={onChange1}
                    />
                    <Form.Input
                        label="Asking Price"
                        iconPosition="left"
                        icon="dollar"
                        type="number"
                        placeholder="Enter Asking Price"
                        onChange={onChange2}
                    />
                    <Form.Select
                        fluid
                        label='Condition'
                        options={options}
                        placeholder='Select Condition'
                        onChange={onChange3}
                    />
                    <Form.Select
                        fluid
                        label='Category'
                        options={options}
                        placeholder='Select Category'
                        onChange={onChange4}
                    />
                    <Divider/>
                    <Form.TextArea
                        label="Description"
                        iconPosition="left"
                        icon="info"
                        type="text"
                        placeholder="Enter Description"
                        onChange={onChange5}
                    />

                    <Button primary fluid disabled={isInvalid} type="submit">
                        Submit
                    </Button>
                </Form>)
            }
        </Card.Content>
    </Card>)
};

export default withRouter(ListingForm);
