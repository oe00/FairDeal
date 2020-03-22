import React from 'react';
import {withRouter} from 'react-router-dom';
import {Card, Grid} from "semantic-ui-react";
import AccountSidebar from "./AccountSidebar";
import AccountForm from "./AccountForm";
import jwt from "jsonwebtoken";
import config from "../../config";

const Account = props => {

    const {
        data: {code}
    } = jwt.decode(localStorage.getItem(config.accessTokenKey));

    return (
        <Grid columns={3}>
            <Grid.Column width={3}>
                <AccountForm code={code}/>
            </Grid.Column>
            <Grid.Column width={10}>
                <Card fluid>
                    <Card.Content>
                        <Card.Header>Feedback</Card.Header>
                    </Card.Content>
                </Card>
            </Grid.Column>
            <Grid.Column width={3}>
                <AccountSidebar code={code}/>
            </Grid.Column>
        </Grid>
    );
};


export default withRouter(Account);
