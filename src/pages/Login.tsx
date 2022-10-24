import './Login.css';

import React, { useState, useRef } from 'react';
import { Navigate } from "react-router-dom";
import { authorizeUser } from '../api/AuthorizationService';
import { AuthorizationModel } from '../models/Auth/AuthorizationModel';
import { TokenModel } from '../models/Auth/TokenModel';
import { setTokenToStorage } from '../api/TokenStorageService';

const LoginComponent = () => {
    const [ isLoading, setIsLoading ] = useState<boolean>(false);
    
    const [ redirect, setRedirect ] = useState<boolean>(false);
    const [ redirectUrl, setRedirectUrl ] = useState<string>("");
    
    const [ isError, setIsError ] = useState<boolean>(false);
    const [ errorMessage, setErrorMessage ] = useState<string>("");

    const email = useRef<HTMLInputElement>(null);
    const password = useRef<HTMLInputElement>(null);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        setIsLoading(true);

        const isFormProvided = email && email.current && email.current.value !== ''
           && password && password.current && password.current.value !== '';

        if (isFormProvided) {
            let model: AuthorizationModel = new AuthorizationModel();
            model.email = email.current.value;
            model.password = password.current.value;
            authorizeUser(model).then((response) => {
                let authModel = response.data as TokenModel;
                setTokenToStorage(authModel);
                setIsError(false);
                setErrorMessage("");
                setRedirectUrl("/video");
                setRedirect(true);
            })
            .catch((error) => {
                setIsLoading(false);
                console.log(error);
                if(error && error.response && error.response.data) {
                    setIsError(true);
                    setErrorMessage(error.response.data);
                }
            });
        } 
        else {
            alert('Please type something to send a message. Don\'t be a jerk !');
        }
    }

    return (
        <>
            {redirect && redirectUrl ? <Navigate to={redirectUrl} /> : null}
            {isError && errorMessage ?
                <div>
                    {errorMessage}
                </div>
                :
                ""
            }
            <div>
            { isLoading ?
                <div>
                    Loading...
                </div>
                :
                ""
            }
            </div>
            <form onSubmit={onSubmit}>
                
                <label htmlFor="email">Email:</label>
                <br />
                <input 
                    type="text"
                    id="email"
                    name="email"
                    ref={email} />
                <br/><br/>

                <label htmlFor="password">Password:</label>
                <br />
                <input 
                    type="text"
                    id="password"
                    name="password"
                    ref={password} />
                <br/><br/>

                <button>Submit</button>
            </form>
        </>
    )
};

export default LoginComponent;