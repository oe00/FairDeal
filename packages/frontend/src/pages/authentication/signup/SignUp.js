import React, {useState} from 'react';
import SignUpForm from './SignUpForm';
import {Button, Icon, Modal} from "semantic-ui-react";

const SignUp = () => {

    return (
        <Modal closeIcon size="tiny"
               trigger={<Button color="green">
                   <h3><Icon name="signup"/>Sign Up</h3></Button>}>
            <Modal.Header>Sign Up</Modal.Header>
            <Modal.Content>
                <SignUpForm/>
            </Modal.Content>
        </Modal>

    );
}

export default SignUp;
