import React, { useEffect } from 'react';
import { View } from 'react-native';
import { 
    NavigationContainer, 
    DarkTheme as NavigationDarkTheme, 
    DefaultTheme as NavigationDefaultTheme 
} from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Main_Tab_Screen from './src/components/screeners/MainTabScreen';
import { DrawerContent } from './src/components/screeners/DrawerContent';
import Bookmark_Screen from './src/components/screeners/BookmarkScreen';
import Settings_Screen from './src/components/screeners/SettingsScreen';
import Support_Screen from './src/components/screeners/SupportScreen';
import RootStack_Screen from './src/components/screeners/RootStackScreen';
import { 
    ActivityIndicator, 
    Provider as PaperProvider, 
    DarkTheme as PaperDarkTheme,
    DefaultTheme as PaperDefaultTheme 
} from 'react-native-paper';
import { AuthContext } from './src/components/Context';
import AsyncStorage from '@react-native-community/async-storage';

const Drawer = createDrawerNavigator();



const App = () => {

    const [isDarkTheme, setIsDarkTheme] = React.useState(false);

    const customDefaultTheme = {
        ...NavigationDefaultTheme,
        ...PaperDefaultTheme,
        colors: {
            ...NavigationDefaultTheme.colors,
            ...PaperDefaultTheme.colors,
            background: "#fff",
            text: "#333333",
        }
    }

    const customDarkTheme = {
        ...NavigationDarkTheme,
        ...PaperDarkTheme,
        colors: {
            ...NavigationDarkTheme.colors,
            ...PaperDarkTheme.colors,
            background: "#333333",
            text: "#fff",
        }
    }

    const theme = isDarkTheme ? customDarkTheme : customDefaultTheme;

    const initialLoginState = {
        isLoading: true,
        userName: null,
        userToken :null,
    };

    const loginReducer = (prevState, action) => {
        switch(action.type) {
            case 'RETRIEVE_TOKEN':
                return{
                    ...prevState,
                    userToken: action.token,
                    isLoading: false,
                };
            case 'LOGIN':
                return{
                    ...prevState,
                    userName: action.id,
                    userToken: action.token,
                    isLoading: false,
                };
            case 'LOGOUT':
                return{
                    ...prevState,
                    userName: null,
                    userToken: null,
                    isLoading: false,
                };
            case 'REGISTER':
                return{
                    ...prevState,
                    userName: action.id,
                    userToken: action.token,
                    isLoading: false,
                };
        }
    };

    const [loginState, dispatch] = React.useReducer(loginReducer, initialLoginState);

    const authContext = React.useMemo(() => ({
        fnSignIn: async(foundUser) => {
            const userToken = String(foundUser[0].user_token);
            const userName = foundUser[0].user_name;

            try {
                await AsyncStorage.setItem('userToken', userToken)
            } catch(e) {
                console.warn('Error: ', e );
            }

            dispatch({type: 'LOGIN', id: userName, token: userToken});
        },
        fnSignUp: () => {
            setUserToken('signup_token');
            setIsLoading(false);
        },
        fnSignOut: async() => {
            try {
                await AsyncStorage.removeItem('userToken');
            } catch(e) {
                console.warn('Error: ', e );
            }
            dispatch({type: 'LOGOUT'});
        },
        toggleTheme: () => {
            setIsDarkTheme(isDarkTheme => !isDarkTheme);
        }
    }));

    useEffect(() => {
        setTimeout(async() => {
            let userToken;
            userToken = null;
            try {
                userToken = await AsyncStorage.getItem('userToken');
            } catch(e) {
                console.warn('Error: ', e );
            }
            dispatch({type: 'REGISTER',token: userToken});
        }, 1000);
    }, []);

    if (loginState.isLoading) {
        return(
            <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return(
        <PaperProvider theme={theme}>
            <AuthContext.Provider value={authContext}>
                <NavigationContainer theme={theme}>
                    { loginState.userToken != null ? (
                        <Drawer.Navigator drawerContent= { props => <DrawerContent { ...props } /> } >
                            <Drawer.Screen 
                                name="HomeDrawer"
                                component={Main_Tab_Screen}
                            />
                            <Drawer.Screen 
                                name="Bookmark"
                                component={Bookmark_Screen}
                            />
                            <Drawer.Screen 
                                name="Setting"
                                component={Settings_Screen}
                            />
                            <Drawer.Screen 
                                name="Supporter"
                                component={Support_Screen}
                            />
                        </Drawer.Navigator>
                        )
                    :
                        <RootStack_Screen />
                    }
                    {/*  */}
                </NavigationContainer>
            </AuthContext.Provider>
        </PaperProvider>
    );
}

export default App;

