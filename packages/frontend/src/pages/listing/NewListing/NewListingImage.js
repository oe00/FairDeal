import React, {useEffect, useRef, useState} from 'react';
import axios from 'axios';
import {withRouter} from 'react-router-dom';
import config from '../../../config';
import {Button, Card, Divider, Form, Header, Icon, Image, Message, Modal, Segment} from "semantic-ui-react";
import jwt from "jsonwebtoken";

const NewListingImage = props => {

    const {
        data: {code},
    } = jwt.decode(localStorage.getItem(config.accessTokenKey));


    const [activeCardImage, setActiveCardImage] = useState(null);

    const listingCode = props.listing_code;
    const {setListingCompleted} = props;

    const [images, setImages] = useState(null);

    const [error, setError] = useState(null);
    const [errorCard, setErrorCard] = useState(null);

    const [loading, setLoading] = useState(null);

    const fileInputRef = useRef("fileInput");

    const setListingCardImage = async (image_source) => {
        try {
            const res = await axios({
                method: 'post',
                url: `${config.apiDomain}/listing/${listingCode}/set-card-image`,
                data: {image_source},
                headers: {
                    'account-code':code,
                    authorization: localStorage.getItem(config.accessTokenKey)
                }
            });

            setActiveCardImage(image_source);

        } catch (e) {
            //setErrorCardImageUpdate(true);
        }
    };

    const deleteListingImage = async (image_source, index) => {
        try {
            const res = await axios({
                method: "delete",
                url: `${config.apiDomain}/listing/${listingCode}/delete-image/${image_source}`,
                headers: {
                    'account-code': code,
                    authorization: localStorage.getItem(config.accessTokenKey),
                }
            });

            const new_images = [...images];
            new_images.splice(index, 1);

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
                    url: `${config.apiDomain}/listing/${listingCode}/get-images`,
                });

                const data = res.data;

                setImages(data);
            } catch (e) {
                //setErrorImages(true);
            }
        }

        fetchListingImages();
    }, [listingCode]);

    async function uploadListingImage(file) {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const res = await axios({
                method: "post",
                url: `${config.apiDomain}/listing/${listingCode}/upload-image`,
                data: formData,
                headers: {
                    'account-code': code,
                    authorization: localStorage.getItem(config.accessTokenKey),
                    'content-type': 'multipart/form-data',
                },
            });

            const res2 = await axios({
                method: 'get',
                url: `${config.apiDomain}/listing/${listingCode}/get-images`,
            });

            const data = res2.data;

            setImages(data);

        } catch (e) {
        }
    }


    async function checkCardImage() {
        if(!activeCardImage){
            setErrorCard(true);

            setTimeout(() => {
                setErrorCard(false);
            }, 2000);
        }

        else{
                try {
                    const res = await axios({
                        method: 'patch',
                        url: `${config.apiDomain}/listing/${listingCode}/set-active`,
                        headers: {
                            'account-code': code,
                            authorization: localStorage.getItem(config.accessTokenKey),
                        }
                    });

                    setListingCompleted(true);

                } catch (e) {
                    //setErrorImages(true);
                }
            }
    }

    return (<Card fluid>
        {errorCard &&  <Message negative icon>
            <Icon name='warning sign'/>
            <Message.Content>
                <Message.Header>Error</Message.Header>
                One image must be selected as card image!
            </Message.Content>
        </Message>}
        <Card.Content>
            {images ? <Card.Group itemsPerRow={5}>
                {images.map((image_source, index) =>
                    <Card fluid>
                        <Modal closeIcon trigger={
                            <Image ui
                                   src={`${config.apiDomain}/listing/${listingCode}/get-image/${image_source}`}/>
                        }>
                            <Modal.Content>
                                <Image size="large"
                                       src={`${config.apiDomain}/listing/${listingCode}/get-image/${image_source}`}/>
                            </Modal.Content>
                        </Modal>
                        <Divider/>

                        <Button.Group className={image_source === activeCardImage ? "customDisabled" : ""} vertical>
                            <Button
                                primary
                                onClick={(e) => {
                                    //e.preventDefault();
                                    setListingCardImage(image_source);
                                }}>Make Card Image</Button>
                            <Button fluid negative onClick={(e) => {
                                e.preventDefault();
                                deleteListingImage(image_source, index);
                            }}>Delete </Button>
                        </Button.Group>

                    </Card>
                )}
            </Card.Group>
            : <Segment placeholder>
                    <Header icon>
                        <Icon name='image'/>
                        Add Listing Image
                    </Header>
                </Segment>}
        </Card.Content>
        <Card.Content extra>
            <Button positive onClick={(e) => {
                //e.preventDefault();
                fileInputRef.current.click()
            }}>
                Add Image</Button>
            <input
                ref={fileInputRef}
                type="file"
                hidden
                onChange={(e) => {
                    //e.preventDefault();
                    uploadListingImage(e.target.files[0]);
                }}
            />
        </Card.Content>
        <Card.Content>
            <Button fluid primary onClick={() => checkCardImage()}>Complete</Button>
        </Card.Content>
    </Card>)
};

export default withRouter(NewListingImage);
