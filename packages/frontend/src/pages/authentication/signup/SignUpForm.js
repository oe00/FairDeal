import React, {useState} from 'react';
import axios from 'axios';
import {withRouter} from 'react-router-dom';
import config from '../../../config';
import {Button, Form, Icon, Message} from "semantic-ui-react";

const SignUpForm = () => {

    const [value1, setValue1] = useState(null);
    const [value2, setValue2] = useState(null);
    const [value3, setValue3] = useState(null);
    const [value4, setValue4] = useState(null);

    const [error, setError] = useState(false);
    const [signed, setSigned] = useState(false);
    const [loading, setLoading] = useState(false);

    const signUp = async () => {
        try {
            const res = await axios({
                method: "post",
                url: `${config.apiDomain}/account/register`,
                data: {
                    name: value1,
                    city: value2,
                    email: value3,
                    password: value4,
                }
            });

            if (res.status === 200) {

                setSigned(true);
                setLoading(false);

                setTimeout(async () => {

                    const res = await axios({
                        method: "post",
                        url: `${config.apiDomain}/auth`,
                        data: {
                            email: value3,
                            password: value4,
                        }
                    });

                    if (res.status === 200) {
                        localStorage.setItem(config.accessTokenKey, res.data.accessToken);

                        window.location.reload();
                    }
                }, 2000);
            }

        } catch (e) {
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

    const onChange3 = event => {
        setValue3(event.target.value);
    };

    const onChange4 = event => {
        setValue4(event.target.value);
    };

    const isInvalid = !value1 || !value2;

    return signed ?
        (<Message positive icon>
            <Icon name='circle notched' loading/>
            <Message.Content>
                <Message.Header>Welcome!</Message.Header>
                You will be redirected in 3 seconds!
            </Message.Content>
        </Message>)
        :
        (<Form loading={loading} onSubmit={() => {
            setLoading(true);
            setError(false);
            signUp();
        }}>
            {error && (
                <Message negative icon>
                    <Icon name='warning sign'/>
                    <Message.Content>
                        <Message.Header>Error</Message.Header>
                        Email is in use. Try another one!
                    </Message.Content>
                </Message>
            )}
            <Form.Input
                label="Name"
                iconPosition="left"
                icon="user"
                type="text"
                placeholder="Enter Name"
                onChange={onChange1}
                required/>
            <Form.Input
                label="City"
                iconPosition="left"
                icon="building"
                type="text"
                placeholder="Enter City"
                onChange={onChange2}
                required/>
            <Form.Input
                label="Email"
                iconPosition="left"
                icon="mail"
                type="email"
                placeholder="Enter Email"
                onChange={onChange3}
                required/>
            <Form.Input
                label="Password"
                iconPosition="left"
                icon="key"
                type="password"
                placeholder="Enter Password"
                onChange={onChange4}
                required/>
            <Button fluid primary disabled={isInvalid} type="submit">
                Submit
            </Button>
        </Form>)
};

export default withRouter(SignUpForm);
