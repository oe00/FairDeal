import React, {useState, useEffect} from 'react';
import {withRouter} from 'react-router-dom';
import {
    Button,
    Segment,
    Form,
    Tab,
    Icon,
    Header, Message, Container
} from "semantic-ui-react";
import axios from "axios";
import config from "../../config";
import Loading from "../../components/Loading";
import Login from "../authentication/login/Login";
import jwt from "jsonwebtoken";


const BrowseListingOfferForm = props => {

    const {listing} = props;

    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const [value1, setValue1] = useState(null);
    const [value2, setValue2] = useState(null);
    const [value3, setValue3] = useState(0);

    let signed = localStorage.getItem(config.accessTokenKey);

    const onChange2 = (e, {value}) => setValue2({value});

    const onChange1 = event => {
        setValue1(event.target.value);
    };

    const onChange3 = event => {
        setValue3(event.target.value);
    };

    const makeOffer = async (offerType) => {
        try {

            const {
                data: {code},
            } = jwt.decode(localStorage.getItem(config.accessTokenKey));

            const res = await axios({
                method: "post",
                url: `${config.apiDomain}/offer/makeOffer`,
                data: {
                    toListing: listing.code,
                    toUser: listing.addedBy,
                    fromUser: code,
                    offerType: offerType,
                    swapListing: offerType === 0 ? null : value2.value,
                    amount: offerType === 0 ? value1 : value3,
                },
                headers: {
                    authorization: localStorage.getItem(config.accessTokenKey),
                }
            });

            if (res.status === 200) {
                setLoading(false);

                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
                }, 2500);
            }

        } catch (e) {
            setLoading(false);
            setError(true);

            console.log(e.response);

            if (e.response.status === 401) {
                localStorage.clear();
                window.location.reload();
            }

            setTimeout(() => {
                setError(false);
            }, 2500);

        }
    };

    const panes = [
        {
            menuItem: "Money",
            render: () =>
                <Tab.Pane as={Container} fluid>
                    <Form loading={loading} onSubmit={() => {
                        setLoading(true);
                        makeOffer(0);
                    }}>
                        <Form.Input
                            label="Amount"
                            iconPosition="left"
                            icon="dollar"
                            type="number"
                            placeholder="Enter amount"
                            onChange={onChange1}
                            required
                        />
                        <Button fluid primary disabled={!value1 ? true : loading} type="submit">
                            Submit
                        </Button>
                    </Form>
                </Tab.Pane>
        },
        {
            menuItem: "Swap", render: () =>
                <Tab.Pane as={Container} fluid>
                    <Form loading={loading} onSubmit={() => {
                        setLoading(true);
                        makeOffer(1);
                    }}>
                        <Form.Dropdown label="Offered Listing" required selection options={options}
                                       placeholder='Choose an listing'
                                       onChange={onChange2}/>
                        <Form.Input
                            label="You Can Enter Additional Amount"
                            iconPosition="left"
                            icon="dollar"
                            type="number"
                            value={value3}
                            onChange={onChange3}
                            required
                        />
                        <Button fluid primary disabled={!value2 ? true : loading} type="submit">
                            Submit
                        </Button>
                    </Form>
                </Tab.Pane>
        },
    ];

    const options = [
        {
            key: 1,
            text: 'Mobile',
            value: 98765,
            content: (
                <Header icon='mobile' content='Mobile' subheader='The smallest size'/>
            ),
        },
        {
            key: 2,
            text: 'Tablet',
            value: 2,
            content: (
                <Header
                    icon='tablet'
                    content='Tablet'
                    subheader='The size in the middle'
                />
            ),
        },
        {
            key: 3,
            text: 'Desktop',
            value: 3,
            content: (
                <Header icon='desktop' content='Desktop' subheader='The largest size'/>
            ),
        },
    ];

    return (
        <Segment>
            <h3>Make an Offer</h3>
            {(signed) ?
                <>{success && <Message positive icon>
                    <Icon name='check'/>
                    <Message.Content>
                        <Message.Header>Offer Sent!</Message.Header>
                        You can track offers in Offers tab.
                    </Message.Content>
                </Message>}
                    {error && (
                        <Message negative icon>
                            <Icon name='warning sign'/>
                            <Message.Content>
                                <Message.Header>Error</Message.Header>
                                Please try it later again.
                            </Message.Content>
                        </Message>
                    )}
                    <Tab menu={{attached: false, widths: 2}} panes={panes} onTabChange={() => {
                        setValue1(null);
                        setValue2(null);
                        setValue3(0);
                    }}/>
                </>
                : <Segment placeholder>
                    <Header icon>
                        <Icon name='lock'/>
                        Login to Make an Offer!
                    </Header>
                </Segment>}
        </Segment>
    );
};

export default withRouter(BrowseListingOfferForm);
