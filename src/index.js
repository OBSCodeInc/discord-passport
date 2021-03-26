'use strict';

const req = require('petitio');
const formData = require("form-data");

/**
 * Creates a new passport flow.
 * @param {object} options Passport options
 * @param {string} options.code The code returned from the oauth flow.
 * @param {?string} options.state The state to pass through the flow. 
 * @param {string} options.client_id The `client_id` for authorization.
 * @param {string} options.client_secret The `client_secret`for authorization.
 * @param {string} options.redirect_uri The `redirect_uri` for authorization.
 * @param {array} options.scope The scopes requested in your authorization url.
 * @method open Opens a new oauth flow.
 * @property {string} token The access token. 
 * @property {string} refresh_token The refresh access token. 
 * @property {string} token_type The type of access token. 
 * @property {string} expires_in The time in milliseconds till the access token expires. 
 * @property {array} connections A list of this user's connections, requires the `connections`. 
 * @property {array} guilds A list of this user's guilds, with limited information, requires the `guilds` scope. 
 * @property {object} user Information about this user, requires the `identify` scope.
 * @property {string} user.id The users ID.
 * @property {string} user.username The user's username.
 * @property {string} user.discriminator The user's discriminator.
 * @property {?string} user.avatar The user's avatar hash.
 * @property {boolean} user.bot Whether the user belongs to an Oauth2 application.
 * @property {boolean} user.system Whether the user is an Official Discord System user (part of the urgent message system)
 * @property {boolean} user.mfa_enabled Whether the user has two factor enabled on their account.
 * @property {?string} user.locale The user's chosen language option.
 * @property {?boolean} user.verified Whether the email on this account has been verified.
 * @property {?string} user.email The user's email, requires the `email` scope.
 * @property {?integer} user.flags The flags on a user's account.
 * @property {?integer} user.premium_type The type of Nitro subscription on a user's account.
 * @property {?integer} user.public_flags The public flags on a user's account.
 */
