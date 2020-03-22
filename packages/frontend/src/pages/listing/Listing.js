import React, {useEffect, useState} from 'react';
import {withRouter} from 'react-router-dom';
import {Container, Icon, Message, Tab} from "semantic-ui-react";
import jwt from "jsonwebtoken";
import config from "../../config";
import axios from "axios";
import Loading from "../../components/Loading";
import ListingDetails from "./ListingDetails";

const Listing = props => {

    const {
        data: {code}
    } = jwt.decode(localStorage.getItem(config.accessTokenKey));


    const [activeListings, setActiveListings] = useState(null);
    const [passiveListings, setPassiveListings] = useState(null);

    const [errorActiveListings, setErrorActiveListings] = useState(false);
    const [errorPassiveListings, setErrorPassiveListings] = useState(false);

    const [emptyActiveListings, setEmptyActiveListings] = useState(false);
    const [emptyPassiveListings, setEmptyPassiveListings] = useState(false);

    useEffect(() => {

        async function fetchActiveListings() {
            try {
                const res = await axios({
                    method: 'get',
                    url: `${config.apiDomain}/listing/active/account/${code}`,
                    headers: {
                        authorization: localStorage.getItem(config.accessTokenKey),
                    }
                });

                const data = res.data;

                if (!data) {
                    setEmptyActiveListings(true);
                }
                setActiveListings(data);
            } catch (e) {

                setErrorActiveListings(true);

                if (e.response.status === 401) {
                    localStorage.clear();
                    window.location.reload();
                }
            }
        }

        async function fetchPassiveListings() {
            try {
                const res = await axios({
                    method: 'get',
                    url: `${config.apiDomain}/listing/passive/account/${code}`,
                    headers: {
                        authorization: localStorage.getItem(config.accessTokenKey),
                    }
                });
                const data = res.data;

                if (!data) {
                    setEmptyPassiveListings(true);
                }

                setPassiveListings(data);
            } catch (e) {

                setErrorPassiveListings(true);

                if (e.response.status === 401) {
                    localStorage.clear();
                    window.location.reload();
                }
            }
        }

        fetchActiveListings();
        fetchPassiveListings();
    }, []);

    const panes = [
        {
            menuItem: "Active Listings", render: () =>
                <Tab.Pane as={Container} fluid>
                    {activeListings ?
                        <Tab
                            grid={{paneWidth: 13, tabWidth: 3}}
                            menu={{vertical: true, fluid: true}}
                            menuPosition='left'
                            panes={activeListings.map((listing, index) => {
                                return ({
                                    menuItem: `${listing.listing_data.name}`,
                                    render: () =>
                                        <Tab.Pane key={"active-"+index}>
                                            <ListingDetails passed_listing={listing}/>
                                        </Tab.Pane>
                                })
                            })}
                        />
                        : emptyActiveListings ? <Message info icon>
                            <Icon name='warning sign'/>
                            <Message.Content>
                                <Message.Header>No results.</Message.Header>
                                You don't have any active listings!
                            </Message.Content>
                        </Message> : <Loading size={100}/>}
                </Tab.Pane>
        },
        {
            menuItem: "Passive Listings", render: () =>
                <Tab.Pane as={Container} fluid>
                    {passiveListings ?
                        <Tab
                            grid={{paneWidth: 13, tabWidth: 3}}
                            menu={{vertical: true, fluid: true}}
                            menuPosition='left'
                            panes={passiveListings.map((listing, index) => {
                                return ({
                                    menuItem: `${listing.listing_data.name}`,
                                    render: () =>
                                        <Tab.Pane key={"passive-"+index}>
                                            <ListingDetails passed_listing={listing}/>
                                        </Tab.Pane>
                                })
                            })}
                        />
                        : emptyPassiveListings ? <Message info icon>
                            <Icon name='warning sign'/>
                            <Message.Content>
                                <Message.Header>No results.</Message.Header>
                                You don't have any passive listings!
                            </Message.Content>
                        </Message> : <Loading size={100}/>}
                </Tab.Pane>
        },

    ];

    return (
            <Tab menu={{attached: false, widths: 2}} panes={panes}/>
    );
};


export default withRouter(Listing);
