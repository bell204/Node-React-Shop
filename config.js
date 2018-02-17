var config = {
    port: 3000,
    secret: 'secret',

    routes: {
        login: '/auth/login',
    		logout: '/logout',
    		join: '/join',
        friendList: '/friendList',
        chat: '/chat',
        facebookAuth: '/auth/facebook',
    		facebookAuthCallback: '/auth/facebook/callback'
    },
    host: 'http://localhost:3000',

	  facebook: {
		appID: '189102605019222',
		appSecret: '81348b35fcdcb3aba1da48b074db6052'
	},
};

module.exports = config;
