import React from 'react';
import config from '../config';
import {Button, Icon, Menu} from "semantic-ui-react";
import {Link} from "react-router-dom";
import Login from "../pages/authentication/login/Login";
import SignUp from "../pages/authentication/signup/SignUp";


const Navigation = () => {

        const isBrowse = window.location.pathname.toString() === "/browse";

        let index = 0;
        switch (window.location.pathname.toString()) {
            case "/listings":
                index = 1;
                break;
            case "/offers":
                index = 2;
                break;
            case "/deals":
                index = 3;
                break;
            case "/account":
                index = 4;
                break;
            case "/new-listing":
                index = 5;
                break;
        }

        const signed = localStorage.getItem(config.accessTokenKey);


        return (
            (signed) ?
                (<div className={isBrowse ? "stickyMenu" : "normalMenu"}>
                    <Menu widths={7}>
                        <Button animated fluid color="red"
                                as={Link} to={"/browse"}>
                            <Button.Content visible><h1>Fair Deal</h1></Button.Content>
                            <Button.Content style={{top: "30%"}} hidden><h1>Browse</h1></Button.Content>
                        </Button>
                        <Menu.Item active={index === 1} as={Link} to={"/listings"}>
                            <h3>Listings</h3></Menu.Item>
                        <Menu.Item active={index === 2} as={Link} to={"/offers"}>
                            <h3>Offers</h3></Menu.Item>
                        <Menu.Item active={index === 3} as={Link} to={"/deals"}>
                            <h3>Deals</h3></Menu.Item>
                        <Menu.Item active={index === 4} as={Link} to={"/account"}>
                            <h3>Account</h3></Menu.Item>
                        <Menu.Item active={index === 5} as={Link}
                                   to={"/new-listing"}>
                            <Button positive compact>
                                <Icon name="add"/>
                                New Listing</Button>
                        </Menu.Item>
                        <Menu.Item><Button onClick={() => {
                            {
                                localStorage.clear();
                                window.location.reload();
                            }
                        }}>
                            <Icon name="sign out"/>
                            Sign Out</Button></Menu.Item>

                    </Menu>
                </div>)
                :
                (<div className={isBrowse ? "stickyMenu" : "normalMenu"}>
                    <Menu widths={3}>
                        <Button animated fluid color="red" as={Link} to={"/browse"}>
                            <Button.Content visible><h1>Fair Deal</h1></Button.Content>
                            <Button.Content style={{top: "30%"}} hidden><h1>Browse</h1></Button.Content>
                        </Button>
                        <Menu.Item><Login/></Menu.Item>
                        <Menu.Item><SignUp/></Menu.Item>
                    </Menu>
                </div>)
        );
    }
;

export default Navigation;
