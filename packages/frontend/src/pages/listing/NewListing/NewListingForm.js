import React, {useRef, useState} from 'react';
import axios from 'axios';
import {withRouter} from 'react-router-dom';
import config from '../../../config';
import {Button, Card, Divider, Form, Icon, Image, Message, Pagination} from "semantic-ui-react";
import jwt from "jsonwebtoken";

const ListingForm = props => {



    const {
        data: {code},
    } = jwt.decode(localStorage.getItem(config.accessTokenKey));


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

    const images = [];

    const [error, setError] = useState(null);

    const [updated, setUpdated] = useState(false);

    const [loading, setLoading] = useState(null);

    const fileInputRef = useRef("fileInput");

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

    async function uploadListingImage(file) {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const res = await axios({
                method: "post",
                url: `${config.apiDomain}/upload/account/${code}/listing/${""}`,
                data: formData,
                headers: {
                    authorization: localStorage.getItem(config.accessTokenKey),
                    'content-type': 'multipart/form-data',
                },
            });
        } catch (e) {
        }
    }

    async function fetchListingImage() {
        try {
            const res = await axios({
                method: 'get',
                url: `${config.apiDomain}/account/${code}`,
                headers: {
                    authorization: localStorage.getItem(config.accessTokenKey),
                }
            });
            const data = res.data;
            //setAccount(data);
        } catch (e) {
            //TODO: error handling here
            if (e.response.status === 401) {
                localStorage.clear();
                window.location.reload();
            }
        }
    }

    const listingUpdate = async () => {
        try {

            const res = await axios({
                method: "put",
                url: `${config.apiDomain}/account/${code}`,
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
                    <Card fluid>
                        <Card.Content>
                            <Card.Header>Images</Card.Header>
                            <Card.Group itemsPerRow={5}>
                                {images && images.map(image =>
                                <Card>
                                    <Image wrapped ui={false}
                                           src={image.imageURL}/>
                                </Card>)}
                            </Card.Group>

                            <Pagination boundaryRange={0}
                                        defaultActivePage={1}
                                        ellipsisItem={null}
                                        firstItem={null}
                                        lastItem={null}
                                        siblingRange={1}
                                        totalPages={10}
                                        style={{justifyContent: "center"}}
                                        onPageChange={() => ""}/>
                        </Card.Content>
                        <Card.Content><Button positive compact onClick={(e) => {
                            e.preventDefault();
                            fileInputRef.current.click()}}>
                            Add Image</Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                hidden
                                onChange={(e) => {
                                    e.preventDefault();
                                    uploadListingImage(e.target.files[0]);
                                }}
                            /></Card.Content>
                    </Card>
                    <Divider/>
                    <Form.TextArea
                        label="Description"
                        iconPosition="left"
                        icon="info"
                        type="text"
                        placeholder="Enter Description"
                        onChange={onChange5}
                    />

                    <Button primary fluid type="submit">
                        Submit
                    </Button>
                </Form>)
            }
        </Card.Content>
    </Card>)
};

export default withRouter(ListingForm);