module.exports = class Passport {
    /**
 * Creates a new passport flow.
 * @param {object} options Passport options
 * @param {string} options.code The code returned from the oauth flow.
 * @param {?string} options.state The state to pass through the flow. 
 * @param {string} options.client_id The `client_id` for authorization.
 * @param {string} options.client_secret The `client_secret`for authorization.
 * @param {string} options.redirect_uri The `redirect_uri` for authorization.
 * @param {array} options.scope The scopes requested in your authorization url.
    */
    constructor(options) {
        this.options = options;
        this.code = options.code;
        this.state = options.state;
        this.client_id = options.client_id;
        this.redirect_uri = options.redirect_uri;
        this.scope = options.scope;

if (!options.code) throw new Error("DiscordPassportError: Missing the code param.");
if (!options.client_id) throw new Error("DiscordPassportError: Missing the client_id param.");
if (!options.client_secret) throw new Error("DiscordPassportError: Missing the client_secret param.");
if (!options.redirect_uri) throw new Error("DiscordPassportError: Missing the redirect_uri param.");
if (!options.scope) throw new Error("DiscordPassportError: Missing the scope param.");
    }
/**
 * Opens a new passport flow.
 * @this {Passport} The passport flow.
 * @returns Creates values `this.token`, `this.refresh_token` and `this.expires_in` and scope values.
 * @property {string} this.token The access token. 
 * @property {string} this.refresh_token The refresh access token. 
 * @property {string} this.token_type The type of access token. 
 * @property {string} this.expires_in The time in milliseconds till the access token expires. 
 * @property {array} this.connections A list of this user's connections, requires the `connections`. 
 * @property {array} this.guilds A list of this user's guilds, with limited information, requires the `guilds` scope. 
 * @property {object} this.user Information about this user, requires the `identify` scope.
 * @property {string} this.user.id The users ID.
 * @property {string} this.user.username The user's username.
 * @property {string} this.user.discriminator The user's discriminator.
 * @property {?string} this.user.avatar The user's avatar hash.
 * @property {boolean} this.user.bot Whether the user belongs to an Oauth2 application.
 * @property {boolean} this.user.system Whether the user is an Official Discord System user (part of the urgent message system)
 * @property {boolean} this.user.mfa_enabled Whether the user has two factor enabled on their account.
 * @property {?string} this.user.locale The user's chosen language option.
 * @property {?boolean} this.user.verified Whether the email on this account has been verified.
 * @property {?string} this.user.email The user's email, requires the `email` scope.
 * @property {?integer} this.user.flags The flags on a user's account.
 * @property {?integer} this.user.premium_type The type of Nitro subscription on a user's account.
 * @property {?integer} this.user.public_flags The public flags on a user's account.
 */ 
async open() {
const {code, state, client_id, client_secret, redirect_uri, scope} = this.options;

const codeData = new formData();
codeData.append('client_id', client_id)
codeData.append('client_secret', client_secret)
codeData.append('grant_type', 'authorization_code')
codeData.append('code', code)
codeData.append('redirect_uri', redirect_uri)
codeData.append('scope', scope.join(" "));

if (state) codeData.append('state', state);

const tokenRequest = await req("https://discord.com/api/oauth2/token", "POST")
    .body(codeData)
    .send();

if (!tokenRequest) throw new Error("DiscordPassportError: Unable to fetch the token with given options. Make sure they are correct.");

const tokenResults = await tokenRequest.json();

if (!tokenResults || !tokenResults.access_token) throw new Error("DiscordPassportError: Unable to fetch the token with given options. Make sure they are correct.");

const { access_token, refresh_token, expires_in, token_type } = tokenResults;

this.token = access_token;

this.token_type = token_type;

this.refresh_token = refresh_token;

this.expires_in = expires_in;

const token = access_token;

const scopeFetchers = {
    connections: async () => {
        const fetchReq = await req("https://discord.com/api/users/@me/connections", "GET")
            .header("authorization", `${token_type} ${token}`)
            .send();

        if (!fetchReq) throw new Error("DiscordPassportError: Authorization failed.");

        const fetchRes = await fetchReq.json();

        this.connections = fetchRes;

        return fetchRes;
    },
    identify: async () => {
        const fetchReq = await req("https://discord.com/api/users/@me", "GET")
            .header("authorization", `${token_type} ${token}`)
            .send();

        if (!fetchReq) throw new Error("DiscordPassportError: Authorization failed.");

        const fetchRes = await fetchReq.json();

        this.user = fetchRes;

        return fetchRes;
    },
    guilds: async () => {
        const fetchReq = await req("https://discord.com/api/users/@me/guilds", "GET")
            .header("authorization", `${token_type} ${token}`)
            .send();

        if (!fetchReq) throw new Error("DiscordPassportError: Authorization failed.");

        const fetchRes = await fetchReq.json();

        this.guilds = fetchRes;

    }
}

if (this.scope.includes("identify")) await scopeFetchers.identify();
if (this.scope.includes("guilds")) await scopeFetchers.guilds();
if (this.scope.includes("connections")) await scopeFetchers.connections();

return;


}
/**
 * Refresh your `access_token` using the current `refresh_token`
 * @returns updated values.
 * @this {Passport} The passport flow.
 * @property {string} this.token The updated access token. 
 * @property {string} this.refresh_token The updated refresh access token. 
 * @property {string} this.token_type The updated type of access token. 
 * @property {string} this.expires_in The updated time in milliseconds till the access token expires. 
 */
async refresh() {
    const {state, client_id, client_secret, redirect_uri, scope} = this.options;

    if (!this.refresh_token) throw new Error("DiscordPassportError: Attempted to refresh authorization before opening one.");

    const refreshData = new formData();
    refreshData.append('client_id', client_id)
    refreshData.append('client_secret', client_secret)
    refreshData.append('grant_type', 'refresh_token')
    refreshData.append('refresh_token', this.refresh_token)
    refreshData.append('redirect_uri', redirect_uri)
    refreshData.append('scope', scope.join(" "));
    
    if (state) refreshData.append('state', state);
    
    const tokenRequest = await req("https://discord.com/api/oauth2/token", "GET")
        .body(refreshData)
        .send();
    
    if (!tokenRequest) throw new Error("DiscordPassportError: Unable to fetch the token with given options. Make sure they are correct.");
    
    const tokenResults = await tokenRequest.json();
    
    if (!tokenResults || !tokenResults.access_token) throw new Error("DiscordPassportError: Unable to fetch the token with given options. Make sure they are correct.");
    
    const { access_token, refresh_token, expires_in, token_type } = tokenResults;
    
    this.token = access_token;
    
    this.token_type = token_type;
    
    this.refresh_token = refresh_token;
    
    this.expires_in = expires_in;
    
}

}