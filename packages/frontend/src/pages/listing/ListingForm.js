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
    const [activeCardImage, setActiveCardImage] = useState(props.listing.listing_data.cardImageUrl);


    const [images, setImages] = useState(null);


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

    const changeCardImage = async (image_source) => {
        try {
            const res = await axios({
                method: 'post',
                url: `${config.apiDomain}/listing/${listing.listing_data.code}/setCardImage/`,
                data: {image_source},
                headers: {
                    authorization: localStorage.getItem(config.accessTokenKey)
                }
            });

            const data = res.data;

            setActiveCardImage(image_source);


        } catch (e) {
            //setErrorCardImageUpdate(true);
        }
    };


    const deleteListingImage = async (image_source,index) => {
        try {
            const res = await axios({
                method: "delete",
                url: `${config.apiDomain}/listing/${listing.listing_data.code}/delete-image/${image_source}`,
                headers: {
                    authorization: localStorage.getItem(config.accessTokenKey),
                }
            });

                const new_images = [...images];
                new_images.splice(index,1);

                setImages(new_images);


        } catch (e) {
            setLoading(false);
            setError(true);

            setTimeout(() => {
                setError(false);
            }, 2500);
        }
    };

    useEffect(() => {

        async function fetchListingImages() {
            try {
                const res = await axios({
                    method: 'get',
                    url: `${config.apiDomain}/listing/get-image/${listing.listing_data.code}`,
                });

                const data = res.data;

                if (!data) {
                    //setEmptyImages(true);
                }
                setImages(data);
            } catch (e) {
                //setErrorImages(true);
            }
        }

        fetchListingImages();
    }, []);

    async function uploadListingImage(file) {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const res = await axios({
                method: "post",
                url: `${config.apiDomain}/upload/account/${code}/listing/${listing.listing_data.code}`,
                data: formData,
                headers: {
                    authorization: localStorage.getItem(config.accessTokenKey),
                    'content-type': 'multipart/form-data',
                },
            });

            const res2 = await axios({
                method: 'get',
                url: `${config.apiDomain}/listing/get-image/${listing.listing_data.code}`,
            });

            const data = res2.data;

            if (!data) {
                //setEmptyImages(true);
            }
            setImages(data);

        } catch (e) {
        }
    }

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

                    <Card fluid>
                        <Card.Content>
                            {images && <Card.Group itemsPerRow={5}>
                                {images.map((image_source,index) =>
                                    <Card fluid>
                                        <Modal closeIcon trigger={
                                            <Image
                                                src={`${config.apiDomain}/image/listing/${listing.listing_data.code}/${image_source}`}/>
                                        }>
                                            <Modal.Content>
                                                <Image size="large"
                                                       src={`${config.apiDomain}/image/listing/${listing.listing_data.code}/${image_source}`}/>
                                            </Modal.Content>
                                        </Modal>
                                        <Button.Group vertical>
                                            <Button disabled={image_source === activeCardImage} fluid
                                                    primary
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        changeCardImage(image_source);
                                                    }}>Make Card Image</Button>
                                            <Button fluid negative onClick={(e) => {
                                                e.preventDefault();
                                                deleteListingImage(image_source,index);
                                            }}>Delete </Button>
                                        </Button.Group>
                                    </Card>
                                )}
                            </Card.Group>}
                        </Card.Content>
                        <Card.Content><Button positive compact onClick={(e) => {
                            e.preventDefault();
                            fileInputRef.current.click()
                        }}>
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

                    <Button primary fluid disabled={isInvalid} type="submit">
                        Submit
                    </Button>
                </Form>)
            }
        </Card.Content>
    </Card>)
};

export default withRouter(ListingForm);
