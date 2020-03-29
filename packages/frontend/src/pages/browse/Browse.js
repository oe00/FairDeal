import React, {useEffect, useState} from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import config from '../../config';
import BrowseListingCard from "./BrowseListingCard";
import {Card, Grid} from "semantic-ui-react";
import SideBar from "../../components/SideBar";
import Loading from "../../components/Loading";

const Browse = () => {

    const [listings, setListings] = useState(null);

    useEffect(() => {
        async function fetchBrowseListings() {
            try {
                const res = await axios({
                    method: 'get',
                    url: `${config.apiDomain}/listing/browse`,
                });
                const data = res.data;

                setListings(data);
            } catch (e) {
                //TODO: error handling here
            }
        }
        fetchBrowseListings();
    }, []);


    return (
        <Grid>
            <Grid.Column width={3}>
                <SideBar/>
            </Grid.Column>
            <Grid.Column width={1}/>
            <Grid.Column width={11}>
                {listings ?
                    <Card.Group itemsPerRow={4}>
                        {listings.map((item) => (
                            <BrowseListingCard key={item.listing_data.code} item={item}/>
                        ))}
                    </Card.Group>
                    :
                    <Loading size={150}/>
                }
            </Grid.Column>
            <Grid.Column width={1}/>
        </Grid>
    );
};

Browse.propTypes = {
    history: PropTypes.object.isRequired,
};

export default withRouter(Browse);
