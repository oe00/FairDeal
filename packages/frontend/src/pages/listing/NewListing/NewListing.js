import React, {useState} from 'react';
import {withRouter} from 'react-router-dom';
import {Grid, Header, Segment} from "semantic-ui-react";
import NewListingView from "./NewListingView";
import NewListingForm from "./NewListingForm";
import jwt from "jsonwebtoken";
import config from "../../../config";

const NewListing = props => {

    const {
        data: {code}
    } = jwt.decode(localStorage.getItem(config.accessTokenKey));

    return (
        <Segment>
            <Header size="huge">New Listing</Header>
            <Grid>
                <Grid.Column width={12}>
                    <NewListingForm code={code}/>
                </Grid.Column>
                <Grid.Column width={4}>
                    <NewListingView code={code}/>
                </Grid.Column>
            </Grid>
        </Segment>
    );
};


export default withRouter(NewListing);
