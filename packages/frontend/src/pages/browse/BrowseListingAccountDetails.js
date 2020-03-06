import React from 'react';
import {withRouter} from 'react-router-dom';
import {Card, Grid} from "semantic-ui-react";
import BrowseListingAccountCard from "./BrowseListingAccountCard";


const BrowseListingAccountDetails = props => {

    const {code} = props;

    return (
        <Grid columns={2}>
            <Grid.Column width={12}>
                <Card fluid>
                    <Card.Content>
                        <Card.Header>Feedback</Card.Header>
                    </Card.Content>
                </Card>
            </Grid.Column>
            <Grid.Column width={4}>
                <BrowseListingAccountCard inDetail account={code}/>
            </Grid.Column>
        </Grid>
    );
};


export default withRouter(BrowseListingAccountDetails);
