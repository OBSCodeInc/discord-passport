# Discord Passport
Easy to use, intuitive discord login flow.

## Installation

`npm i discord-passport`

## Example Usage

### First Login
```js
const Passport = require("discord-passport");
const express = require("express");

const app = express();

app.get("/", async (req, res) => {
    res.send(`<p><a href="your_authorization_link">Login with Discord</a></p>`);
})

app.get("/passport", async (req, res) => {
    var code = req.query.code;

    var passport = new Passport({
        code: code,
        client_id: "your_client_id",
        client_secret: "your_client_secret",
        redirect_uri: "your_redirect_url",
        scope: ["identify", "email", "connections", "guilds"]
    })

    await passport.open(); // Trades your code for an access token and gets the basic scopes for you.

    res.send(`Hello ${passport.user.username}${passport.user.discriminator}!`);

    console.log(passport.user);

    console.log(passport.guilds);

    console.log(passport.connections);
})

app.listen(3000);
```


### Refreshing Token
```js
const Passport = require("discord-passport");

var passport = new Passport({
        code: "your_access_code",
        client_id: "your_client_id",
        client_secret: "your_client_secret",
        redirect_uri: "your_redirect_url",
        scope: ["identify", "email", "connections", "guilds"]
    })

    await passport.open(); // Logging in for the first time.

    var {token, refresh_token, expires_in} = passport;

    setTimeout(async () => { // After our token expires, get a new one.
        await passport.refresh(); // Updates these values with the new ones.
    }, expires_in);
```

## Documentation
Check out the full docs at [OBSCode](https://obs.wtf/docs/discord-passport).

## Contributing
Before submitting an issue make sure it hasn't been already reported/resolved.

## Help
If you do not understand something or need help with Oauth flows in general, feel free to stop by the [OBSCode](https://discord.gg/uqWujj8) server!