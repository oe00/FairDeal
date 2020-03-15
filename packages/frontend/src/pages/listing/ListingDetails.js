import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import {Button, Grid, Header, Icon, Message, Tab} from "semantic-ui-react";
import axios from "axios";
import config from "../../config";
import Loading from "../../components/Loading";
import jwt from "jsonwebtoken";
import ListingForm from "./ListingForm";
import ListingImage from "./ListingImage";

const ListingDetails = props => {

    const {
        data: {code},
    } = jwt.decode(localStorage.getItem(config.accessTokenKey));

    const [listing, setListing] = useState(props.passed_listing);

    const panes = [
        {
            menuItem: "Listing Details",
            render: () => <ListingForm listing={listing}/>
        },
        {
            menuItem: "Listing Images",
            render: () => <ListingImage listing={listing}/>
        },

    ];

    async function makeListingPassive(){
        try {
            const res = await axios({
                method: 'patch',
                url: `${config.apiDomain}/listing/${listing.listing_data.code}/set-passive`,
                headers: {
                    'account-code': code,
                    authorization: localStorage.getItem(config.accessTokenKey),
                }
            });

            window.location.reload();

        } catch (e) {
            //setErrorStatus(true);
        }
    }

    async function makeListingActive(){
        try {
            const res = await axios({
                method: 'patch',
                url: `${config.apiDomain}/listing/${listing.listing_data.code}/set-active`,
                headers: {
                    'account-code': code,
                    authorization: localStorage.getItem(config.accessTokenKey),
                }
            });

            window.location.reload();

        } catch (e) {
            //setErrorStatus(true);
        }
    }


    useEffect(() => {
        async function fetchListingData() {
            try {

                const res = await axios({
                    method: 'get',
                    url: `${config.apiDomain}/listing/get/${listing.listing_data.code}`,
                });
                const data = res.data;
                setListing(data);
            } catch (e) {
                // setErrorListing();
            }
        }

        if (!listing)
            fetchListingData();
    }, []);

    return (
        listing ?
            <>
                <Grid columns={2}>
                    <Grid.Column width={12}>
                        <Header size="large">{listing.listing_data.name}</Header>
                    </Grid.Column>
                    <Grid.Column width={4}>
                        {listing.listing_data.status === 1 ?
                            <Button floated="right" negative onClick={() => makeListingPassive()}>Make Listing Passive!</Button> :
                            <Button floated="right" positive onClick={() => makeListingActive()}>Make Listing Active!</Button>}
                    </Grid.Column>
                </Grid>
                <Grid columns={1}>
                    <Grid.Column>
                        <Tab menu={{attached: false, widths: 2}} panes={panes}/>
                    </Grid.Column>
                </Grid>
            </>
            : <Loading size={100}/>
    );
};

ListingDetails.propTypes = {
    history: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
};

export default withRouter(ListingDetails);
