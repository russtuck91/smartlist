# Smartlist

[Automatic Spotify Playlists by Rules](https://www.smartlistmusic.com)


## Description

Create playlists based on rules set to whatever you want - Artist, Album, Genre, Saved in My Library, etc. Preview changes and build the perfect playlist. Publish the playlist to your Spotify account and it will update automatically at regular intervals.


## Build

Built in all-Javascript MERN stack - MongoDB, Express, React, and Node.js. Also with Typescript.


## Run locally over HTTPS

[Local certificate setup](https://web.dev/articles/how-to-use-local-https)

To run just the frontend over HTTPS, run web's `npm run start:ssl`

> Access it at https://localhost:3000/

To run the whole app over HTTPS, build the stack and then run api's `npm run start:ssl`

> Access it at https://localhost:5001/

If you're getting certificate errors, try:

- Trust the Certificate Authority
  - Get the `rootCA.pem` file from where `mkcert -install` creates it
    - On ChromeOS: `/home/<user>/.local/share/mkcert/rootCA/pem`
  - Install that as a Trusted Certificate Authority in your OS

