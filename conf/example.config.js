module.exports = {
    //Application login Url
    loginUrl: '/saml/login',
    //The url, where data sent from the IDp will be handled
    callbackUrl : '/saml/response/callback',
    //optional : Location of private key file (relative to project root)
    privateCertLocation : './pk/login.axway.com.pem',
    //optional : Location of certificat file (relative to project root)
    certLocation : './pk/login.axway.com.crt',
    //resultObject : is the Object structure, that you application requires
    //the object member values are the keys of the Object received from the IDp 
    resultObject : {
        firstName : 'firstname',
        lastName : 'lastname',
        email : 'email',
        username : 'username',
        language : 'preferredLanguage'
    },
    //passport-saml configuration object
    passport: {
        strategy: 'saml',
        saml: {
            //Should be an absolute path
            callbackUrl: 'https://localhost:8080/response/callback',
            entryPoint: 'https://idp.com/saml2/idp/SSOService.php',
            issuer: 'cloud:passport:saml',
            authnContext: 'http://schemas.microsoft.com/ws/2008/06/identity/authenticationmethod/windows',
            logoutCallbackUrl: 'https://localhost:8080/saml/logout'
        }
    }
};


