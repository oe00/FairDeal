import React, {useState} from 'react';
import axios from 'axios';
import {withRouter} from 'react-router-dom';
import config from '../../../config';
import {Form, Button, Message, Icon} from "semantic-ui-react";

const LoginForm = props => {

    const [value1, setValue1] = useState(null);
    const [value2, setValue2] = useState(null);
    const [loading, setLoading] = useState(null);
    const [error, setError] = useState(null);

    const login = async () => {
        try {
            const res = await axios({
                method: "post",
                url: `${config.apiDomain}/auth`,
                data: {
                    email: value1,
                    password: value2,
                }
            });

            if (res.status === 200) {
                localStorage.setItem(config.accessTokenKey, res.data.accessToken);

                window.location.reload();
            }

        } catch (e) {

            console.log("wtf")

            setLoading(false);
            setError(true);

            setTimeout(() => {
                setError(false);
            }, 2500);

        }
    };

    const onChange1 = event => {
        setValue1(event.target.value);
    };

    const onChange2 = event => {
        setValue2(event.target.value);
    };

    const isInvalid = !value1 || !value2;

    return (
        <Form loading={loading} onSubmit={() => {
            setLoading(true);
            setError(false);
            login();
        }}>
            {error && (
                <Message negative icon>
                    <Icon name='warning sign'/>
                    <Message.Content>
                        <Message.Header>Error</Message.Header>
                        Invalid username or password.
                    </Message.Content>
                </Message>
            )}
            <Form.Input
                label="Email"
                iconPosition="left"
                icon="mail"
                type="email"
                placeholder="Enter Email"
                onChange={onChange1}
                required/>
            <Form.Input
                label="Password"
                iconPosition="left"
                icon="key"
                type="password"
                placeholder="Enter Password"
                onChange={onChange2}
                required/>
            <Button fluid primary disabled={isInvalid} type="submit">
                Submit
            </Button>
        </Form>);
};

export default withRouter(LoginForm);
