import React, {useState} from 'react';
import axios from 'axios';
import {withRouter} from 'react-router-dom';
import config from '../../../config';
import {Button, Card, Divider, Form, Icon, Message} from "semantic-ui-react";
import jwt from "jsonwebtoken";

const NewListingForm = props => {


    const {
        data: {code},
    } = jwt.decode(localStorage.getItem(config.accessTokenKey));

    const {setStep,setNewListingCode} = props;


    const [value1, setValue1] = useState(null);
    const [value2, setValue2] = useState(null);
    const [value3, setValue3] = useState(null);
    const [value4, setValue4] = useState(null);
    const [value5, setValue5] = useState(null);

    const options = [
        {key: 'good', text: 'Good', value: '5dkOCo5HQ'},
        {key: 'mediocre', text: 'Mediocre', value: '87KOs5gR3'},
        {key: 'bad', text: 'Bad', value: 'aul53RbdP'},
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
    const onChange3 = (event,{key,value}) => {
        setValue3(value);
    };
    const onChange4 = (event, {key,value}) => {
        setValue4(value);
    };
    const onChange5 = event => {
        setValue5(event.target.value);
    };

    const add_listing = async () => {
        try {

            const res = await axios({
                method: "post",
                url: `${config.apiDomain}/listing/new-listing`,
                data: {
                    name: value1,
                    askingPrice: value2,
                    listingCondition: value3,
                    categoryCode: value4,
                    description: value5,
                },
                headers: {
                    'account-code': code,
                    authorization: localStorage.getItem(config.accessTokenKey),
                }
            });

            const data = res.data;

            if (res.status === 200) {
                setLoading(false);
                setStep(1);
                setNewListingCode(data);
            }

        } catch (e) {
            setLoading(false);
            setError(true);

            setTimeout(() => {
                setError(false);
            }, 2500);
        }
    };

    const isInvalid = !value1 && !value2 && !value3 && !value4;

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
                    add_listing();

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
                        required
                    />
                    <Form.Input
                        label="Asking Price"
                        iconPosition="left"
                        icon="dollar"
                        type="number"
                        placeholder="Enter Asking Price"
                        onChange={onChange2}
                        required
                    />
                    <Form.Select
                        fluid
                        label='Condition'
                        options={options}
                        placeholder='Select Condition'
                        onChange={onChange3}
                        required
                    />
                    <Form.Select
                        fluid
                        label='Category'
                        options={options}
                        placeholder='Select Category'
                        onChange={onChange4}
                        required
                    />
                    <Divider/>
                    <Form.TextArea
                        label="Description"
                        type="text"
                        placeholder="Enter Description"
                        onChange={onChange5}
                    />
                    <Button primary fluid disabled={isInvalid} type="submit">
                        Next
                    </Button>
                </Form>)
            }
        </Card.Content>
    </Card>)
};

export default withRouter(NewListingForm);
