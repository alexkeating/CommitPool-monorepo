import React, { useState }  from 'react';
import { StyleSheet } from 'react-native';
import { Dimensions } from 'react-native';
import { AsyncStorage } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import web3Helper from "./components/web3-helper/web3-helper.js";

import Main from './Main';

WebBrowser.maybeCompleteAuthSession();

// Endpoint
const discovery = {
  authorizationEndpoint: 'https://www.strava.com/oauth/mobile/authorize',
  tokenEndpoint: 'https://www.strava.com/oauth/token',
  revocationEndpoint: 'https://www.strava.com/oauth/deauthorize',
};

export default function App() {  
  const [code, setCode] = useState(true); 
  const [web3, setWeb3] = useState(web3Helper); 
  const { width } = Dimensions.get('window');


  //Strava login
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: '51548',
      scopes: ['read,activity:read'],
      // For usage in managed apps using the proxy
      redirectUri: makeRedirectUri({
        // For usage in bare and standalone
        // the "redirect" must match your "Authorization Callback Domain" in the Strava dev console.
        native: 'your.app://redirect',
      }),
    },
    discovery
  );

  React.useEffect(() => {
    if (response?.type === 'success') {
      fetch('https://www.strava.com/oauth/token?client_id=51548&client_secret=28d56211b9ca33972055bf61010074fbedc3c7c2&code=' + response.params.code + '&grant_type=authorization_code',
        {
          method: 'POST'
        })
        .then(res => res.json())
        .then(async (json) => {
          console.log(json)
          await AsyncStorage.setItem(
            'rt',
            json.refresh_token
          );
          setCode(json);
          createUser(json.athlete.id, json.refresh_token)
        })
    }
  }, [response]);

  const stravaOauth = () => {
    promptAsync()
  }

  const createUser = async (address, token) => {
    await fetch('https://test2.dcl.properties/user', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({address: address, token: token})
    });
  }

  //Web3 instance
  // const loadWeb3 = async () => {
  //     await web3.initialize();
  //     return web3;
  // }

  React.useEffect(() => {
    if (web3.provider !== undefined) {
      setWeb3(web3);
    }
  }, [web3])

  return (
    <Home web3={web3} stravaOauth={stravaOauth} code={code}></Home>
  )

}

class Home extends React.Component <{web3: any, stravaOauth: any, code: string}, {}> {
  state = {
    accessToken: "",
    // message: "Awaiting accesstoken",
    // address: "",
    // account: undefined
  };

  render() {
    return (
      <Main web3={this.props.web3} stravaOAuth={this.props.stravaOauth} code={this.props.code}></Main>
    );
  }
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    //backgroundColor: '#282c34',
    color: 'whitesmoke',
  },

linearGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width,
    borderRadius: 5
  },

  AppHeader: {
    backgroundColor: '#282c34',
    // min-height: 80vh;
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    // font-size: calc(10px + 2vmin);
    color: 'white'
  }
});