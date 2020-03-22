import React, {useState} from 'react';
import {withRouter} from 'react-router-dom';
import {Grid, Icon, Message, Step} from "semantic-ui-react";
import NewListingForm from "./NewListingForm";
import jwt from "jsonwebtoken";
import config from "../../../config";
import NewListingImage from "./NewListingImage";
import BrowseListingDetails from "../../browse/BrowseListingDetails";

const NewListing = props => {

    const {
        data: {code}
    } = jwt.decode(localStorage.getItem(config.accessTokenKey));

    const [step, setStep] = useState(0);
    const [listingCompleted, setListingCompleted] = useState(null);
    const [newListingCode, setNewListingCode] = useState(null);

    return (
            <Grid>
                {listingCompleted ?
                    <Grid.Column>
                            <Message positive icon>
                                <Icon name='check'/>
                                <Message.Content>
                                    <Message.Header>Success</Message.Header>
                                    Listing is posted. You can edit details from Listings tab.
                                </Message.Content>
                            </Message>
                        <BrowseListingDetails passed_listing_code={newListingCode}/>
                    </Grid.Column>
                    : <Grid.Column width={16}>
                        <Step.Group fluid>
                            <Step active={step === 0}>
                                <Icon name="info"/>
                                <Step.Content>
                                    <Step.Title>Info</Step.Title>
                                    <Step.Description>
                                        Add required listing information.
                                    </Step.Description>
                                </Step.Content>
                            </Step>
                            <Step active={step === 1}>
                                <Icon name="picture"/>
                                <Step.Content>
                                    <Step.Title>Image</Step.Title>
                                    <Step.Description>
                                        Add at least one picture of listing.
                                    </Step.Description>
                                </Step.Content>
                            </Step>
                        </Step.Group>
                        {step === 0 && <NewListingForm setNewListingCode={setNewListingCode} setStep={setStep}/>}
                        {newListingCode && step === 1 && <NewListingImage listing_code={newListingCode} setListingCompleted={setListingCompleted}/>}
                    </Grid.Column>
                }
            </Grid>
    );
};


export default withRouter(NewListing);
