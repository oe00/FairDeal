import React, {useEffect, useState} from 'react';
import {withRouter} from 'react-router-dom';
import {Card, Image, Segment} from "semantic-ui-react";
import axios from "axios";
import config from "../../../config";
import Loading from "../../../components/Loading";

const NewListingView = props => {

    const {
        code
    } = props;

    const [account, setAccount] = useState(null);

    useEffect(() => {
        async function fetchAccountData() {
            try {
                const res = await axios({
                    method: 'get',
                    url: `${config.apiDomain}/account/${code}`,
                    headers: {
                        authorization: localStorage.getItem(config.accessTokenKey),
                    }
                });
                const data = res.data;
                setAccount(data);
            } catch (e) {
                //TODO: error handling here
                if (e.response.status === 401) {
                    localStorage.clear();
                    window.location.reload();
                }
            }
        }
       fetchAccountData()
    }, []);

    return (
        account ?
            <Card>
                <Image src={`https://robohash.org/${account.name}.png`}/>
                <Segment.Group>
                    <Segment>
                        <h3>{account.name}</h3>
                    </Segment>
                    <Segment>
                        <h3>{account.email}</h3>
                    </Segment>
                    <Segment>
                        <h3>{account.joinedOn}</h3>
                    </Segment>
                    <Segment>
                        <h3>{account.city}</h3>
                    </Segment>
                </Segment.Group>
            </Card> :
            <Loading size={100}/>)
}

export default withRouter(NewListingView);
