import React, {useEffect, useState} from 'react';
import {withRouter} from 'react-router-dom';
import {Card, Header, Image, Modal, Segment} from "semantic-ui-react";
import axios from "axios";
import config from "../../config";
import Loading from "../../components/Loading";
import BrowseAccountDetails from "./BrowseListingAccountDetails";

const BrowseListingAccountCard = props => {

    const {account, inDetail} = props;

    const [listingOwner, setListingOwner] = useState(null);

    useEffect(() => {
        async function fetchListingOwnerData() {
            try {
                const res = await axios({
                    method: 'get',
                    url: `${config.apiDomain}/account/summary/${account}`,
                });
                const data = res.data;
                setListingOwner(data);
            } catch (e) {
                //TODO: error handling here
            }
        }

        fetchListingOwnerData();
    }, []);

    return (
        listingOwner ?
            !inDetail ?
                <Modal closeIcon
                       trigger={
                           <Card>
                               <Image src={`${config.apiDomain}/account/${listingOwner.code}/get-image`}/>
                               <Segment.Group>
                                   <Segment>
                                       <Header>{listingOwner.name}</Header>
                                   </Segment>
                                   <Segment>
                                       <Header>{listingOwner.joinedOn}</Header>
                                   </Segment>
                                   <Segment>
                                       <Header>{listingOwner.city}</Header>
                                   </Segment>
                               </Segment.Group>
                           </Card>
                       }>
                    <Modal.Content scrolling>
                        <BrowseAccountDetails code={account}/>
                    </Modal.Content>
                </Modal>
                : <Card>
                    <Image src={`${config.apiDomain}/image/account/${listingOwner.code}`}/>
                    <Segment.Group>
                        <Segment>
                            <h3>{listingOwner.name}</h3>
                        </Segment>
                        <Segment>
                            <h3>{listingOwner.joinedOn}</h3>
                        </Segment>
                        <Segment>
                            <h3>{listingOwner.city}</h3>
                        </Segment>
                    </Segment.Group>
                </Card>
            :
            <Loading size={100}/>)
}

export default withRouter(BrowseListingAccountCard);
