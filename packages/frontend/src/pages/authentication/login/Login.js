import React from 'react';
import LoginForm from './LoginForm';
import {Button, Icon, Modal} from "semantic-ui-react";

const Login = (props) => {

    return (
        <Modal closeIcon size="tiny"
               trigger={
                   <Button color="blue">
                       <h3><Icon name="sign in"/>Login</h3>
                   </Button>}>
            <Modal.Header>Login</Modal.Header>
            <Modal.Content>
                <LoginForm/>
            </Modal.Content>
        </Modal>

    );
}

export default Login;
