import React from 'react';
import {BrowserRouter as Router, Redirect, Route} from 'react-router-dom';
import Navigation from './components/Navigation';
import {Container} from "semantic-ui-react";
import Browse from "./pages/browse/Browse";
import BrowseItemDetails from "./pages/browse/BrowseListingDetails";
import Account from "./pages/account/Account";
import Offer from "./pages/offer/Offer";
import Listing from "./pages/listing/Listing";
import config from "./config";
import NewListing from "./pages/listing/NewListing/NewListing";


const App = () => {

    const routes = [
        {
            path: '/listings',
            exact: true,
            component: () => <Listing/>,
        },
        {
            path: '/offers',
            exact: true,
            component: () => <Offer/>,
        },
        {
            path: '/deals',
            component: () => <div/>,
        },
        {
            path: '/account',
            component: () => <Account/>,
        },
        {
            path: '/new-listing',
            component: () => <NewListing/>,
        },
    ];

    const signed = localStorage.getItem(config.accessTokenKey);

    const canView = window.location.pathname.toString().includes("browse");


    return (
        <Router>
            <Container className="stickyContainer">
                <Navigation/>
                <Route path="/" exact component={() => <Redirect to="/browse"/>}/>
                <Route path="/browse" exact component={Browse}/>
                <Route path="/browse/:id" exact component={BrowseItemDetails}/>

                {signed ? routes.map((route, index) => (
                    <Route
                        key={index}
                        path={route.path}
                        exact={route.exact}
                        component={route.component}
                    />
                )) : canView ? null : <Redirect to="/"/>}

            </Container>
        </Router>);
};

export default App;
