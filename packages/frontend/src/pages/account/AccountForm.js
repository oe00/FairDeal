import React, {useRef, useState} from 'react';
import axios from 'axios';
import {withRouter} from 'react-router-dom';
import config from '../../config';
import {Button, Card, Divider, Form, Icon, Message} from "semantic-ui-react";

const AccountForm = props => {


    const {code} = props;

    const fileInputRef = useRef("fileInput");

    const [value1, setValue1] = useState(null);
    const [value2, setValue2] = useState(null);
    const [value3, setValue3] = useState(null);
    const [value4, setValue4] = useState(null);
    const [value5, setValue5] = useState(null);

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
    const onChange5 = event => {
        setValue5(event.target.value);
    };

    const [error, setError] = useState(null);

    const [updated, setUpdated] = useState(false);

    const [loading, setLoading] = useState(null);

    const accountUpdate = async () => {
        try {

            const res = await axios({
                method: "put",
                url: `${config.apiDomain}/account/${code}`,
                data: {
                    name: value1,
                    email: value2,
                    password: value3,
                    city: value4,
                    oldPassword: value5,
                },
                headers: {
                    authorization: localStorage.getItem(config.accessTokenKey),
                }
            });

            if (res.status === 200) {

                setUpdated(true);
                setLoading(false);

                setTimeout(() => {
                    setUpdated(false);
                    window.location.reload();
                }, 1000);
            }

        } catch (e) {
            setLoading(false);
            setError(true);

            setTimeout(() => {
                setError(false);
            }, 2500);
        }
    };

    async function uploadAccountImage(file) {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const res = await axios({
                method: "post",
                url: `${config.apiDomain}/upload/account/${code}`,
                data: formData,
                headers: {
                    authorization: localStorage.getItem(config.accessTokenKey),
                    'content-type': 'multipart/form-data',
                },
            });
        } catch (e) {
        }
    }

    const isInvalid = !value5;

    return (<Card><Card.Content>{
        updated ?
            (<Message positive icon>
                <Icon name='check'/>
                <Message.Content>
                    <Message.Header>Success</Message.Header>
                    Your information is updated.
                </Message.Content>
            </Message>)
            :
            (<Form autoComplete="off" loading={loading} onSubmit={() => {
                setLoading(true);
                setError(false);
                accountUpdate();

            }}>
                {error && (
                    <Message negative icon>
                        <Icon name='warning sign'/>
                        <Message.Content>
                            <Message.Header>Error</Message.Header>
                            Either old password is wrong or new e-mail is in use.
                        </Message.Content>
                    </Message>
                )}
                <Form.Input
                    label="New Name"
                    iconPosition="left"
                    icon="user"
                    type="text"
                    placeholder="Enter New Name"
                    onChange={onChange1}
                />
                <Form.Input
                    label="New Email"
                    iconPosition="left"
                    icon="mail"
                    type="email"
                    placeholder="Enter New Email"
                    onChange={onChange2}
                />
                <Form.Input
                    label="New Password"
                    iconPosition="left"
                    icon="key"
                    type="password"
                    placeholder="Enter New Password"
                    autoComplete="new-password"
                    onChange={onChange3}
                />
                <Form.Input
                    label="New City"
                    iconPosition="left"
                    icon="building"
                    type="text"
                    placeholder="Enter New City"
                    onChange={onChange4}
                />

                <Card fluid>
                    <Card.Content><Button positive fluid onClick={(e) => {
                        e.preventDefault();
                        fileInputRef.current.click()}}>
                        Add Image</Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            hidden
                            onChange={(e) => {
                                e.preventDefault();
                                uploadAccountImage(e.target.files[0]);
                            }}
                        /></Card.Content>
                </Card>


                <Divider/>
                <Form.Input
                    label="Old Password"
                    iconPosition="left"
                    icon="key"
                    type="password"
                    placeholder="Enter Old Password"
                    autoComplete="new-password"
                    onChange={onChange5}
                    required
                />
                <Button primary disabled={isInvalid} type="submit">
                    Submit
                </Button>
            </Form>)
    }
    </Card.Content>
    </Card>)
};

export default withRouter(AccountForm);
