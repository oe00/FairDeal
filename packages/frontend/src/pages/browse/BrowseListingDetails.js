import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import {
    Button,
    Card,
    Grid,
    Image,
    Input,
    Pagination,
    Radio,
    Segment,
    Form,
    Icon,
    Modal,
    Header
} from "semantic-ui-react";
import axios from "axios";
import config from "../../config";
import BrowseListingAccountCard from "./BrowseListingAccountCard";
import Loading from "../../components/Loading";
import BrowseItemOfferForm from "./BrowseListingOfferForm";
import jwt from "jsonwebtoken";

const BrowseListingDetails = props => {

    const {
        match: {params: {id}},
        passed_listing,
        passed_listing_code,
        quickLook
    } = props;

    let accountCode = null;
    if (jwt.decode(localStorage.getItem(config.accessTokenKey))) {
        const {
            data: {code},
        } = jwt.decode(localStorage.getItem(config.accessTokenKey));
        accountCode = code;
    }

    const [listing, setItem] = useState(passed_listing);

    const [copied, setCopied] = useState(false);

    const [activePage, setActivePage] = useState(1);

    const [images, setImages] = useState(null);

    useEffect(() => {
        async function fetchListingData() {
            try {

                const res = await axios({
                    method: 'get',
                    url: `${config.apiDomain}/listing/get/${id ? id : passed_listing_code}`,
                });
                const data = res.data;
                setItem(data);
            } catch (e) {
                //TODO: error handling here
            }
        }

        async function fetchListingImages() {
            try {

                const res = await axios({
                    method: 'get',
                    url: `${config.apiDomain}/listing/get-image/${id ? id : passed_listing_code ? passed_listing_code : listing.listing_data.code }`,
                });

                const data = res.data;

                if (!data) {
                    //setEmptyActiveListings(true);
                }
                setImages(data);
            } catch (e) {

                //setErrorActiveListings(true);
            }
        }

        if (!listing) {
            fetchListingData();
        }

        fetchListingImages();
    }, []);

    const onChange = (e, pageInfo) => {
        setActivePage(pageInfo.activePage);
    };


    return (
        listing ?
            <Segment>
                <Grid columns={2}>
                    <Grid.Column width={12}>
                        <Header size="huge">{listing.listing_data.name}
                        </Header>
                    </Grid.Column>
                    <Grid.Column width={4}>
                        {quickLook && accountCode !== listing.listing_data.addedBy &&
                        <Button size="large" floated="right" color="red" onClick={() => {
                            window.location.href = `/browse/${listing.listing_data.code}`
                        }}><Icon name="exchange"/>Make an Offer!</Button>}
                        {!quickLook && (!copied ? <Button color='green' floated="right"
                                                          onClick={() => {
                                                              navigator.clipboard.writeText(`${config.clientDomain}/browse/${listing.listing_data.code}`).then(r => setCopied(true))
                                                          }}>
                                <Icon name='share'/>
                                Copy Link
                            </Button> :
                            <Button color='green' floated="right">
                                <Icon name='check'/>
                                Link Copied
                            </Button>)}
                    </Grid.Column>
                </Grid>
                <Grid columns={2}>
                    <Grid.Column width={quickLook ? 6 : 4}>
                        <Card fluid>
                            {images ? <><Image wrapped ui={false}
                                               label={{
                                                   as: 'a',
                                                   color: listing.category_data.color,
                                                   content: listing.category_data.name,
                                                   ribbon: true,
                                                   size: (quickLook ? "small" : "large")
                                               }}
                                               src={`${config.apiDomain}/image/listing/${listing.listing_data.code}/${images[activePage-1]}`}/>
                                    <Pagination boundaryRange={0}
                                                activePage={activePage}
                                                siblingRange={1}
                                                ellipsisItem={null}
                                                firstItem={null}
                                                lastItem={null}
                                                totalPages={5}
                                                style={{justifyContent: "center"}}
                                                onPageChange={onChange}/></>
                                : <Loading size={100}/>}
                        </Card>
                    </Grid.Column>
                    <Grid.Column width={quickLook ? 10 : 9}>
                        <Card fluid>
                            <Card.Content>
                                <Segment.Group horizontal widths={3}>
                                    <Segment>
                                        <div style={{fontSize: "1.28571429rem"}}>Asking Price
                                            <h2>${listing.listing_data.askingPrice}</h2></div>
                                    </Segment>
                                    <Segment>
                                        <div style={{fontSize: "1.28571429rem"}}>Condition
                                            <h2>{listing.listing_data.listingCondition}</h2></div>
                                    </Segment>
                                    <Segment>
                                        <div style={{fontSize: "1.28571429rem"}}>Listing Code
                                            <h2>{listing.listing_data.code}</h2></div>
                                    </Segment>
                                </Segment.Group>

                            </Card.Content>
                            <Segment.Group>
                                <Segment>
                                    {listing.listing_data.description}
                                </Segment>
                            </Segment.Group>
                        </Card>
                    </Grid.Column>
                    {!quickLook && <Grid.Column width={3}>
                        <BrowseListingAccountCard account={listing.listing_data.addedBy}/>
                    </Grid.Column>}
                </Grid>
                {(accountCode !== listing.listing_data.addedBy && !quickLook) &&
                <Grid columns={1}>
                    <Grid.Column width={16}>
                        <BrowseItemOfferForm listing={listing.listing_data}/>
                    </Grid.Column>
                    <div style={{height: "1em"}}/>
                </Grid>}
            </Segment>
            : <Loading size={100}/>
    );
};

BrowseListingDetails.propTypes = {
    history: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
};

export default withRouter(BrowseListingDetails);
