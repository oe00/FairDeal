import React, {useEffect, useState} from 'react';
import {withRouter} from 'react-router-dom';
import {Button, Container, Icon, Message, Modal, Tab, Table} from "semantic-ui-react";
import jwt from "jsonwebtoken";
import config from "../../config";
import axios from "axios";
import Loading from "../../components/Loading";
import BrowseItemDetails from "../browse/BrowseListingDetails";

const Offer = () => {

    const {
        data: {code}
    } = jwt.decode(localStorage.getItem(config.accessTokenKey));

    const [sentOffers, setSentOffers] = useState(null);
    const [receivedOffers, setReceivedOffers] = useState(null);

    const [errorSentOffers, setErrorSentOffers] = useState(false);
    const [emptySentMoneyOffers, setEmptySentMoneyOffers] = useState(false);
    const [emptySentSwapOffers, setEmptySentSwapOffers] = useState(false);

    const [errorReceivedOffers, setErrorReceivedOffers] = useState(false);
    const [emptyReceivedMoneyOffers, setEmptyReceivedMoneyOffers] = useState(false);
    const [emptyReceivedSwapOffers, setEmptyReceivedSwapOffers] = useState(false);

    useEffect(() => {
        async function fetchReceivedOffers() {
            try {
                const swap_res = await axios({
                    method: 'get',
                    url: `${config.apiDomain}/offer/received-swap/account/${code}`,
                    headers: {
                        authorization: localStorage.getItem(config.accessTokenKey),
                    }
                });

                const money_res = await axios({
                    method: 'get',
                    url: `${config.apiDomain}/offer/received-money/account/${code}`,
                    headers: {
                        authorization: localStorage.getItem(config.accessTokenKey),
                    }
                });

                const moneyOffer = money_res.data;
                const swapOffer = swap_res.data;

                if (!moneyOffer) {
                    setEmptyReceivedMoneyOffers(true);
                }
                if (!swapOffer) {
                    setEmptyReceivedSwapOffers(true);
                }
                setReceivedOffers({moneyOffer,swapOffer});
            } catch (e) {

                setErrorReceivedOffers(true);

                if (e.response.status === 401) {
                    localStorage.clear();
                    window.location.reload();
                }
            }
        }

        async function fetchSentOffers() {
            try {
                const swap_res = await axios({
                    method: 'get',
                    url: `${config.apiDomain}/offer/sent-swap/account/${code}`,
                    headers: {
                        authorization: localStorage.getItem(config.accessTokenKey),
                    }
                });

                const money_res = await axios({
                    method: 'get',
                    url: `${config.apiDomain}/offer/sent-money/account/${code}`,
                    headers: {
                        authorization: localStorage.getItem(config.accessTokenKey),
                    }
                });

                const moneyOffer = money_res.data;
                const swapOffer = swap_res.data;

                if (!moneyOffer) {
                    setEmptySentMoneyOffers(true);
                }
                if (!swapOffer) {
                    setEmptySentSwapOffers(true);
                }
                setSentOffers({moneyOffer,swapOffer});
            } catch (e) {

                setErrorSentOffers(true);

                if (e.response.status === 401) {
                    localStorage.clear();
                    window.location.reload();
                }
            }
        }

        fetchReceivedOffers();
        fetchSentOffers();
    }, [code]);

    const panes = [
        {
            menuItem: "Received Offers",
            render: () => {
                return (!errorReceivedOffers ? <Tab menu={{attached: false, widths: 2}} panes={receivedOfferPanes}/> :
                    <Message negative icon>
                        <Icon name='warning sign'/>
                        <Message.Content>
                            <Message.Header>Error.</Message.Header>
                            Error occurred while retrieving Received Offers. Please try again later.
                        </Message.Content>
                    </Message>)
            }
        },
        {
            menuItem: "Sent Offers",
            render: () => {
                return (!errorSentOffers ? <Tab menu={{attached: false, widths: 2}} panes={sentOfferPanes}/> :
                    <Message negative icon>
                        <Icon name='warning sign'/>
                        <Message.Content>
                            <Message.Header>Error.</Message.Header>
                            Error occurred while retrieving Sent Offers. Please try again later.
                        </Message.Content>
                    </Message>)
            }
        },

    ];

    const receivedOfferPanes = [
        {
            menuItem: "Money",
            render: () =>
                <Tab.Pane as={Container} fluid>
                    {receivedOffers && receivedOffers.moneyOffer ?
                        <Table celled compact>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>To Listing</Table.HeaderCell>
                                    <Table.HeaderCell>To User</Table.HeaderCell>
                                    <Table.HeaderCell>Proposed Amount</Table.HeaderCell>
                                    <Table.HeaderCell>Date of Offer</Table.HeaderCell>
                                    <Table.HeaderCell>Status</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {receivedOffers.moneyOffer.map(offer => {
                                    return (
                                        <Table.Row key={offer.code}>
                                            <Table.Cell>
                                                <Modal closeIcon
                                                       trigger={<Button primary><Icon name="eye"/>{offer.toListing}
                                                       </Button>}>
                                                    <Modal.Content scrolling>
                                                        <BrowseItemDetails quickLook
                                                                           passed_listing_code={offer.toListing}/>
                                                    </Modal.Content>
                                                </Modal>
                                            </Table.Cell>
                                            <Table.Cell>{offer.toUser}</Table.Cell>
                                            <Table.Cell>{offer.amount}</Table.Cell>
                                            <Table.Cell>{offer.addedOn}</Table.Cell>
                                            <Table.Cell positive><Icon name='check'/>{offer.status}</Table.Cell>
                                        </Table.Row>
                                    )
                                })}
                            </Table.Body>
                        </Table>
                        : emptyReceivedMoneyOffers ? <Message info icon>
                            <Icon name='warning sign'/>
                            <Message.Content>
                                <Message.Header>No results.</Message.Header>
                                You don't have any received "Money" type offers!
                            </Message.Content>
                        </Message> : <Loading size={100}/>}
                </Tab.Pane>
        },
        {
            menuItem: "Swap",
            render: () =>
                <Tab.Pane as={Container} fluid>
                    {receivedOffers && receivedOffers.swapOffer ?
                        <Table celled compact>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>To Listing</Table.HeaderCell>
                                    <Table.HeaderCell>To User</Table.HeaderCell>
                                    <Table.HeaderCell>Proposed Listing</Table.HeaderCell>
                                    <Table.HeaderCell>Proposed Amount</Table.HeaderCell>
                                    <Table.HeaderCell>Date of Offer</Table.HeaderCell>
                                    <Table.HeaderCell>Status</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {receivedOffers.swapOffer.map(offer => {
                                    return (
                                        <Table.Row key={offer.code}>
                                            <Table.Cell>
                                                <Modal closeIcon
                                                       trigger={<Button primary><Icon name="eye"/>{offer.toListing}
                                                       </Button>}>
                                                    <Modal.Content scrolling>
                                                        <BrowseItemDetails quickLook
                                                                           passed_listing_code={offer.toListing}/>
                                                    </Modal.Content>
                                                </Modal>
                                            </Table.Cell>
                                            <Table.Cell>{offer.toUser}</Table.Cell>
                                            <Table.Cell>{offer.swapListing}</Table.Cell>
                                            <Table.Cell>{offer.amount}</Table.Cell>
                                            <Table.Cell>{offer.addedOn}</Table.Cell>
                                            <Table.Cell positive><Icon name='check'/>{offer.status}</Table.Cell>
                                        </Table.Row>
                                    )
                                })}
                            </Table.Body>
                        </Table>
                        : emptyReceivedSwapOffers ? <Message info icon>
                            <Icon name='warning sign'/>
                            <Message.Content>
                                <Message.Header>No results.</Message.Header>
                                You don't have any received "Swap" type offers!
                            </Message.Content>
                        </Message> : <Loading size={100}/>}
                </Tab.Pane>
        },
    ];

    const sentOfferPanes = [
        {
            menuItem: "Money",
            render: () =>
                <Tab.Pane as={Container} fluid>
                    {sentOffers && sentOffers.moneyOffer ?
                        <Table celled compact>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>To Listing</Table.HeaderCell>
                                    <Table.HeaderCell>To User</Table.HeaderCell>
                                    <Table.HeaderCell>Proposed Amount</Table.HeaderCell>
                                    <Table.HeaderCell>Date of Offer</Table.HeaderCell>
                                    <Table.HeaderCell>Status</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {sentOffers.moneyOffer.map(offer => {
                                    return (
                                        <Table.Row key={offer.code}>
                                            <Table.Cell>
                                                <Modal closeIcon
                                                       trigger={<Button primary><Icon name="eye"/>{offer.toListing}
                                                       </Button>}>
                                                    <Modal.Content scrolling>
                                                        <BrowseItemDetails quickLook
                                                                           passed_listing_code={offer.toListing}/>
                                                    </Modal.Content>
                                                </Modal>
                                            </Table.Cell>
                                            <Table.Cell>{offer.toUser}</Table.Cell>
                                            <Table.Cell>{offer.amount}</Table.Cell>
                                            <Table.Cell>{offer.addedOn}</Table.Cell>
                                            <Table.Cell positive><Icon name='check'/>{offer.status}</Table.Cell>
                                        </Table.Row>
                                    )
                                })}
                            </Table.Body>
                        </Table>
                        : emptySentMoneyOffers ? <Message info icon>
                            <Icon name='warning sign'/>
                            <Message.Content>
                                <Message.Header>No results.</Message.Header>
                                You don't have any sent "Money" type offers!
                            </Message.Content>
                        </Message> : <Loading size={100}/>}
                </Tab.Pane>
        },
        {
            menuItem: "Swap",
            render: () =>
                <Tab.Pane as={Container} fluid>
                    {sentOffers && sentOffers.swapOffer ?
                        <Table celled compact>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>To Listing</Table.HeaderCell>
                                    <Table.HeaderCell>To User</Table.HeaderCell>
                                    <Table.HeaderCell>Proposed Listing</Table.HeaderCell>
                                    <Table.HeaderCell>Proposed Amount</Table.HeaderCell>
                                    <Table.HeaderCell>Date of Offer</Table.HeaderCell>
                                    <Table.HeaderCell>Status</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {sentOffers.swapOffer.map(offer => {
                                    return (
                                        <Table.Row key={offer.code}>
                                            <Table.Cell>
                                                <Modal closeIcon
                                                       trigger={<Button primary><Icon name="eye"/>{offer.toListing}
                                                       </Button>}>
                                                    <Modal.Content scrolling>
                                                        <BrowseItemDetails quickLook
                                                                           passed_listing_code={offer.toListing}/>
                                                    </Modal.Content>
                                                </Modal>
                                            </Table.Cell>
                                            <Table.Cell>{offer.toUser}</Table.Cell>
                                            <Table.Cell>{offer.swapListing}</Table.Cell>
                                            <Table.Cell>{offer.amount}</Table.Cell>
                                            <Table.Cell>{offer.addedOn}</Table.Cell>
                                            <Table.Cell positive><Icon name='check'/>{offer.status}</Table.Cell>
                                        </Table.Row>
                                    )
                                })}
                            </Table.Body>
                        </Table>
                        : emptySentSwapOffers ? <Message info icon>
                            <Icon name='warning sign'/>
                            <Message.Content>
                                <Message.Header>No results.</Message.Header>
                                You don't have any sent "Swap" type offers!
                            </Message.Content>
                        </Message> : <Loading size={100}/>}
                </Tab.Pane>
        },
    ];


    return (
        <Tab menu={{attached: false, widths: 2}} panes={panes}/>
    );
};


export default withRouter(Offer);
